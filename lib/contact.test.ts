import { describe, expect, it } from 'vitest'
import { createThrottle, LIMITS, parseContact } from './contact'

const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello there.' }

describe('parseContact', () => {
  it('accepts a well-formed message and trims it', () => {
    const result = parseContact({ name: '  Ada  ', email: ' ada@example.com ', message: ' Hi ' })
    expect(result).toEqual({
      ok: true,
      value: { name: 'Ada', email: 'ada@example.com', message: 'Hi' },
    })
  })

  it('rejects a non-object body', () => {
    expect(parseContact('nope')).toEqual({ ok: false, error: 'Malformed request.' })
    expect(parseContact(null)).toEqual({ ok: false, error: 'Malformed request.' })
  })

  it('rejects missing, blank, and non-string fields', () => {
    expect(parseContact({ ...valid, name: '' }).ok).toBe(false)
    expect(parseContact({ ...valid, email: '   ' }).ok).toBe(false)
    expect(parseContact({ ...valid, message: undefined }).ok).toBe(false)
    expect(parseContact({ ...valid, name: 42 }).ok).toBe(false)
  })

  it('rejects oversized fields', () => {
    expect(parseContact({ ...valid, name: 'a'.repeat(LIMITS.name + 1) })).toEqual({
      ok: false,
      error: 'That name is too long.',
    })
    const longEmail = `${'a'.repeat(LIMITS.email)}@example.com`
    expect(parseContact({ ...valid, email: longEmail })).toEqual({
      ok: false,
      error: 'That address is too long.',
    })
    expect(parseContact({ ...valid, message: 'a'.repeat(LIMITS.message + 1) })).toEqual({
      ok: false,
      error: 'That message is too long.',
    })
  })

  it('rejects header injection through the name or address', () => {
    expect(parseContact({ ...valid, name: 'Ada\nBcc: someone@example.com' }).ok).toBe(false)
    expect(parseContact({ ...valid, email: 'ada@example.com\rX: y' }).ok).toBe(false)
  })

  it('rejects addresses that could not route', () => {
    for (const email of ['ada', 'ada@', '@example.com', 'ada@example', 'a b@example.com']) {
      expect(parseContact({ ...valid, email }).ok).toBe(false)
    }
  })

  it('keeps newlines inside the message body', () => {
    const result = parseContact({ ...valid, message: 'one\ntwo' })
    expect(result.ok && result.value.message).toBe('one\ntwo')
  })
})

describe('createThrottle', () => {
  it('allows up to the limit and then blocks', () => {
    const allow = createThrottle(60_000, 2)
    expect(allow('a', 0)).toBe(true)
    expect(allow('a', 1)).toBe(true)
    expect(allow('a', 2)).toBe(false)
  })

  it('tracks keys independently', () => {
    const allow = createThrottle(60_000, 1)
    expect(allow('a', 0)).toBe(true)
    expect(allow('b', 0)).toBe(true)
    expect(allow('a', 0)).toBe(false)
  })

  it('forgets hits once the window has passed', () => {
    const allow = createThrottle(1_000, 1)
    expect(allow('a', 0)).toBe(true)
    expect(allow('a', 500)).toBe(false)
    expect(allow('a', 1_500)).toBe(true)
  })
})
