'use client'

import { useState, useEffect } from 'react'
import PagePreview from './PagePreview'
import SelectionToolbar from './SelectionToolbar'
import { ProcessedPage } from '@/types/pdf'
import { PDFRenderer } from '@/lib/pdf/renderer'
import { usePageSelection } from '@/hooks/usePageSelection'

export interface PreviewGridProps {
  pages: ProcessedPage[]
  onPageSelect?: (pageNumber: number) => void
  onSelectionChange?: (selectedPages: number[]) => void
  selectedPages?: number[]
  thumbnailSize?: number
  showToolbar?: boolean
}

export default function PreviewGrid({
  pages,
  onPageSelect,
  onSelectionChange,
  selectedPages: externalSelectedPages,
  thumbnailSize = 200,
  showToolbar = false,
}: PreviewGridProps) {
  const [thumbnails, setThumbnails] = useState<{ [key: number]: string }>({})
  const [loading, setLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)

  const [renderer, setRenderer] = useState<PDFRenderer | null>(null)

  // 선택 관리 (외부 selectedPages가 있으면 그것 사용, 없으면 내부 관리)
  const selection = usePageSelection(pages.length)
  const selectedPages = externalSelectedPages || selection.selectedPages

  // 선택 변경 시 부모에게 알림
  useEffect(() => {
    if (onSelectionChange && !externalSelectedPages) {
      onSelectionChange(selection.selectedPages)
    }
  }, [selection.selectedPages, onSelectionChange, externalSelectedPages])

  // 클라이언트 사이드에서만 렌더러 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRenderer(new PDFRenderer())
    }
  }, [])

  // 썸네일 생성
  useEffect(() => {
    if (!renderer) return
    if (pages.length === 0) return

    const generateThumbnails = async () => {
      setLoading(true)
      const newThumbnails: { [key: number]: string } = {}
      let successCount = 0

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        try {
          const thumbnail = await renderer.generateThumbnail(
            page.data,
            1, // 분할된 페이지는 항상 1페이지
            thumbnailSize
          )
          newThumbnails[page.pageNumber] = thumbnail
          successCount++
          setLoadProgress(((i + 1) / pages.length) * 100)
        } catch (error) {
          console.error(`Failed to generate thumbnail for page ${page.pageNumber}:`, error)
          // 에러가 발생해도 계속 진행
        }
      }

      setThumbnails(newThumbnails)
      setLoading(false)

      // 하나도 성공하지 못했으면 에러 알림
      if (successCount === 0 && pages.length > 0) {
        console.warn('Failed to generate any thumbnails. Falling back to placeholder.')
      }
    }

    // 약간의 지연을 두고 실행 (초기화 완료 보장)
    const timer = setTimeout(() => {
      generateThumbnails()
    }, 100)

    return () => clearTimeout(timer)
  }, [pages, renderer, thumbnailSize])

  // 페이지 클릭 핸들러 (키보드 수정자 지원)
  const handlePageClick = (pageNumber: number, event?: React.MouseEvent) => {
    if (externalSelectedPages) {
      // 외부에서 관리하는 경우
      onPageSelect?.(pageNumber)
    } else {
      // 내부에서 관리하는 경우
      selection.togglePage(
        pageNumber,
        event?.shiftKey || false,
        event?.ctrlKey || event?.metaKey || false
      )
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 선택 툴바 */}
      {showToolbar && !externalSelectedPages && (
        <SelectionToolbar
          selectedCount={selection.selectedCount}
          totalPages={pages.length}
          isAllSelected={selection.isAllSelected}
          onToggleAll={selection.toggleAll}
          onClearSelection={selection.clearSelection}
          onInvertSelection={selection.invertSelection}
          onSelectEven={selection.selectEven}
          onSelectOdd={selection.selectOdd}
          onSelectRange={selection.selectRange}
        />
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-sm text-gray-600">Generating thumbnails...</p>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(loadProgress)}%
            </p>
          </div>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 그리드 */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
          {pages.map((page) => (
            <div
              key={page.pageNumber}
              onClick={(e) => handlePageClick(page.pageNumber, e)}
            >
              <PagePreview
                pageData={page.data}
                pageNumber={page.pageNumber}
                thumbnail={thumbnails[page.pageNumber]}
                isSelected={selectedPages.includes(page.pageNumber)}
                onSelect={() => {}} // 클릭은 부모 div에서 처리
              />
            </div>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {!loading && pages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500">No pages to display</p>
        </div>
      )}
    </div>
  )
}