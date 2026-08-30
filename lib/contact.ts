/**
 * Validation for the contact form, kept away from the route handler so it can
 * be tested as a pure function rather than through a fetch.
 *
 * The limits are not about correctness, they are about what a public POST
 * endpoint attracts. An unbounded message field is a free way to push a
 * megabyte of link spam into an inbox, and a name field with newlines in it is
 * the first thing anyone tries when a value ends up in a mail header.
 */

export const LIMITS = {
  name: 100,
  email: 254,
  message: 4000,
} as const

export interface ContactMessage {
  readonly name: string
  readonly email: string
  readonly message: string
}

export type ParseResult =
  | { readonly ok: true; readonly value: ContactMessage }
  | { readonly ok: false; readonly error: string }

/**
 * Deliberately loose. The only email check worth making here is that the string
 * could plausibly be routed, because the address is never trusted for anything:
 * it goes in Reply-To and gets used by a human who can see it. A stricter
 * pattern would reject valid addresses and still not prove the mailbox exists.
 */
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

/** Anything that could break out of a header line if the value is used in one. */
const CONTROL = /[\r\n]/

export function parseContact(input: unknown): ParseResult {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Malformed request.' }

  const raw = input as Record<string, unknown>
  const name = typeof raw.name === 'string' ? raw.name.trim() : ''
  const email = typeof raw.email === 'string' ? raw.email.trim() : ''
  const message = typeof raw.message === 'string' ? raw.message.trim() : ''

  if (!name || !email || !message) return { ok: false, error: 'All three fields are required.' }

  if (name.length > LIMITS.name) return { ok: false, error: 'That name is too long.' }
  if (email.length > LIMITS.email) return { ok: false, error: 'That address is too long.' }
  if (message.length > LIMITS.message) return { ok: false, error: 'That message is too long.' }

  if (CONTROL.test(name) || CONTROL.test(email)) {
    return { ok: false, error: 'Line breaks are not allowed in the name or address.' }
  }
  if (!EMAIL.test(email)) return { ok: false, error: 'That does not look like an email address.' }

  return { ok: true, value: { name, email, message } }
}

/**
 * Best-effort per-address throttle.
 *
 * In-memory, so it holds only for as long as one serverless instance lives and
 * a determined sender gets past it by waiting for a cold start. It is aimed at
 * the double-click and the naive script, not at an adversary, and it is worth
 * having precisely because it costs nothing. The real limit is Resend's.
 */
export function createThrottle(windowMs: number, max: number) {
  const hits = new Map<string, number[]>()

  return function allow(key: string, now: number): boolean {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
    if (recent.length >= max) {
      hits.set(key, recent)
      return false
    }
    recent.push(now)
    hits.set(key, recent)
    return true
  }
}
