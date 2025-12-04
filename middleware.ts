/**
 * Next.js Middleware
 * Handles path-based routing:
 * - /admin/* -> Admin portal
 * - /partner/* -> Partner portal
 * - / -> Partner portal (default)
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const path = url.pathname

  // CRITICAL: Skip middleware entirely for API routes
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip middleware for static files and Next.js internals
  if (
    path.startsWith('/_next/') ||
    path.startsWith('/favicon.ico') ||
    path.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next()
  }

  // Root path - redirect to partner login
  if (path === '/') {
    return NextResponse.next() // Let page.tsx handle it (partner login)
  }

  // Admin routes - allow through
  if (path.startsWith('/admin/')) {
    return NextResponse.next()
  }

  // Partner routes - allow through
  if (path.startsWith('/partner/')) {
    return NextResponse.next()
  }

  // Default: allow through (let Next.js handle 404s)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled by Next.js directly)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
