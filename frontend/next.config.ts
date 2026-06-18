import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' https://*.supabase.co https://paymob.com https://accept.paymob.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://paymob.com https://accept.paymob.com; frame-src https://paymob.com https://accept.paymob.com; frame-ancestors 'none';",
          },
        ],
      },
    ]
  },
}

export default nextConfig

