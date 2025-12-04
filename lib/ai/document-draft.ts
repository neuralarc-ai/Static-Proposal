/**
 * Document Drafting Service
 * Uses Gemini 2.5 Pro to analyze and draft a professional proposal document
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ProposalContent } from '@/types'

const apiKey = process.env.GOOGLE_GEMINI_API_KEY

if (!apiKey) {
  console.warn('GOOGLE_GEMINI_API_KEY not set. Document drafting will not work.')
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface DraftedDocument {
  executiveSummary: string
  projectScope: string[]
  timeline: Array<{
    period: string
    title: string
    description: string
  }>
  investment: Array<{
    name: string
    description: string
    amount: number
  }>
  deliverables: string[]
  technologyStack: {
    frontend: string
    backend: string
    infrastructure: string
  }
  termsAndConditions: string[]
}

export async function draftProposalDocument(
  proposal: {
    title: string
    client: string
    currency: string
    content: ProposalContent
  }
): Promise<DraftedDocument> {
  if (!genAI) {
    const error = new Error('Google Gemini API key not configured')
    console.error('❌ Gemini API key missing:', error)
    throw error
  }

  console.log('✅ Gemini API initialized, using model: gemini-2.5-pro')
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

  // Prepare the proposal content for analysis
  const proposalText = `
PROPOSAL TITLE: ${proposal.title}
CLIENT: ${proposal.client}
CURRENCY: ${proposal.currency}

EXECUTIVE SUMMARY:
${proposal.content.executiveSummary}

PROJECT SCOPE:
${proposal.content.projectScope.map((scope, idx) => `${idx + 1}. ${typeof scope === 'string' ? scope : (scope as any)?.title || String(scope)}`).join('\n')}

PROJECT TIMELINE:
${proposal.content.timeline.map(phase => `- ${phase.period}: ${phase.title}\n  ${phase.description}`).join('\n\n')}

INVESTMENT BREAKDOWN:
${proposal.content.investment.map(item => `- ${item.name}: ${proposal.currency} ${item.amount}\n  ${item.description}`).join('\n\n')}

DELIVERABLES:
${proposal.content.deliverables.map((d, idx) => `${idx + 1}. ${d}`).join('\n')}

TECHNOLOGY STACK:
- Frontend: ${proposal.content.technologyStack.frontend}
- Backend: ${proposal.content.technologyStack.backend}
- Infrastructure: ${proposal.content.technologyStack.infrastructure}

TERMS AND CONDITIONS:
${proposal.content.termsAndConditions.map((term, idx) => `${idx + 1}. ${term}`).join('\n')}
`

  const prompt = `You are a world-class business proposal writer with 20+ years of experience creating winning proposals for Fortune 500 companies. Your task is to COMPLETELY TRANSFORM this proposal into a highly professional, compelling, and polished business document that would impress C-level executives.

**CRITICAL: You MUST make SUBSTANTIAL improvements. Do NOT just rephrase slightly - completely rewrite and enhance every section to be significantly better.**

**YOUR MISSION:**
COMPLETELY TRANSFORM this proposal into a premium, executive-level document that:
1. **Executive Summary**: COMPLETELY REWRITE (do not just rephrase). Create a compelling, strategic, and value-focused summary. Start with a powerful opening that captures attention. Use persuasive language that highlights ROI, competitive advantages, and business impact. Make it 2-3 well-structured paragraphs that executives want to read. SIGNIFICANTLY expand and enhance - make it substantially longer and more detailed than the original.

2. **Project Scope**: COMPLETELY REWRITE each item (do not just rephrase). Make each item specific, measurable, and impactful. Use action-oriented language. Add substantial context about business value, ROI, and strategic importance. Make each item significantly more detailed - explain WHAT will be delivered, WHY it matters, HOW it creates value, and WHAT the business impact will be. Expand each item substantially.

3. **Timeline**: COMPLETELY REWRITE each phase (do not just rephrase). Make phase descriptions significantly more detailed, professional, and show clear progression. Each phase should extensively explain: WHAT will be done (detailed activities), WHY it matters (business value), HOW it contributes to success (strategic importance), WHO will be involved, WHAT deliverables will be produced, and WHAT success looks like. Use professional project management terminology. Make each phase description substantially longer and more comprehensive.

4. **Investment Breakdown**: COMPLETELY REWRITE descriptions (do not just rephrase). Make descriptions substantially more detailed to clearly explain the value proposition, ROI, and business benefits of each investment item. Explain what the client gets for their money in detail. Use professional financial language. Show the strategic value and long-term benefits. Make each description significantly longer and more compelling. Keep amounts EXACTLY as provided - do not change any numbers.

5. **Deliverables**: COMPLETELY REWRITE each deliverable (do not just rephrase). Make each deliverable specific, measurable, and valuable. Use professional terminology. Show the tangible outcomes, business value, and how each deliverable contributes to project success. Expand each deliverable description substantially - explain what it includes, why it matters, and how it will be used.

6. **Technology Stack**: COMPLETELY REWRITE each technology description (do not just rephrase). Significantly expand descriptions to show why these technologies were chosen, their benefits, competitive advantages, and how they support the solution. Make it sound strategic and well-thought-out, not just a list. Explain the technical advantages, scalability, security, and business value of each technology choice. Make each description substantially longer.

7. **Terms and Conditions**: COMPLETELY REWRITE each term (do not just rephrase). Make terms clear, professional, and protect both parties. Use standard business contract language. Make it comprehensive yet readable. Expand each term to be more detailed and specific. Add context where appropriate to make terms clearer and more professional.

**CRITICAL REQUIREMENTS - YOU MUST MAKE SUBSTANTIAL CHANGES:**
- DO NOT change ANY monetary amounts, numbers, dates, or technical specifications
- DO NOT add new features, items, or deliverables not in the original
- DO NOT remove any existing information
- DO COMPLETELY REWRITE (not just rephrase) - make substantial improvements to wording, clarity, and professional presentation
- DO SIGNIFICANTLY EXPAND descriptions with business value, ROI, strategic context, and detailed explanations
- DO improve flow, structure, and readability dramatically
- DO use executive-level business language throughout
- DO make it compelling and persuasive while remaining factual
- DO make each section SUBSTANTIALLY longer and more detailed than the original
- DO ensure the final document is significantly enhanced - if it looks too similar to the original, you haven't done enough

**OUTPUT FORMAT:**
Return ONLY valid JSON in this exact format (no markdown, no code blocks). Make each field significantly improved:

{
  "executiveSummary": "A compelling 2-3 paragraph executive summary that: (1) Opens with a powerful statement about the opportunity, (2) Clearly articulates the value proposition and ROI, (3) Highlights key differentiators and competitive advantages, (4) Ends with a call to action. Use executive-level language that resonates with decision-makers.",
  
  "projectScope": [
    "Each item should be: Specific, Measurable, Action-oriented, and Value-focused. Explain WHAT will be delivered, WHY it matters, and the BUSINESS IMPACT. Use professional terminology and show strategic thinking."
  ],
  
  "timeline": [
    {
      "period": "Keep exact period (e.g., 'Week 1-2')",
      "title": "Professional phase title using project management terminology",
      "description": "Detailed description explaining: (1) What activities will occur, (2) Key deliverables, (3) Success criteria, (4) How it contributes to overall project success. Make it comprehensive and professional."
    }
  ],
  
  "investment": [
    {
      "name": "Keep EXACT name from original",
      "description": "Enhanced description that: (1) Clearly explains the value proposition, (2) Details what the client receives, (3) Shows ROI or business benefit, (4) Uses professional financial language. Make it compelling.",
      "amount": EXACT_AMOUNT_FROM_ORIGINAL_DO_NOT_CHANGE
    }
  ],
  
  "deliverables": [
    "Each deliverable should be: Specific, Measurable, and Value-focused. Explain the tangible outcome and business benefit. Use professional terminology."
  ],
  
  "technologyStack": {
    "frontend": "Enhanced description explaining: (1) What technologies, (2) Why they were chosen, (3) Benefits and capabilities, (4) How they support the solution. Make it strategic.",
    "backend": "Enhanced description explaining: (1) What technologies, (2) Why they were chosen, (3) Benefits and capabilities, (4) How they support the solution. Make it strategic.",
    "infrastructure": "Enhanced description explaining: (1) What technologies, (2) Why they were chosen, (3) Benefits and capabilities, (4) How they support the solution. Make it strategic."
  },
  
  "termsAndConditions": [
    "Each term should be: Clear, Professional, Comprehensive, and Protect both parties. Use standard business contract language. Make it legally sound yet readable."
  ]
}

Original Proposal Content:
${proposalText}

Return ONLY the JSON object, nothing else.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()

    // Clean the response - remove markdown code blocks if present
    let cleanedText = text
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    // Parse JSON
    const drafted = JSON.parse(cleanedText) as DraftedDocument

    // Validate structure
    if (!drafted.executiveSummary || !Array.isArray(drafted.projectScope)) {
      throw new Error('Invalid document structure returned from AI')
    }

    // Ensure amounts are preserved exactly
    drafted.investment = drafted.investment.map((item, idx) => {
      const originalItem = proposal.content.investment[idx]
      return {
        ...item,
        amount: originalItem ? originalItem.amount : item.amount,
        name: originalItem ? originalItem.name : item.name,
      }
    })

    // Log comparison to verify substantial changes
    const execSummaryChange = Math.abs(drafted.executiveSummary.length - proposal.content.executiveSummary.length) / proposal.content.executiveSummary.length
    const scopeChange = Math.abs(drafted.projectScope.join(' ').length - proposal.content.projectScope.join(' ').length) / proposal.content.projectScope.join(' ').length
    
    console.log('✅ Document drafting completed!')
    console.log('📊 Content Comparison:', {
      executiveSummary: {
        original: proposal.content.executiveSummary.length,
        drafted: drafted.executiveSummary.length,
        change: `${(execSummaryChange * 100).toFixed(1)}%`,
      },
      projectScope: {
        originalTotalChars: proposal.content.projectScope.join(' ').length,
        draftedTotalChars: drafted.projectScope.join(' ').length,
        change: `${(scopeChange * 100).toFixed(1)}%`,
      },
    })
    
    if (execSummaryChange < 0.15) {
      console.warn('⚠️ WARNING: Executive summary change is minimal (<15%). AI may not have made substantial improvements.')
    } else {
      console.log('✅ Substantial changes detected in executive summary')
    }

    return drafted
  } catch (error) {
    console.error('❌ Document drafting error:', error)
    console.error('❌ Error type:', error?.constructor?.name)
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error))
    
    if (error instanceof SyntaxError) {
      console.error('❌ JSON parsing failed. Raw response might be logged above.')
      throw new Error(`Failed to parse AI response. The AI may have returned invalid JSON. Original error: ${error.message}`)
    }
    
    // Log more details about the error
    if (error instanceof Error && error.stack) {
      console.error('❌ Stack trace:', error.stack)
    }
    
    throw error
  }
}

