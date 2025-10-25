/** @type {import('next').NextConfig} */

// Security headers (OWASP baseline hardening)
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.google-analytics.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://res.cloudinary.com https://images.unsplash.com https://www.google-analytics.com https://raw.githubusercontent.com;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]

const nextConfig = {
  reactStrictMode: true,
  
  // Enable standalone output for Docker deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Disable telemetry in production
  // telemetry: false, // This option is deprecated
  // swcMinify is deprecated in Next.js 15 - SWC is now default
  
  // i18n configuration is not supported in App Router
  // Use next-intl or similar library instead
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com', pathname: '/**' }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp']
  },
  
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders }
    ]
  },
  
  async redirects() {
    return [
      { source: '/admin', destination: '/admin/dashboard', permanent: false },
      { source: '/dashboard', destination: '/dashboard/bookings', permanent: false }
    ]
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false
      }
    }
    return config
  },
  
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID
  },
  
  experimental: {
    serverActions: { bodySizeLimit: '2mb' }
  },
  
  // Performance monitoring
  poweredByHeader: false,
  compress: true,
  generateEtags: true
}

module.exports = nextConfig