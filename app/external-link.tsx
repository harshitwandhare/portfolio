import type { AnchorHTMLAttributes, ReactNode } from 'react'

/**
 * Every link that leaves the site.
 *
 * Centralised so `target` and `rel` cannot be forgotten at a call site — and
 * `rel="noopener"` in particular is a security control, not a preference: it
 * stops the opened page reaching back through `window.opener`.
 *
 * Screen readers announce nothing about a new tab on their own, so the
 * accessible name says so. Sighted users get the same information from the
 * pattern of the page: outbound links open away, internal ones do not.
 */
export function ExternalLink({
  href,
  children,
  className,
  'aria-label': ariaLabel,
  ...rest
}: { href: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const label = ariaLabel ?? (typeof children === 'string' ? children : undefined)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={label ? `${label} (opens in a new tab)` : undefined}
      {...rest}
    >
      {children}
    </a>
  )
}
