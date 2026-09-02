'use client'

import { useState } from 'react'
import { identity } from '@/content/profile'
import { LIMITS } from '@/lib/contact'

/**
 * The contact form.
 *
 * Posts to /api/contact, which sends through Resend. When that endpoint says it
 * cannot send, or the network never reaches it, the form offers a mail link
 * with everything they typed already composed into it. The point of the
 * fallback is that a missing key or a provider outage costs the visitor one
 * extra click instead of the message, and they never see a dead end with their
 * text trapped behind it. The link is offered rather than opened, for the
 * reason set out where it is built.
 *
 * The address stays visible above the form either way, because some people will
 * simply prefer to write the email themselves.
 */

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  /** Carries the composed mailto so the visitor can open it themselves. */
  | { kind: 'handed-off'; mailto: string }
  | { kind: 'error'; message: string }

const FIELD =
  'mono w-full border border-line bg-bg px-3 py-2 text-fg outline-none focus:border-accent'
const LABEL = 'mono block text-fg-faint'

export function ContactForm() {
  const [state, setState] = useState<State>({ kind: 'idle' })

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state.kind === 'sending') return

    const form = event.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
      company: String(data.get('company') ?? ''),
    }

    setState({ kind: 'sending' })

    let response: Response | undefined
    try {
      response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {
      /* offline or blocked, so fall through to the mail client */
    }

    if (response?.ok) {
      form.reset()
      setState({ kind: 'sent' })
      return
    }

    // 400 and 429 are the visitor's problem to fix and the message says how.
    // Anything else is this site's problem, and the mail client is the way out.
    if (response && response.status < 500) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null
      setState({ kind: 'error', message: body?.error ?? 'Could not send that message.' })
      return
    }

    const subject = `Portfolio message from ${payload.name}`
    const body = `${payload.message}\n\n---\n${payload.name}\n${payload.email}`
    const mailto =
      `mailto:${identity.email}` +
      `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    // Offer the mail client. Do not open it.
    //
    // This used to fire the handoff itself, by assigning location.href and
    // later by clicking a synthetic anchor, and both lose the message on any
    // browser with no handler registered for the scheme. Such a browser does
    // not ignore `mailto:someone@utdallas.edu?subject=...`: WebKit reads the
    // address as userinfo and a host and navigates the tab to
    // https://www.utdallas.edu, carrying the visitor off the site with
    // everything they typed still in the form behind them. Losing the message
    // is the one outcome this path exists to prevent, so it cannot be the
    // thing the path does.
    //
    // Rendering a link the visitor clicks removes the failure entirely. A
    // click they make themselves either opens their mail client or does
    // nothing at all, the page stays up either way, the text stays in the
    // fields, and the address is on screen for anyone who would rather write
    // it out. It also costs the same single click the automatic version did.
    setState({ kind: 'handed-off', mailto })
  }

  return (
    <form className="mt-10 grid max-w-xl gap-6" onSubmit={submit}>
      <div className="grid gap-2">
        <label className={LABEL} htmlFor="contact-name">
          name
        </label>
        <input
          className={FIELD}
          id="contact-name"
          maxLength={LIMITS.name}
          name="name"
          required
          type="text"
        />
      </div>

      <div className="grid gap-2">
        <label className={LABEL} htmlFor="contact-email">
          email
        </label>
        <input
          className={FIELD}
          id="contact-email"
          maxLength={LIMITS.email}
          name="email"
          required
          type="email"
        />
      </div>

      <div className="grid gap-2">
        <label className={LABEL} htmlFor="contact-message">
          message
        </label>
        <textarea
          className={FIELD}
          id="contact-message"
          maxLength={LIMITS.message}
          name="message"
          required
          rows={6}
        />
      </div>

      {/* Bot bait. Hidden from the accessibility tree and from autofill, so the
          only things that fill it in are the things worth dropping. */}
      <input
        aria-hidden
        autoComplete="off"
        className="hidden"
        name="company"
        tabIndex={-1}
        type="text"
      />

      <div className="flex flex-wrap items-center gap-4">
        <button
          className="mono border border-line-strong px-5 py-2 transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          disabled={state.kind === 'sending'}
          type="submit"
        >
          {state.kind === 'sending' ? 'sending' : 'send'}
        </button>
        <p aria-live="polite" className="mono text-fg-faint">
          <Status state={state} />
        </p>
      </div>
    </form>
  )
}

function Status({ state }: { state: State }) {
  switch (state.kind) {
    case 'sent':
      return <>sent. I read everything that lands here.</>
    case 'handed-off':
      return (
        <>
          could not reach the server.{' '}
          <a className="text-accent underline underline-offset-4" href={state.mailto}>
            open this in your mail app
          </a>
          , or write to {identity.email}
        </>
      )
    case 'error':
      return <>{state.message}</>
    default:
      return <>goes straight to my inbox</>
  }
}
