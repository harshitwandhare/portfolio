import type { Metadata } from 'next'
import Link from 'next/link'
import { identity, summary } from '@/content/profile'
import { ResumeSheet } from './resume-sheet'
import { Stage } from './stage'

export const metadata: Metadata = {
  title: 'Résumé — Harshit Wandhare',
  description: summary,
  alternates: { canonical: '/resume' },
  openGraph: {
    type: 'profile',
    title: 'Résumé — Harshit Wandhare',
    description: summary,
    url: '/resume',
  },
}

export default function ResumePage() {
  return (
    <>
      <main id="main" className="min-h-screen bg-bg-sunk text-fg">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-24">
          <div className="no-print">
            <Link
              href="/"
              className="mono text-fg-muted underline underline-offset-4 hover:text-accent"
            >
              ← {identity.name.toLowerCase()}
            </Link>
            <h1 className="mt-8 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">Résumé</h1>
            <p className="mt-5 max-w-2xl text-fg-muted">
              The same content as the site, laid out as a document. It is rendered from one source,
              so this page and the homepage cannot disagree — and printing it produces the PDF,
              which means the copy you take is never a stale file someone forgot to re-upload.
            </p>
            <p className="mono-note mt-4 max-w-2xl text-fg-faint">
              no phone number here by design. it is on the copy sent to an application, not on a
              page a crawler can read.
            </p>
            <div className="mt-10" />
          </div>

          <Stage>
            <ResumeSheet />
          </Stage>
        </div>
      </main>

      <footer className="no-print border-t border-line bg-bg">
        <div className="mono mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-6 py-10 text-fg-faint lg:px-10">
          <span>{identity.name}</span>
          <Link href="/" className="underline underline-offset-4 hover:text-accent">
            harshitwandhare.com
          </Link>
          <a
            href={`mailto:${identity.email}`}
            className="ml-auto underline underline-offset-4 hover:text-accent"
          >
            {identity.email}
          </a>
        </div>
      </footer>
    </>
  )
}
