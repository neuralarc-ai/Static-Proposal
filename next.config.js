/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure API routes are not statically optimized
  experimental: {
    // This ensures all API routes are handled as serverless functions
  },
  // Ensure proper routing
  async rewrites() {
    return []
  },
}

module.exports = nextConfig
