/**
 * Test API Endpoint
 * GET /api/auth/admin/test - Simple test to verify API routes work
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Admin API route is working!',
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Admin API POST route is working!',
    timestamp: new Date().toISOString(),
  })
}

