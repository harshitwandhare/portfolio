import { generateRangoli, type RangoliOptions } from '@/lib/rangoli'

interface Props extends RangoliOptions {
  /**
   * Per-dot weights, row-major, matching the lattice. Where a weight is given
   * the dot is drawn at a size proportional to it — which is how the ornament
   * and the data end up being the same object.
   */
  weights?: readonly number[]
  className?: string
  /** Seconds for the stroke to draw itself. */
  duration?: number
  strokeWidth?: number
  showDots?: boolean
  /**
   * Mark where the stroke begins. A rangoli is started from a single placed
   * point — the bindu — and marking it is what makes "one line" legible rather
   * than merely asserted.
   */
  showOrigin?: boolean
}

/**
 * Server-rendered. The curve is deterministic for a given seed, so it is
 * computed once at build time and shipped as plain SVG — no client JavaScript,
 * and it still renders with scripting disabled.
 */
export function RangoliFigure({
  weights,
  className,
  duration = 4.5,
  strokeWidth = 1.25,
  showDots = true,
  showOrigin = false,
  ...options
}: Props) {
  const r = generateRangoli(options)
  const size = options.size ?? 40

  // Rough path length for the draw animation. Each arc is a quarter circle of
  // radius size/2, so its length is (π/2)(size/2); boundary chords are shorter.
  const approxLength = Math.ceil(r.length * ((Math.PI / 2) * (size / 2)))
  const maxWeight = weights?.length ? Math.max(...weights, 1) : 1
  const origin = r.stroke[0]?.from

  return (
    <svg
      viewBox={`0 0 ${r.width} ${r.height}`}
      className={className}
      role="img"
      aria-label="A lattice of dots with a single unbroken line drawn around every one of them."
      preserveAspectRatio="xMidYMid meet"
    >
      {showDots &&
        r.dots.map((d, i) => {
          const w = weights?.[i]
          const radius =
            w === undefined
              ? size * 0.045
              : size * (0.03 + 0.075 * Math.sqrt(Math.min(w, maxWeight) / maxWeight))
          return (
            <circle
              key={i}
              cx={d[0]}
              cy={d[1]}
              r={radius}
              fill={w !== undefined && w > 0 ? 'var(--accent)' : 'var(--dot)'}
              opacity={w !== undefined && w > 0 ? 0.35 + 0.65 * Math.min(w / maxWeight, 1) : 1}
            />
          )
        })}
      <path
        d={r.path}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-draw"
        style={
          {
            '--len': approxLength,
            animationDuration: `${duration}s`,
          } as React.CSSProperties
        }
      />
      {showOrigin && origin && (
        <circle cx={origin[0]} cy={origin[1]} r={strokeWidth * 2.6} fill="var(--accent)" />
      )}
    </svg>
  )
}

/** The numbers behind a figure, for showing the algorithm rather than asserting it. */
export function rangoliStats(options: RangoliOptions) {
  const r = generateRangoli(options)
  return {
    loopsBefore: r.loopsBefore,
    flips: r.flips,
    arcs: r.length,
    dots: r.dots.length,
  }
}
