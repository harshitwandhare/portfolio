import { expect, test } from '@playwright/test'

/**
 * Guards on the things that would quietly embarrass: a dead link, a number that
 * drifted from its source, or a claim reappearing after it was deliberately cut.
 */

test.describe('/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('states the figure is a single closed stroke', async ({ page }) => {
    // The whole claim rests on the hero figure being one line, not a pattern.
    await expect(page.getByText(/one stroke ·.*never crossing, closed/)).toBeVisible()
  })

  test('leads the proof strip with commits, not a star count', async ({ page }) => {
    const strip = page.locator('section').nth(1)
    await expect(strip.getByText('commits, #1 of 15')).toBeVisible()
    // CountUp animates from zero, so wait for it to settle on the real figure.
    await expect(strip.getByText('1,268')).toBeVisible()
  })

  test('never shows a zero in the proof strip', async ({ page }) => {
    // Job Sentinel and ATLAS have no stars; a panel reading "0" would put the
    // weakest fact on the page in the largest type. Scoped to the strip — the
    // splice panel legitimately starts at zero flips applied.
    const strip = page.locator('section').nth(1)
    await expect(strip.getByText('commits, #1 of 15')).toBeVisible()
    for (const value of await strip.locator('.tabular').allTextContents()) {
      expect(value.trim()).not.toBe('0')
    }
  })

  test('orders skills so backend and ML precede frontend', async ({ page }) => {
    const body = await page.locator('main').innerText()
    const jio = body.indexOf('Software Development Engineer I')
    const yosemite = body.indexOf('Product Engineer')
    // Most recent role first.
    expect(yosemite).toBeLessThan(jio)
  })

  test('omits a phone number until a US one exists', async ({ page }) => {
    const body = await page.locator('main').innerText()
    expect(body).not.toMatch(/\+91/)
  })

  test('excludes the withdrawn tooling claims', async ({ page }) => {
    const body = await page.locator('main').innerText()
    for (const claim of ['ComfyUI', 'TouchDesigner', 'StreamDiffusion', 'TensorRT']) {
      expect(body).not.toContain(claim)
    }
  })

  test('every external link points somewhere real', async ({ page, request }, testInfo) => {
    // One project only. The link set does not vary by browser, and firing the
    // same requests from four projects at once gets us rate-limited by GitHub,
    // which fails the run for a reason that has nothing to do with the site.
    test.skip(testInfo.project.name !== 'chromium', 'checked once, in chromium')

    const hrefs = await page
      .locator('a[href^="http"]')
      .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href))
    expect(hrefs.length).toBeGreaterThan(0)

    for (const href of [...new Set(hrefs)]) {
      const res = await request.get(href, { maxRedirects: 5 })
      expect(res.status(), `${href} returned ${res.status()}`).toBeLessThan(400)
    }
  })
})

test.describe('the hero figure', () => {
  test('plays the splice down to exactly one unbroken stroke', async ({ page }) => {
    await page.goto('/')
    const counter = page.locator('[data-loop-count]')
    await expect(counter).toBeVisible()

    // It plays on its own. The claim the whole page rests on is that it ends
    // on one, so wait for that rather than for a fixed duration.
    await expect(counter).toHaveText('1', { timeout: 20_000 })
    await expect(page.getByText('unbroken stroke')).toBeVisible()
  })

  test('draws a closed path — no gap left by a short dash pattern', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-loop-count]')).toHaveText('1', { timeout: 20_000 })

    const closed = await page
      .locator('[data-splice] path')
      .first()
      .evaluate((el) => {
        const path = el as unknown as SVGPathElement
        const d = path.getAttribute('d') ?? ''
        const style = getComputedStyle(el)
        const dash = style.strokeDasharray
        // Either no dash pattern at all, or one long enough to cover the path.
        const covered =
          dash === 'none' ||
          dash === '' ||
          Number.parseFloat(dash) >= path.getTotalLength() - 1 ||
          // pathLength normalises the curve to 1 unit.
          (path.hasAttribute('pathLength') && Number.parseFloat(dash) >= 1)
        return { endsWithZ: d.trim().endsWith('Z'), covered }
      })

    expect(closed.endsWithZ, 'path data must close with Z').toBe(true)
    expect(closed.covered, 'dash pattern must cover the whole path').toBe(true)
  })

  test('regenerates a different figure on demand', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-loop-count]')).toHaveText('1', { timeout: 20_000 })

    // Compare the whole figure, not one loop — two different tilings can share
    // their largest loop by coincidence.
    const shape = () =>
      page
        .locator('[data-splice] path')
        .evaluateAll((els) => els.map((e) => e.getAttribute('d')).join('|'))

    const before = await shape()
    expect(before.length).toBeGreaterThan(0)

    await page.getByRole('button', { name: 'new figure' }).click()
    await expect.poll(shape, { timeout: 20_000 }).not.toBe(before)
  })
})

test('shows every logo and the portrait without a broken image', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const broken = await page.evaluate(() =>
    [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src),
  )
  expect(broken).toEqual([])
  // Both company marks and the portrait slot.
  expect(await page.locator('img').count()).toBeGreaterThanOrEqual(4)
})

test('the theme switch flips the document and persists the choice', async ({ page }) => {
  await page.goto('/')
  const root = page.locator('html')

  await page.getByRole('button', { name: 'Switch colour theme' }).click()
  const first = await root.getAttribute('data-theme')
  expect(first === 'dark' || first === 'light').toBe(true)

  await page.getByRole('button', { name: 'Switch colour theme' }).click()
  expect(await root.getAttribute('data-theme')).not.toBe(first)

  // The choice must survive a reload without a flash of the wrong theme.
  const chosen = await root.getAttribute('data-theme')
  await page.reload()
  expect(await root.getAttribute('data-theme')).toBe(chosen)
})
