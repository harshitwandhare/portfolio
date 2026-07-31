import Link from 'next/link'

export const metadata = { title: 'Three concepts — Harshit Wandhare' }

const CONCEPTS = [
  {
    slug: 'a',
    name: 'One Stroke',
    idea: 'A lattice of dots and a single unbroken line that goes around every one of them, never crossing, closing where it began.',
    why: 'The rule comes from tipkyanchi rangoli — the dot-grid form of Maharashtra, drawn in Vidarbha, where he is from. It is also a solvable constraint, and the figure on the page is the solution, computed at build time.',
    signature: 'The stroke draws itself across a year of real commits.',
    cost: '0 KB of JavaScript. Static SVG. Renders with scripting disabled.',
    risk: 'Reads as decorative unless the algorithm is visible. Mitigated by showing the loop count collapsing to one.',
    recommended: true,
  },
  {
    slug: 'c',
    name: 'Reconstruction',
    idea: 'A point cloud sampled from his photograph that reforms into the contribution lattice, then into the journey, and back.',
    why: 'Maximum memorability, and the option closest to the 3D scroll spectacle he was drawn to.',
    signature: 'His own figure dissolving into the record of his work.',
    cost: 'The heaviest of the two — a canvas render loop that runs continuously.',
    risk: 'Built and rejected. With the only photograph on file the cloud reads as noise rather than a person, and the genre signals creative developer — the exact misread that costs him backend roles. Kept here so the verdict is visible rather than asserted.',
    recommended: false,
  },
] as const

export default function Home() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-6 py-24 lg:px-10">
      <p className="mono text-fg-faint">concept lab</p>
      <h1 className="mt-6 max-w-3xl text-[length:var(--text-display)] font-semibold leading-[1.02] tracking-[-0.03em]">
        The direction.
      </h1>
      <p className="mt-7 max-w-2xl text-[length:var(--text-lede)] leading-[1.45] text-fg-muted">
        Both are built rather than mocked up, and both run on real data — 1,938 real contributions
        and the actual photograph. A third direction, a live-telemetry dashboard, was built and cut:
        it led every panel with a star count, and two of the three repos have none.
      </p>

      <div className="mt-16 space-y-px bg-line">
        {CONCEPTS.map((c) => (
          <article key={c.slug} className="bg-bg py-10">
            <div className="flex flex-wrap items-baseline gap-4">
              <Link
                href={`/lab/${c.slug}`}
                className="text-3xl font-semibold tracking-[-0.02em] underline decoration-line-strong decoration-1 underline-offset-[6px] hover:decoration-accent"
              >
                {c.name}
              </Link>
              <span className="mono text-fg-faint">/lab/{c.slug}</span>
              {c.recommended && (
                <span className="mono border border-accent/40 bg-accent-soft px-2 py-0.5 text-accent">
                  recommended
                </span>
              )}
            </div>

            <p className="mt-5 max-w-2xl text-fg">{c.idea}</p>

            <dl className="mt-7 grid gap-x-10 gap-y-5 border-l border-line pl-6 sm:grid-cols-2">
              {[
                ['why it fits', c.why],
                ['the signature', c.signature],
                ['what it costs', c.cost],
                ['what could go wrong', c.risk],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="mono text-fg-faint">{k}</dt>
                  <dd className="mt-1.5 text-fg-muted">{v}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <p className="mono-note mt-16 max-w-3xl border-t border-line pt-8 text-fg-muted">
        my recommendation — One Stroke. The dot lattice and the contribution grid are the same
        shape, so a single surface carries both the generative figure and the real record of work.
        Star counts stay off the page entirely except where the number is genuinely large; the proof
        strip leads with commits, users and the documented rating instead — all four of which stay
        true regardless of how any repo trends.
      </p>
    </main>
  )
}
