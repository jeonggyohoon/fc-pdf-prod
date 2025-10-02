'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { SplineScene } from '@/components/ui/splite'
import { Spotlight } from '@/components/ui/spotlight'
import { Upload } from 'lucide-react'

interface DragDropUploadProps {
  onUpload: (file: File) => void
}

export default function DragDropUpload({ onUpload }: DragDropUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(file => file.type === 'application/pdf')

    if (pdfFile) {
      onUpload(pdfFile)
    } else {
      alert('Please upload a PDF file only')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="h-screen flex items-center justify-center p-8 relative overflow-hidden">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            PDF Page Splitter
          </h1>
          <p className="text-muted-foreground text-lg">
            Drop your PDF on the robot to split it into individual pages
          </p>
        </div>

        <div className="relative h-[600px]">
          <Spotlight className="top-0 left-0" size={300} />

          {/* 3D Robot Scene with Drop Zone */}
          <div
            className={`h-full cursor-pointer transition-all ${
              isDragOver ? 'scale-110' : 'scale-100'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </div>

          {/* Bottom Text Overlay */}
          <div className="absolute bottom-0 left-0 right-0 pb-8 pointer-events-none">
            <div className="text-center space-y-2 bg-gradient-to-t from-background/80 to-transparent pt-8 pb-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Upload className="w-5 h-5" />
                <p className="text-sm font-medium">
                  Drag & drop PDF here or click to browse
                </p>
              </div>
              <p className="text-xs text-muted-foreground/70">
                PDF files only • Max 100MB
              </p>
            </div>
          </div>

          {/* Drag Over Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-md flex items-center justify-center pointer-events-none border-4 border-primary border-dashed rounded-lg">
              <div className="text-center">
                <Upload className="w-20 h-20 mx-auto mb-4 text-primary animate-bounce" />
                <p className="text-2xl font-bold text-primary">Drop PDF on the Robot!</p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}