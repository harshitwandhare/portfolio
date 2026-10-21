import { describe, expect, it } from 'vitest'

import {
  SYMMETRIES,
  generateTipkyanchi,
  isConnected,
  pruneLooseEnds,
  symmetrise,
  type Cell,
  type Chord,
} from './tipkyanchi'

/** Seeds the figure is generated from across the suite. */
const SEEDS = [1, 2, 3, 6, 7, 11, 17, 42, 99, 1234]

const key = ([u, v]: Cell) => `${u},${v}`
const chordKey = ({ a, b }: Chord) => [key(a), key(b)].sort().join('|')
const asSet = (chords: readonly Chord[]) => new Set(chords.map(chordKey))

function degrees(chords: readonly Chord[]): Map<string, number> {
  const d = new Map<string, number>()
  for (const c of chords) {
    d.set(key(c.a), (d.get(key(c.a)) ?? 0) + 1)
    d.set(key(c.b), (d.get(key(c.b)) ?? 0) + 1)
  }
  return d
}

describe('the symmetry group', () => {
  it('has eight distinct elements', () => {
    const probe: Cell = [3, 1]
    expect(new Set(SYMMETRIES.map((f) => key(f(probe)))).size).toBe(8)
  })

  it('is closed under composition, so it really is a group', () => {
    const probe: Cell = [3, 1]
    const images = new Set(SYMMETRIES.map((f) => key(f(probe))))
    for (const f of SYMMETRIES) {
      for (const g of SYMMETRIES) {
        expect(images.has(key(f(g(probe))))).toBe(true)
      }
    }
  })

  it('every element is its own inverse or has one in the group', () => {
    const probe: Cell = [4, 2]
    for (const f of SYMMETRIES) {
      const undone = SYMMETRIES.some((g) => key(g(f(probe))) === key(probe))
      expect(undone).toBe(true)
    }
  })
})

describe('symmetrise', () => {
  it('leaves a figure that every symmetry maps onto itself', () => {
    const out = symmetrise([{ a: [1, 0], b: [3, 2] }])
    const before = asSet(out)
    for (const f of SYMMETRIES) {
      const after = asSet(out.map((c) => ({ a: f(c.a), b: f(c.b) })))
      expect(after).toEqual(before)
    }
  })

  it('gives a chord off the mirrors a full orbit of eight', () => {
    expect(symmetrise([{ a: [1, 0], b: [3, 1] }])).toHaveLength(8)
  })

  it('gives a chord lying along a mirror a shorter orbit', () => {
    // On the diagonal, so several symmetries fix it and the orbit collapses.
    expect(symmetrise([{ a: [1, 1], b: [3, 3] }]).length).toBeLessThan(8)
  })

  it('is idempotent: symmetrising a symmetric figure changes nothing', () => {
    const once = symmetrise([{ a: [2, 1], b: [4, 1] }])
    expect(asSet(symmetrise(once))).toEqual(asSet(once))
  })
})

describe('pruneLooseEnds', () => {
  it('removes a stroke that ends in mid-air', () => {
    // A closed triangle plus one spur hanging off it.
    const triangle: Chord[] = [
      { a: [0, 0], b: [2, 0] },
      { a: [2, 0], b: [2, 2] },
      { a: [2, 2], b: [0, 0] },
    ]
    const withSpur = [...triangle, { a: [2, 2], b: [4, 2] } as Chord]
    expect(asSet(pruneLooseEnds(withSpur))).toEqual(asSet(triangle))
  })

  it('removes a chain of spurs, not just the last one', () => {
    const triangle: Chord[] = [
      { a: [0, 0], b: [2, 0] },
      { a: [2, 0], b: [2, 2] },
      { a: [2, 2], b: [0, 0] },
    ]
    const withTail: Chord[] = [
      ...triangle,
      { a: [2, 2], b: [4, 2] },
      { a: [4, 2], b: [6, 2] },
      { a: [6, 2], b: [8, 2] },
    ]
    expect(asSet(pruneLooseEnds(withTail))).toEqual(asSet(triangle))
  })

  it('leaves a figure that already closes alone', () => {
    const square: Chord[] = [
      { a: [0, 0], b: [2, 0] },
      { a: [2, 0], b: [2, 2] },
      { a: [2, 2], b: [0, 2] },
      { a: [0, 2], b: [0, 0] },
    ]
    expect(asSet(pruneLooseEnds(square))).toEqual(asSet(square))
  })

  it('preserves symmetry, because degree is the same across an orbit', () => {
    const pruned = pruneLooseEnds(
      symmetrise([
        { a: [1, 0], b: [3, 1] },
        { a: [3, 1], b: [4, 4] },
      ]),
    )
    const before = asSet(pruned)
    for (const f of SYMMETRIES) {
      expect(asSet(pruned.map((c) => ({ a: f(c.a), b: f(c.b) })))).toEqual(before)
    }
  })
})

describe('generateTipkyanchi', () => {
  it('refuses an even lattice, which has no centre dot to turn about', () => {
    expect(() => generateTipkyanchi({ n: 8 })).toThrow(/odd/)
  })

  it.each(SEEDS)('seed %i is invariant under all eight symmetries', (seed) => {
    const { chords } = generateTipkyanchi({ seed })
    const before = asSet(chords)
    for (const f of SYMMETRIES) {
      expect(asSet(chords.map((c) => ({ a: f(c.a), b: f(c.b) })))).toEqual(before)
    }
  })

  it.each(SEEDS)('seed %i leaves no stroke ending in mid-air', (seed) => {
    const { chords } = generateTipkyanchi({ seed })
    for (const [at, degree] of degrees(chords)) {
      expect(degree, `dot ${at} has one stroke on it`).toBeGreaterThan(1)
    }
  })

  it.each(SEEDS)('seed %i draws one connected figure', (seed) => {
    expect(isConnected(generateTipkyanchi({ seed }).chords)).toBe(true)
  })

  it.each(SEEDS)('seed %i joins dots, never passing between them', (seed) => {
    // The Maharashtrian construction lands on the dots. Every endpoint must be
    // a lattice point, which is exactly what separates this from a kolam.
    const { chords, n } = generateTipkyanchi({ seed })
    const r = (n - 1) / 2
    for (const c of chords) {
      for (const [u, v] of [c.a, c.b]) {
        expect(Number.isInteger(u) && Number.isInteger(v)).toBe(true)
        expect(Math.abs(u)).toBeLessThanOrEqual(r)
        expect(Math.abs(v)).toBeLessThanOrEqual(r)
      }
    }
  })

  it.each(SEEDS)('seed %i has no zero-length stroke', (seed) => {
    for (const s of generateTipkyanchi({ seed }).segments) {
      expect(Math.hypot(s.x2 - s.x1, s.y2 - s.y1)).toBeGreaterThan(0)
    }
  })

  it('is deterministic: one seed always gives the same figure', () => {
    expect(asSet(generateTipkyanchi({ seed: 6 }).chords)).toEqual(
      asSet(generateTipkyanchi({ seed: 6 }).chords),
    )
  })

  it('different seeds give different figures', () => {
    const shapes = new Set(
      SEEDS.map((seed) => [...asSet(generateTipkyanchi({ seed }).chords)].sort().join(';')),
    )
    expect(shapes.size).toBeGreaterThan(1)
  })

  it('lays out n squared dots', () => {
    expect(generateTipkyanchi({ n: 9 }).dots).toHaveLength(81)
    expect(generateTipkyanchi({ n: 11 }).dots).toHaveLength(121)
  })

  it('keeps every stroke inside the canvas', () => {
    const r = generateTipkyanchi({ seed: 6 })
    for (const s of r.segments) {
      for (const [x, y] of [
        [s.x1, s.y1],
        [s.x2, s.y2],
      ]) {
        expect(x).toBeGreaterThanOrEqual(0)
        expect(y).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThanOrEqual(r.width)
        expect(y).toBeLessThanOrEqual(r.height)
      }
    }
  })

  it('splits the figure into passes that rebuild it exactly once each', () => {
    const r = generateTipkyanchi({ seed: 6 })
    const fromPasses = r.passes.flat()
    expect(fromPasses).toHaveLength(r.segments.length)

    const asKey = (s: { x1: number; y1: number; x2: number; y2: number }) =>
      [`${s.x1},${s.y1}`, `${s.x2},${s.y2}`].sort().join('|')
    expect(new Set(fromPasses.map(asKey))).toEqual(new Set(r.segments.map(asKey)))
  })

  it('draws the wedge first, so the first pass is what the seed chose', () => {
    const r = generateTipkyanchi({ seed: 6 })
    expect(r.passes[0]?.length ?? 0).toBeGreaterThan(0)
  })
})
