/**
 * Partner API Endpoint (Single Partner)
 * GET /api/partners/[id] - Get partner by ID
 * PUT /api/partners/[id] - Update partner
 * DELETE /api/partners/[id] - Delete partner
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import bcrypt from 'bcrypt'
import { z } from 'zod'

const updatePartnerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  company: z.string().min(1).optional(),
  pin: z.string().length(4).regex(/^\d{4}$/).optional(),
  status: z.enum(['active', 'pending', 'suspended']).optional(),
})

// GET /api/partners/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request, ['admin'])
    if (authResult.response) return authResult.response

    const { user } = authResult
    const supabase = createSupabaseServerClient()

    const { data: partner, error } = await supabase
      .from('users')
      .select('id, email, name, company, role, status, created_at, last_login_at')
      .eq('id', params.id)
      .eq('role', 'partner')
      .single()

    if (error || !partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      partner,
    })
  } catch (error) {
    console.error('Get partner error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/partners/[id]
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
    const validation = updatePartnerSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const updates = validation.data
    const supabase = createSupabaseServerClient()

    // Check if partner exists
    const { data: existingPartner } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', params.id)
      .eq('role', 'partner')
      .single()

    if (!existingPartner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      )
    }

    // If email is being updated, check for duplicates
    if (updates.email && updates.email !== existingPartner.email) {
      const { data: emailExists } = await supabase
        .from('users')
        .select('id')
        .eq('email', updates.email.toLowerCase().trim())
        .single()

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 409 }
        )
      }
    }

    // Prepare update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.name) updateData.name = updates.name.trim()
    if (updates.email) updateData.email = updates.email.toLowerCase().trim()
    if (updates.company) updateData.company = updates.company.trim()
    if (updates.status) updateData.status = updates.status

    // Hash PIN if provided
    if (updates.pin) {
      updateData.pin_hash = await bcrypt.hash(updates.pin, 10)
    }

    // Update partner
    const { data: partner, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', params.id)
      .select('id, email, name, company, role, status, created_at, updated_at')
      .single()

    if (error) {
      console.error('Error updating partner:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update partner' },
        { status: 500 }
      )
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      action: 'update',
      resource_type: 'partner',
      resource_id: params.id,
      details: { updates },
    })

    return NextResponse.json({
      success: true,
      partner,
    })
  } catch (error) {
    console.error('Update partner error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/partners/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request, ['admin'])
    if (authResult.response) return authResult.response

    const { user } = authResult
    const supabase = createSupabaseServerClient()

    // Check if partner exists
    const { data: partner } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', params.id)
      .eq('role', 'partner')
      .single()

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Delete partner (cascade will handle related records)
    const { error } = await supabase.from('users').delete().eq('id', params.id)

    if (error) {
      console.error('Error deleting partner:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete partner' },
        { status: 500 }
      )
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      action: 'delete',
      resource_type: 'partner',
      resource_id: params.id,
      details: { email: partner.email },
    })

    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully',
    })
  } catch (error) {
    console.error('Delete partner error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

