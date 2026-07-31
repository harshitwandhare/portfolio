import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.test.ts'],
      // Lines and functions are held at 100. Branches sit lower because the
      // remaining uncovered arms are defensive `??` guards on lookups that
      // cannot miss for a well-formed lattice — writing tests that fake those
      // states would assert nothing real.
      thresholds: { lines: 100, functions: 100, statements: 90, branches: 80 },
    },
  },
})
