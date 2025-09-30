export interface ProcessedPage {
  pageNumber: number
  data: Uint8Array
  fileName: string
  size: number
}

export interface PDFProcessorState {
  status: 'idle' | 'loading' | 'processing' | 'complete' | 'error'
  currentPage: number
  totalPages: number
  progress: number
  error?: string
  pages?: ProcessedPage[]
}

export interface DownloadOptions {
  format: 'individual' | 'zip'
  prefix?: string
  includePageNumbers?: boolean
}