'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { PDFFile } from '@/app/page'

// PDF.js를 동적으로 import하여 클라이언트에서만 로드
const loadPdfjs = async () => {
  try {
    const pdfjsLib = await import('pdfjs-dist')
    // worker 설정을 더 안정적으로 변경
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
    console.log('PDF.js loaded, version:', pdfjsLib.version)
    return pdfjsLib
  } catch (error) {
    console.error('Failed to import pdfjs-dist:', error)
    throw error
  }
}

interface PDFViewerProps {
  file: PDFFile | null
}

export default function PDFViewer({ file }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.0)
  const [rendering, setRendering] = useState(false)
  const [pdfjsLib, setPdfjsLib] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // PDF.js 라이브러리 로드
  useEffect(() => {
    loadPdfjs()
      .then(setPdfjsLib)
      .catch((err) => {
        console.error('Failed to load PDF.js:', err)
        setError('Failed to load PDF.js library')
      })
  }, [])

  useEffect(() => {
    if (!file || !pdfjsLib) {
      setPdfDoc(null)
      setCurrentPage(1)
      setTotalPages(0)
      setError(null)
      return
    }

    const loadPDF = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log('Loading PDF from:', file.url)
        const loadingTask = pdfjsLib.getDocument(file.url)
        const pdf = await loadingTask.promise
        console.log('PDF loaded successfully, pages:', pdf.numPages)
        setPdfDoc(pdf)
        setTotalPages(pdf.numPages)
        setCurrentPage(1)
      } catch (error) {
        console.error('Error loading PDF:', error)
        setError(`Failed to load PDF: ${error}`)
      } finally {
        setLoading(false)
      }
    }

    loadPDF()
  }, [file, pdfjsLib])

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return

    const renderPage = async () => {
      setRendering(true)
      try {
        const page = await pdfDoc.getPage(currentPage)
        const viewport = page.getViewport({ scale })

        const canvas = canvasRef.current!
        const context = canvas.getContext('2d')!

        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        await page.render(renderContext).promise
      } catch (error) {
        console.error('Error rendering page:', error)
      }
      setRendering(false)
    }

    renderPage()
  }, [pdfDoc, currentPage, scale])

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(3.0, prev * 1.2))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev / 1.2))
  }

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 text-lg">Select a PDF file to view</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  if (loading || !pdfjsLib) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading PDF...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>

          <div className="border-l pl-4 ml-2">
            <button
              onClick={zoomOut}
              className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              -
            </button>
            <span className="mx-2 text-sm">{Math.round(scale * 100)}%</span>
            <button
              onClick={zoomIn}
              className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-start justify-center p-8 bg-gray-100">
        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <p className="text-blue-500">Loading...</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="shadow-lg bg-white"
        />
      </div>
    </div>
  )
}