'use client'

import { useState } from 'react'

export interface SelectionToolbarProps {
  selectedCount: number
  totalPages: number
  isAllSelected: boolean
  onToggleAll: () => void
  onClearSelection: () => void
  onInvertSelection: () => void
  onSelectEven: () => void
  onSelectOdd: () => void
  onSelectRange: (range: string) => boolean
}

export default function SelectionToolbar({
  selectedCount,
  totalPages,
  isAllSelected,
  onToggleAll,
  onClearSelection,
  onInvertSelection,
  onSelectEven,
  onSelectOdd,
  onSelectRange,
}: SelectionToolbarProps) {
  const [rangeInput, setRangeInput] = useState('')
  const [rangeError, setRangeError] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const success = onSelectRange(rangeInput)
    if (success) {
      setRangeError(false)
      setRangeInput('')
    } else {
      setRangeError(true)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
      {/* 선택 정보 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {selectedCount}
          </span>{' '}
          / {totalPages} pages selected
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          {showAdvanced ? '△ Simple' : '▽ Advanced'}
        </button>
      </div>

      {/* 기본 버튼 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onToggleAll}
          className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        >
          {isAllSelected ? 'Deselect All' : 'Select All'}
        </button>

        {selectedCount > 0 && (
          <button
            onClick={onClearSelection}
            className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
          >
            Clear
          </button>
        )}

        <button
          onClick={onInvertSelection}
          className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
        >
          Invert
        </button>
      </div>

      {/* 고급 옵션 */}
      {showAdvanced && (
        <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* 짝수/홀수 선택 */}
          <div className="flex gap-2">
            <button
              onClick={onSelectOdd}
              className="flex-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              Odd Pages (1, 3, 5...)
            </button>
            <button
              onClick={onSelectEven}
              className="flex-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              Even Pages (2, 4, 6...)
            </button>
          </div>

          {/* 범위 입력 */}
          <form onSubmit={handleRangeSubmit} className="space-y-2">
            <label className="block text-xs text-gray-600 dark:text-gray-400">
              Range Selection (e.g., 1-5, 8, 10-15)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => {
                  setRangeInput(e.target.value)
                  setRangeError(false)
                }}
                placeholder="1-5, 8, 10-15"
                className={`flex-1 px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 transition-colors ${
                  rangeError
                    ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
              >
                Apply
              </button>
            </div>
            {rangeError && (
              <p className="text-xs text-red-500 dark:text-red-400">
                Invalid range format. Use format like: 1-5, 8, 10-15
              </p>
            )}
          </form>

          {/* 도움말 */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p className="font-medium">Keyboard Shortcuts:</p>
            <ul className="space-y-0.5 pl-4">
              <li>• <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Shift</kbd> + Click: Select range</li>
              <li>• <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl</kbd> + Click: Toggle selection</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}