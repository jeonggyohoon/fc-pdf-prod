import { PDFDocument } from 'pdf-lib'
import { ProcessedPage } from '@/types/pdf'

export class PDFMerger {
  /**
   * 여러 ProcessedPage를 하나의 PDF로 병합
   */
  async mergePages(pages: ProcessedPage[]): Promise<Uint8Array> {
    try {
      const mergedPdf = await PDFDocument.create()

      for (const page of pages) {
        // 각 페이지의 PDF 문서 로드
        const pagePdf = await PDFDocument.load(page.data)
        const [copiedPage] = await mergedPdf.copyPages(pagePdf, [0])
        mergedPdf.addPage(copiedPage)
      }

      return await mergedPdf.save()
    } catch (error) {
      console.error('Error merging pages:', error)
      throw new Error('Failed to merge pages')
    }
  }

  /**
   * 특정 범위의 페이지만 병합
   */
  async mergeRange(
    allPages: ProcessedPage[],
    start: number,
    end: number
  ): Promise<Uint8Array> {
    const selectedPages = allPages.filter(
      (page) => page.pageNumber >= start && page.pageNumber <= end
    )
    return this.mergePages(selectedPages)
  }

  /**
   * 선택된 페이지 번호로 병합
   */
  async mergeSelected(
    allPages: ProcessedPage[],
    selectedPageNumbers: number[]
  ): Promise<Uint8Array> {
    const selectedPages = allPages.filter((page) =>
      selectedPageNumbers.includes(page.pageNumber)
    )
    return this.mergePages(selectedPages)
  }

  /**
   * 여러 PDF 파일을 하나로 병합
   */
  async mergeFiles(files: File[]): Promise<Uint8Array> {
    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const pageCount = pdf.getPageCount()

        for (let i = 0; i < pageCount; i++) {
          const [copiedPage] = await mergedPdf.copyPages(pdf, [i])
          mergedPdf.addPage(copiedPage)
        }
      }

      return await mergedPdf.save()
    } catch (error) {
      console.error('Error merging files:', error)
      throw new Error('Failed to merge PDF files')
    }
  }
}