/**
 * Unified Login API Endpoint
 * POST /api/auth/login
 * 
 * Authenticates both admin and partner users with PIN
 * Determines role based on subdomain or explicit role parameter
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { generateToken, getTokenExpiration } from '@/lib/auth/jwt'
import bcrypt from 'bcrypt'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const loginSchema = z.object({
  pin: z.string().length(4, 'PIN must be exactly 4 digits').regex(/^\d{4}$/, 'PIN must contain only digits'),
  role: z.enum(['admin', 'partner']).optional(), // Optional: will be determined from subdomain if not provided
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)
    
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        {
          success: false,
          error: firstError?.message || 'Invalid PIN format',
        },
        { status: 400 }
      )
    }

    const { pin, role: explicitRole } = validation.data

    // Determine role from subdomain or explicit parameter
    const hostname = request.headers.get('host') || ''
    const subdomain = hostname.split('.')[0]
    const isAdminSubdomain = subdomain === 'admin' || hostname.startsWith('admin.')
    const userRole = explicitRole || (isAdminSubdomain ? 'admin' : 'partner')

    const supabase = createSupabaseServerClient()

    // Find users based on role
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(userRole === 'admin' 
        ? 'id, email, name, role, pin_hash, status'
        : 'id, email, name, role, pin_hash, status, company'
      )
      .eq('role', userRole)
      .eq('status', 'active')

    if (usersError || !users || users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No active ${userRole}s found`,
        },
        { status: 404 }
      )
    }

    // Try to find matching PIN
    let authenticatedUser: typeof users[0] | null = null

    for (const user of users) {
      if (user.pin_hash) {
        const pinValid = await bcrypt.compare(pin, user.pin_hash)
        if (pinValid) {
          authenticatedUser = user
          break
        }
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid PIN',
        },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken(authenticatedUser.id, authenticatedUser.email, userRole as 'admin' | 'partner')
    const expiresIn = getTokenExpiration(userRole as 'admin' | 'partner')

    // Create session in database
    const { error: sessionError } = await supabase.from('sessions').insert({
      user_id: authenticatedUser.id,
      token_hash: await bcrypt.hash(token, 10),
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
    })

    if (sessionError) {
      console.error('Error creating session:', sessionError)
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authenticatedUser.id)

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: authenticatedUser.id,
      action: 'login',
      resource_type: 'auth',
      resource_id: authenticatedUser.id,
      details: { method: 'pin', role: userRole },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
    })

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          name: authenticatedUser.name,
          role: authenticatedUser.role,
          ...(userRole === 'partner' && 'company' in authenticatedUser ? { company: authenticatedUser.company } : {}),
        },
      },
      { status: 200 }
    )

    // Set httpOnly cookie with token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

