# portfolio

Personal engineering site for **Harshit Wandhare**. Built to survive a recruiter's
twenty-second skim and an engineer's twenty-minute one.

**Live:** <https://harshitwandhare.com>

[![CI](https://github.com/harshitwandhare/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/harshitwandhare/portfolio/actions/workflows/ci.yml)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.2%20LTS-000)](https://nextjs.org)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178c6)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-a3480a.svg)](LICENSE)

## The idea

A **tipkyanchi rangoli** is the dotted form drawn on doorsteps across
Maharashtra. Lay a square lattice of equidistant dots, then join dot to dot with
straight lines until the geometry closes into a motif. The dots are scaffolding:
by the time it is finished they are under the design.

An earlier version of this file was not exact about that. The southern *sikku
kolam* draws one continuous curve that loops **around** the dots and never
touches them, while the Maharashtrian line is straight and lands **on** them.
This site implemented the first and called it the second.

Symmetry is what turns the strokes into a motif. A rangoli is drawn one wedge at
a time and repeated around the centre, so the eighth drawn first decides the
whole figure. That is the rule, and it is checkable:

```
choose strokes         ->  only inside one eighth of the square, the wedge
                           0 <= v <= u measured from the centre dot

repeat them round      ->  close that set under the eight symmetries of the
                           square: four rotations and four reflections

drop the loose ends    ->  remove every stroke with a free end, and repeat.
                           A rangoli closes; a stroke ending in mid-air is an
                           unfinished drawing

grow until it is whole ->  keep feeding in strokes until what survives is a
                           single connected figure
```

The implementation is [`lib/tipkyanchi.ts`](lib/tipkyanchi.ts). It is
deterministic, so the same seed gives the same figure, which is why the
centrepiece is rendered on the server and costs the browser no JavaScript at
all.

The symmetry is asserted rather than assumed: the suite applies each of the
eight symmetries to the finished figure and compares the edge set to itself, and
separately checks that no dot is left carrying a single stroke. Pruning cannot
break the symmetry, because degree is constant across a symmetry orbit.

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
  resume/               the résumé, as a document that prints to PDF
  layout.tsx            fonts, theme bootstrap, skip link
  globals.css           design tokens for both themes, contrast-checked
  tipkyanchi-figure.tsx server-rendered SVG figure, drawn by CSS
  rangoli-player.tsx    replay and reseed, the only script the hero needs
  motion.tsx            reveal, count-up, scroll progress
  theme-toggle.tsx      stateless light-dark switch
lib/
  tipkyanchi.ts         the figure generator
  tipkyanchi.test.ts    68 tests asserting the symmetry actually holds
content/
  profile.ts            every claim the site makes, with its provenance
e2e/                    accessibility and content guards
scripts/
  check-bundle-budget.mjs   measures first-load JS in a real browser
```

### The centrepiece is the working, not the answer

The hero draws the rangoli in the order a hand would make it. The wedge the seed
chose goes down first, then its seven repeats around the centre, so what you
watch is one eighth of a decision becoming the whole figure. It is not tied to
scroll, because a reader should not have to scroll past their own introduction
to watch it resolve.

The drawing is CSS, not script: each of the eight passes is one group with its
own animation delay. The server renders the finished figure, so with scripting
off you get the answer, and `draw it again` and `another rangoli` are the only
things JavaScript adds. Under `prefers-reduced-motion` it holds the finished
figure rather than animating faster.

### Content has provenance, not vibes

Every fact in [`content/profile.ts`](content/profile.ts) carries a `source`:

| Tag         | Meaning                                                          |
| ----------- | ---------------------------------------------------------------- |
| `document`  | Backed by a letter or record in the repository, and linked to it |
| `confirmed` | Publicly checkable: a live API, a public repository              |
| `self`      | The author's own account, written as such                        |

Nothing renders without one. Claims tagged `document` show a marker on the page so
a reader can go and check, and the numbers in the proof strip link straight to the
GitHub page they come from.

Anything sourced from GitHub drifts, so it gets re-read from the API rather than
remembered. The commit count and ranking were last checked on 2026-08-18 against
`/repos/{owner}/{repo}/commits?author=<email>`, paginated: harshit 1,394,
harshvardhan 1,058, ankit 81, all on `main`.

The proof strip links to
[the commit list filtered by author email](https://github.com/YosemiteCrew/Yosemite-Crew/commits/main?author=harshit%40yosemitecrew.com)
rather than to the contributors graph. Two reasons. Signed out, the graph renders
the aggregate chart and no per-person breakdown, so a visitor following it would
learn nothing about the person who linked it. More importantly, the graph only
lists contributors whose commits currently resolve to a GitHub account, and these
do not: the work address they were authored under is no longer verified on any
account, so the graph omits him entirely. The author email is part of each commit
object and cannot be reassigned, so filtering on it is stable no matter who holds
the address. Swap the email in that URL to check anyone else's count.

## Quality gates

CI fails on any of these, and they run on every pull request.

| Gate           | Bar                                                                 |
| -------------- | ------------------------------------------------------------------- |
| Format         | Prettier, checked not fixed                                         |
| Lint           | ESLint, zero warnings                                               |
| Types          | `tsc --strict`, `noUncheckedIndexedAccess`, zero `any`              |
| Unit           | Vitest, **100% line and function coverage** on `lib/`               |
| E2E            | Playwright × Chromium, Firefox, WebKit, mobile                      |
| Accessibility  | `@axe-core/playwright`, zero critical or serious violations         |
| Console        | Zero errors _and_ zero warnings in production                       |
| No-JS          | Core content must render with scripting disabled                    |
| Reduced motion | The finished figure must show immediately, not animate faster       |
| Overflow       | No horizontal scroll at 375 / 768 / 1280 / 1920                     |
| Links          | Every external URL must resolve under 400                           |
| Bundle         | First-load JS, gzipped, from a clean install, under 160 KB          |
| Lighthouse     | Performance ≥ 95 · Accessibility 100 · Best Practices 100 · SEO 100 |

Measured locally against the production build:

```
perf 100 | a11y 100 | best-practices 100 | seo 100
first-load JS 146 KB gzipped of a 160 KB budget
```

### The résumé is a page, not a file

`/resume` renders from the same constants the homepage does, so the two cannot
disagree, which is the failure mode a separately maintained PDF always eventually
hits. Printing it produces the PDF, so the copy a recruiter takes is never a stale
upload someone forgot to replace.

It also carries **no phone number**. That belongs on the copy sent to a named
recipient, not on a page a crawler can read. Tests assert both: that the two
surfaces agree, and that no phone-shaped string reaches either.

### Two numbers worth being honest about

**The bundle number took four attempts to measure, and three of them were
confidently wrong.** Kept here because the failure mode is the interesting part:

1. Summing the built chunk directory counted assets belonging to other routes.
2. Trusting the browser's reported transfer size made the answer depend on
   whether that server compressed.
3. Gzipping each script here instead was the correct method, but it measured
   against a local `node_modules` grown by repeated `npm install` runs rather
   than from the lockfile. It reported **69 KB** and I believed it, because it
   was the answer I wanted.
4. The same method after a clean `npm ci` reported **146 KB**, matching CI
   exactly, and later confirmed against the deployed site itself: Vercel serves
   **145.9 KB**.

A local `node_modules` grown by repeated installs still reports about 70 KB, so
the script now says so out loud rather than letting the smaller number look like
progress.

The real figure is about 146 KB, and almost all of it is React 19 plus the Next
App Router runtime; this site's own components are a few kilobytes of it. Going
materially lower means dropping hydration, which is a framework choice rather
than a tuning exercise. The budget sits at 160 KB so it still catches
regressions in the part we control.

Two lessons, both cheap in hindsight: a number you cannot reproduce from a clean
install is not a measurement, and a disagreement between two environments is
information rather than an inconvenience.

**Branch coverage is gated at 80%, lines and functions at 100%.** The uncovered
branches are defensive `??` guards on lookups that cannot miss for a well-formed
lattice. Tests that fake those states would assert nothing real.

## Design notes

Chosen deliberately against the 2026 generated-site signature: no Inter, no
blue/indigo/violet, no default Tailwind scale, no glassmorphism.

- **Type.** Instrument Sans for text, JetBrains Mono for every number, date and
  stack label, Newsreader for narrative. Three families, four sizes, self-hosted.
- **Colour.** One accent, a warm orange. Nagpur is India's Orange City, which puts
  the single saturated colour on the site outside the hue band every template lives
  in. Light mode is designed independently, not inverted, and both themes are
  checked to WCAG AA contrast.
- **Motion.** The centrepiece draws itself. Everything else is a 200 ms fade and
  rise. No parallax, no scroll-hijacking, no cursor followers.

## Licence

[MIT](LICENSE) for the code. The written content, letters and photographs are not
licensed for reuse.
