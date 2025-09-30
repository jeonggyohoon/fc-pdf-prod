export interface RenderOptions {
  scale?: number
  rotation?: number
  quality?: number
}

export class PDFRenderer {
  private pdfjsLib: any = null
  private isInitializing = false
  private initPromise: Promise<any> | null = null

  private async ensurePdfjs() {
    if (typeof window === 'undefined') {
      throw new Error('PDFRenderer can only be used in the browser')
    }

    // 이미 초기화되었으면 반환
    if (this.pdfjsLib) {
      return this.pdfjsLib
    }

    // 초기화 중이면 기다림
    if (this.isInitializing && this.initPromise) {
      return this.initPromise
    }

    // 새로 초기화
    this.isInitializing = true
    this.initPromise = (async () => {
      try {
        const pdfjs = await import('pdfjs-dist/build/pdf.mjs')

        // Worker 설정
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

        this.pdfjsLib = pdfjs
        return pdfjs
      } catch (error) {
        console.error('Failed to load pdfjs-dist:', error)
        throw new Error('Failed to initialize PDF.js library')
      } finally {
        this.isInitializing = false
      }
    })()

    return this.initPromise
  }

  /**
   * PDF 페이지를 이미지로 렌더링
   * @param pdfData PDF 바이너리 데이터
   * @param pageNum 페이지 번호 (1-based)
   * @param options 렌더링 옵션
   * @returns Base64 인코딩된 이미지 데이터 URL
   */
  async renderPage(
    pdfData: Uint8Array,
    pageNum: number,
    options: RenderOptions = {}
  ): Promise<string> {
    const { scale = 1.5, rotation = 0 } = options

    try {
      const pdfjs = await this.ensurePdfjs()

      // PDF 문서 로드
      const loadingTask = pdfjs.getDocument({ data: pdfData })
      const pdf = await loadingTask.promise

      // 페이지 가져오기
      const page = await pdf.getPage(pageNum)

      // 뷰포트 설정
      const viewport = page.getViewport({ scale, rotation })

      // 캔버스 생성
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error('Failed to get canvas context')
      }

      canvas.height = viewport.height
      canvas.width = viewport.width

      // 렌더링
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise

      // Base64 이미지로 변환
      const imageData = canvas.toDataURL('image/png')

      // 메모리 정리
      page.cleanup()

      return imageData
    } catch (error) {
      console.error('Error rendering PDF page:', error)
      throw new Error(`Failed to render page ${pageNum}`)
    }
  }

  /**
   * 썸네일 이미지 생성
   * @param pdfData PDF 바이너리 데이터
   * @param pageNum 페이지 번호 (1-based)
   * @param size 썸네일 크기 (픽셀)
   * @returns Base64 인코딩된 썸네일 이미지
   */
  async generateThumbnail(
    pdfData: Uint8Array,
    pageNum: number,
    size: number = 200
  ): Promise<string> {
    try {
      const pdfjs = await this.ensurePdfjs()
      const loadingTask = pdfjs.getDocument({ data: pdfData })
      const pdf = await loadingTask.promise
      const page = await pdf.getPage(pageNum)

      // 원본 뷰포트 가져오기
      const originalViewport = page.getViewport({ scale: 1 })

      // 썸네일 크기에 맞춰 스케일 계산
      const scale = size / Math.max(originalViewport.width, originalViewport.height)
      const viewport = page.getViewport({ scale })

      // 캔버스 생성
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error('Failed to get canvas context')
      }

      canvas.height = viewport.height
      canvas.width = viewport.width

      // 렌더링
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }

      await page.render(renderContext).promise

      // JPEG로 변환 (파일 크기 최적화)
      const imageData = canvas.toDataURL('image/jpeg', 0.8)

      // 메모리 정리
      page.cleanup()

      return imageData
    } catch (error) {
      console.error('Error generating thumbnail:', error)
      throw new Error(`Failed to generate thumbnail for page ${pageNum}`)
    }
  }

  /**
   * 모든 페이지의 썸네일 일괄 생성
   * @param pdfData PDF 바이너리 데이터
   * @param size 썸네일 크기
   * @param onProgress 진행 상태 콜백
   * @returns 페이지별 썸네일 배열
   */
  async generateAllThumbnails(
    pdfData: Uint8Array,
    size: number = 200,
    onProgress?: (current: number, total: number) => void
  ): Promise<string[]> {
    try {
      const pdfjs = await this.ensurePdfjs()
      const loadingTask = pdfjs.getDocument({ data: pdfData })
      const pdf = await loadingTask.promise
      const numPages = pdf.numPages
      const thumbnails: string[] = []

      for (let i = 1; i <= numPages; i++) {
        const thumbnail = await this.generateThumbnail(pdfData, i, size)
        thumbnails.push(thumbnail)
        onProgress?.(i, numPages)
      }

      return thumbnails
    } catch (error) {
      console.error('Error generating all thumbnails:', error)
      throw new Error('Failed to generate thumbnails')
    }
  }
}