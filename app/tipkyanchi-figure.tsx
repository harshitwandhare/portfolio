import { generateTipkyanchi, type TipkyanchiOptions } from '@/lib/tipkyanchi'

interface Props extends TipkyanchiOptions {
  className?: string
  strokeWidth?: number
  /**
   * Seconds one wedge takes to draw. The seven repeats follow it, staggered,
   * so the whole figure lands in roughly four times this.
   */
  pace?: number
  /** Draw it already finished, for the no-script copy and the social image. */
  still?: boolean
  showDots?: boolean
}

/**
 * The rangoli, server-rendered.
 *
 * The figure is deterministic for a seed, so it is computed on the server and
 * shipped as plain SVG. The drawing is CSS, not script: each of the eight
 * passes is one group with its own animation delay, which is why this costs no
 * client JavaScript and still renders with scripting off.
 *
 * It draws in the order a rangoli is actually made. The wedge the seed chose
 * goes down first, then its seven repeats around the centre, so what you watch
 * is one eighth of a decision turning into the whole figure.
 */
export function TipkyanchiFigure({
  className,
  strokeWidth = 2.2,
  pace = 0.55,
  still = false,
  showDots = true,
  ...options
}: Props) {
  const r = generateTipkyanchi(options)

  return (
    <svg
      viewBox={`0 0 ${r.width} ${r.height}`}
      className={className}
      role="img"
      aria-label="A rangoli: a square lattice of dots joined by straight lines into a motif that repeats eight times about its centre."
      preserveAspectRatio="xMidYMid meet"
    >
      {showDots && (
        // The dots are the scaffolding. They are set out first and the design
        // is laid over them, so they end up barely there rather than gone.
        <g className={still ? undefined : 'rangoli-dots'}>
          {r.dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={Math.max(1, r.size * 0.05)} fill="var(--dot)" />
          ))}
        </g>
      )}

      {r.passes.map((pass, i) => (
        <g
          key={i}
          className={still ? undefined : 'rangoli-pass'}
          style={
            still
              ? undefined
              : { animationDelay: `${(i * pace) / 2}s`, animationDuration: `${pace}s` }
          }
        >
          {pass.map((s, j) => (
            <line
              key={j}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              pathLength={1}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}
    </svg>
  )
}

/** The numbers behind a figure, for showing the construction rather than asserting it. */
export function tipkyanchiStats(options: TipkyanchiOptions) {
  const r = generateTipkyanchi(options)
  return {
    dots: r.dots.length,
    strokes: r.chords.length,
    /** Strokes actually chosen by the seed. The other seven passes follow. */
    wedge: r.passes[0]?.length ?? 0,
  }
}
