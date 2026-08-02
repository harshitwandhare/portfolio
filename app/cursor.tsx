'use client'

import { useEffect, useRef } from 'react'

/**
 * A dot and a ring that trails it.
 *
 * The dot tracks the pointer exactly; the ring eases toward it, which is what
 * makes the movement read as weighted rather than as a second cursor. Over
 * anything interactive the ring opens up and the dot shrinks, so the cursor
 * reports what is clickable before you click it.
 *
 * Additive, never a replacement: the real cursor stays visible on touch
 * devices, under reduced motion, and on coarse pointers, because a site that
 * hides the system cursor and then fails to draw its own is unusable.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    document.documentElement.classList.add('has-custom-cursor')

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let rx = x
    let ry = y
    let raf = 0
    let visible = false

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!visible) {
        visible = true
        dot.style.opacity = '1'
        ring.style.opacity = '1'
      }
      // Widen over anything that responds to a click.
      const el = e.target as Element | null
      const interactive = !!el?.closest('a, button, [role="button"], input, textarea, [tabindex]')
      ring.dataset.on = interactive ? 'true' : 'false'
    }

    const onLeave = () => {
      visible = false
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }

    const tick = () => {
      // The ring chases the dot; the gap between them is the whole effect.
      rx += (x - rx) * 0.16
      ry += (y - ry) * 0.16
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      document.documentElement.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <div aria-hidden>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" data-on="false" />
    </div>
  )
}
