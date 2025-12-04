import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { generateToken, getTokenExpiration } from '@/lib/auth/jwt'
import bcrypt from 'bcrypt'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const loginSchema = z.object({
  pin: z.string().length(4, 'PIN must be exactly 4 digits').regex(/^\d{4}$/, 'PIN must contain only digits'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid PIN format' }, { status: 400 })
    }

    const { pin } = validation.data
    const supabase = createSupabaseServerClient()

    const { data: admins, error: adminsError } = await supabase
      .from('users')
      .select('id, email, name, role, pin_hash, status')
      .eq('role', 'admin')
      .eq('status', 'active')

    if (adminsError || !admins || admins.length === 0) {
      return NextResponse.json({ success: false, error: 'No active admins found' }, { status: 404 })
    }

    let authenticatedUser = null
    for (const admin of admins) {
      if (admin.pin_hash) {
        const pinValid = await bcrypt.compare(pin, admin.pin_hash)
        if (pinValid) {
          authenticatedUser = admin
          break
        }
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json({ success: false, error: 'Invalid PIN' }, { status: 401 })
    }

    const token = generateToken(authenticatedUser.id, authenticatedUser.email, 'admin')
    const expiresIn = getTokenExpiration('admin')

    await supabase.from('sessions').insert({
      user_id: authenticatedUser.id,
      token_hash: await bcrypt.hash(token, 10),
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
    })

    await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', authenticatedUser.id)

    await supabase.from('audit_logs').insert({
      user_id: authenticatedUser.id,
      action: 'login',
      resource_type: 'auth',
      resource_id: authenticatedUser.id,
      details: { method: 'pin', role: 'admin' },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        name: authenticatedUser.name,
        role: authenticatedUser.role,
      },
    }, { status: 200 })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

