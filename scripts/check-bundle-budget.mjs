#!/usr/bin/env node
/**
 * Fails if a route's first-load JavaScript exceeds the budget.
 *
 * Measured by loading the production build in a real browser and summing the
 * transfer size of every script it actually fetches — not by adding up the
 * chunk directory, which counts assets belonging to other routes and flatters
 * or punishes the number depending on how many pages exist.
 *
 * The centrepiece is server-rendered SVG precisely so this stays small. If it
 * starts creeping, something moved to the client that did not need to.
 */
import { spawn } from 'node:child_process'
import { chromium } from 'playwright'

/**
 * 100 KB — the figure the brief asked for, and currently met with room to spare.
 *
 * An earlier draft measured 146 KB and concluded the floor was the framework.
 * That was wrong, and worth recording: the site then had internal <Link>s to
 * two other routes, and Next prefetches a linked route's chunks on sight. The
 * measurement was counting three pages' JavaScript, not one. With the extra
 * routes gone the real figure is well under half of it.
 *
 * The centrepiece is server-rendered SVG, which is why this stays small. If it
 * starts creeping, something moved to the client that did not need to.
 */
const BUDGET_KB = 100
const PORT = 3123
const ROUTES = ['/']

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
      const res = await fetch(url)
      if (res.ok) return
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
    let bytes = 0

    page.on('response', async (res) => {
      const type = res.request().resourceType()
      if (type !== 'script') return
      try {
        const sizes = await res.request().sizes()
        bytes += sizes.responseBodySize || 0
      } catch {
        /* response body already discarded */
      }
    })

    await page.goto(`http://127.0.0.1:${PORT}${route}`, { waitUntil: 'networkidle' })
    results.push([route, bytes / 1024])
    await context.close()
  }
  await browser.close()

  console.log('first-load JavaScript, over the wire\n')
  for (const [route, kb] of results) {
    const over = kb > BUDGET_KB
    if (over) failed = true
    console.log(`${kb.toFixed(1).padStart(7)} KB  ${route}${over ? '   OVER BUDGET' : ''}`)
  }
  console.log(`\nbudget ${BUDGET_KB} KB per route`)

  const worst = Math.max(...results.map(([, kb]) => kb))
  console.log(
    failed
      ? `worst route is ${(worst - BUDGET_KB).toFixed(1)} KB over`
      : `worst route has ${(BUDGET_KB - worst).toFixed(1)} KB of headroom`,
  )
} finally {
  shutdown()
}

process.exit(failed ? 1 : 0)
