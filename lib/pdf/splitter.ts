import { PDFDocument } from 'pdf-lib'
import { ProcessedPage } from '@/types/pdf'

export class PDFSplitter {
  private onProgress?: (progress: number, currentPage: number, totalPages: number) => void

  constructor(onProgress?: (progress: number, currentPage: number, totalPages: number) => void) {
    this.onProgress = onProgress
  }

  async loadPDF(file: File): Promise<PDFDocument> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      return pdfDoc
    } catch (error) {
      console.error('Error loading PDF:', error)
      throw new Error('Failed to load PDF file. Please ensure it is a valid PDF.')
    }
  }

  async splitPages(pdfDoc: PDFDocument, originalFileName: string): Promise<ProcessedPage[]> {
    const pageCount = pdfDoc.getPageCount()
    const pages: ProcessedPage[] = []

    for (let i = 0; i < pageCount; i++) {
      const progress = ((i + 1) / pageCount) * 100
      this.onProgress?.(progress, i + 1, pageCount)

      try {
        const newPdf = await PDFDocument.create()
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i])
        newPdf.addPage(copiedPage)

        const pdfBytes = await newPdf.save()
        const fileName = this.generateFileName(originalFileName, i + 1)

        pages.push({
          pageNumber: i + 1,
          data: pdfBytes,
          fileName,
          size: pdfBytes.length
        })
      } catch (error) {
        console.error(`Error processing page ${i + 1}:`, error)
        throw new Error(`Failed to process page ${i + 1}`)
      }
    }

    return pages
  }

  private generateFileName(originalFileName: string, pageNumber: number): string {
    const baseName = originalFileName.replace(/\.pdf$/i, '')
    return `${baseName}_page_${pageNumber.toString().padStart(3, '0')}.pdf`
  }

  async createSinglePagePDF(pdfDoc: PDFDocument, pageIndex: number): Promise<Uint8Array> {
    const newPdf = await PDFDocument.create()
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex])
    newPdf.addPage(copiedPage)
    return await newPdf.save()
  }
}