import Link from 'next/link'
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
import { ExternalLink } from './external-link'
import { Logo } from './logo'
import { CountUp, Reveal, ScrollProgress } from './motion'
import { RangoliFigure } from './rangoli-figure'
import { SpliceFigure } from './splice'

/**
 * The hero figure. Deliberately coarse: at six cells across each arc is large
 * enough that the eye can follow the line all the way round, which is the whole
 * point. A denser grid turns the same algorithm into wallpaper.
 */
const HERO = { rows: 6, cols: 6, size: 74, seed: 13, pad: 40 }

const LINK = 'text-accent underline underline-offset-4'
const TITLE_LINK =
  'underline decoration-line-strong decoration-1 underline-offset-[6px] transition-colors hover:decoration-accent'

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <main id="main" className="bg-bg text-fg">
        {/* ── hero ───────────────────────────────────────────────────────────
            Sized against the small viewport height minus the sticky header, so
            the whole hero is on screen at load. `svh` rather than `vh` so mobile
            browser chrome does not push it under. */}
        <section className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-7xl grid-cols-1 items-center gap-10 px-6 py-8 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:px-10 lg:py-10">
          <div>
            <p className="mono text-fg-faint">{identity.location}</p>
            {/* Two blocks rather than a <br>, so the accessible name stays
                "Harshit Wandhare" and not "HarshitWandhare". */}
            <h1 className="mt-5 text-[length:var(--text-display)] font-semibold leading-[0.96] tracking-[-0.035em]">
              <span className="block">Harshit</span> <span className="block">Wandhare</span>
            </h1>
            <p className="mt-7 max-w-xl text-[length:var(--text-lede)] leading-[1.4]">
              {hero.line}
            </p>
            <p className="mt-5 max-w-lg text-fg-muted">{hero.sub}</p>

            <p className="mono mt-7 flex items-center gap-2.5 text-fg-muted">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle"
              />
              {identity.status}
            </p>
          </div>

          {/* The figure is the algorithm, and it is playable. Width comes from
              the column, not the content, and the square shape means capping
              width caps height, which is what keeps the hero on one screen. */}
          <figure className="w-full lg:ml-auto" style={{ maxWidth: 'min(100%, 520px, 44svh)' }}>
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

        {/* ── experience ─────────────────────────────────────────────────── */}
        <section aria-labelledby="experience-heading" className="border-b border-line">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <p className="mono text-fg-faint">01 - Experience</p>
            <h2 id="experience-heading" className="sr-only">
              Experience
            </h2>
            <div className="mt-14 space-y-20">
              {experience.map((role) => (
                <Reveal key={role.org}>
                  <article className="grid gap-6 lg:grid-cols-[220px_1fr] lg:gap-14">
                    <div>
                      {role.logo &&
                        (role.href ? (
                          <ExternalLink
                            href={role.href}
                            aria-label={role.logo.alt}
                            className="mb-4 inline-block"
                          >
                            <Logo src={role.logo.src} alt={role.logo.alt} height={44} />
                          </ExternalLink>
                        ) : (
                          <Logo
                            src={role.logo.src}
                            alt={role.logo.alt}
                            height={44}
                            className="mb-4"
                          />
                        ))}
                      <p className="mono text-fg-muted">
                        <time dateTime={role.from}>{role.from}</time> to{' '}
                        <time dateTime={role.to}>{role.to}</time>
                      </p>
                      <p className="mono mt-1.5 text-fg-faint">{role.where}</p>
                    </div>
                    <div className="border-l border-line pl-7 lg:pl-10">
                      <h3 className="text-2xl font-semibold tracking-[-0.015em]">{role.title}</h3>
                      <p className="mt-1.5 text-fg-muted">
                        {role.href ? (
                          <ExternalLink
                            href={role.href}
                            className="underline decoration-line-strong decoration-1 underline-offset-[5px] transition-colors hover:text-fg hover:decoration-accent"
                          >
                            {role.org}
                          </ExternalLink>
                        ) : (
                          role.org
                        )}
                      </p>
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

        {/* ── education ──────────────────────────────────────────────────────
            Directly under experience: the two answer the same question, and a
            reader checking whether someone is qualified should not have to pass
            three other sections to find half the answer. */}
        <section aria-labelledby="education-heading" className="border-b border-line bg-bg-sunk">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <p className="mono text-fg-faint">02 - Education</p>
            <h2 id="education-heading" className="sr-only">
              Education
            </h2>

            <div className="mt-14 grid gap-16 lg:grid-cols-[1fr_320px] lg:gap-20">
              <div className="space-y-10">
                {education.map((e) => (
                  <Reveal key={e.school}>
                    <article className="grid gap-3 sm:grid-cols-[160px_1fr] sm:gap-10">
                      <div>
                        <Logo
                          src={e.logo.src}
                          srcLight={'srcLight' in e.logo ? e.logo.srcLight : undefined}
                          alt={e.logo.alt}
                          height={56}
                          className="mb-4"
                        />
                        <p className="mono text-fg-muted">
                          <time dateTime={e.from}>{e.from}</time> to{' '}
                          <time dateTime={e.to}>{e.to}</time>
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold tracking-[-0.01em]">
                          <ExternalLink href={e.href} className={TITLE_LINK}>
                            {e.school}
                          </ExternalLink>
                        </h3>
                        <p className="mt-1.5 text-fg-muted">{e.detail}</p>
                        <p className="mono mt-2 text-fg-faint">{e.note}</p>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={100}>
                {/* Not sticky. A pinned portrait beside a short list stutters
                    more than it flatters, and the aspect ratio is declared so
                    the frame holds its space before the image arrives. */}
                <figure>
                  <picture>
                    <source srcSet="/portrait.webp" type="image/webp" />
                    <img
                      src={identity.portrait}
                      alt="Harshit Wandhare"
                      width={800}
                      height={1000}
                      className="w-full border border-line object-cover"
                      style={{ aspectRatio: '4 / 5' }}
                    />
                  </picture>
                  <figcaption className="mono mt-3 text-fg-faint">Richardson, TX</figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── projects ───────────────────────────────────────────────────── */}
        <section aria-labelledby="work-heading" className="border-b border-line">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <p className="mono text-fg-faint">03 - Selected work</p>
            <h2 id="work-heading" className="sr-only">
              Selected work
            </h2>
            <div className="mt-14 grid gap-px bg-line md:grid-cols-3">
              {projects.map((p, i) => (
                <Reveal key={p.name} delay={i * 90} className="bg-bg">
                  <article className="flex h-full flex-col p-8">
                    <div className="flex h-10 items-center gap-3">
                      {p.logo && (
                        <Logo
                          src={p.logo.src}
                          srcLight={p.logo.srcLight}
                          alt={p.logo.alt}
                          height={32}
                        />
                      )}
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
                        <ExternalLink className={LINK} href={p.repo}>
                          repo
                        </ExternalLink>
                      )}
                      {p.live && (
                        <ExternalLink className={LINK} href={p.live}>
                          live
                        </ExternalLink>
                      )}
                      {p.docs && (
                        <ExternalLink className={LINK} href={p.docs}>
                          docs
                        </ExternalLink>
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
        <section aria-labelledby="research-heading" className="border-b border-line bg-bg-sunk">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <p className="mono text-fg-faint">04 - Research</p>
            <h2 id="research-heading" className="sr-only">
              Research
            </h2>
            <div className="mt-14 space-y-14">
              {research.map((paper) => (
                <Reveal key={paper.title}>
                  <article className="max-w-4xl">
                    <h3 className="text-xl font-semibold leading-snug tracking-[-0.01em]">
                      {/* The paper itself, not a citation of it. Opens away so a
                          reader keeps their place on the page. */}
                      <ExternalLink href={paper.file} className={TITLE_LINK}>
                        {paper.title}
                      </ExternalLink>
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
                    <p className="mono mt-5">
                      <ExternalLink href={paper.file} className={LINK}>
                        read the paper
                      </ExternalLink>
                      <span className="ml-3 text-fg-faint">
                        pdf · {paper.pages} pages · {paper.sizeMb} MB
                      </span>
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── skills ─────────────────────────────────────────────────────── */}
        <section aria-labelledby="skills-heading" className="border-b border-line">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <p className="mono text-fg-faint">05 - Stack</p>
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

        {/* ── contact ────────────────────────────────────────────────────── */}
        <section aria-labelledby="contact-heading" className="bg-bg-sunk">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
            <h2 id="contact-heading" className="sr-only">
              Contact
            </h2>
            <Reveal>
              <p className="text-[length:var(--text-lede)] leading-[1.4]">
                Open to Summer 2027 SWE and AI/ML internships.
              </p>
              <ul className="mono mt-8 flex flex-wrap gap-x-10 gap-y-4">
                <li>
                  <a className={LINK} href={`mailto:${identity.email}`}>
                    {identity.email}
                  </a>
                </li>
                <li>
                  <Link className={LINK} href="/resume">
                    résumé
                  </Link>
                </li>
                <li>
                  <ExternalLink className={LINK} href={identity.github}>
                    github
                  </ExternalLink>
                </li>
                <li>
                  <ExternalLink className={LINK} href={identity.linkedin}>
                    linkedin
                  </ExternalLink>
                </li>
              </ul>
            </Reveal>
          </div>
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
