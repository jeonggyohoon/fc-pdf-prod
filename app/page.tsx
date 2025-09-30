'use client'

import { useState, useEffect } from 'react'
import SimplePDFViewer from '@/components/SimplePDFViewer'
import FileList from '@/components/FileList'
import DragDropUpload from '@/components/DragDropUpload'
import PDFProcessor from '@/components/PDFProcessor'
import ProcessingStatus from '@/components/ProcessingStatus'
import DownloadManager from '@/components/DownloadManager'
import ThemeToggle from '@/components/ThemeToggle'
import { ProcessedPage, PDFProcessorState } from '@/types/pdf'

export interface PDFFile {
  filename: string
  originalName?: string
  url: string
  size: number
  uploadedAt?: string | Date
}

export default function Home() {
  const [files, setFiles] = useState<PDFFile[]>([])
  const [selectedFile, setSelectedFile] = useState<PDFFile | null>(null)
  const [uploading, setUploading] = useState(false)

  // PDF Processing states
  const [currentProcessingFile, setCurrentProcessingFile] = useState<File | null>(null)
  const [processingState, setProcessingState] = useState<PDFProcessorState>({
    status: 'idle',
    currentPage: 0,
    totalPages: 0,
    progress: 0
  })
  const [processedPages, setProcessedPages] = useState<ProcessedPage[]>([])
  const [showSplitView, setShowSplitView] = useState(false)

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files')
      const data = await response.json()
      setFiles(data.files)
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const handleUpload = async (file: File) => {
    if (uploading) return

    setUploading(true)
    const formData = new FormData()
    formData.append('pdf', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      await loadFiles() // 파일 목록 새로고침
      setSelectedFile(data.file) // 업로드된 파일 자동 선택

      // Start PDF processing
      setCurrentProcessingFile(file)
      setShowSplitView(true)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Delete failed')

      loadFiles()
      if (selectedFile?.filename === filename) {
        setSelectedFile(null)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete file')
    }
  }

  const handleProcessComplete = (pages: ProcessedPage[]) => {
    setProcessedPages(pages)
  }

  const handleProcessError = (error: string) => {
    alert(`Processing failed: ${error}`)
    setShowSplitView(false)
    setCurrentProcessingFile(null)
  }

  const handleBackToUpload = () => {
    setShowSplitView(false)
    setCurrentProcessingFile(null)
    setProcessedPages([])
    setProcessingState({
      status: 'idle',
      currentPage: 0,
      totalPages: 0,
      progress: 0
    })
  }

  const handleSplitAnother = (file: PDFFile) => {
    // Create a File object from the uploaded file
    fetch(file.url)
      .then(response => response.blob())
      .then(blob => {
        const fileObj = new File([blob], file.originalName || file.filename, {
          type: 'application/pdf'
        })
        setCurrentProcessingFile(fileObj)
        setSelectedFile(file)
        setShowSplitView(true)
      })
      .catch(error => {
        console.error('Error loading file for splitting:', error)
        alert('Failed to load file for splitting')
      })
  }

  if (showSplitView) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <header className="bg-slate-800 dark:bg-slate-900 text-white p-4 border-b border-slate-700 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToUpload}
              className="px-3 py-1 bg-slate-700 dark:bg-slate-800 hover:bg-slate-600 dark:hover:bg-slate-700 rounded text-sm transition-colors"
            >
              ← Back to Upload
            </button>
            <h1 className="text-xl font-bold">PDF Page Splitter</h1>
            <div className="w-20" /> {/* Spacer for center alignment */}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <aside className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <ProcessingStatus state={processingState} />

            {processingState.status === 'complete' && processedPages.length > 0 && (
              <DownloadManager
                pages={processedPages}
                originalFileName={currentProcessingFile?.name || 'document.pdf'}
              />
            )}
          </aside>

          <main className="flex-1 bg-gray-50 dark:bg-gray-900">
            {selectedFile ? (
              <SimplePDFViewer file={selectedFile} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg">Processing PDF...</p>
              </div>
            )}
          </main>
        </div>

        {/* Hidden PDF Processor */}
        <PDFProcessor
          file={currentProcessingFile}
          onProcessComplete={handleProcessComplete}
          onError={handleProcessError}
          onStateChange={setProcessingState}
        />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-slate-800 dark:bg-slate-900 text-white p-4 border-b border-slate-700 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">PDF Page Splitter</h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
                Upload PDF
              </h2>
              <DragDropUpload onUpload={handleUpload} uploading={uploading} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
                PDF Files ({files.length})
              </h2>
              <FileList
                files={files}
                selectedFile={selectedFile}
                onSelect={setSelectedFile}
                onDelete={handleDelete}
                onSplit={handleSplitAnother}
              />
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <SimplePDFViewer file={selectedFile} />
        </main>
      </div>
    </div>
  )
}