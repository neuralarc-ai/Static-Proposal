import jsPDF from 'jspdf'

export interface PDFPage {
  width: number
  height: number
  margin: number
  contentWidth: number
}

export interface PDFTextOptions {
  fontSize?: number
  font?: 'helvetica' | 'times' | 'courier'
  fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic'
  color?: [number, number, number]
  align?: 'left' | 'center' | 'right' | 'justify'
  maxWidth?: number
}

export interface PDFLineOptions {
  color?: [number, number, number]
  width?: number
}

export class PDFGenerator {
  private pdf: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private contentWidth: number
  private yPosition: number
  private pageCount: number

  constructor(orientation: 'p' | 'l' = 'p', unit: 'mm' | 'pt' | 'px' | 'in' = 'mm', format: 'a4' | 'letter' = 'a4') {
    this.pdf = new jsPDF(orientation, unit, format)
    this.pageWidth = this.pdf.internal.pageSize.getWidth()
    this.pageHeight = this.pdf.internal.pageSize.getHeight()
    this.margin = 25
    this.contentWidth = this.pageWidth - 2 * this.margin
    this.yPosition = this.margin
    this.pageCount = 1
  }

  /**
   * Check if a page break is needed and add a new page if necessary
   */
  checkPageBreak(requiredHeight: number): boolean {
    if (this.yPosition + requiredHeight > this.pageHeight - this.margin) {
      this.pdf.addPage()
      this.pageCount++
      this.yPosition = this.margin
      // Add watermark to new page automatically
      this.addWatermark('CONFIDENTIAL', { fontSize: 72, color: [220, 220, 220], angle: 45 })
      return true
    }
    return false
  }

  /**
   * Add a watermark to the current page
   */
  addWatermark(text: string = 'CONFIDENTIAL', options?: { fontSize?: number; color?: [number, number, number]; angle?: number }) {
    const fontSize = options?.fontSize || 72
    const color = options?.color || [220, 220, 220]
    const angle = options?.angle || 45

    this.pdf.setTextColor(color[0], color[1], color[2])
    this.pdf.setFontSize(fontSize)
    this.pdf.setFont('helvetica', 'bold')
    
    const centerX = this.pageWidth / 2
    const centerY = this.pageHeight / 2
    
    try {
      this.pdf.text(text, centerX, centerY, {
        angle,
        align: 'center',
        baseline: 'middle',
      } as any)
    } catch (e) {
      // Fallback without rotation
      const textWidth = this.pdf.getTextWidth(text)
      this.pdf.text(text, centerX - textWidth / 2, centerY, { align: 'left' })
    }
  }

  /**
   * Add text with automatic wrapping and formatting
   * If y is provided, uses that position; otherwise uses current yPosition
   * Returns the final Y position after the text
   */
  addText(text: string, x?: number, y?: number, options?: PDFTextOptions): number {
    const fontSize = options?.fontSize || 11
    const font = options?.font || 'helvetica'
    const fontStyle = options?.fontStyle || 'normal'
    const color = options?.color || [0, 0, 0]
    const align = options?.align || 'left'
    const maxWidth = options?.maxWidth || this.contentWidth
    
    const xPos = x !== undefined ? x : this.margin
    let yPos = y !== undefined ? y : this.yPosition

    this.pdf.setFontSize(fontSize)
    this.pdf.setFont(font, fontStyle)
    this.pdf.setTextColor(color[0], color[1], color[2])

    const lines = this.pdf.splitTextToSize(text, maxWidth)
    lines.forEach((line: string) => {
      this.pdf.text(line, xPos, yPos, { align })
      yPos += fontSize * 0.4 // Approximate line height
    })

    // If y was not provided, update yPosition
    if (y === undefined) {
      this.yPosition = yPos
    }

    return yPos
  }

  /**
   * Add a heading with underline
   */
  addHeading(text: string, level: 1 | 2 | 3 = 1, underlineColor?: [number, number, number]): void {
    const fontSize = level === 1 ? 18 : level === 2 ? 14 : 12
    const spacing = level === 1 ? 8 : 6

    this.checkPageBreak(20)
    
    this.pdf.setFontSize(fontSize)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.text(text, this.margin, this.yPosition)
    this.yPosition += spacing

    if (underlineColor) {
      this.pdf.setDrawColor(underlineColor[0], underlineColor[1], underlineColor[2])
      this.pdf.setLineWidth(1)
      this.pdf.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition)
      this.yPosition += 4
    }
    
    this.yPosition += 8
  }

  /**
   * Add a horizontal line
   */
  addLine(options?: PDFLineOptions): void {
    const color = options?.color || [200, 200, 200]
    const width = options?.width || 0.5

    this.pdf.setDrawColor(color[0], color[1], color[2])
    this.pdf.setLineWidth(width)
    this.pdf.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition)
    this.yPosition += 8
  }

  /**
   * Add a section with title and content
   */
  addSection(title: string, content: string, options?: { titleSize?: number; contentSize?: number }): void {
    const titleSize = options?.titleSize || 18
    const contentSize = options?.contentSize || 11

    this.checkPageBreak(25)
    
    // Title
    this.pdf.setFontSize(titleSize)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.text(title, this.margin, this.yPosition)
    this.yPosition += 8

    // Underline
    this.pdf.setDrawColor(0, 100, 200)
    this.pdf.setLineWidth(1)
    this.pdf.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition)
    this.yPosition += 12

    // Content
    this.pdf.setFontSize(contentSize)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.setTextColor(60, 60, 60)
    const contentLines = this.pdf.splitTextToSize(content, this.contentWidth)
    contentLines.forEach((line: string) => {
      this.checkPageBreak(8)
      this.pdf.text(line, this.margin, this.yPosition)
      this.yPosition += 7
    })
    this.yPosition += 10
  }

  /**
   * Add a list item with checkmark
   */
  addListItem(text: string, description?: string, options?: { fontSize?: number; spacing?: number }): void {
    const fontSize = options?.fontSize || 11
    const spacing = options?.spacing || 6

    this.checkPageBreak(20)

    // Checkmark
    this.pdf.setFontSize(12)
    this.pdf.setTextColor(0, 150, 100)
    this.pdf.text('✓', this.margin, this.yPosition)

    // Item text
    this.pdf.setFontSize(fontSize)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.text(text, this.margin + 6, this.yPosition)
    this.yPosition += 7

    // Description if provided
    if (description) {
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.setTextColor(80, 80, 80)
      const descLines = this.pdf.splitTextToSize(description, this.contentWidth - 12)
      descLines.forEach((line: string) => {
        this.checkPageBreak(spacing)
        this.pdf.text(line, this.margin + 6, this.yPosition)
        this.yPosition += spacing
      })
      this.pdf.setTextColor(60, 60, 60)
    }
    this.yPosition += spacing
  }

  /**
   * Add a box/container with background
   */
  addBox(x: number, y: number, width: number, height: number, options?: { color?: [number, number, number]; radius?: number }): void {
    const color = options?.color || [248, 249, 250]
    const radius = options?.radius || 2

    this.pdf.setFillColor(color[0], color[1], color[2])
    this.pdf.roundedRect(x, y, width, height, radius, radius, 'F')
  }

  /**
   * Add spacing
   */
  addSpacing(amount: number): void {
    this.yPosition += amount
  }

  /**
   * Get current Y position
   */
  getYPosition(): number {
    return this.yPosition
  }

  /**
   * Set Y position
   */
  setYPosition(y: number): void {
    this.yPosition = y
  }

  /**
   * Get page info
   */
  getPageInfo(): PDFPage {
    return {
      width: this.pageWidth,
      height: this.pageHeight,
      margin: this.margin,
      contentWidth: this.contentWidth,
    }
  }

  /**
   * Get PDF instance for advanced operations
   */
  getPDF(): jsPDF {
    return this.pdf
  }

  /**
   * Get total page count
   */
  getPageCount(): number {
    return this.pageCount
  }

  /**
   * Set current page
   */
  setPage(pageNumber: number): void {
    this.pdf.setPage(pageNumber)
  }

  /**
   * Save the PDF
   */
  save(filename: string): void {
    this.pdf.save(filename)
  }

  /**
   * Get PDF as blob/data URL
   */
  getBlob(): Blob {
    return this.pdf.output('blob')
  }

  /**
   * Get PDF as data URL
   */
  getDataURL(): string {
    return this.pdf.output('dataurlstring')
  }
}

