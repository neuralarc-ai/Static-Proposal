/**
 * Authentication Middleware
 * Validates JWT tokens and protects routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, type JWTPayload } from './jwt'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

/**
 * Get JWT token from request (cookie or Authorization header)
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // Try cookie first
  const tokenCookie = request.cookies.get('auth-token')
  if (tokenCookie?.value) {
    return tokenCookie.value
  }

  // Try Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

/**
 * Middleware to authenticate requests
 * Returns user payload if authenticated, null otherwise
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<JWTPayload | null> {
  const token = getTokenFromRequest(request)

  if (!token) {
    return null
  }

  const payload = verifyToken(token)

  if (!payload) {
    return null
  }

  // Verify user still exists and is active in database
  const supabase = createSupabaseServerClient()
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, role, status')
    .eq('id', payload.userId)
    .single()

  if (error || !user || user.status !== 'active') {
    return null
  }

  // Verify token matches current user state
  if (user.email !== payload.email || user.role !== payload.role) {
    return null
  }

  return payload
}

/**
 * Middleware helper to protect API routes
 * Returns NextResponse with error if not authenticated
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: ('admin' | 'partner')[]
): Promise<{ user: JWTPayload; response?: never } | { user?: never; response: NextResponse }> {
  const user = await authenticateRequest(request)

  if (!user) {
    return {
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
    }
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      response: NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      ),
    }
  }

  return { user }
}

