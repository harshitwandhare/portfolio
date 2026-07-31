'use client'

import { useEffect, useRef } from 'react'

/**
 * A point cloud that reforms between three arrangements as you scroll:
 * the portrait, the contribution lattice, and the journey.
 *
 * The portrait points are sampled from the real photograph at runtime — the
 * image is drawn to an offscreen canvas, luminance-thresholded, and the
 * surviving pixels become particles. Nothing is hand-placed.
 *
 * Under prefers-reduced-motion the cloud holds the portrait and does not spin.
 * Without JavaScript it renders nothing, which is why this layer is decorative
 * and never the only copy of any information on the page.
 */

interface Pt {
  x: number
  y: number
  z: number
  /** The portrait position, kept so phase 0 can always return to it. */
  hx: number
  hy: number
  hz: number
}

const COUNT = 2800

function latticeTarget(i: number): [number, number, number] {
  const cols = 53
  const c = i % cols
  const r = Math.floor(i / cols)
  const rows = Math.ceil(COUNT / cols)
  return [(c / (cols - 1) - 0.5) * 1.8, (r / (rows - 1) - 0.5) * 0.85, 0]
}

function journeyTarget(i: number): [number, number, number] {
  const t = i / COUNT
  const a = t * Math.PI * 2
  const wobble = Math.sin(a * 6) * 0.07
  return [Math.cos(a) * (0.62 + wobble), Math.sin(a * 2) * 0.28, Math.sin(a) * (0.62 + wobble)]
}

export function PointCloud({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const phaseRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let disposed = false
    let points: Pt[] = []

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) phaseRef.current = Number((e.target as HTMLElement).dataset.phase)
        }
      },
      { threshold: 0.55 },
    )
    document.querySelectorAll<HTMLElement>('[data-phase]').forEach((el) => observer.observe(el))

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    img.onload = () => {
      if (disposed) return

      const S = 120
      const off = document.createElement('canvas')
      off.width = S
      off.height = S
      const octx = off.getContext('2d', { willReadFrequently: true })
      if (!octx) return
      octx.drawImage(img, 0, 0, S, S)
      const data = octx.getImageData(0, 0, S, S).data

      // Keep the darker pixels: the figure, not the bright wall behind it.
      const candidates: Array<[number, number, number]> = []
      for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
          const o = (y * S + x) * 4
          const lum =
            (0.2126 * (data[o] ?? 0) + 0.7152 * (data[o + 1] ?? 0) + 0.0722 * (data[o + 2] ?? 0)) /
            255
          if (lum < 0.46) {
            candidates.push([(x / S - 0.5) * 1.2, (y / S - 0.5) * 1.2, (lum - 0.25) * 0.4])
          }
        }
      }
      if (!candidates.length) return

      points = Array.from({ length: COUNT }, (_, i) => {
        const c = candidates[Math.floor((i / COUNT) * candidates.length)] ?? [0, 0, 0]
        return { x: c[0], y: c[1], z: c[2], hx: c[0], hy: c[1], hz: c[2] }
      })

      const render = (time: number) => {
        if (disposed) return
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const w = canvas.clientWidth
        const h = canvas.clientHeight
        if (!w || !h) {
          raf = requestAnimationFrame(render)
          return
        }
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          canvas.width = Math.round(w * dpr)
          canvas.height = Math.round(h * dpr)
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, w, h)

        const styles = getComputedStyle(document.documentElement)
        const accent = styles.getPropertyValue('--accent').trim() || '#f2a25c'
        const fg = styles.getPropertyValue('--fg').trim() || '#ebe7e1'

        const phase = reduced ? 0 : phaseRef.current
        const spin = reduced ? 0.35 : time * 0.00015
        const cos = Math.cos(spin)
        const sin = Math.sin(spin)
        const scale = Math.min(w, h) * 0.8

        for (let i = 0; i < points.length; i++) {
          const p = points[i]!
          const target =
            phase === 1 ? latticeTarget(i) : phase === 2 ? journeyTarget(i) : [p.hx, p.hy, p.hz]

          p.x += ((target[0] as number) - p.x) * 0.06
          p.y += ((target[1] as number) - p.y) * 0.06
          p.z += ((target[2] as number) - p.z) * 0.06

          const rx = p.x * cos - p.z * sin
          const rz = p.x * sin + p.z * cos
          const persp = 1.9 / (1.9 + rz)
          const sx = w / 2 + rx * scale * persp
          const sy = h / 2 + p.y * scale * persp
          const size = Math.max(0.5, 1.6 * persp)

          ctx.fillStyle = i % 11 === 0 ? accent : fg
          ctx.globalAlpha = Math.max(0.1, Math.min(0.9, persp * 0.72))
          ctx.fillRect(sx, sy, size, size)
        }
        ctx.globalAlpha = 1
        raf = requestAnimationFrame(render)
      }
      raf = requestAnimationFrame(render)
    }

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [src])

  return (
    <>
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
      <span className="sr-only">
        A decorative point cloud sampled from a photograph, which reforms into a contribution grid
        and a journey arc while scrolling.
      </span>
    </>
  )
}
