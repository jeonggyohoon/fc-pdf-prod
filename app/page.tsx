'use client'

import { useState } from 'react'
import { ProcessedPage, PDFProcessorState } from '@/types/pdf'
import DragDropUpload from '@/components/DragDropUpload'
import PDFProcessor from '@/components/PDFProcessor'
import ProcessingView from '@/components/ProcessingView'
import ResultView from '@/components/ResultView'
import ThemeToggle from '@/components/ThemeToggle'

type AppState = 'idle' | 'processing' | 'complete'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [processedPages, setProcessedPages] = useState<ProcessedPage[]>([])
  const [processingState, setProcessingState] = useState<PDFProcessorState>({
    status: 'idle',
    currentPage: 0,
    totalPages: 0,
    progress: 0
  })

  const handleFileUpload = (file: File) => {
    setCurrentFile(file)
    setAppState('processing')
  }

  const handleProcessComplete = (pages: ProcessedPage[]) => {
    setProcessedPages(pages)
    setAppState('complete')
  }

  const handleProcessError = (error: string) => {
    alert(`Processing failed: ${error}`)
    handleReset()
  }

  const handleReset = () => {
    setAppState('idle')
    setCurrentFile(null)
    setProcessedPages([])
    setProcessingState({
      status: 'idle',
      currentPage: 0,
      totalPages: 0,
      progress: 0
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <ThemeToggle />

      {/* Idle State: Drag & Drop */}
      {appState === 'idle' && (
        <DragDropUpload onUpload={handleFileUpload} />
      )}

      {/* Processing State: Progress */}
      {appState === 'processing' && (
        <ProcessingView state={processingState} fileName={currentFile?.name || ''} />
      )}

      {/* Complete State: Grid with Download Buttons */}
      {appState === 'complete' && (
        <ResultView
          pages={processedPages}
          originalFileName={currentFile?.name || 'document.pdf'}
          onReset={handleReset}
        />
      )}

      {/* Hidden PDF Processor */}
      {appState === 'processing' && currentFile && (
        <PDFProcessor
          file={currentFile}
          onProcessComplete={handleProcessComplete}
          onError={handleProcessError}
          onStateChange={setProcessingState}
        />
      )}
    </div>
  )
}