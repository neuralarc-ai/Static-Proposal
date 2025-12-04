import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface GeneratePDFOptions {
  element: HTMLElement
  filename: string
  title: string
}

export async function generateProposalPDF({ element, filename, title }: GeneratePDFOptions): Promise<void> {
  try {
    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // Calculate PDF dimensions (A4 size in mm)
    const pdfWidth = 210 // A4 width in mm
    const pdfHeight = (imgHeight * pdfWidth) / imgWidth
    const pageHeight = 297 // A4 height in mm

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    let heightLeft = pdfHeight
    let position = 0

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
    heightLeft -= pageHeight

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pageHeight
    }

    // Add CONFIDENTIAL watermark to all pages
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      
      // Get page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Set watermark properties
      pdf.setTextColor(200, 200, 200) // Light gray
      pdf.setFontSize(60)
      pdf.setFont('helvetica', 'bold')
      
      // Calculate center position
      const centerX = pageWidth / 2
      const centerY = pageHeight / 2
      
      // Save current graphics state
      pdf.saveGraphicsState()
      
      // Set opacity for watermark (if supported)
      try {
        if (pdf.setGState) {
          pdf.setGState(pdf.GState({ opacity: 0.3 }))
        }
      } catch (e) {
        // GState might not be available, continue without opacity
      }
      
      // Rotate and draw watermark text
      // jsPDF rotate works in radians, 45 degrees = PI/4
      const angle = (45 * Math.PI) / 180
      
      // Translate to center, rotate, then draw text
      pdf.translate(centerX, centerY)
      pdf.rotate(angle)
      pdf.text('CONFIDENTIAL', 0, 0, {
        align: 'center',
        baseline: 'middle',
      })
      
      // Restore graphics state
      pdf.restoreGraphicsState()
    }

    // Save PDF
    pdf.save(filename)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}

