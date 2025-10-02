'use client'

import { useState } from 'react'
import { ProcessedPage } from '@/types/pdf'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import PreviewGrid from '@/components/PreviewGrid'
import { CheckCircle2, Download, RotateCcw } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface ResultViewProps {
  pages: ProcessedPage[]
  originalFileName: string
  onReset: () => void
}

export default function ResultView({ pages, originalFileName, onReset }: ResultViewProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownloadAll = async () => {
    setDownloading(true)
    try {
      const zip = new JSZip()

      pages.forEach((page) => {
        zip.file(page.fileName, page.data)
      })

      const content = await zip.generateAsync({ type: 'blob' })
      const baseName = originalFileName.replace(/\.pdf$/i, '')
      saveAs(content, `${baseName}_split.zip`)
    } catch (error) {
      console.error('Error creating ZIP:', error)
      alert('Failed to download files')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="h-screen overflow-auto p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Successfully split {pages.length} page{pages.length > 1 ? 's' : ''}!
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">Split Pages</h2>
              <p className="text-muted-foreground text-sm truncate max-w-md">
                {originalFileName}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadAll}
                disabled={downloading}
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloading ? 'Creating ZIP...' : 'Download All (ZIP)'}
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Split Another
              </Button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <PreviewGrid pages={pages} />
      </div>
    </div>
  )
}