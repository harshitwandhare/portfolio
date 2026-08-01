import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const PAGES = ['/'] as const

for (const path of PAGES) {
  test.describe(`${path}`, () => {
    test('has no critical or serious accessibility violations', async ({ page }) => {
      await page.goto(path)

      // Scroll the whole page first and let it settle. Reveal fades content in
      // from opacity 0, and axe computes effective colour through opacity — so
      // auditing mid-fade reports contrast failures against a colour that only
      // exists for a few hundred milliseconds. The settled page is what a
      // reader actually sees, and it is what must pass.
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 120))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(900)

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const blocking = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )
      expect(blocking, blocking.map((v) => `${v.id}: ${v.help}`).join('\n')).toEqual([])
    })

    test('has exactly one h1 and an ordered heading structure', async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('h1')).toHaveCount(1)

      const levels = await page
        .locator('h1, h2, h3, h4, h5, h6')
        .evaluateAll((els) => els.map((e) => Number(e.tagName[1])))

      // A heading may never jump more than one level deeper than the last.
      for (let i = 1; i < levels.length; i++) {
        expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1)
      }
    })

    test('puts the skip link first and sends it to the main content', async ({ page }) => {
      await page.goto(path)

      // Focused directly rather than via Tab: Safari does not move focus to
      // links on Tab unless full keyboard access is switched on, so tabbing
      // would test a browser preference rather than this page.
      const skip = page.getByRole('link', { name: 'Skip to content' })
      await skip.focus()
      await expect(skip).toBeFocused()

      // It must be the first focusable thing in the document.
      const isFirst = await page.evaluate(() => {
        const focusable = document.querySelectorAll<HTMLElement>(
          'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        return focusable[0]?.textContent?.trim() === 'Skip to content'
      })
      expect(isFirst).toBe(true)

      // And it must actually reach the main landmark.
      expect(await skip.getAttribute('href')).toBe('#main')
      await expect(page.locator('#main')).toHaveCount(1)
    })

    test('does not scroll horizontally at any breakpoint', async ({ page }) => {
      for (const width of [375, 768, 1280, 1920]) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(path)
        const overflows = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1,
        )
        expect(overflows, `horizontal overflow at ${width}px`).toBe(false)
      }
    })

    test('logs nothing to the console', async ({ page }) => {
      const noise: string[] = []
      page.on('console', (m) => {
        if (m.type() === 'error' || m.type() === 'warning') noise.push(m.text())
      })
      page.on('pageerror', (e) => noise.push(String(e)))
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      expect(noise).toEqual([])
    })
  })
}

test('renders its content with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')

  // The centrepiece is server-rendered SVG, so the figure and every fact
  // survive without scripting.
  await expect(page.locator('h1')).toContainText('Harshit Wandhare')
  await expect(page.locator('svg[role="img"]').first()).toBeVisible()
  await expect(page.getByText('Product Engineer')).toBeVisible()
  await expect(page.getByText('Software Development Engineer I')).toBeVisible()
  await context.close()
})

test('honours prefers-reduced-motion by showing the finished figure', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto('/')

  // The stroke must be fully drawn immediately rather than merely animating fast.
  const offset = await page
    .locator('.stroke-draw')
    .first()
    .evaluate((el) => getComputedStyle(el).strokeDashoffset)
  expect(Number.parseFloat(offset)).toBe(0)
  await context.close()
})
