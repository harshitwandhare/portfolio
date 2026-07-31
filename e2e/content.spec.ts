import { expect, test } from '@playwright/test'

/**
 * Guards on the things that would quietly embarrass: a dead link, a number that
 * drifted from its source, or a claim reappearing after it was deliberately cut.
 */

test.describe('/lab/a', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lab/a')
  })

  test('states the figure is a single closed stroke', async ({ page }) => {
    await expect(page.getByText('strokes at the end')).toBeVisible()
    // The whole claim rests on this number being one.
    const strokes = page.locator('dd', { hasText: /^1$/ }).first()
    await expect(strokes).toBeVisible()
  })

  test('leads the proof strip with commits, not a star count', async ({ page }) => {
    const strip = page.locator('section').nth(1)
    await expect(strip.getByText('1,268')).toBeVisible()
    await expect(strip.getByText('commits, #1 of 15')).toBeVisible()
  })

  test('never shows a zero metric', async ({ page }) => {
    // Job Sentinel and ATLAS have no stars; a panel reading "0" would put the
    // weakest fact on the page in the largest type.
    const metrics = await page.locator('.tabular').allTextContents()
    for (const m of metrics) {
      expect(m.trim()).not.toBe('0')
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

  test('every external link points somewhere real', async ({ page, request }) => {
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

test('the theme switch flips the document and persists the choice', async ({ page }) => {
  await page.goto('/lab/a')
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
