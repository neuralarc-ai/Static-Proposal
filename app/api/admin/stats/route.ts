/**
 * Admin Statistics API Endpoint
 * GET /api/admin/stats
 * 
 * Returns dashboard statistics for admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin'])
    if (authResult.response) return authResult.response

    const supabase = createSupabaseServerClient()

    // Get total partners count
    const { count: partnersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'partner')
      .eq('status', 'active')

    // Get active proposals count
    const { count: proposalsCount } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'pending'])

    // Get total revenue (sum of all approved proposals)
    const { data: approvedProposals } = await supabase
      .from('proposals')
      .select('value, currency')
      .eq('status', 'approved')

    // Calculate total revenue (convert to USD for simplicity, or handle multi-currency)
    const totalRevenue = approvedProposals?.reduce((sum, p) => {
      // Simple conversion (in production, use real exchange rates)
      const usdValue = p.currency === 'USD' ? p.value : 
                      p.currency === 'EUR' ? p.value * 1.1 :
                      p.currency === 'GBP' ? p.value * 1.25 :
                      p.currency === 'INR' ? p.value / 83 : p.value
      return sum + usdValue
    }, 0) || 0

    // Get all proposals for conversion rate
    const { count: totalProposals } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true })

    const { count: approvedCount } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    const conversionRate = totalProposals && totalProposals > 0
      ? Math.round((approvedCount || 0) / totalProposals * 100)
      : 0

    // Get recent partners (last 5)
    const { data: recentPartners } = await supabase
      .from('users')
      .select('id, name, email, company, created_at')
      .eq('role', 'partner')
      .order('created_at', { ascending: false })
      .limit(5)

    // Get recent proposals (last 5)
    const { data: recentProposals } = await supabase
      .from('proposals')
      .select(`
        id,
        title,
        client_name,
        status,
        value,
        currency,
        created_at,
        users:partner_id (
          id,
          name,
          company
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      stats: {
        totalPartners: partnersCount || 0,
        activeProposals: proposalsCount || 0,
        totalRevenue: Math.round(totalRevenue),
        conversionRate,
      },
      recentPartners: recentPartners || [],
      recentProposals: recentProposals || [],
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

