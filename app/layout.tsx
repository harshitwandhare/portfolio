import type { Metadata } from 'next'
import { Instrument_Sans, JetBrains_Mono, Newsreader } from 'next/font/google'
import { identity } from '@/content/profile'
import { SITE_URL } from '@/next.config'
import './globals.css'
import { ThemeToggle } from './theme-toggle'

const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-face',
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
})

const TITLE = 'Harshit Wandhare — Software Engineer'
const DESCRIPTION =
  'Software engineer. Three years shipping production web, mobile and backend at scale — ' +
  'enterprise platforms serving 100K+ users at Reliance Jio, then the entire engineering ' +
  'function at a three-person startup in Germany. MS Computer Science at UT Dallas.'

export const metadata: Metadata = {
  // Resolves relative Open Graph and canonical URLs against the real domain
  // rather than the deployment host, so a shared link never points at a
  // *.vercel.app address.
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  title: TITLE,
  description: DESCRIPTION,
  applicationName: 'Harshit Wandhare',
  authors: [{ name: 'Harshit Wandhare', url: SITE_URL }],
  creator: 'Harshit Wandhare',
  keywords: [
    'Harshit Wandhare',
    'software engineer',
    'backend engineer',
    'AI ML engineer',
    'UT Dallas',
    'Reliance Jio',
    'Yosemite Crew',
    'Summer 2027 internship',
  ],
  openGraph: {
    type: 'profile',
    url: SITE_URL,
    siteName: 'Harshit Wandhare',
    title: TITLE,
    description: DESCRIPTION,
    firstName: 'Harshit',
    lastName: 'Wandhare',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

/**
 * Sets the theme before first paint so the page never flashes the wrong one.
 * Deliberately inline and tiny; it is the only blocking script on the page.
 */
const themeScript = `
try {
  var t = localStorage.getItem('theme');
  if (t) document.documentElement.setAttribute('data-theme', t);
} catch (e) {}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${instrument.variable} ${mono.variable} ${newsreader.variable}`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-bg focus:px-4 focus:py-2 focus:ring-2 focus:ring-accent"
        >
          Skip to content
        </a>
        <ThemeToggle />
        {/* Each page supplies its own <main> and <footer> so the footer is a
            sibling of main rather than nested inside it. */}
        {children}
        {/* Structured data, so a search result shows a person rather than a
            page. Kept in sync with content/profile.ts by hand — it is small
            enough that generating it would cost more than it saves. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Harshit Wandhare',
              url: SITE_URL,
              image: `${SITE_URL}/portrait.jpg`,
              jobTitle: 'Software Engineer',
              email: `mailto:${identity.email}`,
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Richardson',
                addressRegion: 'TX',
                addressCountry: 'US',
              },
              alumniOf: [
                {
                  '@type': 'CollegeOrUniversity',
                  name: 'Vidyalankar Institute of Technology, University of Mumbai',
                },
              ],
              worksFor: { '@type': 'Organization', name: 'UT Dallas' },
              knowsAbout: [
                'Distributed systems',
                'Backend engineering',
                'Machine learning',
                'Cloud infrastructure',
                'React Native',
              ],
              sameAs: [identity.github, identity.linkedin],
            }),
          }}
        />
      </body>
    </html>
  )
}
