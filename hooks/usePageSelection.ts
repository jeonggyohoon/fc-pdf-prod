import { useState, useCallback } from 'react'

export interface PageSelectionOptions {
  allowMultiple?: boolean
  allowRange?: boolean
}

export function usePageSelection(
  totalPages: number,
  options: PageSelectionOptions = {}
) {
  const { allowMultiple = true, allowRange = true } = options
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [lastSelected, setLastSelected] = useState<number | null>(null)

  // 단일 페이지 토글
  const togglePage = useCallback(
    (pageNumber: number, shiftKey = false, ctrlKey = false) => {
      setSelectedPages((prev) => {
        // Shift + 클릭: 범위 선택
        if (shiftKey && allowRange && lastSelected !== null) {
          const start = Math.min(lastSelected, pageNumber)
          const end = Math.max(lastSelected, pageNumber)
          const range = Array.from({ length: end - start + 1 }, (_, i) => start + i)

          // 기존 선택과 병합
          const newSelection = [...new Set([...prev, ...range])].sort((a, b) => a - b)
          return newSelection
        }

        // Ctrl + 클릭: 다중 선택 토글
        if (ctrlKey && allowMultiple) {
          const isSelected = prev.includes(pageNumber)
          setLastSelected(pageNumber)

          if (isSelected) {
            return prev.filter((p) => p !== pageNumber)
          } else {
            return [...prev, pageNumber].sort((a, b) => a - b)
          }
        }

        // 일반 클릭: 단일 선택
        setLastSelected(pageNumber)
        if (prev.includes(pageNumber) && prev.length === 1) {
          return [] // 이미 선택된 유일한 페이지를 클릭하면 해제
        }
        return [pageNumber]
      })
    },
    [lastSelected, allowMultiple, allowRange]
  )

  // 전체 선택/해제
  const toggleAll = useCallback(() => {
    setSelectedPages((prev) => {
      if (prev.length === totalPages) {
        return []
      } else {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
      }
    })
  }, [totalPages])

  // 범위 선택 (문자열 파싱: "1-5, 8, 10-15")
  const selectRange = useCallback(
    (rangeString: string) => {
      try {
        const pages = new Set<number>()
        const parts = rangeString.split(',').map((s) => s.trim())

        for (const part of parts) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map((n) => parseInt(n.trim(), 10))
            if (isNaN(start) || isNaN(end)) continue

            const from = Math.max(1, Math.min(start, end))
            const to = Math.min(totalPages, Math.max(start, end))

            for (let i = from; i <= to; i++) {
              pages.add(i)
            }
          } else {
            const pageNum = parseInt(part, 10)
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
              pages.add(pageNum)
            }
          }
        }

        setSelectedPages(Array.from(pages).sort((a, b) => a - b))
        return true
      } catch (error) {
        console.error('Invalid range string:', error)
        return false
      }
    },
    [totalPages]
  )

  // 선택 해제
  const clearSelection = useCallback(() => {
    setSelectedPages([])
    setLastSelected(null)
  }, [])

  // 선택 반전
  const invertSelection = useCallback(() => {
    const allPages = Array.from({ length: totalPages }, (_, i) => i + 1)
    setSelectedPages((prev) => allPages.filter((p) => !prev.includes(p)))
  }, [totalPages])

  // 짝수/홀수 선택
  const selectEven = useCallback(() => {
    setSelectedPages(
      Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p % 2 === 0)
    )
  }, [totalPages])

  const selectOdd = useCallback(() => {
    setSelectedPages(
      Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p % 2 === 1)
    )
  }, [totalPages])

  return {
    selectedPages,
    setSelectedPages,
    togglePage,
    toggleAll,
    selectRange,
    clearSelection,
    invertSelection,
    selectEven,
    selectOdd,
    isAllSelected: selectedPages.length === totalPages && totalPages > 0,
    selectedCount: selectedPages.length,
  }
}