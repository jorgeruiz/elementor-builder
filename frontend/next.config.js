/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk', 'cheerio'],
  },
}

module.exports = nextConfig
