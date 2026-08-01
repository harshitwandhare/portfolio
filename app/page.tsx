/* eslint-disable @next/next/no-img-element -- the logos and portrait are small
   static assets with fixed dimensions; next/image would add client JavaScript
   and a layout wrapper for no benefit at this size. */
import contributions from '@/data/contributions.json'
import {
  education,
  experience,
  hero,
  identity,
  learning,
  metrics,
  projects,
  research,
  skills,
} from '@/content/profile'
import { CountUp, Reveal, ScrollProgress } from './motion'
import { RangoliFigure } from './rangoli-figure'
import { SpliceFigure } from './splice'

/**
 * The hero figure. Deliberately coarse: at six cells across each arc is large
 * enough that the eye can follow the line all the way round, which is the whole
 * point. A denser grid turns the same algorithm into wallpaper.
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

const totalContributions = contributions.totals['harshit-yc'] + contributions.totals.harshitwandhare

export default function Home() {
  const weights = latticeWeights()
  const active = weights.filter((w) => w > 0).length
  const busiest = Math.max(...contributions.days.map((d) => d.c))

  return (
    <>
      <ScrollProgress />
      <main id="main" className="bg-bg text-fg">
        {/* ── hero ───────────────────────────────────────────────────────── */}
        <section className="mx-auto grid min-h-[92vh] max-w-7xl grid-cols-1 items-center gap-16 px-6 py-24 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-10">
          <div>
            <p className="mono text-fg-faint">{identity.location}</p>
            {/* Two blocks rather than a <br>, so the accessible name stays
                "Harshit Wandhare" and not "HarshitWandhare". */}
            <h1 className="mt-7 text-[length:var(--text-display)] font-semibold leading-[0.96] tracking-[-0.035em]">
              <span className="block">Harshit</span> <span className="block">Wandhare</span>
            </h1>
            <p className="mt-9 max-w-xl text-[length:var(--text-lede)] leading-[1.4]">
              {hero.line}
            </p>
            <p className="mt-6 max-w-lg text-fg-muted">{hero.sub}</p>

            <p className="mono mt-10 flex items-center gap-2.5 text-fg-muted">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle"
              />
              {identity.status}
            </p>
          </div>

          {/* The figure is the algorithm, and it is playable. The server renders
              the finished stroke so it is never blank without JavaScript. */}
          <figure className="lg:justify-self-end lg:max-w-[560px]">
            <noscript>
              <div className="text-fg">
                <RangoliFigure {...HERO} strokeWidth={2.4} duration={0} showOrigin />
              </div>
            </noscript>
            <SpliceFigure {...HERO} />
          </figure>
        </section>

        {/* ── proof strip ────────────────────────────────────────────────── */}
        <section className="border-y border-line bg-bg-sunk">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-line px-6 md:grid-cols-4 md:divide-x lg:px-10">
            {metrics.map((m, i) => (
              <Reveal key={m.label} delay={i * 70}>
                <div className="px-2 py-10 md:px-7">
                  <p className="tabular text-4xl font-medium tracking-tight md:text-5xl">
                    <CountUp value={m.value} />
                  </p>
                  <p className="mono mt-3 text-fg-muted">{m.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── the rule ───────────────────────────────────────────────────── */}
        <section aria-labelledby="rule-heading" className="border-b border-line">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <Reveal>
              <p className="mono text-fg-faint">01 — The rule</p>
              <h2
                id="rule-heading"
                className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.025em] md:text-5xl"
              >
                It is not a drawing. It is a constraint being satisfied.
              </h2>
              <div className="mt-9 grid max-w-5xl gap-8 text-fg-muted md:grid-cols-2 md:gap-14">
                <p>
                  Lay a grid of equidistant dots. Draw a line that goes{' '}
                  <em className="not-italic text-fg">around</em> every dot, never through one, never
                  crossing itself, and closing where it began. That rule is old — it is how the
                  dot-grid rangoli of Maharashtra is drawn, on doorsteps, at dawn, from memory.
                </p>
                <p>
                  It is also a solvable problem, and a raw tiling does not solve it — it comes out
                  as a dozen separate loops. Flipping one tile rewires two arcs and joins two of
                  those loops into one. The figure above plays that through to the single stroke;
                  press <span className="text-fg">new figure</span> and it solves a fresh one.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── the lattice ────────────────────────────────────────────────── */}
        <section aria-labelledby="lattice-heading" className="border-b border-line bg-bg-sunk">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <Reveal>
              <p className="mono text-fg-faint">02 — The lattice</p>
              <h2
                id="lattice-heading"
                className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.025em] md:text-5xl"
              >
                One line, drawn around a year of work.
              </h2>
              <p className="mt-6 max-w-2xl text-fg-muted">
                Every dot below is a real day, sized by the commits pushed that day —{' '}
                <span className="tabular text-fg">{totalContributions.toLocaleString()}</span>{' '}
                contributions across{' '}
                <span className="tabular text-fg">{active.toLocaleString()}</span> active days. The
                same rule applies: the line weaves around all of them and closes.
              </p>
            </Reveal>

            <Reveal delay={120}>
              {/* Wider than a phone, so it scrolls — which means it has to be
                  reachable and scrollable by keyboard, not only by touch. */}
              <div
                role="group"
                aria-label="Contribution lattice — scroll horizontally to see the full year"
                tabIndex={0}
                className="mt-12 overflow-x-auto border border-line bg-bg p-8"
              >
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
                busiest single day <span className="tabular text-fg">{busiest}</span> commits · the
                lattice holds <span className="tabular text-fg">{contributions.days.length}</span>{' '}
                days
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── experience ─────────────────────────────────────────────────── */}
        <section aria-labelledby="experience-heading" className="border-b border-line">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <p className="mono text-fg-faint">03 — Experience</p>
            <h2 id="experience-heading" className="sr-only">
              Experience
            </h2>
            <div className="mt-14 space-y-20">
              {experience.map((role) => (
                <Reveal key={role.org}>
                  <article className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-14">
                    <div>
                      {role.logo && (
                        <img
                          src={role.logo.src}
                          alt={role.logo.alt}
                          width={40}
                          height={40}
                          className="mb-4 h-10 w-10 object-contain"
                        />
                      )}
                      <p className="mono text-fg-muted">
                        <time dateTime={role.from}>{role.from}</time> —{' '}
                        <time dateTime={role.to}>{role.to}</time>
                      </p>
                      <p className="mono mt-1.5 text-fg-faint">{role.where}</p>
                    </div>
                    <div className="border-l border-line pl-7 lg:pl-10">
                      <h3 className="text-2xl font-semibold tracking-[-0.015em]">{role.title}</h3>
                      <p className="mt-1.5 text-fg-muted">{role.org}</p>
                      {role.badge && (
                        <p className="mono mt-4 inline-block border border-accent/40 bg-accent-soft px-2.5 py-1 text-accent">
                          {role.badge}
                        </p>
                      )}
                      <ul className="mt-6 space-y-3.5">
                        {role.points.map((p) => (
                          <li key={p.text} className="flex gap-3.5 text-fg-muted">
                            <span
                              aria-hidden
                              className="mt-[0.7em] h-px w-3.5 shrink-0 bg-line-strong"
                            />
                            <span>
                              {p.text}
                              {p.source === 'document' && (
                                <span className="mono ml-2 align-middle text-fg-faint">
                                  documented
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── projects ───────────────────────────────────────────────────── */}
        <section aria-labelledby="work-heading" className="border-b border-line bg-bg-sunk">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <p className="mono text-fg-faint">04 — Selected work</p>
            <h2 id="work-heading" className="sr-only">
              Selected work
            </h2>
            <div className="mt-14 grid gap-px bg-line md:grid-cols-3">
              {projects.map((p, i) => (
                <Reveal key={p.name} delay={i * 90} className="bg-bg">
                  <article className="flex h-full flex-col p-8">
                    <div className="flex h-10 items-center gap-3">
                      {p.logo &&
                        (p.logo.srcLight ? (
                          <>
                            <img
                              src={p.logo.src}
                              alt={p.logo.alt}
                              width={32}
                              height={32}
                              className="only-dark h-8 w-8 object-contain"
                            />
                            <img
                              src={p.logo.srcLight}
                              alt={p.logo.alt}
                              width={32}
                              height={32}
                              className="only-light h-8 w-8 object-contain"
                            />
                          </>
                        ) : (
                          <img
                            src={p.logo.src}
                            alt={p.logo.alt}
                            width={32}
                            height={32}
                            className="h-8 w-8 object-contain"
                          />
                        ))}
                      <h3 className="text-2xl font-semibold tracking-[-0.015em]">{p.name}</h3>
                    </div>
                    <p className="mt-3 text-fg-muted">{p.blurb}</p>
                    <ul className="mt-6 flex-1 space-y-3">
                      {p.points.map((pt) => (
                        <li key={pt.text} className="text-fg-muted">
                          {pt.text}
                        </li>
                      ))}
                    </ul>
                    <p className="mono mt-8 text-fg-faint">{p.stack.join(' · ')}</p>
                    <p className="mono mt-4 flex flex-wrap gap-4">
                      {p.repo && (
                        <a className="text-accent underline underline-offset-4" href={p.repo}>
                          repo
                        </a>
                      )}
                      {p.live && (
                        <a className="text-accent underline underline-offset-4" href={p.live}>
                          live
                        </a>
                      )}
                      {p.docs && (
                        <a className="text-accent underline underline-offset-4" href={p.docs}>
                          docs
                        </a>
                      )}
                      {p.private && <span className="text-fg-faint">private repository</span>}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── research ───────────────────────────────────────────────────── */}
        <section aria-labelledby="research-heading" className="border-b border-line">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <p className="mono text-fg-faint">05 — Research</p>
            <h2 id="research-heading" className="sr-only">
              Research
            </h2>
            <div className="mt-14 space-y-14">
              {research.map((paper) => (
                <Reveal key={paper.title}>
                  <article className="max-w-4xl">
                    <h3 className="text-xl font-semibold leading-snug tracking-[-0.01em]">
                      {paper.title}
                    </h3>
                    <p className="mono mt-2.5 text-fg-faint">{paper.venue}</p>
                    <ul className="mt-5 space-y-3">
                      {paper.points.map((pt) => (
                        <li key={pt} className="flex gap-3.5 text-fg-muted">
                          <span
                            aria-hidden
                            className="mt-[0.7em] h-px w-3.5 shrink-0 bg-line-strong"
                          />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── skills ─────────────────────────────────────────────────────── */}
        <section aria-labelledby="skills-heading" className="border-b border-line bg-bg-sunk">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <p className="mono text-fg-faint">06 — Stack</p>
            <h2 id="skills-heading" className="sr-only">
              Technical skills
            </h2>
            {/* Reveal carries the grid classes itself so the DOM stays
                dl > div > dt/dd. An extra wrapper would orphan the terms. */}
            <dl className="mt-14 space-y-8">
              {skills.map((group, i) => (
                <Reveal
                  key={group.group}
                  delay={i * 60}
                  className="grid gap-3 border-t border-line pt-6 md:grid-cols-[220px_1fr] md:gap-10"
                >
                  <dt className="mono text-fg-faint">{group.group}</dt>
                  <dd className="flex flex-wrap gap-x-5 gap-y-2 text-fg-muted">
                    {group.items.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </dd>
                </Reveal>
              ))}
              <Reveal className="grid gap-3 border-t border-line pt-6 md:grid-cols-[220px_1fr] md:gap-10">
                <dt className="mono text-accent">currently learning</dt>
                <dd className="text-fg-muted">{learning.join(', ')}</dd>
              </Reveal>
            </dl>
          </div>
        </section>

        {/* ── education, portrait and contact ────────────────────────────── */}
        <section
          aria-labelledby="contact-heading"
          className="mx-auto max-w-7xl px-6 py-24 lg:px-10"
        >
          <p className="mono text-fg-faint">07 — Education</p>
          <h2 id="contact-heading" className="sr-only">
            Education and contact
          </h2>

          <div className="mt-12 grid gap-16 lg:grid-cols-[1fr_320px] lg:gap-20">
            <div className="space-y-10">
              {education.map((e) => (
                <Reveal key={e.school}>
                  <article className="grid gap-3 sm:grid-cols-[160px_1fr] sm:gap-10">
                    <p className="mono text-fg-muted">
                      <time dateTime={e.from}>{e.from}</time> — <time dateTime={e.to}>{e.to}</time>
                    </p>
                    <div>
                      <h3 className="text-xl font-semibold tracking-[-0.01em]">{e.school}</h3>
                      <p className="mt-1.5 text-fg-muted">{e.detail}</p>
                      <p className="mono mt-2 text-fg-faint">{e.note}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal delay={100}>
              <figure className="lg:sticky lg:top-24">
                <img
                  src={identity.portrait}
                  alt="Harshit Wandhare"
                  width={800}
                  height={1000}
                  className="w-full border border-line object-cover"
                />
                <figcaption className="mono mt-3 text-fg-faint">Richardson, TX</figcaption>
              </figure>
            </Reveal>
          </div>

          <Reveal>
            <div className="mt-24 border-t border-line pt-14">
              <p className="text-[length:var(--text-lede)] leading-[1.4]">
                Open to Summer 2027 SWE and AI/ML internships.
              </p>
              <ul className="mono mt-8 flex flex-wrap gap-x-10 gap-y-4">
                <li>
                  <a
                    className="text-accent underline underline-offset-4"
                    href={`mailto:${identity.email}`}
                  >
                    {identity.email}
                  </a>
                </li>
                <li>
                  <a className="text-accent underline underline-offset-4" href={identity.github}>
                    github
                  </a>
                </li>
                <li>
                  <a className="text-accent underline underline-offset-4" href={identity.linkedin}>
                    linkedin
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mono mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-6 py-10 text-fg-faint lg:px-10">
          <span>{identity.name}</span>
          <span>Richardson, TX</span>
          <span className="ml-auto">the figure is a tipkyanchi rangoli, solved in the browser</span>
        </div>
      </footer>
    </>
  )
}
