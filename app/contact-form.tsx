'use client'

import { useState } from 'react'
import { identity } from '@/content/profile'
import { LIMITS } from '@/lib/contact'

/**
 * The contact form.
 *
 * Posts to /api/contact, which sends through Resend. When that endpoint says it
 * cannot send, or the network never reaches it, the form falls back to handing
 * the message to the visitor's own mail client with everything they typed
 * already in it. The point of the fallback is that a missing key or a provider
 * outage costs the visitor one extra click instead of the message, and they
 * never see a dead end with their text trapped behind it.
 *
 * The address stays visible above the form either way, because some people will
 * simply prefer to write the email themselves.
 */

type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'handed-off' }
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
    window.location.href =
      `mailto:${identity.email}` +
      `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setState({ kind: 'handed-off' })
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
      return <>opened in your mail app. if nothing happened, write to {identity.email}</>
    case 'error':
      return <>{state.message}</>
    default:
      return <>goes straight to my inbox</>
  }
}
