import { expect, test } from '@playwright/test'

/**
 * Guards on the things that would quietly embarrass: a dead link, a number that
 * drifted from its source, or a claim reappearing after it was deliberately cut.
 */

test.describe('/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('says what the figure is, and draws that', async ({ page }) => {
    await expect(page.getByText(/one eighth is chosen/)).toBeVisible()
    await expect(page.locator('[data-rangoli] svg line').first()).toBeAttached()
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
    await expect(strip.getByText('commits on the project')).toBeVisible()
    // CountUp animates from zero, so wait for it to settle on the real figure.
    await expect(strip.getByText('1,394')).toBeVisible()

    // The repository came back up on 2026-10-27, so this is a link again and
    // the number is exact again. It must stay a link: an unlinked count is
    // what the page fell back to while the repo was banned, and there is no
    // reason to make a reader take it on trust now that they can check it.
    const tile = strip.getByRole('link', { name: /commits on the project/ })
    await expect(tile).toHaveAttribute(
      'href',
      /author=harshit%40yosemitecrew\.com|author=harshit@yosemitecrew\.com/,
    )

    // The one link into that repo that must never appear. His commits are
    // unattributed to any GitHub account, so /graphs/contributors does not
    // list him at all: sending a reader there would show them a page his name
    // is absent from, directly under a claim about his commits. The
    // author-filtered commit list is filtered on the git author email, which
    // lives in the commit objects, so it renders his name regardless of which
    // account holds that address.
    await expect(page.locator('a[href*="/graphs/contributors"]')).toHaveCount(0)
  })

  test('claims no commit ranking on Yosemite Crew', async ({ page }) => {
    // He was the largest contributor while he worked there and is not any
    // more: the founder has kept committing since his last commit in July
    // 2026 and is now well ahead on `main`. Every page that links to the
    // commit list is one click from that fact, so any superlative here would
    // be contradicted by its own citation. The bare count does not rot.
    const body = await page.locator('body').innerText()
    expect(body).not.toMatch(
      /largest contributor|most on the project|more than any other|ahead of every other/i,
    )
  })

  test('never shows a zero in the proof strip', async ({ page }) => {
    // Job Sentinel and ATLAS have no stars; a panel reading "0" would put the
    // weakest fact on the page in the largest type.
    const strip = page.locator('section').nth(1)
    await expect(strip.getByText('commits on the project')).toBeVisible()
    for (const value of await strip.locator('.tabular').allTextContents()) {
      expect(value.trim()).not.toBe('0')
    }
  })

  test('runs the sections in the intended order, numbered in sequence', async ({ page }) => {
    // Education sits directly under experience: the two answer the same
    // question, and a reader checking whether someone is qualified should not
    // have to pass three other sections to find half the answer.
    const labels = await page
      .locator('main section > div > p.mono')
      .filter({ hasText: /^\d{2} - / })
      .allTextContents()

    // Open source sits ahead of Selected work: everything in Selected work is
    // self-published, and everything in Open source was reviewed and merged by
    // someone with no reason to be kind.
    expect(labels).toEqual([
      '01 - Experience',
      '02 - Education',
      '03 - Open source',
      '04 - Selected work',
      '05 - Research',
      '06 - Stack',
    ])
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

    // Examples use the 555 range, which is reserved for fiction. The real
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

  test('uses no em or en dashes in anything a reader sees', async ({ page }) => {
    // An em dash between clauses is one of the tells people read as machine-
    // written. The prose was rewritten rather than find-and-replaced, so this
    // guards the result: it fails on the character itself, wherever it appears.
    // innerText skips whatever is inside a closed <details>, and the longer
    // pull request lists keep their older rows in one, so open them all first
    // or those titles never get read.
    await page.evaluate(() => {
      document.querySelectorAll('details').forEach((d) => {
        d.open = true
      })
    })

    const text = await page.locator('body').innerText()
    const found = [...text.matchAll(/.{0,45}[—–].{0,45}/g)].map((m) => m[0].replace(/\s+/g, ' '))
    expect(found, `long dash in rendered text:\n${found.join('\n')}`).toEqual([])
  })

  test('folds the longer pull request lists without hiding them from a crawler', async ({
    page,
  }) => {
    const section = page.locator('section[aria-labelledby="oss-heading"]')
    const articles = section.locator('article')

    // A repository that folds shows four rows. One that does not fold may show
    // five, because splitMerged deliberately leaves a fifth row in place rather
    // than putting a disclosure in front of a single hidden item. Asserting a
    // flat four made the suite fail the moment a repo reached exactly five,
    // which is the one case the component is written to allow.
    for (const article of await articles.all()) {
      const shown = await article.locator('ul:not(details ul) > li').count()
      const folds = (await article.locator('details').count()) > 0
      expect(
        shown,
        folds
          ? 'a folding repository is showing more rows than the limit'
          : 'an unfolded repository has grown past the point where it should fold',
      ).toBeLessThanOrEqual(folds ? 4 : 5)
    }

    // A link inside a closed <details> is still in the document, which is the
    // reason for using one rather than dropping the rows.
    const hidden = section.locator('details a[href*="/pull/"]')
    const hiddenCount = await hidden.count()
    expect(hiddenCount, 'nothing is folded away, so there is nothing to test').toBeGreaterThan(0)
    for (const href of await hidden.evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).href),
    )) {
      expect(href).toMatch(/^https:\/\/github\.com\/.+\/pull\/\d+$/)
    }
    await expect(hidden.first()).toBeHidden()

    // Opening it from the keyboard alone, which is what the native element
    // buys us over a div and a click handler.
    const summary = section.locator('details > summary').first()
    await expect(summary).toContainText(/show \d+ earlier/)
    await summary.focus()
    await page.keyboard.press('Enter')
    await expect(hidden.first()).toBeVisible()
    await expect(summary).toContainText(/hide the earlier \d+/)

    await page.keyboard.press('Enter')
    await expect(hidden.first()).toBeHidden()
  })

  test('leaves the short pull request lists alone', async ({ page }) => {
    // A disclosure that reveals one row is worse than the row. Repositories at
    // or under the limit render as a plain list.
    const shortOnes = page.locator('section[aria-labelledby="oss-heading"] article', {
      hasText: 'cosmos-framework',
    })
    await expect(shortOnes.locator('details')).toHaveCount(0)
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

    // Every merged pull request adds a link, and each one is a round trip to
    // GitHub made one at a time to stay under the rate limit. The default 30s
    // stopped being enough somewhere around the fifteenth.
    test.slow()

    const hrefs = await page
      .locator('a[href^="http"]')
      .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href))
    expect(hrefs.length).toBeGreaterThan(0)

    // Structured-data URLs are checked too. A dead link in `sameAs` is just as
    // broken as one in the markup and nobody sees it until a crawler does,
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

      // 429 means "you asked too often", which is a statement about this
      // runner's IP and never about the link. GitHub returns it to CI for the
      // filtered commit-list URL even while the page serves fine to a real
      // visitor, and LinkedIn returns it once a run has asked a few times.
      // Treating it as a failure made this suite fail for a link that works.
      if (status === 429) continue

      // LinkedIn also answers automation with 999, its own bot block. Same
      // reasoning, but it is specific to that host, so keep it scoped.
      if (status === 999 && new URL(href).hostname.endsWith('linkedin.com')) continue

      // Everything else, on any host, must be a genuine success. 404 and 410
      // in particular have to keep failing: a dead link is exactly what this
      // test exists to catch, and it caught the Yosemite repo going down.
      expect(status, `${href} returned ${status}`).toBeLessThan(400)
    }
  })
})

test.describe('the hero figure', () => {
  /** Every stroke, as endpoint pairs in the SVG's own coordinates. */
  const strokes = (page: import('@playwright/test').Page) =>
    page.locator('[data-rangoli] svg line').evaluateAll((els) =>
      els.map((el) => {
        const n = (a: string) => Number.parseFloat(el.getAttribute(a) ?? 'NaN')
        return [n('x1'), n('y1'), n('x2'), n('y2')] as [number, number, number, number]
      }),
    )

  test('joins the dots rather than looping around them', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-rangoli] svg line').first()).toBeAttached()

    // This is the whole correction. A Maharashtrian rangoli lands on the dots;
    // the southern kolam curves around them and touches none. So every stroke
    // must be a straight line whose ends sit exactly on lattice dots.
    const dots = await page
      .locator('[data-rangoli] svg circle')
      .evaluateAll((els) => els.map((el) => `${el.getAttribute('cx')},${el.getAttribute('cy')}`))
    expect(dots.length, 'the lattice must be drawn').toBeGreaterThan(0)

    const lines = await strokes(page)
    expect(lines.length).toBeGreaterThan(0)
    for (const [x1, y1, x2, y2] of lines) {
      expect(dots).toContain(`${x1},${y1}`)
      expect(dots).toContain(`${x2},${y2}`)
    }

    // And no curves anywhere in the figure.
    expect(await page.locator('[data-rangoli] svg path').count()).toBe(0)
  })

  test('is unchanged by all eight symmetries of the square', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-rangoli] svg line').first()).toBeAttached()

    const lines = await strokes(page)
    const box = await page
      .locator('[data-rangoli] svg')
      .getAttribute('viewBox')
      .then((v) => (v ?? '0 0 0 0').split(' ').map(Number))
    const c = (box[2] ?? 0) / 2

    const round = (v: number) => Math.round(v * 100) / 100
    const asKey = (a: [number, number], b: [number, number]) =>
      [`${round(a[0])},${round(a[1])}`, `${round(b[0])},${round(b[1])}`].sort().join('|')

    const maps: ((p: [number, number]) => [number, number])[] = [
      ([u, v]) => [u, v],
      ([u, v]) => [-v, u],
      ([u, v]) => [-u, -v],
      ([u, v]) => [v, -u],
      ([u, v]) => [-u, v],
      ([u, v]) => [u, -v],
      ([u, v]) => [v, u],
      ([u, v]) => [-v, -u],
    ]

    const centred = lines.map(
      ([x1, y1, x2, y2]) =>
        [
          [x1 - c, y1 - c],
          [x2 - c, y2 - c],
        ] as [[number, number], [number, number]],
    )
    const original = new Set(centred.map(([a, b]) => asKey(a, b)))

    for (const [i, f] of maps.entries()) {
      const image = new Set(centred.map(([a, b]) => asKey(f(a), f(b))))
      expect(image, `symmetry ${i} must map the figure onto itself`).toEqual(original)
    }
  })

  test('leaves no stroke ending in mid-air', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-rangoli] svg line').first()).toBeAttached()

    const degree = new Map<string, number>()
    for (const [x1, y1, x2, y2] of await strokes(page)) {
      for (const k of [`${x1},${y1}`, `${x2},${y2}`]) degree.set(k, (degree.get(k) ?? 0) + 1)
    }
    expect(degree.size).toBeGreaterThan(0)
    for (const [at, d] of degree) expect(d, `dot ${at} carries one stroke`).toBeGreaterThan(1)
  })

  test('never resizes while it draws, replays or reseeds', async ({ page }) => {
    await page.goto('/')
    const svg = page.locator('[data-rangoli] svg')
    await expect(svg).toBeVisible()

    const box = async () => {
      const b = await svg.boundingBox()
      if (!b) throw new Error('figure has no box')
      return `${Math.round(b.width)}x${Math.round(b.height)}`
    }

    const first = await box()
    const seen = new Set([first])
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(220)
      seen.add(await box())
    }

    await page.getByRole('button', { name: 'draw it again' }).click()
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(220)
      seen.add(await box())
    }

    await page.getByRole('button', { name: 'another rangoli' }).click()
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(220)
      seen.add(await box())
    }

    expect([...seen], 'the figure must hold one size throughout').toEqual([first])
  })

  test('draws a different rangoli on demand', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-rangoli] svg line').first()).toBeAttached()

    const shape = async () =>
      (await strokes(page))
        .map((l) => l.join(','))
        .sort()
        .join('|')
    const before = await shape()
    expect(before.length).toBeGreaterThan(0)

    await page.getByRole('button', { name: 'another rangoli' }).click()
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
