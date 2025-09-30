pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class PDFViewerApp {
    constructor() {
        this.currentPDF = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.0;
        this.pdfDoc = null;
        this.pageRendering = false;
        this.pageNumPending = null;

        this.initializeElements();
        this.attachEventListeners();
        this.loadFileList();
    }

    initializeElements() {
        this.uploadBtn = document.getElementById('uploadBtn');
        this.fileInput = document.getElementById('fileInput');
        this.fileList = document.getElementById('fileList');
        this.pdfCanvas = document.getElementById('pdfCanvas');
        this.ctx = this.pdfCanvas.getContext('2d');
        this.prevPageBtn = document.getElementById('prevPage');
        this.nextPageBtn = document.getElementById('nextPage');
        this.pageNum = document.getElementById('pageNum');
        this.pageCount = document.getElementById('pageCount');
        this.zoomInBtn = document.getElementById('zoomIn');
        this.zoomOutBtn = document.getElementById('zoomOut');
        this.zoomLevel = document.getElementById('zoomLevel');
        this.placeholder = document.getElementById('placeholder');
    }

    attachEventListeners() {
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.prevPageBtn.addEventListener('click', () => this.onPrevPage());
        this.nextPageBtn.addEventListener('click', () => this.onNextPage());
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            console.log('File uploaded successfully:', data);

            this.loadFileList();
            this.loadPDF(data.file.url);

            this.fileInput.value = '';
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file. Please try again.');
        }
    }

    async loadFileList() {
        try {
            const response = await fetch('/api/files');
            const data = await response.json();

            this.renderFileList(data.files);
        } catch (error) {
            console.error('Error loading file list:', error);
        }
    }

    renderFileList(files) {
        this.fileList.innerHTML = '';

        if (files.length === 0) {
            this.fileList.innerHTML = '<p style="color: #999; text-align: center;">No files uploaded</p>';
            return;
        }

        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';

            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.filename;

            const fileSize = document.createElement('div');
            fileSize.className = 'file-size';
            fileSize.textContent = this.formatFileSize(file.size);

            fileInfo.appendChild(fileName);
            fileInfo.appendChild(fileSize);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                this.deleteFile(file.filename);
            };

            fileItem.appendChild(fileInfo);
            fileItem.appendChild(deleteBtn);

            fileItem.addEventListener('click', () => {
                document.querySelectorAll('.file-item').forEach(item => {
                    item.classList.remove('active');
                });
                fileItem.classList.add('active');
                this.loadPDF(file.url);
            });

            this.fileList.appendChild(fileItem);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    async deleteFile(filename) {
        if (!confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            const response = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Delete failed');
            }

            console.log('File deleted successfully');
            this.loadFileList();

            if (this.currentPDF && this.currentPDF.includes(filename)) {
                this.clearViewer();
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete file. Please try again.');
        }
    }

    async loadPDF(url) {
        this.currentPDF = url;
        this.placeholder.style.display = 'none';

        const loadingTask = pdfjsLib.getDocument(url);

        try {
            this.pdfDoc = await loadingTask.promise;
            this.totalPages = this.pdfDoc.numPages;
            this.pageCount.textContent = this.totalPages;

            this.currentPage = 1;
            this.renderPage(this.currentPage);

            this.updateNavigation();
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Failed to load PDF. Please try again.');
            this.clearViewer();
        }
    }

    renderPage(num) {
        this.pageRendering = true;

        this.pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: this.scale });
            this.pdfCanvas.height = viewport.height;
            this.pdfCanvas.width = viewport.width;

            const renderContext = {
                canvasContext: this.ctx,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
                this.pageRendering = false;

                if (this.pageNumPending !== null) {
                    this.renderPage(this.pageNumPending);
                    this.pageNumPending = null;
                }
            });
        });

        this.pageNum.textContent = num;
    }

    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    }

    onPrevPage() {
        if (this.currentPage <= 1) return;
        this.currentPage--;
        this.queueRenderPage(this.currentPage);
        this.updateNavigation();
    }

    onNextPage() {
        if (this.currentPage >= this.totalPages) return;
        this.currentPage++;
        this.queueRenderPage(this.currentPage);
        this.updateNavigation();
    }

    zoomIn() {
        this.scale = Math.min(this.scale * 1.2, 3.0);
        this.zoomLevel.textContent = Math.round(this.scale * 100) + '%';
        this.queueRenderPage(this.currentPage);
    }

    zoomOut() {
        this.scale = Math.max(this.scale / 1.2, 0.5);
        this.zoomLevel.textContent = Math.round(this.scale * 100) + '%';
        this.queueRenderPage(this.currentPage);
    }

    updateNavigation() {
        this.prevPageBtn.disabled = this.currentPage <= 1;
        this.nextPageBtn.disabled = this.currentPage >= this.totalPages;
    }

    clearViewer() {
        this.ctx.clearRect(0, 0, this.pdfCanvas.width, this.pdfCanvas.height);
        this.pdfCanvas.width = 0;
        this.pdfCanvas.height = 0;
        this.placeholder.style.display = 'flex';
        this.currentPDF = null;
        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;
        this.scale = 1.0;
        this.pageNum.textContent = '1';
        this.pageCount.textContent = '1';
        this.zoomLevel.textContent = '100%';
        this.updateNavigation();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PDFViewerApp();
});