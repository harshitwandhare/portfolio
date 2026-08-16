import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * The résumé page is the artefact a recruiter actually keeps, so the guards
 * here are about the document being correct, current and safe to hand over.
 */

test.describe('/resume', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resume')
  })

  test('renders the whole document, not a PDF embed', async ({ page }) => {
    await expect(page.locator('#resume-sheet')).toBeVisible()
    for (const section of [
      'Summary',
      'Education',
      'Experience',
      'Projects',
      'Research',
      'Technical Skills',
    ]) {
      await expect(page.getByRole('heading', { name: section, exact: true })).toBeVisible()
    }
    // An embed would be an <iframe> or <object>; this must be real markup so it
    // can be indexed, read aloud, and printed.
    expect(await page.locator('iframe, object, embed').count()).toBe(0)
  })

  test('uses no em or en dashes in anything a reader sees', async ({ page }) => {
    const text = await page.locator('body').innerText()
    const found = [...text.matchAll(/.{0,45}[—–].{0,45}/g)].map((m) => m[0].replace(/\s+/g, ' '))
    expect(found, `long dash in rendered text:\n${found.join('\n')}`).toEqual([])
  })

  test('carries no phone number', async ({ page }) => {
    const text = await page.locator('body').innerText()
    const html = await page.content()
    for (const shape of [
      /\+\d{1,3}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,
      /\(\d{3}\)\s?\d{3}[\s.-]?\d{4}/,
      /\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/,
      /\btel:/i,
    ]) {
      expect(text).not.toMatch(shape)
      expect(html).not.toMatch(shape)
    }
  })

  test('cannot drift from the homepage, because both read one source', async ({ page }) => {
    const resumeText = await page.locator('#resume-sheet').innerText()
    await page.goto('/')
    const homeText = await page.locator('main').innerText()

    // Facts that appear on both must be identical, which is the point of
    // rendering them from the same constants.
    for (const fact of [
      'Product Engineer',
      'Software Development Engineer I',
      'Reliance Jio Platforms Limited',
      'CGPA 9.53 / 10.0',
      'M.S. Computer Science, Intelligent Systems track',
    ]) {
      expect(resumeText, `résumé is missing: ${fact}`).toContain(fact)
      expect(homeText, `homepage is missing: ${fact}`).toContain(fact)
    }
  })

  test('prints to a single page', async ({ page }) => {
    // US Letter at 96dpi, less the margins declared in @page. Printing lays out
    // at paper width regardless of the device, so the viewport is set to match:
    // `emulateMedia` switches the stylesheet but leaves the viewport alone, and
    // measuring at a phone's width would report wrapping that paper never sees.
    const PAGE_W = Math.round(8.5 * 96 - (22 / 25.4) * 96)
    const PAGE_H = Math.round(11 * 96 - (20 / 25.4) * 96)

    await page.setViewportSize({ width: PAGE_W, height: PAGE_H })
    await page.emulateMedia({ media: 'print' })
    await page.goto('/resume')

    // A résumé that spills onto a second page is a worse document than one that
    // does not, and the overflow is almost always spacing rather than content.
    const height = await page
      .locator('#resume-sheet')
      .evaluate((el) => Math.round(el.getBoundingClientRect().height))

    expect(height, `sheet is ${height}px against ${PAGE_H}px of page`).toBeLessThanOrEqual(PAGE_H)
    await page.emulateMedia({ media: 'screen' })
  })

  test('hides the page furniture when printed', async ({ page }) => {
    await page.emulateMedia({ media: 'print' })
    // The controls and navigation are not part of the document.
    await expect(page.getByRole('button', { name: 'download pdf' })).toBeHidden()
    await expect(page.locator('#resume-sheet')).toBeVisible()
    await page.emulateMedia({ media: 'screen' })
  })

  test('has no critical or serious accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    expect(blocking, blocking.map((v) => `${v.id}: ${v.help}`).join('\n')).toEqual([])
  })

  test('does not scroll horizontally at any breakpoint', async ({ page }) => {
    for (const width of [375, 768, 1280, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/resume')
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
        `horizontal overflow at ${width}px`,
      ).toBe(false)
    }
  })

  test('logs nothing to the console', async ({ page }) => {
    const noise: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') noise.push(m.text())
    })
    page.on('pageerror', (e) => noise.push(String(e)))
    await page.goto('/resume')
    await page.waitForLoadState('networkidle')
    expect(noise).toEqual([])
  })
})

test('the résumé is reachable from the header, without scrolling', async ({ page }) => {
  await page.goto('/')

  // The header is the one that matters: it is on screen before any scrolling,
  // and opening the résumé is the likeliest first useful action a recruiter
  // takes. The contact section carries the same link further down.
  const header = page.getByRole('link', { name: 'résumé', exact: true }).first()
  await expect(header).toBeInViewport()
  await header.click()
  await expect(page).toHaveURL(/\/resume$/)
})

test('the résumé renders with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/resume')

  // The sheet is server-rendered; only the tilt and the buttons need scripting.
  await expect(page.locator('#resume-sheet')).toBeVisible()
  await expect(page.getByText('Reliance Jio Platforms Limited')).toBeVisible()
  await context.close()
})
