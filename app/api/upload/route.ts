import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = uniqueSuffix + '-' + file.name
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)

    return NextResponse.json({
      success: true,
      file: {
        filename: filename,
        originalName: file.name,
        size: file.size,
        url: `/uploads/${filename}`
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    )
  }
}