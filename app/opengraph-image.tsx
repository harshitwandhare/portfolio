import { ImageResponse } from 'next/og'
import { generateRangoli } from '@/lib/rangoli'

/**
 * The card that appears when the link is pasted into Slack, LinkedIn or a DM.
 *
 * It draws the same figure the site does, from the same generator, so the
 * preview is the real thing rather than a screenshot that drifts out of date.
 */

export const alt = 'Harshit Wandhare, Software Engineer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BG = '#0a0a0a'
const FG = '#ebe7e1'
const MUTED = '#8f877d'
const ACCENT = '#f2a25c'
const DOT = '#35322f'

export default function OpenGraphImage() {
  const r = generateRangoli({ rows: 5, cols: 5, size: 84, seed: 23, pad: 50 })

  // Satori does not run our CSS, so the figure is inlined as an SVG data URI.
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r.width} ${r.height}" width="${r.width}" height="${r.height}">`,
    r.dots.map((d) => `<circle cx="${d[0]}" cy="${d[1]}" r="3.4" fill="${DOT}"/>`).join(''),
    `<path d="${r.path}" fill="none" stroke="${ACCENT}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    r.stroke[0]
      ? `<circle cx="${r.stroke[0].from[0]}" cy="${r.stroke[0].from[1]}" r="7" fill="${ACCENT}"/>`
      : '',
    `</svg>`,
  ].join('')

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: BG,
        color: FG,
        padding: '72px 80px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 620 }}>
        <div style={{ fontSize: 22, color: MUTED, letterSpacing: 2 }}>RICHARDSON, TX</div>
        <div
          style={{
            fontSize: 86,
            fontWeight: 600,
            lineHeight: 1,
            marginTop: 26,
            letterSpacing: -3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>Harshit</span>
          <span>Wandhare</span>
        </div>
        <div style={{ fontSize: 30, color: FG, marginTop: 34, lineHeight: 1.35 }}>
          I own systems end to end, from the data model to the app store.
        </div>
        <div style={{ fontSize: 21, color: MUTED, marginTop: 30, display: 'flex', gap: 26 }}>
          <span>1,394 commits, #1 of 28</span>
          <span style={{ color: DOT }}>·</span>
          <span>100K+ users</span>
          <span style={{ color: DOT }}>·</span>
          <span style={{ color: ACCENT }}>A* at Jio</span>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        width={400}
        height={400}
        alt=""
        src={`data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`}
      />
    </div>,
    size,
  )
}
