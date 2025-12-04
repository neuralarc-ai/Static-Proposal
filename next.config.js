/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure API routes are not statically optimized
  // All API routes should be serverless functions
  output: 'standalone',
}

module.exports = nextConfig
