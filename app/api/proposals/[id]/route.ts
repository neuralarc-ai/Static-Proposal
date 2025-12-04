/**
 * Proposal API Endpoint (Single Proposal)
 * GET /api/proposals/[id] - Get proposal by ID
 * PUT /api/proposals/[id] - Update proposal status
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateProposalSchema = z.object({
  status: z.enum(['draft', 'pending', 'approved', 'rejected']).optional(),
})

// GET /api/proposals/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        executive_summary,
        project_scope,
        timeline_phases,
        investment_items,
        deliverables,
        technology_stack,
        terms_and_conditions,
        approved_at,
        approved_by,
        created_at,
        updated_at,
        users:partner_id (
          id,
          name,
          email,
          company
        )
      `)
      .eq('id', params.id)

    // Partners can only see their own proposals
    if (user.role === 'partner') {
      query = query.eq('partner_id', user.userId)
    }

    const { data: proposal, error } = await query.single()

    if (error || !proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Format proposal content for frontend
    const formattedProposal = {
      id: proposal.id,
      partnerId: proposal.partner_id,
      title: proposal.title,
      client: proposal.client_name,
      status: proposal.status,
      value: proposal.value,
      currency: proposal.currency,
      timeline: proposal.timeline,
      content: {
        executiveSummary: proposal.executive_summary || '',
        projectScope: (proposal.project_scope as string[]) || [],
        timeline: (proposal.timeline_phases as Array<{
          period: string
          title: string
          description: string
        }>) || [],
        investment: (proposal.investment_items as Array<{
          name: string
          description: string
          amount: number
        }>) || [],
        deliverables: (proposal.deliverables as string[]) || [],
        technologyStack: (proposal.technology_stack as {
          frontend: string
          backend: string
          infrastructure: string
        }) || {
          frontend: '',
          backend: '',
          infrastructure: '',
        },
        termsAndConditions: (proposal.terms_and_conditions as string[]) || [],
      },
      partner: proposal.users,
      approvedAt: proposal.approved_at,
      approvedBy: proposal.approved_by,
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at,
    }

    return NextResponse.json({
      success: true,
      proposal: formattedProposal,
    })
  } catch (error) {
    console.error('Get proposal error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/proposals/[id] - Update proposal (mainly for status changes)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request, ['admin'])
    if (authResult.response) return authResult.response

    const { user } = authResult
    const body = await request.json()

    // Validate input
    const validation = updateProposalSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { status } = validation.data
    const supabase = createSupabaseServerClient()

    // Check if proposal exists
    const { data: existingProposal } = await supabase
      .from('proposals')
      .select('id, status')
      .eq('id', params.id)
      .single()

    if (!existingProposal) {
      return NextResponse.json(
        { success: false, error: 'Proposal not found' },
        { status: 404 }
      )
    }

    // Prepare update
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (status) {
      updateData.status = status
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString()
        updateData.approved_by = user.userId
      }
    }

    // Update proposal
    const { data: proposal, error } = await supabase
      .from('proposals')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating proposal:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update proposal' },
        { status: 500 }
      )
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      action: 'update',
      resource_type: 'proposal',
      resource_id: params.id,
      details: { status, previous_status: existingProposal.status },
    })

    return NextResponse.json({
      success: true,
      proposal,
    })
  } catch (error) {
    console.error('Update proposal error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

