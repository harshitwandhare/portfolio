/**
 * Screenshot the running site for a look, not for a test.
 *
 *   node scripts/shoot.mjs <outDir> [baseUrl]
 *
 * Writes one PNG per section plus a full-page shot, in both themes. Scrolls the
 * whole page first and waits for the reveal transitions to settle, because the
 * sections start hidden and only fade in once they have been on screen.
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const out = process.argv[2] ?? 'shots'
const base = process.argv[3] ?? 'http://localhost:3010'

await mkdir(out, { recursive: true })

const browser = await chromium.launch()

for (const theme of ['dark', 'light']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(base, { waitUntil: 'networkidle' })

  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)

  // Walk the page so every IntersectionObserver fires, then let the 620ms
  // transitions finish before anything is captured.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(1200)

  await page.screenshot({ path: join(out, `full-${theme}.png`), fullPage: true })

  for (const id of ['oss-heading', 'work-heading', 'experience-heading']) {
    const section = page.locator(`[aria-labelledby="${id}"]`)
    if ((await section.count()) === 0) continue
    await section.screenshot({ path: join(out, `${id.replace('-heading', '')}-${theme}.png`) })
  }

  await page.close()
}

await browser.close()
console.log(`wrote shots to ${out}`)
