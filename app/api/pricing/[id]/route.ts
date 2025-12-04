/**
 * Price List API Endpoint (Single Price List)
 * GET /api/pricing/[id] - Get price list by ID
 * PUT /api/pricing/[id] - Update price list
 * DELETE /api/pricing/[id] - Delete price list
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updatePriceListSchema = z.object({
  currency: z.enum(['USD', 'INR', 'EUR', 'GBP']).optional(),
  helium_license_monthly: z.number().positive().optional(),
  helium_license_annual: z.number().positive().optional(),
  development_rate_per_hour: z.number().positive().optional(),
  deployment_cost: z.number().positive().optional(),
  maintenance_cost: z.number().positive().optional(),
})

// GET /api/pricing/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request, ['admin', 'partner'])
    if (authResult.response) return authResult.response

    const { user } = authResult
    const supabase = createSupabaseServerClient()

    // Get global price list (no partner restriction)
    let query = supabase
      .from('price_lists')
      .select(`
        id,
        currency,
        helium_license_monthly,
        helium_license_annual,
        development_rate_per_hour,
        deployment_cost,
        maintenance_cost,
        created_at,
        updated_at
      `)
      .eq('id', params.id)
      .is('partner_id', null) // Only global pricing

    const { data: priceList, error } = await query.single()

    if (error || !priceList) {
      return NextResponse.json(
        { success: false, error: 'Price list not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      priceList,
    })
  } catch (error) {
    console.error('Get price list error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/pricing/[id]
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
    const validation = updatePriceListSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const updates = validation.data
    const supabase = createSupabaseServerClient()

    // Check if price list exists
    const { data: existingPriceList } = await supabase
      .from('price_lists')
      .select('id, partner_id')
      .eq('id', params.id)
      .single()

    if (!existingPriceList) {
      return NextResponse.json(
        { success: false, error: 'Price list not found' },
        { status: 404 }
      )
    }

    // Update price list
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      ...updates,
    }

    const { data: priceList, error } = await supabase
      .from('price_lists')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating price list:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update price list' },
        { status: 500 }
      )
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      action: 'update',
      resource_type: 'price_list',
      resource_id: params.id,
      details: { updates },
    })

    return NextResponse.json({
      success: true,
      priceList,
    })
  } catch (error) {
    console.error('Update price list error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/pricing/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request, ['admin'])
    if (authResult.response) return authResult.response

    const { user } = authResult
    const supabase = createSupabaseServerClient()

    // Check if price list exists (global pricing only)
    const { data: priceList } = await supabase
      .from('price_lists')
      .select('id, currency')
      .eq('id', params.id)
      .is('partner_id', null) // Only global pricing
      .single()

    if (!priceList) {
      return NextResponse.json(
        { success: false, error: 'Price list not found' },
        { status: 404 }
      )
    }

    // Delete price list
    const { error } = await supabase.from('price_lists').delete().eq('id', params.id)

    if (error) {
      console.error('Error deleting price list:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete price list' },
        { status: 500 }
      )
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      action: 'delete',
      resource_type: 'price_list',
      resource_id: params.id,
      details: { currency: priceList.currency },
    })

    return NextResponse.json({
      success: true,
      message: 'Price list deleted successfully',
    })
  } catch (error) {
    console.error('Delete price list error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

