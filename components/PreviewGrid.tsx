'use client'

import { useState, useEffect } from 'react'
import PagePreview from './PagePreview'
import { ProcessedPage } from '@/types/pdf'
import { PDFRenderer } from '@/lib/pdf/renderer'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PreviewGridProps {
  pages: ProcessedPage[]
  thumbnailSize?: number
  itemsPerPage?: number
}

export default function PreviewGrid({
  pages,
  thumbnailSize = 300,
  itemsPerPage = 5,
}: PreviewGridProps) {
  const [thumbnails, setThumbnails] = useState<{ [key: number]: string }>({})
  const [loading, setLoading] = useState(true)
  const [renderer, setRenderer] = useState<PDFRenderer | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // 페이지 계산
  const totalPages = Math.ceil(pages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPages = pages.slice(startIndex, endIndex)

  // 클라이언트 사이드에서만 렌더러 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRenderer(new PDFRenderer())
    }
  }, [])

  // 썸네일 생성 (현재 페이지의 항목만)
  useEffect(() => {
    if (!renderer) return
    if (currentPages.length === 0) return

    const generateThumbnails = async () => {
      setLoading(true)

      for (let i = 0; i < currentPages.length; i++) {
        const page = currentPages[i]

        // 이미 생성된 썸네일은 스킵
        if (thumbnails[page.pageNumber]) {
          continue
        }

        try {
          const thumbnail = await renderer.generateThumbnail(
            page.data,
            1, // 분할된 페이지는 항상 1페이지
            thumbnailSize
          )
          setThumbnails(prev => ({
            ...prev,
            [page.pageNumber]: thumbnail
          }))
        } catch (error) {
          console.error(`Failed to generate thumbnail for page ${page.pageNumber}:`, error)
        }
      }

      setLoading(false)
    }

    const timer = setTimeout(() => {
      generateThumbnails()
    }, 100)

    return () => clearTimeout(timer)
  }, [currentPage, renderer, thumbnailSize, pages.length])

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No pages to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 페이지 정보 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, pages.length)} of {pages.length} pages
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm font-medium px-3">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
          <p className="text-muted-foreground">Generating thumbnails...</p>
        </div>
      )}

      {/* 그리드 - 5개씩 표시 */}
      {!loading && (
        <div className="grid grid-cols-5 gap-4">
          {currentPages.map((page) => (
            <PagePreview
              key={page.pageNumber}
              page={page}
              thumbnail={thumbnails[page.pageNumber]}
            />
          ))}
        </div>
      )}

      {/* 하단 페이지네이션 */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-center pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm font-medium px-3">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}