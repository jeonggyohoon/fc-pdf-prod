'use client'

import { useState } from 'react'
import { ProcessedPage } from '@/types/pdf'
import { DownloadHelper } from '@/lib/utils/download'
import { PDFMerger } from '@/lib/pdf/merger'
import PreviewGrid from './PreviewGrid'
import { saveAs } from 'file-saver'

interface DownloadManagerProps {
  pages: ProcessedPage[]
  originalFileName: string
}

export default function DownloadManager({ pages, originalFileName }: DownloadManagerProps) {
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleSelectAll = () => {
    if (selectedPages.length === pages.length) {
      setSelectedPages([])
    } else {
      setSelectedPages(pages.map(page => page.pageNumber))
    }
  }

  const handlePageToggle = (pageNumber: number) => {
    setSelectedPages(prev =>
      prev.includes(pageNumber)
        ? prev.filter(p => p !== pageNumber)
        : [...prev, pageNumber]
    )
  }

  const handleDownloadSingle = async (page: ProcessedPage) => {
    setIsDownloading(true)
    try {
      DownloadHelper.downloadSingleFile(page.data, page.fileName)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadSelected = async () => {
    if (selectedPages.length === 0) {
      alert('Please select at least one page to download.')
      return
    }

    setIsDownloading(true)
    try {
      await DownloadHelper.downloadSelected(pages, selectedPages)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadAll = async () => {
    setIsDownloading(true)
    try {
      const zipFileName = DownloadHelper.generateZipFileName(originalFileName)
      await DownloadHelper.createZipFile(pages, zipFileName)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleMergeSelected = async () => {
    if (selectedPages.length === 0) {
      alert('Please select at least one page to merge.')
      return
    }

    setIsMerging(true)
    try {
      const merger = new PDFMerger()
      const mergedPdf = await merger.mergeSelected(pages, selectedPages)

      const baseName = originalFileName.replace(/\.pdf$/i, '')
      const fileName = `${baseName}_merged_${selectedPages.length}pages.pdf`
      const blob = new Blob([mergedPdf], { type: 'application/pdf' })
      saveAs(blob, fileName)
    } catch (error) {
      console.error('Merge failed:', error)
      alert('Merge failed. Please try again.')
    } finally {
      setIsMerging(false)
    }
  }

  const totalSize = pages.reduce((sum, page) => sum + page.size, 0)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Split Pages ({pages.length} pages)
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">
            Total: {DownloadHelper.formatFileSize(totalSize)}
          </div>
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <button
          onClick={handleSelectAll}
          className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
          disabled={isDownloading || isMerging}
        >
          {selectedPages.length === pages.length ? 'Deselect All' : 'Select All'}
        </button>

        <button
          onClick={handleDownloadSelected}
          disabled={selectedPages.length === 0 || isDownloading || isMerging}
          className="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download Selected ({selectedPages.length})
        </button>

        <button
          onClick={handleMergeSelected}
          disabled={selectedPages.length < 2 || isDownloading || isMerging}
          className="px-3 py-1 text-sm bg-purple-500 text-white hover:bg-purple-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Merge selected pages into one PDF"
        >
          {isMerging ? 'Merging...' : `Merge Selected (${selectedPages.length})`}
        </button>

        <button
          onClick={handleDownloadAll}
          disabled={isDownloading || isMerging}
          className="px-3 py-1 text-sm bg-green-500 text-white hover:bg-green-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download All as ZIP
        </button>
      </div>

      {/* Content - Grid or List View */}
      {viewMode === 'grid' ? (
        <PreviewGrid
          pages={pages}
          selectedPages={selectedPages}
          onPageSelect={handlePageToggle}
          showToolbar={true}
        />
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {pages.map((page) => (
            <div
              key={page.pageNumber}
              className={`
                flex items-center justify-between p-3 border rounded-lg transition-colors
                ${selectedPages.includes(page.pageNumber)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedPages.includes(page.pageNumber)}
                  onChange={() => handlePageToggle(page.pageNumber)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isDownloading}
                />

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Page {page.pageNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {DownloadHelper.formatFileSize(page.size)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDownloadSingle(page)}
                disabled={isDownloading}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}

      {isDownloading && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-blue-700">Preparing download...</span>
          </div>
        </div>
      )}
    </div>
  )
}