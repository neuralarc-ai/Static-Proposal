/**
 * Text Rephrasing API Endpoint
 * POST /api/text/rephrase
 * 
 * Rephrases text for better clarity using Google Gemini 2.5 Pro
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'

// Mark route as dynamic to prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const rephraseSchema = z.object({
  text: z.string().min(1, 'Text is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = rephraseSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { success: false, error: firstError?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { text } = validation.data

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

    const prompt = `Enhance and expand the following project description. Add more detail and clarity while keeping the original meaning and all the user's points. Make it more comprehensive and professional, but don't change the core message.

Original text:
${text}

Return ONLY the elaborated text, nothing else. Do not add any explanations, comments, or markdown formatting. Just return the expanded version.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const rephrasedText = response.text().trim()

    // Clean the response - remove markdown code blocks if present
    let cleanedText = rephrasedText
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '')
    }

    return NextResponse.json({
      success: true,
      rephrasedText: cleanedText.trim(),
    })
  } catch (error) {
    console.error('Rephrase text error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to rephrase text. Please try again.' 
      },
      { status: 500 }
    )
  }
}

