import Link from 'next/link'
import contributions from '@/data/contributions.json'
import { hero, identity, story } from '@/content/profile'
import { PointCloud } from './point-cloud'

export const metadata = { title: 'Concept C — Reconstruction' }

const PHASES = [
  {
    phase: 0,
    kicker: '01 — The person',
    title: identity.name,
    body: hero.line,
  },
  {
    phase: 1,
    kicker: '02 — The record',
    title: 'The same points, rearranged into a year of commits.',
    body: 'Every particle in the portrait is one unit of work. Scroll, and the figure resolves into the contribution lattice it was made of.',
  },
  {
    phase: 2,
    kicker: '03 — The journey',
    title: 'Nagpur to Mumbai to Mainz to Dallas.',
    body: 'The same cloud again, this time as the path. One set of points, three readings.',
  },
] as const

export default function ConceptC() {
  const total = contributions.totals['harshit-yc'] + contributions.totals.harshitwandhare

  return (
    <main id="main" className="min-h-screen bg-bg text-fg">
      {/* The cloud is fixed behind the scrolling copy. */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <PointCloud src="/avatar.png" />
      </div>

      <div className="relative z-10">
        {PHASES.map((p) => (
          <section
            key={p.phase}
            data-phase={p.phase}
            className="flex min-h-screen items-center px-6 lg:px-10"
          >
            <div className="mx-auto w-full max-w-6xl">
              <div className="max-w-md bg-bg/80 p-8 backdrop-blur-sm">
                <p className="mono text-fg-faint">{p.kicker}</p>
                {/* The first panel carries the page's only h1. */}
                {p.phase === 0 ? (
                  <h1 className="mt-5 text-4xl font-semibold leading-[1.06] tracking-[-0.03em]">
                    {p.title}
                  </h1>
                ) : (
                  <h2 className="mt-5 text-4xl font-semibold leading-[1.06] tracking-[-0.03em]">
                    {p.title}
                  </h2>
                )}
                <p className="mt-5 text-fg-muted">{p.body}</p>
                {p.phase === 1 && (
                  <p className="tabular mt-6 text-3xl text-accent">{total.toLocaleString()}</p>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* The story, once the cloud has done its work. */}
        <section className="bg-bg px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="mono text-fg-faint">04 — The long version</h2>
            <div className="mt-12 space-y-14">
              {story.map((s) => (
                <article key={s.year} className="grid gap-4 sm:grid-cols-[90px_1fr] sm:gap-8">
                  <p className="mono text-fg-muted">
                    {s.year}
                    <span className="mt-1 block text-fg-faint">{s.place}</span>
                  </p>
                  <div className="border-l border-line pl-6">
                    <h3 className="text-xl font-semibold tracking-[-0.01em]">{s.title}</h3>
                    <p className="mt-3 font-serif text-[1.0625rem] leading-[1.7] text-fg-muted">
                      {s.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <p className="mono-note mt-16 border-t border-line pt-8 text-fg-faint">
              note — the portrait is sampled from a full-length photo, which is the only image
              currently on file. A proper headshot would change how this reads considerably.
            </p>

            <Link href="/" className="mono mt-10 inline-block text-fg-muted underline">
              ← back to both directions
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
