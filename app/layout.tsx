import type { Metadata } from 'next'
import { Instrument_Sans, JetBrains_Mono, Newsreader } from 'next/font/google'
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

export const metadata: Metadata = {
  title: 'Harshit Wandhare — concept lab',
  description: 'Three directions for a personal engineering portfolio.',
  robots: { index: false, follow: false },
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
      </body>
    </html>
  )
}
