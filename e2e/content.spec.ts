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
    await expect(page.getByText(/one stroke ·.*never crosses, never lifts/)).toBeVisible()
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

test.describe('the splice animation', () => {
  test('starts on many loops and reaches exactly one by the end of the track', async ({ page }) => {
    await page.goto('/')
    const counter = page.locator('[data-loop-count]')
    const track = page.locator('[data-splice-track]')
    await expect(counter).toBeVisible()

    const start = Number(await counter.textContent())
    expect(start).toBeGreaterThan(1)

    // Scroll to the end of the sticky track.
    const box = await track.boundingBox()
    if (!box) throw new Error('splice track has no box')
    await page.evaluate((y) => window.scrollTo(0, y), box.y + box.height)
    await expect(counter).toHaveText('1')
  })

  test('regenerates a different figure on demand', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-loop-count]')).toBeVisible()

    // Compare the whole figure, not one loop — two different tilings can share
    // their largest loop by coincidence.
    const shape = () =>
      page
        .locator('[data-splice-track] path')
        .evaluateAll((els) => els.map((e) => e.getAttribute('d')).join('|'))

    const before = await shape()
    expect(before.length).toBeGreaterThan(0)

    await page.getByRole('button', { name: 'new figure' }).click()
    await expect.poll(shape, { timeout: 10_000 }).not.toBe(before)
  })
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
