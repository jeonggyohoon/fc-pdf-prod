'use client'

import { useState, useEffect } from 'react'

export interface PagePreviewProps {
  pageData: Uint8Array
  pageNumber: number
  thumbnail?: string
  isSelected?: boolean
  onSelect?: () => void
  onLoad?: () => void
}

export default function PagePreview({
  pageData,
  pageNumber,
  thumbnail,
  isSelected = false,
  onSelect,
  onLoad,
}: PagePreviewProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(thumbnail || null)
  const [loading, setLoading] = useState(!thumbnail)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (thumbnail) {
      setImageUrl(thumbnail)
      setLoading(false)
      onLoad?.()
      return
    }

    // 썸네일이 없으면 PDF에서 직접 렌더링
    const loadThumbnail = async () => {
      try {
        setLoading(true)
        // 여기서는 PDFRenderer를 사용하지 않고 props로 받은 데이터 사용
        // 실제 렌더링은 부모 컴포넌트에서 처리
        setLoading(false)
        onLoad?.()
      } catch (err) {
        console.error('Error loading thumbnail:', err)
        setError(true)
        setLoading(false)
      }
    }

    loadThumbnail()
  }, [thumbnail, pageData, pageNumber, onLoad])

  return (
    <div
      className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all ${
        isSelected
          ? 'ring-4 ring-blue-500 shadow-lg scale-105'
          : 'ring-1 ring-gray-200 hover:ring-2 hover:ring-blue-300 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      {/* 썸네일 이미지 */}
      <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
        {loading && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-xs text-gray-500">Loading...</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs text-red-500">Failed to load</span>
          </div>
        )}

        {!loading && !error && imageUrl && (
          <img
            src={imageUrl}
            alt={`Page ${pageNumber}`}
            className="w-full h-full object-contain"
          />
        )}

        {!loading && !error && !imageUrl && (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <svg
              className="w-12 h-12 text-gray-300"
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
            <span className="text-xs text-gray-400">PDF Page</span>
          </div>
        )}
      </div>

      {/* 페이지 번호 */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-2 py-1 text-center text-sm font-medium transition-colors ${
          isSelected
            ? 'bg-blue-500 text-white'
            : 'bg-white/90 text-gray-700 group-hover:bg-blue-50'
        }`}
      >
        Page {pageNumber}
      </div>

      {/* 선택 체크박스 */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* 호버 오버레이 */}
      {!isSelected && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
      )}
    </div>
  )
}