import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 정적 내보내기 (Vercel에서는 필요없지만 CDN 배포 시 활성화)
  // output: 'export',

  // 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // 압축
  compress: true,

  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
