import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    if (!existsSync(uploadDir)) {
      return NextResponse.json({ files: [] })
    }

    const files = await readdir(uploadDir)

    const pdfFiles = await Promise.all(
      files
        .filter(file => file.endsWith('.pdf'))
        .map(async (file) => {
          const filePath = path.join(uploadDir, file)
          const stats = await stat(filePath)

          return {
            filename: file,
            url: `/uploads/${file}`,
            size: stats.size,
            uploadedAt: stats.birthtime.toISOString()
          }
        })
    )

    const sortedFiles = pdfFiles.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )

    return NextResponse.json({ files: sortedFiles })
  } catch (error) {
    console.error('Error reading files:', error)
    return NextResponse.json(
      { error: 'Failed to read files' },
      { status: 500 }
    )
  }
}