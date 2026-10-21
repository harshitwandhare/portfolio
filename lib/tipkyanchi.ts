/**
 * Tipkyanchi rangoli, the dotted form drawn on doorsteps across Maharashtra.
 *
 * Lay a square lattice of equidistant dots, then join dot to dot with straight
 * lines until the geometry closes into a motif. The dots are scaffolding: by
 * the time the design is finished they are under it and out of sight.
 *
 * The southern construction is a different thing. A sikku kolam draws one
 * continuous curve that loops *around* the dots and never touches them, while
 * the Maharashtrian line is straight and lands *on* them. The two get confused
 * constantly, including by an earlier version of this file, which drew the
 * first and called it the second.
 *
 * Symmetry is what turns the strokes into a motif. A rangoli is drawn one
 * wedge at a time and repeated around the centre, so the eighth drawn first
 * decides the whole figure. That is the rule here, exactly:
 *
 *   1. Chords are chosen only inside one eighth of the square, the wedge
 *      0 <= v <= u measured from the centre dot.
 *   2. The chosen set is closed under the eight symmetries of the square, the
 *      dihedral group D4: four rotations and four reflections.
 *
 * So the finished figure is invariant under all eight, and `tipkyanchi.test.ts`
 * asserts that by applying each one and comparing the edge set to itself.
 *
 * Everything below is deterministic: pass the same seed, get the same rangoli.
 */

/** A lattice point, in centred integer coordinates about the middle dot. */
export type Cell = readonly [number, number]

/** A straight stroke between two lattice dots. */
export interface Chord {
  readonly a: Cell
  readonly b: Cell
}

/** A chord placed on the canvas, in pixels. */
export interface Segment {
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
}

/**
 * The eight symmetries of the square, as functions on centred coordinates.
 * Four rotations, then the four reflections.
 */
export const SYMMETRIES: readonly ((c: Cell) => Cell)[] = [
  ([u, v]) => [u, v],
  ([u, v]) => [-v, u],
  ([u, v]) => [-u, -v],
  ([u, v]) => [v, -u],
  ([u, v]) => [-u, v],
  ([u, v]) => [u, -v],
  ([u, v]) => [v, u],
  ([u, v]) => [-v, -u],
]

/**
 * Directions a stroke may run in.
 *
 * Only these four, and whatever the symmetries make of them. A rangoli is set
 * out against the square of the lattice, so its lines are the square's own
 * directions: the two axes, the diagonal, and the shallow two-to-one that
 * gives the pointed petals. An arbitrary slope reads as a mistake.
 */
const DIRECTIONS: readonly Cell[] = [
  [1, 0],
  [0, 1],
  [1, 1],
  [2, 1],
]

const key = ([u, v]: Cell) => `${u},${v}`

/** A chord is undirected, so both orderings have to name the same thing. */
function chordKey({ a, b }: Chord): string {
  const [ka, kb] = [key(a), key(b)]
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`
}

/** Deterministic PRNG. Same seed, same figure, on the server and in a test. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Half the lattice width. Dots run from -radius to +radius on both axes. */
const radiusOf = (n: number) => (n - 1) / 2

const onLattice = ([u, v]: Cell, r: number) =>
  Number.isInteger(u) && Number.isInteger(v) && Math.abs(u) <= r && Math.abs(v) <= r

/**
 * Every stroke that starts in the wedge, runs in one of the allowed
 * directions, and stays on the lattice. These are what the seed chooses from.
 */
function wedgeCandidates(n: number): Chord[] {
  const r = radiusOf(n)
  const out: Chord[] = []
  const seen = new Set<string>()

  for (let u = 0; u <= r; u++) {
    for (let v = 0; v <= u; v++) {
      const a: Cell = [u, v]
      for (const [du, dv] of DIRECTIONS) {
        // Two to four dots long. One step is too short to read as a stroke,
        // and anything longer crosses the whole figure and flattens it.
        for (let len = 1; len <= 3; len++) {
          const b: Cell = [u + du * len, v + dv * len]
          if (!onLattice(b, r)) continue
          const chord = { a, b }
          const k = chordKey(chord)
          if (seen.has(k)) continue
          seen.add(k)
          out.push(chord)
        }
      }
    }
  }
  return out
}

/** Apply one symmetry to a chord. */
const mapChord = (c: Chord, f: (cell: Cell) => Cell): Chord => ({ a: f(c.a), b: f(c.b) })

/**
 * Close a set of chords under all eight symmetries.
 *
 * This is the step that turns a handful of strokes into a rangoli. A chord
 * lying on a mirror line maps onto itself, so the orbit of one chord is
 * anywhere from one to eight chords and the total is never simply eight times
 * the input.
 */
export function symmetrise(chords: readonly Chord[]): Chord[] {
  const byKey = new Map<string, Chord>()
  for (const c of chords) {
    for (const f of SYMMETRIES) {
      const image = mapChord(c, f)
      byKey.set(chordKey(image), image)
    }
  }
  return [...byKey.values()]
}

/**
 * Drop strokes that end in mid-air.
 *
 * A rangoli closes. Lines meet other lines and enclose shapes; a stroke with a
 * free end reads as an unfinished drawing, and the seeded search produces them
 * often. Removing every chord with an endpoint of degree one, and repeating
 * until none is left, leaves the part of the figure that actually closes.
 *
 * Degree is the same at every point of a symmetry orbit, so pruning a
 * symmetric figure leaves it symmetric. That is why this can run after
 * `symmetrise` without undoing it.
 */
export function pruneLooseEnds(chords: readonly Chord[]): Chord[] {
  let kept = [...chords]

  for (;;) {
    const degree = new Map<string, number>()
    for (const c of kept) {
      degree.set(key(c.a), (degree.get(key(c.a)) ?? 0) + 1)
      degree.set(key(c.b), (degree.get(key(c.b)) ?? 0) + 1)
    }

    const next = kept.filter(
      (c) => (degree.get(key(c.a)) ?? 0) > 1 && (degree.get(key(c.b)) ?? 0) > 1,
    )
    if (next.length === kept.length) return kept
    kept = next
  }
}

/** Dots touched by at least one stroke, which is how connectivity is judged. */
function endpoints(chords: readonly Chord[]): Set<string> {
  const s = new Set<string>()
  for (const c of chords) {
    s.add(key(c.a))
    s.add(key(c.b))
  }
  return s
}

/**
 * Is the figure a single connected piece?
 *
 * A rangoli is drawn without lifting the hand more than it has to, and a motif
 * that falls into unrelated islands looks like a mistake rather than a design,
 * so the generator keeps adding strokes until this holds.
 */
export function isConnected(chords: readonly Chord[]): boolean {
  if (chords.length === 0) return true

  const adjacency = new Map<string, string[]>()
  for (const c of chords) {
    const [ka, kb] = [key(c.a), key(c.b)]
    adjacency.set(ka, [...(adjacency.get(ka) ?? []), kb])
    adjacency.set(kb, [...(adjacency.get(kb) ?? []), ka])
  }

  const start = key((chords[0] as Chord).a)
  const seen = new Set([start])
  const queue = [start]
  while (queue.length > 0) {
    const at = queue.pop() as string
    for (const next of adjacency.get(at) ?? []) {
      if (seen.has(next)) continue
      seen.add(next)
      queue.push(next)
    }
  }
  return seen.size === endpoints(chords).size
}

export interface TipkyanchiOptions {
  /** Dots per side. Odd, so the lattice has a centre dot to turn about. */
  readonly n?: number
  /** Pixels between neighbouring dots. */
  readonly size?: number
  /** Padding around the lattice, in pixels. */
  readonly pad?: number
  readonly seed?: number
  /** How many strokes to choose inside the wedge before symmetrising. */
  readonly strokes?: number
}

export interface Tipkyanchi {
  readonly n: number
  readonly size: number
  readonly pad: number
  readonly width: number
  readonly height: number
  /** Every dot of the lattice, in pixels, row-major from the top left. */
  readonly dots: readonly { x: number; y: number }[]
  /** The finished figure. */
  readonly chords: readonly Chord[]
  /** The same strokes in pixels, ready to draw. */
  readonly segments: readonly Segment[]
  /**
   * The figure split into the eight passes a hand would draw it in: the wedge
   * first, then its seven repeats. Pass 0 is what the seed actually chose.
   */
  readonly passes: readonly (readonly Segment[])[]
}

/**
 * Build the figure.
 *
 * Strokes are drawn from the wedge in a seeded order and kept when they touch
 * what is already there, which is how the motif grows outward from the centre
 * instead of scattering. Once the quota is met the set is symmetrised, and if
 * the result is still in pieces the remaining candidates are tried until it
 * is whole.
 */
export function generateTipkyanchi({
  n = 9,
  size = 40,
  pad = 24,
  seed = 1,
  strokes = 7,
}: TipkyanchiOptions = {}): Tipkyanchi {
  if (n % 2 === 0) throw new Error(`n must be odd so the lattice has a centre dot, got ${n}`)

  const r = radiusOf(n)
  const rand = mulberry32(seed)

  // Shuffle the candidates once, then take from the front. Seeded, so the
  // order is a property of the seed rather than of the iteration.
  const pool = wedgeCandidates(n)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const a = pool[i] as Chord
    const b = pool[j] as Chord
    pool[i] = b
    pool[j] = a
  }

  const chosen: Chord[] = []
  const touched = new Set<string>()

  for (const c of pool) {
    if (chosen.length >= strokes) break
    const touches = touched.size === 0 || touched.has(key(c.a)) || touched.has(key(c.b))
    if (!touches) continue
    chosen.push(c)
    touched.add(key(c.a))
    touched.add(key(c.b))
  }

  // Symmetrise, prune the strokes that end in mid-air, and keep feeding the
  // figure until what survives is a single closed piece of a decent size.
  // Pruning can eat most of a sparse figure, so this grows it rather than
  // trusting the first draw.
  const settle = (picked: readonly Chord[]) => pruneLooseEnds(symmetrise(picked))

  let chords = settle(chosen)
  for (const c of pool) {
    if (chords.length >= strokes * 4 && isConnected(chords)) break
    if (chosen.some((already) => chordKey(already) === chordKey(c))) continue
    chosen.push(c)
    chords = settle(chosen)
  }

  // Only the strokes that survived pruning should be replayed by the figure.
  const survived = new Set(chords.map(chordKey))
  const wedgeStrokes = chosen.filter((c) => survived.has(chordKey(c)))

  const centre = pad + r * size
  const place = ([u, v]: Cell) => ({ x: centre + u * size, y: centre + v * size })

  const dots: { x: number; y: number }[] = []
  for (let v = -r; v <= r; v++) {
    for (let u = -r; u <= r; u++) dots.push(place([u, v]))
  }

  const toSegment = (c: Chord): Segment => {
    const a = place(c.a)
    const b = place(c.b)
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
  }

  // Group by symmetry rather than by chord, so the figure can be drawn the way
  // it is made: one wedge, then its repeats.
  const drawn = new Set<string>()
  const passes: Segment[][] = SYMMETRIES.map((f) => {
    const pass: Segment[] = []
    for (const c of wedgeStrokes) {
      const image = mapChord(c, f)
      const k = chordKey(image)
      if (drawn.has(k)) continue
      drawn.add(k)
      pass.push(toSegment(image))
    }
    return pass
  })

  const extent = pad * 2 + (n - 1) * size
  return {
    n,
    size,
    pad,
    width: extent,
    height: extent,
    dots,
    chords,
    segments: chords.map(toSegment),
    passes,
  }
}
