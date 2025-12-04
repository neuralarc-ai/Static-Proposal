/**
 * Get Current User API Endpoint
 * GET /api/auth/me
 * 
 * Returns the currently authenticated user's information
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth/middleware'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Get full user data from database
    const supabase = createSupabaseServerClient()
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, name, role, company, status, created_at')
      .eq('id', user.userId)
      .single()

    if (error || !userData) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          company: userData.company,
          status: userData.status,
          createdAt: userData.created_at,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

