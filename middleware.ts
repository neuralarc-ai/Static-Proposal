/**
 * Next.js Middleware
 * Handles subdomain routing:
 * - admin.localhost:3000 -> Admin portal
 * - localhost:3000 -> Partner portal
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  
  // Extract subdomain
  const subdomain = hostname.split('.')[0]
  
  // Check if it's admin subdomain
  const isAdminSubdomain = subdomain === 'admin' || hostname.startsWith('admin.')
  
  // Get the path
  const path = url.pathname
  
  // Admin subdomain routing
  if (isAdminSubdomain) {
    // If on root, redirect to admin login
    if (path === '/') {
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    
    // If trying to access partner routes, redirect to admin equivalent
    if (path.startsWith('/partner/')) {
      url.pathname = path.replace('/partner/', '/admin/')
      return NextResponse.redirect(url)
    }
    
    // If trying to access partner login, redirect to admin login
    if (path === '/partner/login' || path === '/login') {
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    
    // Allow admin routes
    if (path.startsWith('/admin/') || path.startsWith('/api/')) {
      return NextResponse.next()
    }
    
    // Default: redirect to admin login
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }
  
  // Partner portal (default/localhost)
  // Root path shows partner login (handled by page.tsx)
  // Allow partner routes and API routes
  if (path.startsWith('/partner/') || path.startsWith('/api/') || path === '/') {
    return NextResponse.next()
  }
  
  // If trying to access admin routes, redirect to partner equivalent
  if (path.startsWith('/admin/')) {
    url.pathname = path.replace('/admin/', '/partner/')
    return NextResponse.redirect(url)
  }
  
  // If trying to access admin login, redirect to root (partner login)
  if (path === '/admin/login') {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
  
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

