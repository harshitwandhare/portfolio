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

export function SpliceFigure({ rows, cols, size, pad, seed, step = 320 }: Props) {
  const [currentSeed, setCurrentSeed] = useState(seed)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<number | null>(null)

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
    setPlaying(false)
  }, [])

  const play = useCallback(() => {
    stop()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIndex(last)
      return
    }
    setIndex(0)
    setPlaying(true)
    timer.current = window.setInterval(() => {
      setIndex((i) => {
        if (i >= last) {
          stop()
          return last
        }
        return i + 1
      })
    }, step)
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
          <circle key={i} cx={d[0]} cy={d[1]} r={size * 0.04} fill="var(--dot)" />
        ))}

        {/* Grey loops first so the accent one always draws on top. */}
        {stage.loops.map((loop, i) => (
          <path
            key={`${index}-${i}`}
            d={loop.path}
            fill="none"
            stroke={i === 0 ? 'var(--accent)' : 'var(--fg-faint)'}
            strokeWidth={i === 0 ? size * 0.05 : size * 0.028}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={i === 0 ? 1 : 0.5}
            style={{ transition: 'stroke-width 220ms ease, opacity 220ms ease' }}
          />
        ))}

        {/* The bindu — the origin dot a rangoli is started from. */}
        {done && stage.loops[0]?.arcs[0] && (
          <circle
            cx={stage.loops[0].arcs[0].from[0]}
            cy={stage.loops[0].arcs[0].from[1]}
            r={size * 0.075}
            fill="var(--accent)"
          />
        )}
      </svg>

      <div className="mt-7 flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <p className="flex items-baseline gap-2.5">
          <span
            data-loop-count
            className="tabular text-3xl font-medium tabular-nums"
            style={{ color: done ? 'var(--accent)' : 'var(--fg)' }}
          >
            {stage.loopCount}
          </span>
          <span className="mono text-fg-muted">{done ? 'unbroken stroke' : 'separate loops'}</span>
        </p>

        <p className="mono text-fg-faint">
          {stage.flips} {stage.flips === 1 ? 'flip' : 'flips'} ·{' '}
          {stage.loops.reduce((n, l) => n + l.arcs.length, 0)} arcs
        </p>

        <span className="ml-auto flex gap-2">
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

      <p className="mono-note mt-4 text-fg-faint">
        {done
          ? 'one stroke · around every dot, never through one, never crossing, closed'
          : 'each flip rewires two arcs inside one cell, joining two loops into one'}
      </p>
    </div>
  )
}
