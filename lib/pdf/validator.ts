export class PDFValidator {
  static readonly MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
  static readonly ALLOWED_TYPES = ['application/pdf']
  static readonly PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46] // %PDF

  static validateFileType(file: File): boolean {
    return this.ALLOWED_TYPES.includes(file.type)
  }

  static validateFileSize(file: File, maxSize: number = this.MAX_FILE_SIZE): boolean {
    return file.size <= maxSize
  }

  static async isPDFFile(file: File): Promise<boolean> {
    try {
      // Check MIME type first
      if (!this.validateFileType(file)) {
        return false
      }

      // Check magic bytes
      const arrayBuffer = await file.slice(0, 4).arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)

      return this.PDF_MAGIC_BYTES.every((byte, index) => bytes[index] === byte)
    } catch (error) {
      console.error('Error validating PDF file:', error)
      return false
    }
  }

  static async validatePDF(file: File): Promise<{ isValid: boolean; error?: string }> {
    // Check file size
    if (!this.validateFileSize(file)) {
      return {
        isValid: false,
        error: `File size exceeds ${Math.round(this.MAX_FILE_SIZE / 1024 / 1024)}MB limit`
      }
    }

    // Check file type
    if (!this.validateFileType(file)) {
      return {
        isValid: false,
        error: 'Only PDF files are allowed'
      }
    }

    // Check if it's actually a PDF
    const isPdf = await this.isPDFFile(file)
    if (!isPdf) {
      return {
        isValid: false,
        error: 'File does not appear to be a valid PDF'
      }
    }

    return { isValid: true }
  }
}