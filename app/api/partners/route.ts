/**
 * Partners API Endpoint
 * GET /api/partners - List all partners
 * POST /api/partners - Create a new partner
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import bcrypt from 'bcrypt'
import { z } from 'zod'

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const createPartnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(1, 'Company name is required'),
  pin: z.string().length(4, 'PIN must be exactly 4 digits').regex(/^\d{4}$/, 'PIN must contain only digits'),
  status: z.enum(['active', 'pending', 'suspended']).default('active'),
})

const updatePartnerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  company: z.string().min(1).optional(),
  pin: z.string().length(4).regex(/^\d{4}$/).optional(),
  status: z.enum(['active', 'pending', 'suspended']).optional(),
})

// GET /api/partners - List all partners
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin'])
    if (authResult.response) return authResult.response

    const { user } = authResult
    const supabase = createSupabaseServerClient()

    const { data: partners, error } = await supabase
      .from('users')
      .select('id, email, name, company, role, status, created_at, last_login_at')
      .eq('role', 'partner')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching partners:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch partners' },
        { status: 500 }
      )
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      action: 'list',
      resource_type: 'partners',
      details: { count: partners?.length || 0 },
    })

    return NextResponse.json({
      success: true,
      partners: partners || [],
    })
  } catch (error) {
    console.error('Partners API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/partners - Create a new partner
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['admin'])
    if (authResult.response) return authResult.response

    const { user } = authResult
    const body = await request.json()

    // Validate input
    const validation = createPartnerSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { name, email, company, pin, status } = validation.data
    const supabase = createSupabaseServerClient()

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      )
    }

    // Hash PIN
    const pinHash = await bcrypt.hash(pin, 10)

    // Create partner
    const { data: partner, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        company: company.trim(),
        role: 'partner',
        pin_hash: pinHash,
        status: status || 'active',
        email_verified: false,
      })
      .select('id, email, name, company, role, status, created_at')
      .single()

    if (error) {
      console.error('Error creating partner:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create partner'
      if (error.code === '23505') {
        errorMessage = 'Email already exists'
      } else if (error.code === '23502') {
        errorMessage = 'Missing required field'
      } else if (error.code === '23503') {
        errorMessage = 'Invalid reference (foreign key constraint)'
      } else if (error.code === '23514') {
        errorMessage = 'Invalid data (check constraint violation)'
      } else if (error.message) {
        errorMessage = `Database error: ${error.message}`
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      )
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      action: 'create',
      resource_type: 'partner',
      resource_id: partner.id,
      details: { email: partner.email, company: partner.company },
    })

    return NextResponse.json(
      {
        success: true,
        partner,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create partner error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

