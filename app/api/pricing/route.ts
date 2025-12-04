/**
 * Price Lists API Endpoint
 * GET /api/pricing - List all price lists
 * POST /api/pricing - Create a new price list
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createPriceListSchema = z.object({
  currency: z.enum(['USD', 'INR', 'EUR', 'GBP']),
  helium_license_monthly: z.number().positive('Monthly license must be positive'),
  helium_license_annual: z.number().positive('Annual license must be positive'),
  development_rate_per_hour: z.number().positive('Development rate must be positive'),
  deployment_cost: z.number().positive('Deployment cost must be positive'),
  maintenance_cost: z.number().positive('Maintenance cost must be positive'),
})

const updatePriceListSchema = z.object({
  currency: z.enum(['USD', 'INR', 'EUR', 'GBP']).optional(),
  helium_license_monthly: z.number().positive().optional(),
  helium_license_annual: z.number().positive().optional(),
  development_rate_per_hour: z.number().positive().optional(),
  deployment_cost: z.number().positive().optional(),
  maintenance_cost: z.number().positive().optional(),
})

// GET /api/pricing - List all price lists
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin', 'partner'])
    if (authResult.response) return authResult.response

    const { user } = authResult
    const supabase = createSupabaseServerClient()

    // Get global price lists (no partner_id) - one per currency
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
      .is('partner_id', null) // Only global pricing
      .order('currency', { ascending: true })

    const { data: priceLists, error } = await query

    if (error) {
      console.error('Error fetching price lists:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch price lists' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      priceLists: priceLists || [],
    })
  } catch (error) {
    console.error('Price lists API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/pricing - Create a new price list
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin'])
    if (authResult.response) return authResult.response

    const { user } = authResult
    const body = await request.json()

    // Validate input
    const validation = createPriceListSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const priceListData = validation.data
    const supabase = createSupabaseServerClient()

    // Check if price list already exists for this currency
    const { data: existingPriceList } = await supabase
      .from('price_lists')
      .select('id')
      .eq('currency', priceListData.currency)
      .is('partner_id', null) // Global pricing
      .maybeSingle()

    if (existingPriceList) {
      // Update existing global price list
      const { data: priceList, error } = await supabase
        .from('price_lists')
        .update({
          helium_license_monthly: priceListData.helium_license_monthly,
          helium_license_annual: priceListData.helium_license_annual,
          development_rate_per_hour: priceListData.development_rate_per_hour,
          deployment_cost: priceListData.deployment_cost,
          maintenance_cost: priceListData.maintenance_cost,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPriceList.id)
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
        resource_id: priceList.id,
        details: { currency: priceListData.currency },
      })

      return NextResponse.json(
        {
          success: true,
          priceList,
        },
        { status: 200 }
      )
    }

    // Create new global price list
    const { data: priceList, error } = await supabase
      .from('price_lists')
      .insert({
        partner_id: null, // Global pricing (no partner)
        currency: priceListData.currency,
        helium_license_monthly: priceListData.helium_license_monthly,
        helium_license_annual: priceListData.helium_license_annual,
        development_rate_per_hour: priceListData.development_rate_per_hour,
        deployment_cost: priceListData.deployment_cost,
        maintenance_cost: priceListData.maintenance_cost,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating price list:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create price list' },
        { status: 500 }
      )
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      action: 'create',
      resource_type: 'price_list',
      resource_id: priceList.id,
      details: { currency: priceListData.currency },
    })

    return NextResponse.json(
      {
        success: true,
        priceList,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create price list error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

