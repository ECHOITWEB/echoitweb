/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // domains 대신 remotePatterns 사용
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'echoit.co.kr',
      },
      {
        protocol: 'https',
        hostname: '**.echoit.co.kr',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'ext.same-assets.com',
      }
    ],
  },
  // 타임아웃 설정 증가
  staticPageGenerationTimeout: 120,
  experimental: {
    serverActions: {
      timeout: 120,
    },
    optimizePackageImports: ['lucide-react'],
  },
  // 메모리 사용량 최적화
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
  // JWT 관련 환경 변수 노출
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    JWT_SECRET: process.env.JWT_SECRET
  }
}

module.exports = nextConfig; 