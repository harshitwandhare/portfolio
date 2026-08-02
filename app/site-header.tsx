import Link from 'next/link'
import { identity } from '@/content/profile'
import { ExternalLink } from './external-link'
import { ThemeToggle } from './theme-toggle'

/**
 * The contact links, at the top.
 *
 * They also live in the footer, but nobody scrolls a page they have not decided
 * to read yet — and the single most likely useful action for a recruiter in the
 * first ten seconds is opening the résumé or the GitHub profile. Putting them
 * behind a full scroll is the sort of thing that costs a reply.
 *
 * Sticky rather than fixed, and only 48px, so it never eats the hero.
 */
export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-sm">
      {/* A fixed 56px so the hero can subtract an exact number rather than an
          estimate — a two-pixel guess is the difference between the hero
          fitting and the page offering a scrollbar on first paint. */}
      <nav
        aria-label="Site"
        className="mono mx-auto flex h-14 max-w-7xl items-center gap-x-5 px-6 lg:px-10"
      >
        <Link
          href="/"
          className="hidden text-fg transition-colors hover:text-accent sm:inline"
          aria-label="Home"
        >
          {identity.name}
        </Link>

        <span className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/resume" className="text-fg-muted transition-colors hover:text-accent">
            résumé
          </Link>
          <ExternalLink
            href={identity.github}
            className="text-fg-muted transition-colors hover:text-accent"
          >
            github
          </ExternalLink>
          <ExternalLink
            href={identity.linkedin}
            className="text-fg-muted transition-colors hover:text-accent"
          >
            linkedin
          </ExternalLink>
          <a
            href={`mailto:${identity.email}`}
            className="text-accent transition-opacity hover:opacity-70"
          >
            email
          </a>
          <ThemeToggle />
        </span>
      </nav>
    </header>
  )
}
