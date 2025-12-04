/**
 * Proposal Request API Endpoint
 * POST /api/proposals/[id]/request
 * 
 * Creates a request for more information about a proposal
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const createRequestSchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request, ['partner'])
    if (authResult.response) return authResult.response

    const { user } = authResult
    const body = await request.json()

    // Validate input
    const validation = createRequestSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { message } = validation.data
    const supabase = createSupabaseServerClient()

    // Verify proposal exists and belongs to this partner
    const { data: proposal } = await supabase
      .from('proposals')
      .select('id, partner_id')
      .eq('id', params.id)
      .eq('partner_id', user.userId)
      .single()

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Create request
    const { data: proposalRequest, error } = await supabase
      .from('proposal_requests')
      .insert({
        proposal_id: params.id,
        partner_id: user.userId,
        message: message.trim(),
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating proposal request:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create request' },
        { status: 500 }
      )
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      action: 'create',
      resource_type: 'proposal_request',
      resource_id: proposalRequest.id,
      details: { proposal_id: params.id },
    })

    return NextResponse.json(
      {
        success: true,
        request: proposalRequest,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create proposal request error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

