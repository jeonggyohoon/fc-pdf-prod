'use client'

import { PDFFile } from '@/app/page'

interface SimplePDFViewerProps {
  file: PDFFile | null
}

export default function SimplePDFViewer({ file }: SimplePDFViewerProps) {
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 text-lg">Select a PDF file to view</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-700">
            {file.originalName || file.filename.replace(/^\d+-\d+-/, '')}
          </h3>
        </div>
      </div>

      <div className="flex-1">
        <iframe
          src={file.url}
          className="w-full h-full border-0"
          title="PDF Viewer"
        />
      </div>
    </div>
  )
}