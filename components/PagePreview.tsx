'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProcessedPage } from '@/types/pdf'
import { Download, FileText, Loader2 } from 'lucide-react'
import { saveAs } from 'file-saver'

export interface PagePreviewProps {
  page: ProcessedPage
  thumbnail?: string
}

export default function PagePreview({ page, thumbnail }: PagePreviewProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = new Blob([page.data as any], { type: 'application/pdf' })
      saveAs(blob, page.fileName)
    } catch (error) {
      console.error('Error downloading page:', error)
      alert('Failed to download page')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="aspect-[3/4] bg-muted flex items-center justify-center relative">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={`Page ${page.pageNumber}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              <span className="text-xs text-muted-foreground">Loading...</span>
            </div>
          )}

          {/* Page Number Badge */}
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 shadow-md"
          >
            <FileText className="w-3 h-3 mr-1" />
            Page {page.pageNumber}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-2">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          size="sm"
          className="w-full"
          variant="outline"
        >
          <Download className="w-3 h-3 mr-2" />
          {downloading ? 'Downloading...' : 'Download'}
        </Button>
      </CardFooter>
    </Card>
  )
}