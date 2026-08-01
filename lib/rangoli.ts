/**
 * Tipkyanchi rangoli — the dot-grid form of Maharashtra.
 *
 * The rule the drawing obeys is old and exact: lay a lattice of equidistant
 * dots, then draw a line that goes *around* every dot, never through one, never
 * crosses itself, and closes on itself. In the kolam literature the same
 * constraint is called Line-Around-Dots, and the resulting single closed curve
 * is a Brahmamudi.
 *
 * The construction here is a contour tiling. Each cell of the lattice carries
 * one of two tiles, and each tile is a pair of quarter-circle arcs centred on
 * opposite corners of that cell:
 *
 *     tile 0            tile 1
 *     ·   ·             ·   ·
 *      \_/               \_/       arcs curve around the dots at the corners,
 *     ·   ·             ·   ·      so no arc ever touches a dot.
 *
 * Two facts make this correct rather than merely decorative:
 *
 *   1. Every arc endpoint sits at the midpoint of a cell edge, and every
 *      interior edge is shared by exactly two cells. So every midpoint has
 *      degree two, and the arcs can only ever form disjoint closed loops —
 *      never a dangling end, never a crossing.
 *   2. Flipping one tile rewires exactly the two arcs inside that cell. If the
 *      two arcs belonged to different loops, the flip splices those loops into
 *      one. Repeating that is what drives a many-loop tiling down to the single
 *      unbroken stroke.
 *
 * Everything below is deterministic: pass the same seed, get the same rangoli.
 */

export type Tile = 0 | 1

/** A point where two arcs meet — always the midpoint of a lattice cell edge. */
type NodeId = string

export interface Arc {
  /** Start midpoint. */
  from: readonly [number, number]
  /** End midpoint. */
  to: readonly [number, number]
  /** The dot this arc curves around. */
  around: readonly [number, number]
  /** SVG arc sweep flag. */
  sweep: 0 | 1
}

/** One closed loop of the tiling, as an ordered ring of arcs. */
export interface Loop {
  readonly arcs: readonly Arc[]
  readonly path: string
}

/**
 * One stage of the splice. The first stage is the raw tiling with all its
 * separate loops; the last is the single stroke.
 */
export interface Stage {
  readonly loops: readonly Loop[]
  readonly loopCount: number
  /** Flips applied to reach this stage. */
  readonly flips: number
}

export interface Rangoli {
  /** Every dot in the lattice, in row-major order. */
  dots: ReadonlyArray<readonly [number, number]>
  /** The stroke, as an ordered ring of arcs. */
  stroke: readonly Arc[]
  /** SVG path data for the stroke. */
  path: string
  /** How many separate loops the raw tiling produced before splicing. */
  loopsBefore: number
  /** How many tile flips were needed to reach one stroke. */
  flips: number
  /** Total arc count — the length of the single closed curve. */
  length: number
  width: number
  height: number
}

/* ── lattice bookkeeping ─────────────────────────────────────────────────── */

const hNode = (r: number, c: number): NodeId => `h:${r}:${c}`
const vNode = (r: number, c: number): NodeId => `v:${r}:${c}`

/** The four edge midpoints of cell (r, c), as node ids. */
function cellNodes(r: number, c: number) {
  return {
    n: hNode(r, c),
    s: hNode(r + 1, c),
    w: vNode(r, c),
    e: vNode(r, c + 1),
  }
}

/**
 * The two arcs a tile contributes, as node-id pairs.
 * Tile 0 joins N–W and S–E; tile 1 joins N–E and S–W.
 */
function tilePairs(r: number, c: number, tile: Tile): [[NodeId, NodeId], [NodeId, NodeId]] {
  const { n, s, w, e } = cellNodes(r, c)
  return tile === 0
    ? [
        [n, w],
        [s, e],
      ]
    : [
        [n, e],
        [s, w],
      ]
}

/**
 * The perimeter midpoints, walked in order around the outside of the lattice.
 * These have only one cell against them, so they are joined to each other in
 * consecutive pairs to close the curve at the boundary — which is exactly what
 * a rangoli does when the line turns back at the edge of the pattern.
 */
function perimeterNodes(rows: number, cols: number): NodeId[] {
  const ring: NodeId[] = []
  for (let c = 0; c < cols; c++) ring.push(hNode(0, c)) // top, left to right
  for (let r = 0; r < rows; r++) ring.push(vNode(r, cols)) // right, top to bottom
  for (let c = cols - 1; c >= 0; c--) ring.push(hNode(rows, c)) // bottom, right to left
  for (let r = rows - 1; r >= 0; r--) ring.push(vNode(r, 0)) // left, bottom to top
  return ring
}

/* ── deterministic randomness ────────────────────────────────────────────── */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ── loop tracing ────────────────────────────────────────────────────────── */

/**
 * Walk the arc graph and label every node with the loop it belongs to.
 * Because every node has degree two this is a plain union of cycles.
 */
function traceLoops(adj: Map<NodeId, NodeId[]>): Map<NodeId, number> {
  const loopOf = new Map<NodeId, number>()
  let loop = 0

  for (const start of adj.keys()) {
    if (loopOf.has(start)) continue
    let current = start
    let previous: NodeId | null = null

    // Follow the cycle back to where it started.
    for (;;) {
      loopOf.set(current, loop)
      const neighbours = adj.get(current)
      if (!neighbours) break
      const next = neighbours.find((n) => n !== previous) ?? neighbours[0]
      if (next === undefined) break
      previous = current
      current = next
      if (current === start) break
    }
    loop++
  }
  return loopOf
}

/** Rebuild the adjacency map from the current tiling plus the boundary pairing. */
function buildAdjacency(
  tiles: Tile[][],
  rows: number,
  cols: number,
  boundaryPairs: ReadonlyArray<readonly [NodeId, NodeId]>,
): Map<NodeId, NodeId[]> {
  const adj = new Map<NodeId, NodeId[]>()
  const link = (a: NodeId, b: NodeId) => {
    const listA = adj.get(a)
    if (listA) listA.push(b)
    else adj.set(a, [b])
    const listB = adj.get(b)
    if (listB) listB.push(a)
    else adj.set(b, [a])
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const row = tiles[r]
      if (!row) continue
      const tile = row[c]
      if (tile === undefined) continue
      const [p, q] = tilePairs(r, c, tile)
      link(p[0], p[1])
      link(q[0], q[1])
    }
  }
  for (const [a, b] of boundaryPairs) link(a, b)
  return adj
}

/* ── geometry ────────────────────────────────────────────────────────────── */

function nodePoint(id: NodeId, size: number, pad: number): readonly [number, number] {
  const [kind, rs, cs] = id.split(':')
  const r = Number(rs)
  const c = Number(cs)
  return kind === 'h'
    ? [pad + c * size + size / 2, pad + r * size]
    : [pad + c * size, pad + r * size + size / 2]
}

/**
 * Which dot does the arc between two midpoints of the same cell curve around?
 * It is the lattice corner shared by both edges.
 */
function sharedCorner(a: NodeId, b: NodeId, size: number, pad: number): readonly [number, number] {
  const [ka, ar, ac] = a.split(':')
  const [, br, bc] = b.split(':')
  // One node is horizontal, the other vertical. The shared corner takes its
  // column from the vertical edge and its row from the horizontal edge.
  const h = ka === 'h' ? { r: Number(ar), c: Number(ac) } : { r: Number(br), c: Number(bc) }
  const v = ka === 'h' ? { r: Number(br), c: Number(bc) } : { r: Number(ar), c: Number(ac) }
  return [pad + v.c * size, pad + h.r * size]
}

function sweepFor(
  from: readonly [number, number],
  to: readonly [number, number],
  centre: readonly [number, number],
): 0 | 1 {
  const cross =
    (from[0] - centre[0]) * (to[1] - centre[1]) - (from[1] - centre[1]) * (to[0] - centre[0])
  // SVG y grows downward, so a positive cross product is a clockwise turn.
  return cross > 0 ? 1 : 0
}

/* ── walking the graph into drawable arcs ────────────────────────────────── */

/** Build the arc joining two adjacent midpoints. */
function makeArc(a: NodeId, b: NodeId, size: number, pad: number): Arc {
  const from = nodePoint(a, size, pad)
  const to = nodePoint(b, size, pad)
  // Arcs inside a cell join a horizontal edge midpoint to a vertical one. A
  // pair of like-kind nodes is a boundary link, drawn as a straight chord.
  const sameKind = a[0] === b[0]
  const around = sameKind ? from : sharedCorner(a, b, size, pad)
  return { from, to, around, sweep: sameKind ? 0 : sweepFor(from, to, around) }
}

/** SVG path data for an ordered ring of arcs. */
export function arcsToPath(arcs: readonly Arc[], size: number): string {
  if (!arcs.length) return ''
  const r = size / 2
  const head = `M ${arcs[0]!.from[0]} ${arcs[0]!.from[1]}`
  const body = arcs
    .map((arc) =>
      arc.around === arc.from
        ? `L ${arc.to[0]} ${arc.to[1]}`
        : `A ${r} ${r} 0 0 ${arc.sweep} ${arc.to[0]} ${arc.to[1]}`,
    )
    .join(' ')
  return `${head} ${body} Z`
}

/** Follow the ring that starts at `start`, emitting arcs in order. */
function walkRing(
  adj: Map<NodeId, NodeId[]>,
  start: NodeId,
  size: number,
  pad: number,
  seen?: Set<NodeId>,
): Arc[] {
  const arcs: Arc[] = []
  let current = start
  let previous: NodeId | null = null

  for (let step = 0; step <= adj.size; step++) {
    seen?.add(current)
    const neighbours = adj.get(current)
    if (!neighbours) break
    const next = neighbours.find((n) => n !== previous) ?? neighbours[0]
    if (next === undefined) break

    arcs.push(makeArc(current, next, size, pad))
    previous = current
    current = next
    if (current === start) break
  }
  return arcs
}

/** Every closed loop currently present, each as its own ordered ring. */
function collectLoops(adj: Map<NodeId, NodeId[]>, size: number, pad: number): Loop[] {
  const seen = new Set<NodeId>()
  const loops: Loop[] = []
  for (const start of adj.keys()) {
    if (seen.has(start)) continue
    const arcs = walkRing(adj, start, size, pad, seen)
    if (arcs.length) loops.push({ arcs, path: arcsToPath(arcs, size) })
  }
  // Largest first, so colour assignment stays stable as loops merge.
  return loops.sort((a, b) => b.arcs.length - a.arcs.length)
}

/* ── the generator ───────────────────────────────────────────────────────── */

export interface RangoliOptions {
  rows: number
  cols: number
  /** Distance between neighbouring dots. */
  size?: number
  seed?: number
  /** Margin around the lattice, in the same units as `size`. */
  pad?: number
}

/**
 * Build a rangoli: a dot lattice and the single unbroken line that encircles it.
 */
export function generateRangoli({
  rows,
  cols,
  size = 40,
  seed = 1,
  pad = 20,
}: RangoliOptions): Rangoli {
  const rand = mulberry32(seed)

  const tiles: Tile[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (rand() < 0.5 ? 0 : 1) as Tile),
  )

  // Pair consecutive perimeter midpoints so the curve turns back at the edge.
  const ring = perimeterNodes(rows, cols)
  const boundaryPairs: Array<readonly [NodeId, NodeId]> = []
  for (let i = 0; i < ring.length; i += 2) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    if (a && b) boundaryPairs.push([a, b])
  }

  let adj = buildAdjacency(tiles, rows, cols, boundaryPairs)
  let loopOf = traceLoops(adj)
  const loopsBefore = new Set(loopOf.values()).size

  // Splice loops together, one tile flip at a time, until a single stroke is
  // left. Each pass re-traces; the loop count strictly decreases, so this
  // terminates in at most `loopsBefore` passes.
  let flips = 0
  let loopCount = loopsBefore
  let guard = rows * cols * 4

  while (loopCount > 1 && guard-- > 0) {
    let flipped = false
    for (let r = 0; r < rows && !flipped; r++) {
      for (let c = 0; c < cols && !flipped; c++) {
        const row = tiles[r]
        if (!row) continue
        const tile = row[c]
        if (tile === undefined) continue
        const [p, q] = tilePairs(r, c, tile)
        const lp = loopOf.get(p[0])
        const lq = loopOf.get(q[0])
        if (lp === undefined || lq === undefined || lp === lq) continue

        // Two different loops pass through this cell — flipping splices them.
        row[c] = (tile === 0 ? 1 : 0) as Tile
        flips++
        flipped = true
      }
    }
    if (!flipped) break
    adj = buildAdjacency(tiles, rows, cols, boundaryPairs)
    loopOf = traceLoops(adj)
    loopCount = new Set(loopOf.values()).size
  }

  // Walk the finished curve into an ordered ring of arcs.
  const startNode = adj.keys().next().value
  const stroke = startNode === undefined ? [] : walkRing(adj, startNode, size, pad)

  return {
    dots: latticeDots(rows, cols, size, pad),
    stroke,
    path: arcsToPath(stroke, size),
    loopsBefore,
    flips,
    length: stroke.length,
    width: cols * size + pad * 2,
    height: rows * size + pad * 2,
  }
}

/** Every dot in the lattice, row-major. */
function latticeDots(
  rows: number,
  cols: number,
  size: number,
  pad: number,
): Array<readonly [number, number]> {
  const dots: Array<readonly [number, number]> = []
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) dots.push([pad + c * size, pad + r * size])
  }
  return dots
}

export interface Stages {
  readonly dots: ReadonlyArray<readonly [number, number]>
  /** Index 0 is the raw tiling; the last entry is the single stroke. */
  readonly stages: readonly Stage[]
  readonly width: number
  readonly height: number
}

/**
 * The same construction, but recording the figure after every splice.
 *
 * `generateRangoli` only needs the answer. This returns the working — the raw
 * tiling with all its separate loops, then each one absorbed, down to the
 * single stroke. It exists so the page can show the algorithm running rather
 * than assert that it did.
 */
export function generateStages({
  rows,
  cols,
  size = 40,
  seed = 1,
  pad = 20,
}: RangoliOptions): Stages {
  const rand = mulberry32(seed)
  const tiles: Tile[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (rand() < 0.5 ? 0 : 1) as Tile),
  )

  const ring = perimeterNodes(rows, cols)
  const boundaryPairs: Array<readonly [NodeId, NodeId]> = []
  for (let i = 0; i < ring.length; i += 2) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    if (a && b) boundaryPairs.push([a, b])
  }

  let adj = buildAdjacency(tiles, rows, cols, boundaryPairs)
  let loopOf = traceLoops(adj)
  let loopCount = new Set(loopOf.values()).size

  const stages: Stage[] = [{ loops: collectLoops(adj, size, pad), loopCount, flips: 0 }]

  let flips = 0
  let guard = rows * cols * 4

  while (loopCount > 1 && guard-- > 0) {
    let flipped = false
    for (let r = 0; r < rows && !flipped; r++) {
      for (let c = 0; c < cols && !flipped; c++) {
        const row = tiles[r]
        if (!row) continue
        const tile = row[c]
        if (tile === undefined) continue
        const [p, q] = tilePairs(r, c, tile)
        const lp = loopOf.get(p[0])
        const lq = loopOf.get(q[0])
        if (lp === undefined || lq === undefined || lp === lq) continue

        row[c] = (tile === 0 ? 1 : 0) as Tile
        flips++
        flipped = true
      }
    }
    if (!flipped) break

    adj = buildAdjacency(tiles, rows, cols, boundaryPairs)
    loopOf = traceLoops(adj)
    loopCount = new Set(loopOf.values()).size
    stages.push({ loops: collectLoops(adj, size, pad), loopCount, flips })
  }

  return {
    dots: latticeDots(rows, cols, size, pad),
    stages,
    width: cols * size + pad * 2,
    height: rows * size + pad * 2,
  }
}
