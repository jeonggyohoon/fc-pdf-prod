import { useState, useCallback, useEffect } from 'react'

export interface ProgressData {
  currentPage: number
  totalPages: number
  currentStep: 'idle' | 'loading' | 'processing' | 'generating' | 'complete'
  elapsedTime: number
  estimatedTimeRemaining: number
  processedSize: number
  totalSize: number
  speed: number // pages per second
}

export function useProgress(file?: File) {
  const [progress, setProgress] = useState<ProgressData>({
    currentPage: 0,
    totalPages: 0,
    currentStep: 'idle',
    elapsedTime: 0,
    estimatedTimeRemaining: 0,
    processedSize: 0,
    totalSize: file?.size || 0,
    speed: 0,
  })

  const [startTime, setStartTime] = useState<number | null>(null)
  const [processingHistory, setProcessingHistory] = useState<number[]>([])

  // 타이머 관리
  useEffect(() => {
    if (progress.currentStep === 'idle' || progress.currentStep === 'complete') {
      setStartTime(null)
      return
    }

    if (!startTime) {
      setStartTime(Date.now())
    }

    const interval = setInterval(() => {
      if (startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setProgress((prev) => ({
          ...prev,
          elapsedTime: elapsed,
        }))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [progress.currentStep, startTime])

  const updateProgress = useCallback((data: Partial<ProgressData>) => {
    setProgress((prev) => {
      const newProgress = { ...prev, ...data }

      // 처리 속도 계산
      if (data.currentPage && prev.currentPage !== data.currentPage) {
        setProcessingHistory((history) => {
          const newHistory = [...history, data.currentPage!]
          // 최근 5개 페이지 처리 시간만 유지
          return newHistory.slice(-5)
        })

        if (newProgress.elapsedTime > 0) {
          const speed = newProgress.currentPage / newProgress.elapsedTime
          newProgress.speed = speed

          // 예상 남은 시간 계산
          if (newProgress.totalPages > newProgress.currentPage) {
            const remainingPages = newProgress.totalPages - newProgress.currentPage
            newProgress.estimatedTimeRemaining = Math.ceil(remainingPages / speed)
          }
        }
      }

      // 처리 완료
      if (data.currentStep === 'complete') {
        newProgress.estimatedTimeRemaining = 0
        newProgress.currentPage = newProgress.totalPages
      }

      return newProgress
    })
  }, [])

  const reset = useCallback(() => {
    setProgress({
      currentPage: 0,
      totalPages: 0,
      currentStep: 'idle',
      elapsedTime: 0,
      estimatedTimeRemaining: 0,
      processedSize: 0,
      totalSize: file?.size || 0,
      speed: 0,
    })
    setStartTime(null)
    setProcessingHistory([])
  }, [file])

  const getProgressPercentage = useCallback(() => {
    if (progress.totalPages === 0) return 0
    return Math.round((progress.currentPage / progress.totalPages) * 100)
  }, [progress.currentPage, progress.totalPages])

  const formatTime = useCallback((seconds: number): string => {
    if (seconds === 0) return '0s'
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }, [])

  const getStepLabel = useCallback((): string => {
    switch (progress.currentStep) {
      case 'idle':
        return 'Ready'
      case 'loading':
        return 'Loading PDF...'
      case 'processing':
        return 'Splitting pages...'
      case 'generating':
        return 'Generating files...'
      case 'complete':
        return 'Complete!'
      default:
        return 'Processing...'
    }
  }, [progress.currentStep])

  return {
    progress,
    updateProgress,
    reset,
    getProgressPercentage,
    formatTime,
    getStepLabel,
  }
}