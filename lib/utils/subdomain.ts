/**
 * Subdomain Utilities
 * Helper functions for subdomain detection and routing
 */

/**
 * Get the login URL based on role
 */
export function getLoginUrl(role: 'admin' | 'partner'): string {
  if (role === 'admin') {
    return 'http://admin.localhost:3000'
  }
  return 'http://localhost:3000'
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
  if (isAdminSubdomain(hostname)) {
    return 'http://admin.localhost:3000'
  }
  return 'http://localhost:3000'
}

