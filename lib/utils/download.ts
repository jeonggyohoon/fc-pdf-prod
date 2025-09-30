import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { ProcessedPage } from '@/types/pdf'

export class DownloadHelper {
  static downloadSingleFile(data: Uint8Array, fileName: string): void {
    const blob = new Blob([data], { type: 'application/pdf' })
    saveAs(blob, fileName)
  }

  static async createZipFile(pages: ProcessedPage[], zipFileName: string): Promise<void> {
    const zip = new JSZip()

    // Add each page to the zip
    pages.forEach(page => {
      zip.file(page.fileName, page.data)
    })

    try {
      // Generate the zip file
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      })

      // Download the zip file
      saveAs(zipBlob, zipFileName)
    } catch (error) {
      console.error('Error creating ZIP file:', error)
      throw new Error('Failed to create ZIP file')
    }
  }

  static generateZipFileName(originalFileName: string): string {
    const baseName = originalFileName.replace(/\.pdf$/i, '')
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    return `${baseName}_split_${timestamp}.zip`
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  static async downloadSelected(pages: ProcessedPage[], selectedPageNumbers: number[]): Promise<void> {
    const selectedPages = pages.filter(page => selectedPageNumbers.includes(page.pageNumber))

    if (selectedPages.length === 0) {
      throw new Error('No pages selected for download')
    }

    if (selectedPages.length === 1) {
      // Download single file
      const page = selectedPages[0]
      this.downloadSingleFile(page.data, page.fileName)
    } else {
      // Create ZIP with selected pages
      const zipFileName = `selected_pages_${selectedPageNumbers.join('-')}.zip`
      await this.createZipFile(selectedPages, zipFileName)
    }
  }
}