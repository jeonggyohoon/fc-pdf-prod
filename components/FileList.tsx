'use client'

import { PDFFile } from '@/app/page'

interface FileListProps {
  files: PDFFile[]
  selectedFile: PDFFile | null
  onSelect: (file: PDFFile) => void
  onDelete: (filename: string) => void
  onSplit?: (file: PDFFile) => void
}

export default function FileList({ files, selectedFile, onSelect, onDelete, onSplit }: FileListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (files.length === 0) {
    return (
      <p className="text-gray-400 text-center text-sm">No files uploaded</p>
    )
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.filename}
          onClick={() => onSelect(file)}
          className={`
            p-3 rounded-lg cursor-pointer transition-all border group
            ${selectedFile?.filename === file.filename
              ? 'bg-blue-500 text-white border-blue-600'
              : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 18h12V6a2 2 0 00-2-2h-4L8 2H4a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                <p className="text-sm font-medium truncate">
                  {file.originalName || file.filename.replace(/^\d+-\d+-/, '')}
                </p>
              </div>

              <div className={`text-xs space-y-1 ${
                selectedFile?.filename === file.filename
                  ? 'text-blue-100'
                  : 'text-gray-500'
              }`}>
                <p>{formatFileSize(file.size)}</p>
                {file.uploadedAt && (
                  <p>{formatDate(file.uploadedAt)}</p>
                )}
              </div>
            </div>

            <div className="flex gap-1">
              {onSplit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSplit(file)
                  }}
                  className={`
                    px-2 py-1 text-xs rounded transition-all opacity-0 group-hover:opacity-100
                    ${selectedFile?.filename === file.filename
                      ? 'bg-blue-600 hover:bg-blue-700 text-white opacity-100'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }
                  `}
                >
                  Split
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(file.filename)
                }}
                className={`
                  px-2 py-1 text-xs rounded transition-all opacity-0 group-hover:opacity-100
                  ${selectedFile?.filename === file.filename
                    ? 'bg-red-600 hover:bg-red-700 text-white opacity-100'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                  }
                `}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}