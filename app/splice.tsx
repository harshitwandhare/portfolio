'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generateStages } from '@/lib/rangoli'

/**
 * The hero figure, and the algorithm behind it.
 *
 * A raw tiling is not one line — it is a dozen separate closed loops. Each tile
 * flip splices two of them together. This plays that through: the longest loop
 * is drawn in the accent and the rest stay grey, so the accent visibly spreads
 * across the lattice as loops are absorbed, ending on a single unbroken stroke.
 *
 * It runs once on load and can be replayed or reseeded. It is not tied to
 * scroll — the figure is the first thing on the page, and a reader should not
 * have to scroll past their own introduction to see it resolve.
 *
 * Progressive throughout: the server renders the finished stroke, so the answer
 * is there without JavaScript, and reduced motion holds the finished stroke
 * rather than playing faster.
 */

interface Props {
  rows: number
  cols: number
  size: number
  pad: number
  seed: number
  /** Milliseconds each splice step is held. */
  step?: number
}

/** How long the opening trace takes before the first splice. */
const DRAW_MS = 1500

export function SpliceFigure({ rows, cols, size, pad, seed, step = 320 }: Props) {
  const [currentSeed, setCurrentSeed] = useState(seed)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  /**
   * The opening. Before any splicing, the raw tiling draws itself in — every
   * loop traced from nothing. Without it the figure simply appears fully formed
   * and the first thing the eye sees is an answer rather than a construction.
   */
  const [drawingIn, setDrawingIn] = useState(true)
  /** Bumped on every play, so the draw animation actually restarts. */
  const [run, setRun] = useState(0)
  const timer = useRef<number | null>(null)
  const opening = useRef<number | null>(null)

  const model = useMemo(
    () => generateStages({ rows, cols, size, pad, seed: currentSeed }),
    [rows, cols, size, pad, currentSeed],
  )
  const last = model.stages.length - 1

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current)
      timer.current = null
    }
    if (opening.current !== null) {
      window.clearTimeout(opening.current)
      opening.current = null
    }
    setPlaying(false)
  }, [])

  const play = useCallback(() => {
    stop()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDrawingIn(false)
      setIndex(last)
      return
    }

    setIndex(0)
    setPlaying(true)
    setRun((r) => r + 1)
    // Trace the raw tiling first, then start splicing once it is all on screen.
    setDrawingIn(true)
    opening.current = window.setTimeout(() => {
      setDrawingIn(false)
      timer.current = window.setInterval(() => {
        setIndex((i) => {
          if (i >= last) {
            stop()
            return last
          }
          return i + 1
        })
      }, step)
    }, DRAW_MS)
  }, [last, step, stop])

  // Play once when the figure first appears, and again whenever it is reseeded.
  useEffect(() => {
    const id = window.setTimeout(play, 450)
    return () => {
      window.clearTimeout(id)
      stop()
    }
  }, [play, stop])

  const stage = model.stages[Math.min(index, last)]
  if (!stage) return null

  const done = stage.loopCount === 1
  /** Longest loop in this stage, used to keep the drawing rate constant. */
  const longestLoop = Math.max(...stage.loops.map((l) => l.arcs.length), 1)

  return (
    <div data-splice className="w-full">
      <svg
        viewBox={`0 0 ${model.width} ${model.height}`}
        className="h-auto w-full"
        role="img"
        aria-label={
          done
            ? 'A lattice of dots with a single unbroken line drawn around every one of them.'
            : `The tiling part-way through: ${stage.loopCount} separate loops remaining.`
        }
      >
        {model.dots.map((d, i) => (
          <circle key={i} cx={d[0]} cy={d[1]} r={size * 0.046} fill="var(--dot)" />
        ))}

        {/* Grey loops first so the accent one always draws on top. */}
        {stage.loops.map((loop, i) => (
          <path
            // Keyed by slot, not by stage. Keying on the stage index remounted
            // every path on every step, which meant the transition below never
            // ran and each splice landed as a hard cut. `run` is still in the
            // key so replay does remount and restarts the draw animation.
            key={`${run}-${i}`}
            d={loop.path}
            fill="none"
            stroke={i === 0 ? 'var(--accent)' : 'var(--fg-faint)'}
            strokeWidth={i === 0 ? size * 0.062 : size * 0.034}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            className={drawingIn ? 'stroke-draw' : undefined}
            opacity={i === 0 ? 1 : 0.5}
            style={{
              transition:
                'stroke 300ms cubic-bezier(0.22,1,0.36,1), stroke-width 300ms cubic-bezier(0.22,1,0.36,1), opacity 300ms cubic-bezier(0.22,1,0.36,1)',
              ...(drawingIn
                ? {
                    // Every loop is normalised to pathLength 1, so a fixed
                    // duration would draw a 3-arc loop and a 22-arc loop in the
                    // same time: a sevenfold difference in speed, which is what
                    // made the opening look uneven. Scaling the duration by
                    // length lays ink down at one rate across the whole figure.
                    animationDuration: `${Math.round(
                      DRAW_MS * Math.max(loop.arcs.length / longestLoop, 0.18),
                    )}ms`,
                    // Linear, not the eased curve the static figure uses. An
                    // ease-in-out makes a single stroke feel drawn by hand, but
                    // across thirteen loops at once it reads as the whole figure
                    // surging and stalling.
                    animationTimingFunction: 'linear',
                  }
                : {}),
            }}
          />
        ))}

        {/* The bindu — the origin dot a rangoli is started from. */}
        {done && stage.loops[0]?.arcs[0] && (
          <circle
            cx={stage.loops[0].arcs[0].from[0]}
            cy={stage.loops[0].arcs[0].from[1]}
            r={size * 0.09}
            fill="var(--accent)"
          />
        )}
      </svg>

      {/* Every value here changes as the splice runs, and each one used to
          resize its own box — the counter from two digits to one, the label
          from "separate loops" to "unbroken stroke", the note from two lines to
          one. With the hero grid centred, that reflow moved the whole column.
          Each slot now reserves its widest state, so nothing shifts. */}
      <div className="mt-7 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-4">
        <p className="flex items-baseline gap-2.5">
          <span
            data-loop-count
            className="tabular inline-block min-w-[1.4ch] text-right text-3xl font-medium tabular-nums"
            style={{ color: done ? 'var(--accent)' : 'var(--fg)' }}
          >
            {stage.loopCount}
          </span>
          <span className="mono inline-block min-w-[8.5rem] text-fg-muted">
            {done ? 'unbroken stroke' : 'separate loops'}
          </span>
        </p>

        {/* Wraps below the counter on a phone rather than pushing past the
            viewport edge. */}
        <span className="flex gap-2">
          <button
            type="button"
            onClick={play}
            disabled={playing}
            className="mono border border-line px-3 py-1.5 text-fg-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
          >
            replay
          </button>
          <button
            type="button"
            onClick={() => setCurrentSeed((s) => s + 1)}
            className="mono border border-line px-3 py-1.5 text-fg-muted transition-colors hover:border-accent hover:text-accent"
          >
            new figure
          </button>
        </span>
      </div>

      <div
        aria-hidden
        className="mt-4 h-px w-full"
        style={{
          backgroundImage: `linear-gradient(to right, var(--accent) ${
            (index / Math.max(last, 1)) * 100
          }%, var(--line) 0)`,
        }}
      />

      <p className="mono-note mt-4 flex min-h-[3.4rem] items-start text-fg-faint">
        <span>
          {stage.flips} {stage.flips === 1 ? 'flip' : 'flips'} ·{' '}
          {stage.loops.reduce((n, l) => n + l.arcs.length, 0)} arcs ·{' '}
          {done
            ? 'around every dot, never through one, never crossing, closed'
            : 'each flip joins two loops into one'}
        </span>
      </p>
    </div>
  )
}
