'use client'

import { PDFProcessorState } from '@/types/pdf'

interface ProcessingStatusProps {
  state: PDFProcessorState
}

export default function ProcessingStatus({ state }: ProcessingStatusProps) {
  if (state.status === 'idle') {
    return null
  }

  const getStatusText = () => {
    switch (state.status) {
      case 'loading':
        return 'Loading PDF file...'
      case 'processing':
        return `Processing page ${state.currentPage} of ${state.totalPages}...`
      case 'complete':
        return `Successfully split ${state.totalPages} pages!`
      case 'error':
        return `Error: ${state.error}`
      default:
        return ''
    }
  }

  const getStatusColor = () => {
    switch (state.status) {
      case 'loading':
      case 'processing':
        return 'text-blue-600'
      case 'complete':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Processing Status</h3>
        {(state.status === 'loading' || state.status === 'processing') && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        )}
      </div>

      <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>

      {(state.status === 'loading' || state.status === 'processing') && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(state.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {state.status === 'complete' && state.pages && (
        <div className="mt-3 text-xs text-gray-600">
          Total size: {(state.pages.reduce((sum, page) => sum + page.size, 0) / 1024 / 1024).toFixed(2)} MB
        </div>
      )}
    </div>
  )
}