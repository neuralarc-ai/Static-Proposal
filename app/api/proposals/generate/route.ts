/**
 * Proposal Generation API Endpoint
 * POST /api/proposals/generate
 * 
 * Generates a proposal using Google Gemini 2.5 Pro
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { generateProposal } from '@/lib/ai/gemini'
import { z } from 'zod'

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const generateProposalSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  projectDescription: z.string().min(10, 'Project description must be at least 10 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  budget: z.number().positive().optional(),
  currency: z.enum(['USD', 'INR', 'EUR', 'GBP']).default('USD'),
  timeline: z.string().optional(),
  industry: z.enum(['insurance', 'banking', 'healthcare', 'finance', 'consulting']).optional(),
  solutionType: z.string().optional(),
  complexity: z.enum(['simple', 'moderate', 'complex', 'enterprise']).optional(),
  teamSize: z.enum(['small', 'medium', 'large']).optional(),
  licenseTier: z.enum(['starter', 'professional', 'enterprise']).optional(),
  minimumBudget: z.number().positive().optional(),
  country: z.string().optional(),
  expectedTime: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request, ['partner'])
    if (authResult.response) return authResult.response

    const { user } = authResult
    const body = await request.json()

    // Validate input
    const validation = generateProposalSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { clientName, projectDescription, requirements, budget, currency, timeline, industry, solutionType, complexity, teamSize, licenseTier, minimumBudget, country, expectedTime } = validation.data
    const supabase = createSupabaseServerClient()

    // Get partner information
    const { data: partner, error: partnerError } = await supabase
      .from('users')
      .select('id, name, company')
      .eq('id', user.userId)
      .eq('role', 'partner')
      .single()

    if (partnerError || !partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Get global price list based on currency (from Neural Arc Knowledge Base)
    // Currency is determined from country selection or defaults to USD
    const priceListCurrency = currency || 'USD'
    const { data: priceList, error: priceListError } = await supabase
      .from('price_lists')
      .select('*')
      .eq('currency', priceListCurrency)
      .is('partner_id', null) // Global pricing (no partner_id)
      .maybeSingle()

    if (priceListError) {
      console.error('Error fetching price list:', priceListError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch price list. Please try again.' },
        { status: 500 }
      )
    }

    // If no global price list found, use defaults from Neural Arc Knowledge Base
    let finalPriceList
    if (!priceList) {
      console.log(`Global price list not found for currency: ${priceListCurrency}, using defaults`)
      const isIndiaMarket = priceListCurrency === 'INR'
      finalPriceList = {
        currency: priceListCurrency,
        helium_license_monthly: isIndiaMarket ? 75000 : 2000,
        helium_license_annual: isIndiaMarket ? 900000 : 24000,
        development_rate_per_hour: isIndiaMarket ? 1200 : 35,
        deployment_cost: isIndiaMarket ? 375000 : 5000,
        maintenance_cost: isIndiaMarket ? 60000 : 800,
      }
    } else {
      finalPriceList = priceList
    }

    // Generate proposal using AI with price list information
    let generatedContent
    try {
      generatedContent = await generateProposal({
        partnerName: partner.name,
        partnerCompany: partner.company || '',
        clientName,
        projectDescription,
        requirements,
        budget: minimumBudget || budget,
        currency: currency || finalPriceList.currency,
        timeline: expectedTime || timeline,
        industry: industry || undefined,
        solutionType: solutionType || undefined,
        complexity: complexity || undefined,
        teamSize: teamSize || undefined,
        licenseTier: licenseTier || undefined,
        minimumBudget: minimumBudget || undefined,
        country: country || undefined,
        expectedTime: expectedTime || undefined,
        priceList: {
          currency: finalPriceList.currency as 'USD' | 'INR' | 'EUR' | 'GBP',
          helium_license_monthly: Number(finalPriceList.helium_license_monthly),
          helium_license_annual: Number(finalPriceList.helium_license_annual),
          development_rate_per_hour: Number(finalPriceList.development_rate_per_hour),
          deployment_cost: Number(finalPriceList.deployment_cost),
          maintenance_cost: Number(finalPriceList.maintenance_cost),
        },
      })
    } catch (aiError) {
      console.error('AI generation error:', aiError)
      return NextResponse.json(
        {
          success: false,
          error: aiError instanceof Error ? aiError.message : 'Failed to generate proposal. Please try again.',
        },
        { status: 500 }
      )
    }

    // Normalize investment items - ensure all amounts are numbers
    const normalizedInvestment = generatedContent.investment.map((item) => {
      const rawAmount: unknown = item.amount
      let amount: number
      
      // If amount is a string, parse it (remove currency symbols, commas, etc.)
      if (typeof rawAmount === 'string') {
        // Remove currency symbols, commas, and whitespace
        const cleaned = rawAmount.replace(/[$€£₹,\s]/g, '')
        // Parse as float
        amount = parseFloat(cleaned) || 0
      } else if (typeof rawAmount === 'number') {
        amount = rawAmount
      } else {
        amount = 0
      }
      
      // Ensure it's a valid number
      if (isNaN(amount) || !isFinite(amount)) {
        console.warn(`Invalid amount for item "${item.name}": ${rawAmount}, using 0`)
        amount = 0
      }
      
      return {
        name: item.name,
        description: item.description,
        amount: amount,
      }
    })
    
    // Calculate total value from normalized investment items
    const totalValue = normalizedInvestment.reduce((sum, item) => sum + item.amount, 0)
    
    // Ensure totalValue is a valid number
    if (isNaN(totalValue) || !isFinite(totalValue)) {
      console.error('Invalid totalValue calculated:', totalValue, 'from investment items:', generatedContent.investment)
      throw new Error('Failed to calculate proposal total value')
    }

    // Create proposal in database
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        partner_id: user.userId,
        title: `Proposal for ${clientName}`,
        client_name: clientName,
        status: 'draft',
        value: totalValue,
        currency: currency || finalPriceList.currency,
        timeline: timeline || 'To be determined',
        executive_summary: generatedContent.executiveSummary,
        project_scope: generatedContent.projectScope,
        timeline_phases: generatedContent.timeline,
        investment_items: normalizedInvestment,
        deliverables: generatedContent.deliverables,
        technology_stack: generatedContent.technologyStack,
        terms_and_conditions: generatedContent.termsAndConditions,
      })
      .select()
      .single()

    if (proposalError) {
      console.error('Error creating proposal:', proposalError)
      return NextResponse.json(
        { success: false, error: 'Failed to save proposal' },
        { status: 500 }
      )
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.userId,
      action: 'create',
      resource_type: 'proposal',
      resource_id: proposal.id,
      details: { client_name: clientName, method: 'ai_generation' },
    })

    return NextResponse.json(
      {
        success: true,
        proposal: {
          id: proposal.id,
          title: proposal.title,
          client: proposal.client_name,
          status: proposal.status,
          value: proposal.value,
          currency: proposal.currency,
          timeline: proposal.timeline,
          createdAt: proposal.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Generate proposal error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

