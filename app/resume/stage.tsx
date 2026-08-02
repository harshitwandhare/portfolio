'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * The sheet on a stage: a slight pointer-driven tilt, plus the two things
 * anyone actually wants from a résumé page — take a copy, send it to someone.
 *
 * The tilt is a single CSS transform written straight to the node, so it costs
 * one compositor update per frame and no React render. It is disabled entirely
 * for touch input and reduced motion, where it would be either meaningless or
 * unwelcome.
 *
 * "Download" is the browser's own print-to-PDF. That is deliberate: the printed
 * sheet is generated from the same content as the page, so it can never be a
 * stale copy of the résumé, and there is no file to keep in sync.
 */
export function Stage({ children }: { children: ReactNode }) {
  const sheetRef = useRef<HTMLDivElement | null>(null)
  // Only set from a click handler. Whether the share sheet exists is decided at
  // click time rather than mirrored into state on mount — the label reads
  // "share" either way, and the fallback reports itself when it runs.
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const el = sheetRef.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (reduced || coarse) return

    let frame = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5
        const y = e.clientY / window.innerHeight - 0.5
        // Small angles. A résumé that swings about is a novelty, not a document.
        el.style.transform = `perspective(1800px) rotateY(${x * 4}deg) rotateX(${-y * 2.6}deg)`
      })
    }
    const onLeave = () => {
      cancelAnimationFrame(frame)
      el.style.transform = 'perspective(1800px)'
    }

    el.style.transition = 'transform 380ms cubic-bezier(0.22,1,0.36,1)'
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  async function share() {
    const url = 'https://harshitwandhare.com/resume'
    const data = { title: 'Harshit Wandhare, Résumé', url }
    try {
      if (navigator.share) {
        await navigator.share(data)
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      /* dismissed, or clipboard unavailable — nothing to recover from */
    }
  }

  return (
    <>
      <div className="no-print mb-10 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="mono border border-line px-4 py-2 text-fg transition-colors hover:border-accent hover:text-accent"
        >
          download pdf
        </button>
        <button
          type="button"
          onClick={share}
          className="mono border border-line px-4 py-2 text-fg-muted transition-colors hover:border-accent hover:text-accent"
        >
          {copied ? 'link copied' : 'share'}
        </button>
        <p className="mono-note text-fg-faint">
          printing produces the pdf, so the copy you take is always the current one
        </p>
      </div>

      <div ref={sheetRef} className="print-sheet" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </>
  )
}
