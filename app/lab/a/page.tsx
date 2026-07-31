import Link from 'next/link'
import contributions from '@/data/contributions.json'
import { experience, hero, identity, metrics, projects } from '@/content/profile'
import { RangoliFigure, rangoliStats } from './rangoli-figure'

export const metadata = { title: 'Concept A — One Stroke' }

/**
 * Deliberately coarse. At six cells across, each arc is large enough that the
 * eye can follow the line all the way round — which is the entire point. A
 * denser grid turns the same algorithm into wallpaper.
 */
const HERO = { rows: 6, cols: 6, size: 74, seed: 23, pad: 40 }

/**
 * The contribution lattice.
 *
 * A year laid out the GitHub way — 53 weeks across, 7 days down — makes a band
 * so thin that the arcs collapse into texture and the commit-weighted dots stop
 * reading at all. Reshaping the same 365 days into a squarer block keeps every
 * day and makes both the data and the line legible.
 */
const LATTICE = { rows: 13, cols: 27, size: 34, seed: 3, pad: 18 }

/** One weight per lattice dot, in the same row-major order the figure draws. */
function latticeWeights(): number[] {
  const days = contributions.days
  const out: number[] = []
  let day = 0
  for (let r = 0; r <= LATTICE.rows; r++) {
    for (let c = 0; c <= LATTICE.cols; c++) {
      out.push(days[day]?.c ?? 0)
      day++
    }
  }
  return out
}

export default function ConceptA() {
  const stats = rangoliStats(HERO)
  const weights = latticeWeights()
  const active = weights.filter((w) => w > 0).length

  return (
    <main id="main" className="min-h-screen bg-bg text-fg">
      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto grid min-h-[82vh] max-w-6xl grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:px-10">
        <div>
          <p className="mono text-fg-faint">01 — {identity.location}</p>
          <h1 className="mt-6 text-[length:var(--text-display)] font-semibold leading-[1.02] tracking-[-0.03em]">
            {identity.name}
          </h1>
          <p className="mt-7 max-w-xl text-[length:var(--text-lede)] leading-[1.45] text-fg">
            {hero.line}
          </p>
          <p className="mt-5 max-w-lg text-fg-muted">{hero.sub}</p>

          <p className="mono mt-8 flex items-center gap-2 text-fg-muted">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle"
            />
            {identity.status}
          </p>
        </div>

        <figure className="lg:pl-8">
          <div className="text-fg">
            <RangoliFigure
              {...HERO}
              className="h-auto w-full max-w-[440px]"
              duration={6}
              strokeWidth={2}
              showOrigin
            />
          </div>
          <figcaption className="mono-note mt-6 max-w-[440px] text-fg-faint">
            <span className="text-accent">●</span> one stroke · {stats.dots} dots ·{' '}
            {stats.loopsBefore} loops spliced into {stats.arcs} arcs · never crosses, never lifts
          </figcaption>
        </figure>
      </section>

      {/* ── proof strip ──────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-bg-sunk">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-line px-6 md:grid-cols-4 md:divide-x lg:px-10">
          {metrics.map((m) => (
            <div key={m.label} className="px-2 py-8 md:px-6">
              <p className="tabular text-3xl font-medium tracking-tight md:text-4xl">{m.value}</p>
              <p className="mono mt-2 text-fg-muted">{m.label}</p>
              {m.live && <p className="mono mt-1 text-fg-faint">live</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ── the lattice: ornament and data are the same object ───────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
        <p className="mono text-fg-faint">02 — The lattice</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.02em]">
          One line, drawn around a year of work.
        </h2>
        <p className="mt-5 max-w-2xl text-fg-muted">
          Every dot below is a real day. Its size is the number of commits pushed that day —{' '}
          <span className="tabular text-fg">
            {(
              contributions.totals['harshit-yc'] + contributions.totals.harshitwandhare
            ).toLocaleString()}
          </span>{' '}
          contributions across <span className="tabular text-fg">{active.toLocaleString()}</span>{' '}
          active days. The line weaves around all of them without lifting once.
        </p>

        {/* The figure is wider than a phone, so this scrolls — which means it
            must be reachable and scrollable by keyboard, not just by touch. */}
        <div
          role="group"
          aria-label="Contribution lattice — scroll horizontally to see the full year"
          tabIndex={0}
          className="mt-12 overflow-x-auto border border-line bg-bg-sunk p-8"
        >
          {/* The line recedes and the data leads: stroke in the muted tone,
              dots in the accent and sized by that day's real commit count. */}
          <div className="min-w-[760px] text-fg-faint">
            <RangoliFigure
              {...LATTICE}
              weights={weights}
              className="h-auto w-full"
              duration={9}
              strokeWidth={1.1}
            />
          </div>
        </div>

        <p className="mono-note mt-5 text-fg-faint">
          the busiest single day was{' '}
          <span className="tabular text-fg">{Math.max(...contributions.days.map((d) => d.c))}</span>{' '}
          commits · the lattice holds{' '}
          <span className="tabular text-fg">{contributions.days.length}</span> days
        </p>
      </section>

      {/* ── the rule ─────────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-bg-sunk">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
          <p className="mono text-fg-faint">03 — The rule</p>
          <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.02em]">
                It is not a drawing. It is a constraint being satisfied.
              </h2>
              <p className="mt-6 text-fg-muted">
                Lay a grid of equidistant dots. Draw a line that goes{' '}
                <em className="not-italic text-fg">around</em> every dot, never through one, never
                crossing itself, and closing where it began. That rule is old — it is how the
                dot-grid rangoli of Maharashtra is drawn, on doorsteps, at dawn, from memory.
              </p>
              <p className="mt-4 text-fg-muted">
                It is also a solvable problem. Each cell of the lattice carries one of two tiles;
                every arc endpoint lands on a shared edge midpoint, so the arcs can only ever form
                closed loops. Flipping a single tile where two loops meet splices them into one.
                Repeat until one stroke is left.
              </p>
              <p className="mt-4 text-fg-muted">
                The figure above the fold is not a picture of that idea. It is the output of it,
                computed at build time and shipped as static SVG.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-8 gap-y-7 self-start border-l border-line pl-8">
              {[
                ['dots in the lattice', stats.dots],
                ['loops in the raw tiling', stats.loopsBefore],
                ['tile flips to splice them', stats.flips],
                ['arcs in the final stroke', stats.arcs],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className="mono text-fg-faint">{label}</dt>
                  <dd className="tabular mt-1.5 text-2xl">{String(value)}</dd>
                </div>
              ))}
              <div className="col-span-2 border-t border-line pt-6">
                <dt className="mono text-fg-faint">strokes at the end</dt>
                <dd className="tabular mt-1.5 text-2xl text-accent">1</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ── experience ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
        <p className="mono text-fg-faint">04 — Experience</p>
        <div className="mt-12 space-y-16">
          {experience.map((role) => (
            <article key={role.org} className="grid gap-6 lg:grid-cols-[200px_1fr] lg:gap-12">
              <div>
                <p className="mono text-fg-muted">
                  <time dateTime={role.from}>{role.from}</time> —{' '}
                  <time dateTime={role.to}>{role.to}</time>
                </p>
                <p className="mono mt-1 text-fg-faint">{role.where}</p>
              </div>
              <div className="border-l border-line pl-6 lg:pl-8">
                <h3 className="text-xl font-semibold tracking-[-0.01em]">{role.title}</h3>
                <p className="mt-1 text-fg-muted">{role.org}</p>
                {role.badge && (
                  <p className="mono mt-3 inline-block border border-accent/40 bg-accent-soft px-2.5 py-1 text-accent">
                    {role.badge}
                  </p>
                )}
                <ul className="mt-5 space-y-3">
                  {role.points.slice(0, 5).map((p) => (
                    <li key={p.text} className="flex gap-3 text-fg-muted">
                      <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-line-strong" />
                      <span>
                        {p.text}
                        {p.source === 'document' && (
                          <span className="mono ml-2 align-middle text-fg-faint">documented</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── projects ─────────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-bg-sunk">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10">
          <p className="mono text-fg-faint">05 — Selected work</p>
          <div className="mt-12 grid gap-px bg-line md:grid-cols-3">
            {projects.map((p) => (
              <article key={p.name} className="flex flex-col bg-bg p-7">
                <h3 className="text-xl font-semibold tracking-[-0.01em]">{p.name}</h3>
                <p className="mt-2 text-fg-muted">{p.blurb}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.points.slice(0, 3).map((pt) => (
                    <li key={pt.text} className="text-fg-muted">
                      {pt.text}
                    </li>
                  ))}
                </ul>
                <p className="mono mt-7 text-fg-faint">{p.stack.join(' · ')}</p>
                <p className="mono mt-4 flex gap-4">
                  {p.repo && (
                    <a className="text-accent underline" href={p.repo}>
                      repo
                    </a>
                  )}
                  {p.live && (
                    <a className="text-accent underline" href={p.live}>
                      live
                    </a>
                  )}
                  {p.docs && (
                    <a className="text-accent underline" href={p.docs}>
                      docs
                    </a>
                  )}
                  {p.private && <span className="text-fg-faint">private repository</span>}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <Link href="/" className="mono text-fg-muted underline">
          ← back to both directions
        </Link>
      </div>
    </main>
  )
}
