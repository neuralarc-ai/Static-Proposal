/**
 * Logout API Endpoint
 * POST /api/auth/logout
 * 
 * Invalidates user session and clears auth cookie
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/middleware'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)

    if (user) {
      // Invalidate all sessions for this user
      const supabase = createSupabaseServerClient()
      await supabase
        .from('sessions')
        .update({ expires_at: new Date().toISOString() })
        .eq('user_id', user.userId)

      // Log audit event
      await supabase.from('audit_logs').insert({
        user_id: user.userId,
        action: 'logout',
        resource_type: 'auth',
        resource_id: user.userId,
        details: { method: 'manual' },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      })
    }

    // Clear auth cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    )

    response.cookies.delete('auth-token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

