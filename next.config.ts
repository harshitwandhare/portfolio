import type { NextConfig } from 'next'

export const SITE_URL = 'https://harshitwandhare.com'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  async redirects() {
    return [
      // One canonical hostname. Vercel serves both www and the apex, which
      // would otherwise put identical content on two addresses and split the
      // canonical signal. Kept here rather than in a dashboard toggle so it
      // lives in version control and survives the project being recreated.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.harshitwandhare.com' }],
        destination: `${SITE_URL}/:path*`,
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default nextConfig
