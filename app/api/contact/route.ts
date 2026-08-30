import { identity } from '@/content/profile'
import { createThrottle, parseContact } from '@/lib/contact'

/**
 * The contact endpoint.
 *
 * Talks to Resend over plain fetch rather than through the `resend` package.
 * This site has no runtime dependencies at all, and one POST to one documented
 * REST endpoint is not worth breaking that for: the SDK would pull a dependency
 * tree into the deployment to save about ten lines here.
 *
 * The handler is deliberately quiet about failure. If the key is missing or
 * Resend is down it returns 503 and the form falls back to opening the
 * visitor's mail client, so a broken provider costs the visitor a click rather
 * than the message.
 */

export const runtime = 'nodejs'

const RESEND = 'https://api.resend.com/emails'

/** Three messages per address per hour. See the note on createThrottle. */
const allow = createThrottle(60 * 60 * 1000, 3)

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Malformed request.' }, { status: 400 })
  }

  // A field no human sees and every naive bot fills in. Answering 200 rather
  // than 400 means the bot has nothing to tune against.
  if (typeof body === 'object' && body !== null && (body as { company?: unknown }).company) {
    return Response.json({ ok: true })
  }

  const parsed = parseContact(body)
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 })
  const { name, email, message } = parsed.value

  if (!allow(email.toLowerCase(), Date.now())) {
    return Response.json(
      { error: 'That is a few too many messages. Try again later.' },
      { status: 429 },
    )
  }

  const key = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM
  if (!key || !from) {
    return Response.json({ error: 'Mail is not configured.' }, { status: 503 })
  }

  try {
    const sent = await fetch(RESEND, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [identity.email],
        // So hitting reply in the inbox answers the visitor rather than the
        // sending domain, which is what makes the whole thing usable.
        reply_to: email,
        subject: `Portfolio message from ${name}`,
        text: `${message}\n\n---\n${name}\n${email}`,
      }),
    })

    if (!sent.ok) {
      // The provider's own error text can carry account detail, so it is logged
      // and not returned.
      console.error('resend rejected the message', sent.status, await sent.text())
      return Response.json({ error: 'Could not send that message.' }, { status: 503 })
    }
  } catch (cause) {
    console.error('resend was unreachable', cause)
    return Response.json({ error: 'Could not send that message.' }, { status: 503 })
  }

  return Response.json({ ok: true })
}
