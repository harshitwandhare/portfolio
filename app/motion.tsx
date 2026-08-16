'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Motion primitives.
 *
 * All three write to the DOM directly rather than through React state. That is
 * deliberate on two counts: a scroll handler that sets state re-renders on every
 * frame, and starting from a hidden state in React would mean the content is
 * missing for anyone without JavaScript. Here the markup ships finished and
 * visible, and these only take the finished state away once they have confirmed
 * they can put it back.
 */

function usesReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Fade and rise as the element enters, once. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || usesReducedMotion()) return

    // Hide only now that we know we can animate it back.
    el.style.opacity = '0'
    el.style.transform = 'translateY(14px)'
    el.style.transition = `opacity 620ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 620ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        el.style.opacity = '1'
        el.style.transform = 'none'
        observer.disconnect()
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/**
 * Counts up to a number when it first appears.
 *
 * The real value is what renders on the server, so it is correct before this
 * runs and correct if this never runs. Only its arrival is animated.
 */
export function CountUp({
  value,
  duration = 1400,
  className,
}: {
  value: string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || usesReducedMotion()) return

    // Only plain numbers animate. "A*" and "100K+" are left as written.
    const firstDigit = value.search(/[0-9]/)
    if (firstDigit === -1) return
    const digits = value.replace(/[^0-9]/g, '')
    if (!digits || digits.length > 7) return
    const target = Number(digits)
    if (!Number.isFinite(target) || target === 0) return

    const prefix = value.slice(0, firstDigit)
    const numeral = value.slice(firstDigit).match(/^[0-9,]+/)?.[0] ?? ''
    const suffix = value.slice(firstDigit + numeral.length)
    const grouped = numeral.includes(',')

    let raf = 0
    let start = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()

        // Zeroed here rather than on mount. Doing it up front would leave the
        // real figure replaced by a 0 for anything that never scrolls into
        // view, which is exactly where these numbers live.
        el.textContent = `${prefix}0${suffix}`

        const tick = (now: number) => {
          if (!start) start = now
          const t = Math.min((now - start) / duration, 1)
          // Ease out, so it decelerates into the real figure.
          const eased = 1 - Math.pow(1 - t, 3)
          const n = Math.round(target * eased)
          el.textContent = t < 1 ? `${prefix}${grouped ? n.toLocaleString() : n}${suffix}` : value
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
      el.textContent = value
    }
  }, [value, duration])

  return (
    <span
      ref={ref}
      className={className}
      // The animation counts up from 0, which is narrower than the final
      // figure. Reserving the final width keeps the strip from reflowing as
      // four counters run at once. `ch` is sized to the digit here because the
      // surrounding type is tabular.
      style={{ display: 'inline-block', minWidth: `${value.length}ch` }}
    >
      {value}
    </span>
  )
}

/** A thin rule across the top that fills as the page is scrolled. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0
        el.style.transform = `scaleX(${progress})`
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
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-accent"
      style={{ transform: 'scaleX(0)' }}
    />
  )
}
