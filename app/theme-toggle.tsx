'use client'

/**
 * Explicit light/dark switch.
 *
 * Deliberately stateless. The current theme already lives in one place — the
 * `data-theme` attribute on <html> — so mirroring it into React state would mean
 * an effect that reads the DOM on mount, a hydration mismatch to suppress, and
 * two sources of truth. Instead the click reads the attribute, and the label is
 * chosen by CSS from that same attribute.
 *
 * Until someone picks explicitly, no attribute is set and the OS preference
 * wins through the media query in globals.css.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement
    const current =
      root.getAttribute('data-theme') ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    const next = current === 'dark' ? 'light' : 'dark'
    root.setAttribute('data-theme', next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* storage unavailable — the choice just will not persist */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      // Both labels are in the DOM so CSS can pick one without JavaScript, which
      // means the visible text is unreliable as an accessible name — a screen
      // reader would read "darklight". The label is stated explicitly instead.
      aria-label="Switch colour theme"
      className="mono theme-toggle fixed right-4 top-4 z-40 border border-line px-3 py-1.5 text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
    >
      <span aria-hidden className="theme-toggle__to-dark">
        dark
      </span>
      <span aria-hidden className="theme-toggle__to-light">
        light
      </span>
    </button>
  )
}
