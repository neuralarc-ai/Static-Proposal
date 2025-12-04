/**
 * PDF Export API Endpoint
 * GET /api/proposals/[id]/export-pdf
 * 
 * Generates a PDF with AI-enhanced document drafting
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { generateProposalPDF } from '@/lib/pdf/generator'

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request, ['admin', 'partner'])
    if (authResult.response) return authResult.response

    const { user } = authResult
    const supabase = createSupabaseServerClient()

    // Fetch proposal
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
        created_at
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

    // Format proposal content
    const proposalContent = {
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
    }

    // Generate PDF with AI drafting
    const filename = `Proposal-${proposal.id.slice(-6).toUpperCase()}-${proposal.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.pdf`
    
    console.log('📄 Starting PDF generation for proposal:', proposal.id)
    console.log('🤖 AI drafting enabled - will analyze and enhance document')
    
    // Generate PDF and get as blob
    const pdfBlob = await generateProposalPDF({
      proposal: {
        id: proposal.id,
        title: proposal.title,
        client: proposal.client_name,
        createdAt: proposal.created_at,
        currency: proposal.currency,
        content: proposalContent,
      },
      filename,
      useAIDrafting: true, // Enable AI document drafting
      returnBlob: true, // Return blob instead of saving
    })

    if (!pdfBlob) {
      console.error('❌ PDF blob generation failed')
      throw new Error('Failed to generate PDF blob')
    }

    console.log('✅ PDF generated successfully, size:', pdfBlob.size, 'bytes')

    // Convert blob to buffer
    const arrayBuffer = await pdfBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('📦 PDF buffer created, returning to client')

    // Return PDF as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export PDF' },
      { status: 500 }
    )
  }
}

