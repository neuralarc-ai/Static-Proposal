/**
 * Proposals API Endpoint
 * GET /api/proposals - List proposals
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// GET /api/proposals - List proposals
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin', 'partner'])
    if (authResult.response) return authResult.response

    const { user } = authResult
    const supabase = createSupabaseServerClient()

    let query = supabase
      .from('proposals')
      .select(`
        id,
        partner_id,
        title,
        client_name,
        status,
        value,
        currency,
        timeline,
        created_at,
        updated_at,
        users:partner_id (
          id,
          name,
          email,
          company
        )
      `)
      .order('created_at', { ascending: false })

    // Partners can only see their own proposals
    if (user.role === 'partner') {
      query = query.eq('partner_id', user.userId)
    }

    const { data: proposals, error } = await query

    if (error) {
      console.error('Error fetching proposals:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch proposals' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      proposals: proposals || [],
    })
  } catch (error) {
    console.error('Proposals API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

