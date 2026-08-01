'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { generateStages } from '@/lib/rangoli'

/**
 * The algorithm, running.
 *
 * A raw tiling is not one line — it is a dozen separate closed loops. Each tile
 * flip splices two of them together. Scrolling steps through that: the largest
 * loop is drawn in the accent and every other loop stays grey, so the accent
 * visibly spreads across the lattice as loops are absorbed, until the whole
 * figure is a single stroke.
 *
 * The server renders the finished figure. This only takes over once JavaScript
 * is available, and it holds the finished figure under reduced motion, so the
 * answer is never withheld — only the working is progressive.
 */

interface Props {
  rows: number
  cols: number
  size: number
  pad: number
  seed: number
}

export function Splice({ rows, cols, size, pad, seed }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  // Starts at the raw tiling. It must not start unrendered: the scroll handler
  // measures the track element, so gating the render on a scroll reading would
  // mean the track never mounts and the section never appears.
  const [index, setIndex] = useState(0)
  const [currentSeed, setCurrentSeed] = useState(seed)

  // Derived from the seed, so it belongs in a memo rather than in state set by
  // an effect. The generator is deterministic and small, so regenerating is one
  // function call rather than a round trip.
  const model = useMemo(
    () => generateStages({ rows, cols, size, pad, seed: currentSeed }),
    [rows, cols, size, pad, currentSeed],
  )

  useEffect(() => {
    const last = model.stages.length - 1
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        // Reduced motion gets the finished figure and never the working — the
        // answer is shown at once rather than the animation merely running fast.
        if (reduced) {
          setIndex(last)
          return
        }
        const track = trackRef.current
        if (!track) return
        const rect = track.getBoundingClientRect()
        const scrollable = rect.height - window.innerHeight
        if (scrollable <= 0) {
          setIndex(last)
          return
        }
        const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1)
        setIndex(Math.round(progress * last))
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [model])

  const stage = model.stages[Math.min(index, model.stages.length - 1)]
  if (!stage) return null

  const done = stage.loopCount === 1
  const total = model.stages.length - 1

  return (
    <div ref={trackRef} data-splice-track className="relative h-[340vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
            <svg
              viewBox={`0 0 ${model.width} ${model.height}`}
              className="h-auto w-full"
              role="img"
              aria-label={`The tiling at stage ${index + 1} of ${total + 1}: ${stage.loopCount} ${
                stage.loopCount === 1 ? 'loop' : 'separate loops'
              }.`}
            >
              {model.dots.map((d, i) => (
                <circle key={i} cx={d[0]} cy={d[1]} r={size * 0.042} fill="var(--dot)" />
              ))}

              {/* Grey loops first so the accent one always draws on top. */}
              {stage.loops.map((loop, i) => (
                <path
                  key={`${index}-${i}`}
                  d={loop.path}
                  fill="none"
                  stroke={i === 0 ? 'var(--accent)' : 'var(--fg-faint)'}
                  strokeWidth={i === 0 ? size * 0.055 : size * 0.03}
                  strokeLinecap="round"
                  opacity={i === 0 ? 1 : 0.55}
                  style={{ transition: 'stroke 260ms ease, stroke-width 260ms ease' }}
                />
              ))}
            </svg>

            <div>
              <p className="mono text-fg-faint">the algorithm, running</p>

              <p className="mt-5 flex items-baseline gap-3">
                <span
                  data-loop-count
                  className="tabular text-6xl font-medium tracking-tight tabular-nums"
                  style={{ color: done ? 'var(--accent)' : 'var(--fg)' }}
                >
                  {stage.loopCount}
                </span>
                <span className="mono text-fg-muted">
                  {stage.loopCount === 1 ? 'stroke' : 'separate loops'}
                </span>
              </p>

              <div
                className="mt-6 h-px w-full bg-line"
                role="presentation"
                aria-hidden
                style={{
                  backgroundImage: `linear-gradient(to right, var(--accent) ${
                    (index / Math.max(total, 1)) * 100
                  }%, var(--line) 0)`,
                }}
              />

              <dl className="mono mt-6 grid grid-cols-2 gap-y-4 text-fg-muted">
                <dt className="text-fg-faint">flips applied</dt>
                <dd className="tabular text-right text-fg">{stage.flips}</dd>
                <dt className="text-fg-faint">arcs in play</dt>
                <dd className="tabular text-right text-fg">
                  {stage.loops.reduce((n, l) => n + l.arcs.length, 0)}
                </dd>
                <dt className="text-fg-faint">longest loop</dt>
                <dd className="tabular text-right text-fg">{stage.loops[0]?.arcs.length ?? 0}</dd>
              </dl>

              <p className="mono-note mt-6 text-fg-faint">
                {done
                  ? 'one stroke. it goes around every dot and closes where it began.'
                  : 'each flip rewires two arcs inside one cell, joining two loops into one.'}
              </p>

              <button
                type="button"
                onClick={() => setCurrentSeed((s) => s + 1)}
                className="mono mt-7 border border-line px-3 py-1.5 text-fg-muted transition-colors hover:border-accent hover:text-accent"
              >
                new figure
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
