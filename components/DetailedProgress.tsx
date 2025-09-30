'use client'

import { ProgressData } from '@/hooks/useProgress'

interface DetailedProgressProps {
  progress: ProgressData
  formatTime: (seconds: number) => string
  getStepLabel: () => string
  getProgressPercentage: () => number
}

export default function DetailedProgress({
  progress,
  formatTime,
  getStepLabel,
  getProgressPercentage,
}: DetailedProgressProps) {
  const percentage = getProgressPercentage()
  const stepLabel = getStepLabel()

  const steps: Array<'loading' | 'processing' | 'generating' | 'complete'> = [
    'loading',
    'processing',
    'generating',
    'complete',
  ]

  const getStepStatus = (step: typeof steps[number]) => {
    const currentIndex = steps.indexOf(progress.currentStep as any)
    const stepIndex = steps.indexOf(step)

    if (currentIndex > stepIndex) return 'completed'
    if (currentIndex === stepIndex) return 'active'
    return 'pending'
  }

  const getStepIcon = (step: typeof steps[number]) => {
    const status = getStepStatus(step)

    if (status === 'completed') {
      return (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      )
    }

    if (status === 'active') {
      return (
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      )
    }

    return (
      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
    )
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Processing PDF</h3>
        <p className="text-sm text-gray-500">{stepLabel}</p>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span className="font-medium text-blue-600">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          >
            <div className="h-full w-full bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {[
          { key: 'loading', label: 'Loading PDF' },
          { key: 'processing', label: 'Splitting Pages' },
          { key: 'generating', label: 'Generating Files' },
          { key: 'complete', label: 'Complete' },
        ].map((step) => {
          const status = getStepStatus(step.key as any)
          return (
            <div key={step.key} className="flex items-center gap-3">
              {getStepIcon(step.key as any)}
              <span
                className={`text-sm ${
                  status === 'completed'
                    ? 'text-green-600 font-medium'
                    : status === 'active'
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Detailed Stats */}
      {progress.currentStep !== 'idle' && progress.totalPages > 0 && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Current Page</p>
            <p className="text-lg font-semibold text-gray-900">
              {progress.currentPage} / {progress.totalPages}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Elapsed Time</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatTime(progress.elapsedTime)}
            </p>
          </div>

          {progress.currentStep === 'processing' && progress.speed > 0 && (
            <>
              <div>
                <p className="text-xs text-gray-500 mb-1">Processing Speed</p>
                <p className="text-lg font-semibold text-gray-900">
                  {progress.speed.toFixed(1)} pages/s
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Time Remaining</p>
                <p className="text-lg font-semibold text-gray-900">
                  ~{formatTime(progress.estimatedTimeRemaining)}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* File Size Info */}
      {progress.totalSize > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total File Size</span>
            <span className="text-sm font-medium text-gray-900">
              {formatBytes(progress.totalSize)}
            </span>
          </div>
        </div>
      )}

      {/* Complete Message */}
      {progress.currentStep === 'complete' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <svg
            className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-green-900">
              Processing Complete!
            </p>
            <p className="text-xs text-green-700 mt-1">
              Successfully split {progress.totalPages} pages in {formatTime(progress.elapsedTime)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}