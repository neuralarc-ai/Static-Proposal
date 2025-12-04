import type { ProposalContent } from '@/types'
import { PDFGenerator } from '@/lib/utils/pdf'
import { draftProposalDocument } from '@/lib/ai/document-draft'

interface GeneratePDFOptions {
  proposal: {
    id: string
    title: string
    client: string
    createdAt: string
    currency: string
    content: ProposalContent
  }
  filename: string
  useAIDrafting?: boolean // Optional flag to enable AI document drafting
  returnBlob?: boolean // If true, return blob instead of saving
}

// Helper function to format currency
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount)
}

export async function generateProposalPDF({ proposal, filename, useAIDrafting = true, returnBlob = false }: GeneratePDFOptions): Promise<Blob | void> {
  try {
    console.log('PDF Generator v2.0 - Using new PDFGenerator utility')
    
    // Step 1: Analyze and draft the document using Gemini 2.5 Pro
    let finalContent = proposal.content
    if (useAIDrafting) {
      try {
        console.log('🚀 Starting AI document analysis and drafting with Gemini 2.5 Pro...')
        console.log('📄 Original content summary:', {
          executiveSummaryLength: proposal.content.executiveSummary?.length || 0,
          projectScopeItems: proposal.content.projectScope?.length || 0,
          timelinePhases: proposal.content.timeline?.length || 0,
          investmentItems: proposal.content.investment?.length || 0,
        })
        
        const draftedDocument = await draftProposalDocument({
          title: proposal.title,
          client: proposal.client,
          currency: proposal.currency,
          content: proposal.content,
        })
        
        console.log('✅ AI document drafting completed successfully!')
        console.log('📊 Drafted content summary:', {
          executiveSummaryLength: draftedDocument.executiveSummary?.length || 0,
          projectScopeItems: draftedDocument.projectScope?.length || 0,
          timelinePhases: draftedDocument.timeline?.length || 0,
          investmentItems: draftedDocument.investment?.length || 0,
        })
        
        finalContent = draftedDocument
      } catch (draftError) {
        console.error('❌ AI document drafting failed:', draftError)
        console.error('❌ Error details:', {
          message: draftError instanceof Error ? draftError.message : String(draftError),
          stack: draftError instanceof Error ? draftError.stack : undefined,
        })
        
        // Check if it's an API key issue
        if (draftError instanceof Error && draftError.message.includes('API key')) {
          console.error('🚨 CRITICAL: Gemini API key is missing or invalid!')
          console.error('🚨 Please check your GOOGLE_GEMINI_API_KEY environment variable')
        }
        
        console.warn('⚠️ Falling back to original content (PDF will use unenhanced content)')
        // Always log in detail so we can see what went wrong
        console.error('🚨 AI DRAFTING FAILED - PDF will use original content')
        console.error('🚨 This means the PDF will NOT be enhanced by AI')
        console.error('🚨 Check server logs above for the actual error')
        
        finalContent = proposal.content
      }
    } else {
      console.log('ℹ️ AI drafting disabled, using original content')
    }
    
    const pdf = new PDFGenerator('p', 'mm', 'a4')
    const pageInfo = pdf.getPageInfo()

    // Add watermark to first page
    pdf.addWatermark('CONFIDENTIAL', { fontSize: 72, color: [220, 220, 220], angle: 45 })

    // Header Section
    pdf.getPDF().setFillColor(250, 250, 250)
    pdf.getPDF().rect(0, 0, pageInfo.width, 50, 'F')
    
    // Logo area - using fixed position for header
    pdf.getPDF().setFontSize(18)
    pdf.getPDF().setFont('helvetica', 'bold')
    pdf.getPDF().setTextColor(0, 0, 0)
    pdf.getPDF().text('Neural Arc', pageInfo.margin, 20)
    
    // Proposal info on right - using fixed positions for header
    pdf.getPDF().setFontSize(9)
    pdf.getPDF().setFont('helvetica', 'normal')
    pdf.getPDF().setTextColor(100, 100, 100)
    pdf.getPDF().text('Proposal Date:', pageInfo.width - pageInfo.margin - 45, 15, { align: 'right' })
    pdf.getPDF().setFont('helvetica', 'bold')
    pdf.getPDF().setTextColor(0, 0, 0)
    pdf.getPDF().text(new Date(proposal.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), pageInfo.width - pageInfo.margin, 15, { align: 'right' })
    
    pdf.getPDF().setFont('helvetica', 'normal')
    pdf.getPDF().setTextColor(100, 100, 100)
    pdf.getPDF().text('Proposal ID:', pageInfo.width - pageInfo.margin - 45, 22, { align: 'right' })
    pdf.getPDF().setFont('helvetica', 'bold')
    pdf.getPDF().setTextColor(0, 0, 0)
    pdf.getPDF().text(`PROP-${proposal.id.slice(-6).toUpperCase()}`, pageInfo.width - pageInfo.margin, 22, { align: 'right' })
    
    // Divider line
    pdf.getPDF().setDrawColor(200, 200, 200)
    pdf.getPDF().setLineWidth(0.5)
    pdf.getPDF().line(pageInfo.margin, 55, pageInfo.width - pageInfo.margin, 55)
    
    pdf.setYPosition(70)

    // Title
    pdf.getPDF().setFontSize(28)
    pdf.getPDF().setFont('helvetica', 'bold')
    pdf.getPDF().setTextColor(0, 0, 0)
    const titleLines = pdf.getPDF().splitTextToSize(proposal.title, pageInfo.contentWidth)
    titleLines.forEach((line: string) => {
      pdf.checkPageBreak(12)
      pdf.getPDF().text(line, pageInfo.margin, pdf.getYPosition())
      pdf.setYPosition(pdf.getYPosition() + 10)
    })
    pdf.addSpacing(15)

    // Executive Summary
    pdf.addHeading('Executive Summary', 1, [0, 100, 200])
    pdf.getPDF().setFontSize(11)
    pdf.getPDF().setFont('helvetica', 'normal')
    pdf.getPDF().setTextColor(60, 60, 60)
    const summaryLines = pdf.getPDF().splitTextToSize(finalContent.executiveSummary, pageInfo.contentWidth)
    summaryLines.forEach((line: string) => {
      pdf.checkPageBreak(8)
      pdf.getPDF().text(line, pageInfo.margin, pdf.getYPosition())
      pdf.setYPosition(pdf.getYPosition() + 7)
    })
    pdf.addSpacing(15)

    // Project Scope
    pdf.addHeading('Project Scope', 1, [0, 100, 200])
    
    // Core Features subsection
    pdf.addHeading('Core Features', 2)
    
    finalContent.projectScope.forEach((scope) => {
      const scopeText = typeof scope === 'string' ? scope : (scope as any)?.title || String(scope)
      const scopeDesc = typeof scope === 'object' && scope !== null && 'description' in scope ? (scope as any).description : ''
      
      pdf.addListItem(scopeText, scopeDesc, { fontSize: 11, spacing: 6 })
    })
    pdf.addSpacing(10)

    // Project Timeline
    pdf.addHeading('Project Timeline', 1, [0, 100, 200])
    
    pdf.getPDF().setFontSize(11)
    pdf.getPDF().setFont('helvetica', 'normal')
    finalContent.timeline.forEach((phase) => {
      pdf.checkPageBreak(25)
      
      // Left border with accent color
      pdf.getPDF().setDrawColor(0, 100, 200)
      pdf.getPDF().setLineWidth(3)
      pdf.getPDF().line(pageInfo.margin, pdf.getYPosition() - 8, pageInfo.margin, pdf.getYPosition() + 18)
      pdf.getPDF().setLineWidth(0.5)
      
      // Period in accent color
      pdf.getPDF().setFont('helvetica', 'bold')
      pdf.getPDF().setTextColor(0, 100, 200)
      pdf.getPDF().setFontSize(12)
      pdf.getPDF().text(phase.period, pageInfo.margin + 6, pdf.getYPosition())
      pdf.setYPosition(pdf.getYPosition() + 7)
      
      // Phase title
      pdf.getPDF().setFont('helvetica', 'bold')
      pdf.getPDF().setTextColor(0, 0, 0)
      pdf.getPDF().setFontSize(11)
      pdf.getPDF().text(phase.title, pageInfo.margin + 6, pdf.getYPosition())
      pdf.setYPosition(pdf.getYPosition() + 6)
      
      // Phase description
      pdf.getPDF().setFont('helvetica', 'normal')
      pdf.getPDF().setTextColor(80, 80, 80)
      const descLines = pdf.getPDF().splitTextToSize(phase.description, pageInfo.contentWidth - 12)
      descLines.forEach((line: string) => {
        pdf.checkPageBreak(6)
        pdf.getPDF().text(line, pageInfo.margin + 6, pdf.getYPosition())
        pdf.setYPosition(pdf.getYPosition() + 6)
      })
      pdf.getPDF().setTextColor(60, 60, 60)
      pdf.addSpacing(10)
    })
    pdf.addSpacing(10)

    // Investment Breakdown
    pdf.addHeading('Investment Breakdown', 1, [0, 100, 200])
    
    pdf.getPDF().setFontSize(11)
    pdf.getPDF().setFont('helvetica', 'normal')
    
    let subtotal = 0
    finalContent.investment.forEach((item) => {
      pdf.checkPageBreak(30)
      
      // Item container
      pdf.addBox(pageInfo.margin, pdf.getYPosition() - 6, pageInfo.contentWidth, 24, {
        color: [248, 249, 250],
        radius: 2,
      })
      
      // Item name
      pdf.getPDF().setFont('helvetica', 'bold')
      pdf.getPDF().setTextColor(0, 0, 0)
      pdf.getPDF().setFontSize(11)
      const nameLines = pdf.getPDF().splitTextToSize(item.name, pageInfo.contentWidth - 80)
      nameLines.forEach((line: string, lineIndex: number) => {
        pdf.getPDF().text(line, pageInfo.margin + 5, pdf.getYPosition() + (lineIndex * 6))
      })
      
      // Amount on the right
      const amount = formatCurrency(item.amount, proposal.currency)
      pdf.getPDF().text(amount, pageInfo.width - pageInfo.margin - 5, pdf.getYPosition(), { align: 'right' })
      
      pdf.setYPosition(pdf.getYPosition() + 7)
      
      // Item description
      pdf.getPDF().setFont('helvetica', 'normal')
      pdf.getPDF().setFontSize(10)
      pdf.getPDF().setTextColor(100, 100, 100)
      const descLines = pdf.getPDF().splitTextToSize(item.description, pageInfo.contentWidth - 85)
      descLines.forEach((line: string) => {
        pdf.getPDF().text(line, pageInfo.margin + 5, pdf.getYPosition())
        pdf.setYPosition(pdf.getYPosition() + 5)
      })
      pdf.getPDF().setFontSize(11)
      pdf.getPDF().setTextColor(60, 60, 60)
      
      subtotal += item.amount
      pdf.addSpacing(8)
    })

    // Totals section
    pdf.checkPageBreak(25)
    pdf.addLine({ color: [200, 200, 200], width: 1 })
    pdf.setYPosition(pdf.getYPosition() - 8) // Adjust for line spacing

    pdf.getPDF().setFont('helvetica', 'bold')
    pdf.getPDF().setFontSize(11)
    pdf.getPDF().setTextColor(0, 0, 0)
    pdf.getPDF().text('Subtotal:', pageInfo.width - pageInfo.margin - 70, pdf.getYPosition(), { align: 'right' })
    pdf.getPDF().text(formatCurrency(subtotal, proposal.currency), pageInfo.width - pageInfo.margin, pdf.getYPosition(), { align: 'right' })
    pdf.setYPosition(pdf.getYPosition() + 7)

    pdf.getPDF().setFont('helvetica', 'normal')
    pdf.getPDF().setTextColor(100, 100, 100)
    pdf.getPDF().text('Tax:', pageInfo.width - pageInfo.margin - 70, pdf.getYPosition(), { align: 'right' })
    pdf.getPDF().text(formatCurrency(0, proposal.currency), pageInfo.width - pageInfo.margin, pdf.getYPosition(), { align: 'right' })
    pdf.addSpacing(10)

    pdf.addLine({ color: [200, 200, 200], width: 1.5 })
    pdf.setYPosition(pdf.getYPosition() - 8) // Adjust for line spacing

    pdf.getPDF().setFontSize(16)
    pdf.getPDF().setFont('helvetica', 'bold')
    pdf.getPDF().setTextColor(0, 0, 0)
    pdf.getPDF().text('Total:', pageInfo.width - pageInfo.margin - 70, pdf.getYPosition(), { align: 'right' })
    pdf.getPDF().text(formatCurrency(subtotal, proposal.currency), pageInfo.width - pageInfo.margin, pdf.getYPosition(), { align: 'right' })
    pdf.addSpacing(20)

    // Deliverables
    pdf.addHeading('Deliverables', 1, [0, 100, 200])
    
    pdf.getPDF().setFontSize(11)
    pdf.getPDF().setFont('helvetica', 'normal')
    pdf.getPDF().setTextColor(60, 60, 60)
    
    const deliverablesPerRow = 2
    const colWidth = (pageInfo.contentWidth - 10) / deliverablesPerRow
    let currentRow = 0
    let startY = pdf.getYPosition()
    
    finalContent.deliverables.forEach((deliverable, index) => {
      if (index > 0 && index % deliverablesPerRow === 0) {
        pdf.setYPosition(startY + 18)
        startY = pdf.getYPosition()
        currentRow = 0
      }
      
      pdf.checkPageBreak(20)
      
      const xPos = pageInfo.margin + 5 + (currentRow * (colWidth + 10))
      
      // Deliverable box
      pdf.addBox(xPos, pdf.getYPosition() - 5, colWidth, 15, {
        color: [248, 249, 250],
        radius: 2,
      })
      
      // Checkmark
      pdf.getPDF().setFontSize(11)
      pdf.getPDF().setTextColor(0, 150, 100)
      pdf.getPDF().text('✓', xPos + 3, pdf.getYPosition() + 2)
      
      // Deliverable text
      pdf.getPDF().setFont('helvetica', 'normal')
      pdf.getPDF().setFontSize(10)
      pdf.getPDF().setTextColor(0, 0, 0)
      const deliverableLines = pdf.getPDF().splitTextToSize(deliverable, colWidth - 10)
      deliverableLines.forEach((line: string, lineIndex: number) => {
        pdf.getPDF().text(line, xPos + 6, pdf.getYPosition() + 2 + (lineIndex * 5))
      })
      
      currentRow++
    })
    
    pdf.setYPosition(startY + 25)

    // Technology Stack
    pdf.addHeading('Technology Stack', 1, [0, 100, 200])
    
    const stackWidth = (pageInfo.contentWidth - 10) / 3
    const stackItems = [
      { title: 'Frontend', content: finalContent.technologyStack.frontend },
      { title: 'Backend', content: finalContent.technologyStack.backend },
      { title: 'Infrastructure', content: finalContent.technologyStack.infrastructure },
    ]

    stackItems.forEach((item, index) => {
      const xPos = pageInfo.margin + 5 + (index * (stackWidth + 5))
      pdf.checkPageBreak(25)
      
      // Stack box
      pdf.addBox(xPos, pdf.getYPosition() - 5, stackWidth, 25, {
        color: [248, 249, 250],
        radius: 2,
      })
      
      // Title
      pdf.getPDF().setFont('helvetica', 'bold')
      pdf.getPDF().setFontSize(11)
      pdf.getPDF().setTextColor(0, 0, 0)
      pdf.getPDF().text(item.title, xPos + 4, pdf.getYPosition() + 3)
      
      // Content
      pdf.getPDF().setFont('helvetica', 'normal')
      pdf.getPDF().setFontSize(9)
      pdf.getPDF().setTextColor(80, 80, 80)
      const contentLines = pdf.getPDF().splitTextToSize(item.content, stackWidth - 8)
      let lineY = pdf.getYPosition() + 8
      contentLines.forEach((line: string) => {
        pdf.getPDF().text(line, xPos + 4, lineY)
        lineY += 4.5
      })
    })
    
    pdf.addSpacing(30)

    // Terms and Conditions
    pdf.addHeading('Terms and Conditions', 1, [0, 100, 200])
    
    pdf.getPDF().setFontSize(11)
    pdf.getPDF().setFont('helvetica', 'normal')
    pdf.getPDF().setTextColor(60, 60, 60)
    
    finalContent.termsAndConditions.forEach((term) => {
      pdf.checkPageBreak(12)
      
      // Checkmark
      pdf.getPDF().setFontSize(11)
      pdf.getPDF().setTextColor(0, 150, 100)
      pdf.getPDF().text('✓', pageInfo.margin, pdf.getYPosition())
      
      // Term text
      pdf.getPDF().setFont('helvetica', 'normal')
      pdf.getPDF().setFontSize(10)
      pdf.getPDF().setTextColor(0, 0, 0)
      const termLines = pdf.getPDF().splitTextToSize(term, pageInfo.contentWidth - 8)
      termLines.forEach((line: string, lineIndex: number) => {
        pdf.getPDF().text(line, pageInfo.margin + 5, pdf.getYPosition() + (lineIndex * 6))
      })
      pdf.setYPosition(pdf.getYPosition() + termLines.length * 6 + 4)
    })
    pdf.addSpacing(15)

    // Company Addresses Footer
    pdf.checkPageBreak(40)
    pdf.addLine({ color: [200, 200, 200], width: 0.5 })
    pdf.setYPosition(pdf.getYPosition() - 8) // Adjust for line spacing

    pdf.getPDF().setFontSize(12)
    pdf.getPDF().setFont('helvetica', 'bold')
    pdf.getPDF().setTextColor(0, 0, 0)
    pdf.getPDF().text('Neural Arc', pageInfo.margin, pdf.getYPosition())
    pdf.addSpacing(8)

    pdf.getPDF().setFontSize(9)
    pdf.getPDF().setFont('helvetica', 'normal')
    pdf.getPDF().setTextColor(80, 80, 80)
    
    // India Address
    pdf.getPDF().setFont('helvetica', 'bold')
    pdf.getPDF().text('India Office:', pageInfo.margin, pdf.getYPosition())
    pdf.setYPosition(pdf.getYPosition() + 5)
    pdf.getPDF().setFont('helvetica', 'normal')
    const indiaAddress = '3rd Floor, Trimurti HoneyGold, Range Hill Rd, Sinchan Nagar, Ashok Nagar, Pune, Maharashtra 411016'
    const indiaAddressLines = pdf.getPDF().splitTextToSize(indiaAddress, pageInfo.contentWidth / 2 - 10)
    indiaAddressLines.forEach((line: string) => {
      pdf.getPDF().text(line, pageInfo.margin, pdf.getYPosition())
      pdf.setYPosition(pdf.getYPosition() + 4)
    })
    
    // US Address
    pdf.setYPosition(pdf.getYPosition() - indiaAddressLines.length * 4)
    pdf.getPDF().setFont('helvetica', 'bold')
    pdf.getPDF().text('United States Office:', pageInfo.width / 2 + 5, pdf.getYPosition())
    pdf.setYPosition(pdf.getYPosition() + 5)
    pdf.getPDF().setFont('helvetica', 'normal')
    const usAddress = '300 Creek View Road, Suite 209, Newark, Delaware 19711'
    const usAddressLines = pdf.getPDF().splitTextToSize(usAddress, pageInfo.contentWidth / 2 - 10)
    usAddressLines.forEach((line: string, lineIndex: number) => {
      pdf.getPDF().text(line, pageInfo.width / 2 + 5, pdf.getYPosition() + (lineIndex * 4))
    })

    // Add watermark to all pages (in case any were missed)
    const totalPages = pdf.getPageCount()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.addWatermark('CONFIDENTIAL', { fontSize: 72, color: [220, 220, 220], angle: 45 })
    }

    // Save PDF or return blob
    console.log(`PDF generated successfully with ${totalPages} page(s)`)
    if (returnBlob) {
      return pdf.getBlob()
    } else {
      pdf.save(filename)
    }
  } catch (error) {
    console.error('Error generating PDF:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to generate PDF: ${errorMessage}`)
  }
}
