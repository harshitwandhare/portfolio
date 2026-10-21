'use client'

import { useState } from 'react'

import { TipkyanchiFigure } from './tipkyanchi-figure'

interface Props {
  n: number
  size: number
  pad: number
  seed: number
  strokes: number
  /** Seconds one wedge takes. The repeats follow it. */
  pace?: number
}

/**
 * The hero figure, and the thing a reader can do with it.
 *
 * Everything that matters is already on the page before this runs: the server
 * renders the finished rangoli, so the figure is there with scripting off and
 * reduced motion holds it still rather than playing it faster. All this adds
 * is the ability to watch it drawn again, or to ask for a different one.
 *
 * Reseeding earns its place. The figure is whatever the rule produces, and the
 * only way to show that rather than assert it is to let someone run the rule
 * again and get back a rangoli neither of us has seen.
 */
export function RangoliPlayer({ n, size, pad, seed, strokes, pace = 0.55 }: Props) {
  const [current, setCurrent] = useState(seed)
  /** Bumped on replay so React remounts the SVG and the CSS restarts. */
  const [run, setRun] = useState(0)

  return (
    <div data-rangoli>
      <TipkyanchiFigure
        key={`${current}-${run}`}
        n={n}
        size={size}
        pad={pad}
        seed={current}
        strokes={strokes}
        pace={pace}
        className="w-full text-fg"
        strokeWidth={2.6}
      />

      {/* Replacing the figure changes the page without navigating, so it is
          announced. Only after a press: the figure that renders on load is
          already described by the SVG's own label. */}
      <p className="sr-only" aria-live="polite">
        {run === 0 ? '' : `A rangoli drawn from seed ${current}.`}
      </p>

      <p className="mono mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-fg-faint">
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="touch-manipulation text-fg-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          draw it again
        </button>
        <button
          type="button"
          onClick={() => {
            setCurrent((s) => s + 1)
            setRun((r) => r + 1)
          }}
          className="touch-manipulation text-fg-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          another rangoli
        </button>
        <span aria-hidden>·</span>
        <span>one eighth is chosen, the other seven are forced</span>
      </p>
    </div>
  )
}
