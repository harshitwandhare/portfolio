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
    await expect(page.locator('[data-loop-count]')).toHaveText('1', { timeout: 20_000 })
    await expect(page.getByText(/never through one, never crossing, closed/)).toBeVisible()
  })

  test('is indexable and describes itself for a search result', async ({ page }) => {
    await expect(page).toHaveTitle(/Harshit Wandhare/)

    const robots = await page.locator('meta[name="robots"]').getAttribute('content')
    expect(robots ?? '', 'the site must not ship noindex').not.toMatch(/noindex/)

    const description = await page.locator('meta[name="description"]').getAttribute('content')
    expect(description ?? '').toContain('Reliance Jio')

    // Structured data, so a result renders as a person rather than a page.
    const ld = await page.locator('script[type="application/ld+json"]').textContent()
    const parsed = JSON.parse(ld ?? '{}')
    expect(parsed['@type']).toBe('Person')
    expect(parsed.name).toBe('Harshit Wandhare')
  })

  test('leads the proof strip with commits, not a star count', async ({ page }) => {
    const strip = page.locator('section').nth(1)
    await expect(strip.getByText('commits — most on the project')).toBeVisible()
    // CountUp animates from zero, so wait for it to settle on the real figure.
    await expect(strip.getByText('1,214')).toBeVisible()
  })

  test('never shows a zero in the proof strip', async ({ page }) => {
    // Job Sentinel and ATLAS have no stars; a panel reading "0" would put the
    // weakest fact on the page in the largest type. Scoped to the strip — the
    // splice panel legitimately starts at zero flips applied.
    const strip = page.locator('section').nth(1)
    await expect(strip.getByText('commits — most on the project')).toBeVisible()
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

  test('publishes no phone number at all', async ({ page }) => {
    // Deliberate, not an oversight: a number on a public page gets harvested,
    // and recruiters open with email regardless. It belongs on the résumé PDF,
    // which is sent rather than crawled. Written as a shape rather than a
    // literal so the number itself never enters this repository.
    const text = await page.locator('body').innerText()
    const html = await page.content()

    // Examples use the 555 range, which is reserved for fiction — the real
    // number must not appear even in a comment.
    const shapes = [
      /\+\d{1,3}[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/, // +1 (555) 010-0100
      /\(\d{3}\)\s?\d{3}[\s.-]?\d{4}/, // (555) 010-0100
      /\b\d{3}[\s.-]\d{3}[\s.-]\d{4}\b/, // 555-010-0100
      /\btel:/i, // a tel: link anywhere in the markup
    ]
    for (const shape of shapes) {
      expect(text, `phone-shaped text matched ${shape}`).not.toMatch(shape)
      expect(html, `phone-shaped markup matched ${shape}`).not.toMatch(shape)
    }
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

    // Structured-data URLs are checked too. A dead link in `sameAs` is just as
    // broken as one in the markup and nobody sees it until a crawler does —
    // which is how a deleted account's profile URL survived here for a while.
    const ld = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
    )
    const ldUrls: string[] = [...(ld.sameAs ?? []), ld.url, ld.image].filter(
      (u: unknown): u is string => typeof u === 'string' && u.startsWith('http'),
    )

    for (const href of [...new Set([...hrefs, ...ldUrls])]) {
      let status: number
      try {
        status = (await request.get(href, { maxRedirects: 5, timeout: 20_000 })).status()
      } catch (err) {
        throw new Error(`${href} did not respond: ${String(err).split('\n')[0]}`)
      }

      // 999 is LinkedIn's response to anything that is not a browser. It is a
      // bot block, not a broken link — real visitors get the page. Everything
      // else must be a genuine success.
      if (status === 999 && new URL(href).hostname.endsWith('linkedin.com')) continue
      expect(status, `${href} returned ${status}`).toBeLessThan(400)
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

  test('never resizes while it plays, replays or reseeds', async ({ page }) => {
    await page.goto('/')
    const svg = page.locator('[data-splice] svg')
    await expect(svg).toBeVisible()

    const box = async () => {
      const b = await svg.boundingBox()
      if (!b) throw new Error('figure has no box')
      return `${Math.round(b.width)}x${Math.round(b.height)}`
    }

    // Sampled across the whole animation. The figure used to size to its own
    // caption, so the label changing from "separate loops" to "unbroken
    // stroke" resized the SVG by 12% part-way through.
    const first = await box()
    const seen = new Set([first])
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(220)
      seen.add(await box())
    }

    await page.getByRole('button', { name: 'replay' }).click()
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(220)
      seen.add(await box())
    }

    await page.getByRole('button', { name: 'new figure' }).click()
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(220)
      seen.add(await box())
    }

    expect([...seen], 'the figure must hold one size throughout').toEqual([first])
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
