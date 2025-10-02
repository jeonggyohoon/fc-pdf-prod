'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PDFProcessorState } from '@/types/pdf'
import { FileText, Loader2 } from 'lucide-react'

interface ProcessingViewProps {
  state: PDFProcessorState
  fileName: string
}

export default function ProcessingView({ state, fileName }: ProcessingViewProps) {
  const getStatusText = () => {
    switch (state.status) {
      case 'loading':
        return 'Loading PDF file...'
      case 'processing':
        return `Splitting page ${state.currentPage} of ${state.totalPages}`
      default:
        return 'Processing...'
    }
  }

  return (
    <div className="h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <FileText className="w-12 h-12 text-muted-foreground" />
              <Loader2 className="w-6 h-6 text-primary absolute -right-2 -bottom-2 animate-spin" />
            </div>
          </div>
          <CardTitle>Splitting PDF</CardTitle>
          <CardDescription className="truncate">{fileName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{getStatusText()}</span>
              <span className="font-medium">{Math.round(state.progress)}%</span>
            </div>
            <Progress value={state.progress} className="h-2" />
          </div>

          {state.totalPages > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              {state.currentPage} / {state.totalPages} pages
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}