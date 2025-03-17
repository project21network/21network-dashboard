/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['firebasestorage.googleapis.com'],
    },
    experimental: {
      serverActions: {
        allowedOrigins: ["localhost:3000", "localhost:3001"]
      }
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }
  
  module.exports = nextConfig