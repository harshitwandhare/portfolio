#!/usr/bin/env node
/**
 * Fails if a route's first-load JavaScript exceeds the budget.
 *
 * Measured by loading the production build in a real browser, collecting every
 * script it actually fetches, and gzipping each one here. Three earlier versions
 * of this check were wrong, each instructively:
 *
 *   - Summing the chunk directory counted assets belonging to other routes.
 *   - Trusting the server's reported transfer size made the answer depend on
 *     whether that particular server compressed.
 *   - Measuring against a local node_modules grown by repeated installs rather
 *     than from the lockfile. That reported 69 KB; a clean `npm ci` reproduces
 *     CI's 146 KB exactly. The install is part of the measurement.
 *
 * Gzipping here removes the server from the answer, and Vercel always serves
 * these compressed, so this is what a visitor actually downloads.
 *
 * The budget is 160 KB because ~146 KB of it is React 19 plus the Next App
 * Router client runtime, not this site's code — the app's own components are a
 * few kilobytes. It sits just above that floor so it still catches regressions
 * in what we control. Going materially below means dropping hydration, which is
 * a framework decision rather than a tuning exercise.
 */
import { spawn } from 'node:child_process'
import { gzipSync } from 'node:zlib'
import { chromium } from 'playwright'

const BUDGET_KB = 160
const PORT = 3123
const ROUTES = ['/', '/resume']

/**
 * A local build that has been rebuilt many times over an evolving node_modules
 * chunks differently from a clean install, and reports roughly half the real
 * figure. CI and Vercel both build from the lockfile and agree with each other;
 * a local run below this is measuring something a visitor never receives.
 */
const SUSPICIOUSLY_SMALL_KB = 100

const server = spawn('npx', ['next', 'start', '--port', String(PORT)], {
  stdio: 'ignore',
  shell: process.platform === 'win32',
})

const shutdown = () => {
  if (!server.killed) server.kill()
}
process.on('exit', shutdown)
process.on('SIGINT', () => process.exit(130))

async function waitForServer(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error(`server did not start within ${timeoutMs}ms`)
}

let failed = false
try {
  await waitForServer(`http://127.0.0.1:${PORT}/`)
  const browser = await chromium.launch()
  const results = []

  for (const route of ROUTES) {
    const context = await browser.newContext()
    const page = await context.newPage()
    const bodies = []

    page.on('response', (res) => {
      if (res.request().resourceType() !== 'script') return
      // Buffer the decoded body; it is gzipped below, once the page settles.
      bodies.push(
        res
          .body()
          .then((b) => ({ url: res.url(), body: b }))
          .catch(() => null),
      )
    })

    await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'networkidle' })
    const scripts = (await Promise.all(bodies)).filter(Boolean)
    await context.close()

    let gz = 0
    let raw = 0
    for (const s of scripts) {
      raw += s.body.length
      gz += gzipSync(s.body).length
    }
    results.push({ route, files: scripts.length, gz: gz / 1024, raw: raw / 1024 })
  }
  await browser.close()

  console.log('first-load JavaScript\n')
  for (const r of results) {
    const over = r.gz > BUDGET_KB
    if (over) failed = true
    console.log(
      `${r.gz.toFixed(1).padStart(7)} KB gzipped  ` +
        `${r.raw.toFixed(1).padStart(7)} KB raw  ` +
        `${String(r.files).padStart(3)} files  ${r.route}${over ? '   OVER BUDGET' : ''}`,
    )
  }

  const worst = Math.max(...results.map((r) => r.gz))
  console.log(`\nbudget ${BUDGET_KB} KB gzipped per route`)
  console.log(
    failed
      ? `worst route is ${(worst - BUDGET_KB).toFixed(1)} KB over`
      : `worst route has ${(BUDGET_KB - worst).toFixed(1)} KB of headroom`,
  )

  if (worst < SUSPICIOUSLY_SMALL_KB && !process.env.CI) {
    console.log(
      `\nnote: ${worst.toFixed(1)} KB is well under what CI and production report (~146 KB).\n` +
        '      A node_modules grown by repeated installs chunks differently from the\n' +
        '      lockfile. Run `npm ci` before trusting a local figure — the gate in CI\n' +
        '      is the one that matches what a visitor downloads.',
    )
  }
} finally {
  shutdown()
}

process.exit(failed ? 1 : 0)
