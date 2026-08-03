import { describe, expect, it } from 'vitest'
import { arcsToPath, generateRangoli, generateStages, type Arc } from './rangoli'

/**
 * The figure on the page is only worth anything if the constraint actually
 * holds. These tests assert the three properties the drawing claims: it is one
 * closed curve, it covers the whole lattice, and it never touches a dot.
 */

const GRIDS = [
  { rows: 3, cols: 3 },
  { rows: 4, cols: 6 },
  { rows: 6, cols: 6 },
  { rows: 6, cols: 9 },
  { rows: 8, cols: 12 },
  { rows: 13, cols: 27 },
] as const

const SEEDS = [1, 2, 3, 7, 23, 42, 99, 1234]

/** Arcs per cell (2) plus one link for each pair of perimeter midpoints. */
function expectedArcs(rows: number, cols: number): number {
  return rows * cols * 2 + (2 * rows + 2 * cols) / 2
}

const key = (p: readonly [number, number]) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`

describe('generateRangoli', () => {
  it.each(GRIDS)('collapses to a single closed stroke on a $rows×$cols lattice', (grid) => {
    for (const seed of SEEDS) {
      const r = generateRangoli({ ...grid, seed, size: 40 })

      // Every arc in the tiling is used exactly once, so the walk covered the
      // whole lattice rather than getting stuck in one small loop.
      expect(r.length).toBe(expectedArcs(grid.rows, grid.cols))

      // The path is explicitly closed.
      expect(r.path.endsWith('Z')).toBe(true)
      expect(r.path.startsWith('M ')).toBe(true)
    }
  })

  it.each(GRIDS)('joins end to end with no breaks on a $rows×$cols lattice', (grid) => {
    for (const seed of SEEDS) {
      const { stroke } = generateRangoli({ ...grid, seed, size: 40 })

      // Each arc must begin exactly where the previous one ended.
      for (let i = 1; i < stroke.length; i++) {
        expect(key(stroke[i]!.from)).toBe(key(stroke[i - 1]!.to))
      }
      // And the last must return to the first — a closed loop, not a path.
      expect(key(stroke.at(-1)!.to)).toBe(key(stroke[0]!.from))
    }
  })

  it('visits every midpoint exactly once, so the curve never self-intersects', () => {
    for (const seed of SEEDS) {
      const { stroke } = generateRangoli({ rows: 6, cols: 9, seed, size: 40 })
      const visited = stroke.map((a: Arc) => key(a.from))
      expect(new Set(visited).size).toBe(visited.length)
    }
  })

  it('never draws through a dot — every arc keeps its radius from the dot it circles', () => {
    const size = 40
    const r = generateRangoli({ rows: 6, cols: 6, seed: 23, size })
    const dots = new Set(r.dots.map(key))

    for (const arc of r.stroke) {
      // Arc endpoints are edge midpoints, never lattice points.
      expect(dots.has(key(arc.from))).toBe(false)
      expect(dots.has(key(arc.to))).toBe(false)

      // A curved arc sits exactly one radius from the dot it goes around.
      if (!arc.boundary) {
        const d = Math.hypot(arc.from[0] - arc.around[0], arc.from[1] - arc.around[1])
        expect(d).toBeCloseTo(size / 2, 6)
      }
    }
  })

  it('keeps one radius for the whole figure, boundary included', () => {
    // The rule of the form is that the line rounds every dot at the same
    // distance. Boundary links used to be straight chords laid along the edge,
    // which both broke that and ran straight through the perimeter dots.
    const size = 40
    for (const [rows, cols] of [
      [6, 6],
      [7, 9],
      [9, 9],
      [5, 12],
    ] as const) {
      const r = generateRangoli({ rows, cols, seed: 23, size, pad: size })
      for (const arc of r.stroke) {
        for (const p of [arc.from, arc.to]) {
          const d = Math.hypot(p[0] - arc.around[0], p[1] - arc.around[1])
          expect(d, `${rows}x${cols} arc at ${p} is ${d} from its dot`).toBeCloseTo(size / 2, 6)
        }
      }
    }
  })

  it('never doubles back on itself, on any lattice', () => {
    // A corner turn-back joins a horizontal midpoint to a vertical one, so it
    // looks exactly like an ordinary cell arc. Drawn as one it took the short
    // way round the corner dot, cutting inside the corner and reversing
    // direction: a cusp on every odd-sided lattice, four of them, every time.
    const size = 40
    const unit = (v: readonly [number, number]) => {
      const m = Math.hypot(v[0], v[1])
      return [v[0] / m, v[1] / m] as const
    }
    /** Unit tangent at a point on an arc. Sweep 1 runs clockwise on screen. */
    const tangent = (arc: Arc, p: readonly [number, number]) => {
      const dx = p[0] - arc.around[0]
      const dy = p[1] - arc.around[1]
      return unit(arc.sweep === 1 ? [dy, -dx] : [-dy, dx])
    }

    for (const [rows, cols] of [
      [6, 6],
      [7, 7],
      [8, 8],
      [9, 9],
      [7, 10],
      [11, 5],
    ] as const) {
      const r = generateRangoli({ rows, cols, seed: 13, size, pad: size })
      for (let i = 0; i < r.stroke.length; i++) {
        const a = r.stroke[i]!
        const b = r.stroke[(i + 1) % r.stroke.length]!
        const [ax, ay] = tangent(a, a.to)
        const [bx, by] = tangent(b, b.from)
        const deg = (Math.acos(Math.max(-1, Math.min(1, ax * bx + ay * by))) * 180) / Math.PI
        expect(deg, `${rows}x${cols}: ${deg.toFixed(0)}deg kink at ${a.to}`).toBeLessThan(1)
      }
    }
  })

  it('turns back at the edge on a curve, never a straight line', () => {
    // The boundary links used to be straight chords, which drew a frame of
    // ruled lines around a field of curves and was the one place the figure
    // stopped reading as a single continuous stroke.
    const size = 40
    const rows = 6
    const cols = 6
    const pad = size / 2
    const r = generateRangoli({ rows, cols, seed: 23, size, pad })
    const path = arcsToPath(r.stroke, size)
    expect(path).not.toMatch(/[LlHhVv]/)

    // Edge turn-backs only. A corner one is a reflex arc, checked above.
    const boundary = r.stroke.filter((a: Arc) => a.boundary && !a.largeArc)
    expect(boundary.length).toBeGreaterThan(0)

    for (const arc of boundary) {
      // Each turn-back is a semicircle bulging away from the lattice, so its
      // apex lands half a cell outside the edge it sits on — which is why the
      // callers pad by at least size / 2.
      const mid = [(arc.from[0] + arc.to[0]) / 2, (arc.from[1] + arc.to[1]) / 2] as const
      const dx = arc.to[0] - arc.from[0]
      const dy = arc.to[1] - arc.from[1]
      const rad = Math.hypot(dx, dy) / 2
      // Apex direction for sweep 1 is (dy, -dx); sweep 0 flips it.
      const s = arc.sweep === 1 ? 1 : -1
      const apex = [mid[0] + (s * dy) / 2, mid[1] - (s * dx) / 2] as const
      expect(rad).toBeCloseTo(size / 2, 6)

      const outside =
        apex[0] < pad - 1e-9 ||
        apex[1] < pad - 1e-9 ||
        apex[0] > pad + cols * size + 1e-9 ||
        apex[1] > pad + rows * size + 1e-9
      expect(outside, `turn-back at ${arc.from} bulges inward`).toBe(true)
    }
  })

  it('needs exactly one flip per loop it has to splice', () => {
    for (const seed of SEEDS) {
      const r = generateRangoli({ rows: 8, cols: 12, seed, size: 40 })
      expect(r.flips).toBe(r.loopsBefore - 1)
    }
  })

  it('is deterministic — the same seed gives the same figure', () => {
    const a = generateRangoli({ rows: 6, cols: 9, seed: 42, size: 40 })
    const b = generateRangoli({ rows: 6, cols: 9, seed: 42, size: 40 })
    expect(a.path).toBe(b.path)
    expect(a.flips).toBe(b.flips)
  })

  it('gives different figures for different seeds', () => {
    const a = generateRangoli({ rows: 6, cols: 9, seed: 1, size: 40 })
    const b = generateRangoli({ rows: 6, cols: 9, seed: 2, size: 40 })
    expect(a.path).not.toBe(b.path)
  })

  it('records a stage per flip, ending on one loop', () => {
    for (const seed of SEEDS) {
      const r = generateRangoli({ rows: 6, cols: 9, seed, size: 40 })
      const { stages } = generateStages({ rows: 6, cols: 9, seed, size: 40 })

      // The working must match the answer.
      expect(stages).toHaveLength(r.flips + 1)
      expect(stages[0]!.loopCount).toBe(r.loopsBefore)
      expect(stages.at(-1)!.loopCount).toBe(1)
      expect(stages.at(-1)!.loops).toHaveLength(1)
      expect(stages.at(-1)!.loops[0]!.arcs).toHaveLength(r.length)
    }
  })

  it('never lets the loop count rise as it splices', () => {
    for (const seed of SEEDS) {
      const { stages } = generateStages({ rows: 8, cols: 12, seed, size: 40 })
      for (let i = 1; i < stages.length; i++) {
        expect(stages[i]!.loopCount).toBeLessThan(stages[i - 1]!.loopCount)
      }
    }
  })

  it('conserves every arc at every stage — splicing rewires, it never deletes', () => {
    const rows = 6
    const cols = 9
    const total = expectedArcs(rows, cols)
    for (const seed of SEEDS) {
      const { stages } = generateStages({ rows, cols, seed, size: 40 })
      for (const stage of stages) {
        const arcs = stage.loops.reduce((n, l) => n + l.arcs.length, 0)
        expect(arcs).toBe(total)
      }
    }
  })

  it('lays out a full dot lattice with the expected geometry', () => {
    const r = generateRangoli({ rows: 4, cols: 6, seed: 1, size: 40, pad: 20 })
    expect(r.dots).toHaveLength((4 + 1) * (6 + 1))
    expect(r.dots[0]).toEqual([20, 20])
    expect(r.width).toBe(6 * 40 + 40)
    expect(r.height).toBe(4 * 40 + 40)
  })
})
