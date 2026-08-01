# portfolio

Personal engineering site for **Harshit Wandhare**. Built to survive a recruiter's
twenty-second skim and an engineer's twenty-minute one.

**Live:** <https://harshitwandhare.com>

[![CI](https://github.com/harshitwandhare/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/harshitwandhare/portfolio/actions/workflows/ci.yml)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.2%20LTS-000)](https://nextjs.org)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178c6)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-a3480a.svg)](LICENSE)

---

## The idea

A **tipkyanchi rangoli** is the dot-grid form drawn on doorsteps across Maharashtra:
lay a lattice of equidistant dots, then draw a line that goes _around_ every dot,
never through one, never crossing itself, closing where it began.

That is not a decoration. It is a constraint, and it is solvable.

The figure on the site is the solution — computed at build time, shipped as static
SVG, and drawn over the author's real GitHub contribution history so the ornament
and the data are the same object.

```
lay a lattice          →  every cell gets one of two tiles, each a pair of
                          quarter-arcs centred on opposite corners

count the loops        →  every arc endpoint lands on a shared edge midpoint, so
                          every midpoint has degree two — the arcs can only form
                          closed loops, never a dangling end and never a crossing

splice them            →  flipping one tile rewires exactly the two arcs inside
                          that cell; if they belonged to different loops, the flip
                          joins those loops into one

repeat                 →  until a single unbroken stroke is left
```

The implementation is [`lib/rangoli.ts`](lib/rangoli.ts). It is deterministic —
same seed, same figure — which is why the centrepiece can be rendered on the
server and cost the browser nothing.

`flips === loops − 1` on every input tested, which is the optimal number of
splices. That property is asserted in the test suite rather than assumed.

## Running it

```bash
npm install
npm run dev
```

| Command                 | What it does                                           |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | Development server                                     |
| `npm run build`         | Production build                                       |
| `npm test`              | Unit tests (Vitest)                                    |
| `npm run test:coverage` | Unit tests with coverage gates                         |
| `npm run test:e2e`      | Playwright across Chromium, Firefox, WebKit and mobile |
| `npm run verify`        | Everything CI runs, locally                            |

## Layout

```
app/
  page.tsx              the site
  layout.tsx            fonts, theme bootstrap, skip link
  globals.css           design tokens — both themes, contrast-checked
  rangoli-figure.tsx    server-rendered SVG figure
  splice.tsx            the algorithm running, scrubbed by scroll
  motion.tsx            reveal / count-up / scroll progress
  theme-toggle.tsx      stateless light-dark switch
lib/
  rangoli.ts            the curve generator, and its intermediate stages
  rangoli.test.ts       21 tests asserting the constraint actually holds
content/
  profile.ts            every claim the site makes, with its provenance
data/
  contributions.json    real contribution calendar, fetched from the GitHub API
e2e/                    accessibility and content guards
scripts/
  check-bundle-budget.mjs   measures first-load JS in a real browser
```

### The centrepiece is the working, not the answer

Scrolling the `01 — The rule` section steps through the splice: the raw tiling
starts as a dozen separate closed loops, the largest is drawn in the accent and
the rest in grey, and the accent visibly spreads as loops are absorbed — down to
one unbroken stroke. `new figure` regenerates it from a fresh seed, live.

That section is progressive. The server renders the finished figure, so with
scripting off you get the answer; JavaScript only adds the ability to watch it
being derived. Under `prefers-reduced-motion` it holds the finished figure
rather than animating faster.

### Content has provenance, not vibes

Every fact in [`content/profile.ts`](content/profile.ts) carries a `source`:

| Tag         | Meaning                                                          |
| ----------- | ---------------------------------------------------------------- |
| `document`  | Backed by a letter or record in the repository, and linked to it |
| `confirmed` | Publicly checkable — a live API, a public repository             |
| `self`      | The author's own account, written as such                        |

Nothing renders without one. Claims tagged `document` show a marker on the page so
a reader can go and check.

## Quality gates

CI fails on any of these, and they run on every pull request.

| Gate           | Bar                                                           |
| -------------- | ------------------------------------------------------------- |
| Format         | Prettier, checked not fixed                                   |
| Lint           | ESLint, zero warnings                                         |
| Types          | `tsc --strict`, `noUncheckedIndexedAccess`, zero `any`        |
| Unit           | Vitest — **100% line and function coverage** on `lib/`        |
| E2E            | Playwright × Chromium, Firefox, WebKit, mobile                |
| Accessibility  | `@axe-core/playwright` — zero critical or serious violations  |
| Console        | Zero errors _and_ zero warnings in production                 |
| No-JS          | Core content must render with scripting disabled              |
| Reduced motion | The finished figure must show immediately, not animate faster |
| Overflow       | No horizontal scroll at 375 / 768 / 1280 / 1920               |
| Links          | Every external URL must resolve under 400                     |
| Bundle         | First-load JS measured in a real browser — **under 100 KB**   |
| Lighthouse     | Performance ≥ 95 · Accessibility 100 · Best Practices 100     |

Measured locally against the production build:

```
perf 100 | a11y 100 | best-practices 100 | seo 63
first-load JS 69.5 KB of a 100 KB budget
```

### Three numbers worth being honest about

**SEO scores 63, and that is on purpose — for now.** The only failing audit is
`is-crawlable`, because the site still carries `robots: noindex` while its content
is being finished. Every other SEO check passes. The assertion is relaxed for that
one audit rather than for the category, so the rest still gates. Removing the
noindex takes it to 100.

**First-load JS is 69.5 KB, and an earlier draft of this file claimed the floor
was 146 KB.** That was wrong, and the reason is worth writing down: the site then
had internal links to two other routes, and Next prefetches a linked route's
chunks on sight, so the measurement was counting three pages of JavaScript rather
than one. The lesson is that a bundle number measured without understanding what
the browser was actually asked to fetch is not a measurement.

**Branch coverage is gated at 80%, lines and functions at 100%.** The uncovered
branches are defensive `??` guards on lookups that cannot miss for a well-formed
lattice. Tests that fake those states would assert nothing real.

## Design notes

Chosen deliberately against the 2026 generated-site signature — no Inter, no
blue/indigo/violet, no default Tailwind scale, no glassmorphism.

- **Type** — Instrument Sans for text, JetBrains Mono for every number, date and
  stack label, Newsreader for narrative. Three families, four sizes, self-hosted.
- **Colour** — one accent, a warm orange. Nagpur is India's Orange City, which puts
  the single saturated colour on the site outside the hue band every template lives
  in. Light mode is designed independently, not inverted, and both themes are
  checked to WCAG AA contrast.
- **Motion** — the centrepiece draws itself. Everything else is a 200 ms fade and
  rise. No parallax, no scroll-hijacking, no cursor followers.

## Licence

[MIT](LICENSE) for the code. The written content, letters and photographs are not
licensed for reuse.
