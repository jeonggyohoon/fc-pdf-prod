'use client'

import { useState, useEffect } from 'react'
import { PDFSplitter } from '@/lib/pdf/splitter'
import { PDFValidator } from '@/lib/pdf/validator'
import { ProcessedPage, PDFProcessorState } from '@/types/pdf'

interface PDFProcessorProps {
  file: File | null
  onProcessComplete: (pages: ProcessedPage[]) => void
  onError: (error: string) => void
  onStateChange?: (state: PDFProcessorState) => void
}

export default function PDFProcessor({
  file,
  onProcessComplete,
  onError,
  onStateChange
}: PDFProcessorProps) {
  const [state, setState] = useState<PDFProcessorState>({
    status: 'idle',
    currentPage: 0,
    totalPages: 0,
    progress: 0
  })

  useEffect(() => {
    onStateChange?.(state)
  }, [state, onStateChange])

  useEffect(() => {
    if (!file) {
      setState({
        status: 'idle',
        currentPage: 0,
        totalPages: 0,
        progress: 0
      })
      return
    }

    processFile(file)
  }, [file])

  const processFile = async (file: File) => {
    try {
      // Update state to loading
      setState(prev => ({ ...prev, status: 'loading', progress: 0 }))

      // Validate PDF file
      const validation = await PDFValidator.validatePDF(file)
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid PDF file')
      }

      // Initialize splitter with progress callback
      const splitter = new PDFSplitter((progress, currentPage, totalPages) => {
        setState(prev => ({
          ...prev,
          status: 'processing',
          progress,
          currentPage,
          totalPages
        }))
      })

      // Load and split PDF
      setState(prev => ({ ...prev, status: 'processing' }))
      const pdfDoc = await splitter.loadPDF(file)
      const pages = await splitter.splitPages(pdfDoc, file.name)

      // Complete processing
      setState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        pages
      }))

      onProcessComplete(pages)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
      }))
      onError(errorMessage)
    }
  }

  // This component doesn't render anything visible
  // It's a processing component that manages state
  return null
}