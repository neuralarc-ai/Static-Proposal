/**
 * Subdomain Utilities
 * Helper functions for subdomain detection and routing
 */

/**
 * Get the base app URL from environment variable or default to localhost
 */
function getAppBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return window.location.origin
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

/**
 * Get the login URL based on role
 */
export function getLoginUrl(role: 'admin' | 'partner'): string {
  const baseUrl = getAppBaseUrl()
  
  if (role === 'admin') {
    // Check if we're in production (has https://)
    if (baseUrl.includes('https://')) {
      return baseUrl.replace('https://', 'https://admin.')
    }
    // Development: use admin subdomain
    return baseUrl.replace('localhost:3000', 'admin.localhost:3000')
  }
  return baseUrl
}

/**
 * Check if current request is on admin subdomain
 */
export function isAdminSubdomain(hostname: string | null): boolean {
  if (!hostname) return false
  const subdomain = hostname.split('.')[0]
  return subdomain === 'admin' || hostname.startsWith('admin.')
}

/**
 * Get base URL for current subdomain
 */
export function getBaseUrl(hostname: string | null): string {
  const baseUrl = getAppBaseUrl()
  
  if (isAdminSubdomain(hostname)) {
    if (baseUrl.includes('https://')) {
      return baseUrl.replace('https://', 'https://admin.')
    }
    return baseUrl.replace('localhost:3000', 'admin.localhost:3000')
  }
  return baseUrl
}

