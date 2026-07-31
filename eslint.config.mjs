import coreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

/**
 * eslint-config-next ships flat config directly from v16, so it is spread in
 * rather than wrapped in FlatCompat.
 *
 * `settings.react.version` is pinned deliberately: the bundled
 * eslint-plugin-react 7.37 crashes under ESLint 10 when it tries to *detect*
 * the version, because detection uses the pre-10 rule context API.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'out/**',
      // Generated reports and artefacts — not source.
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '.lighthouseci/**',
    ],
  },
  ...coreWebVitals,
  ...nextTypescript,
  {
    settings: { react: { version: '19' } },
  },
]

export default config
