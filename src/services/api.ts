import type { UploadResponse, ListFilesResponse, FileItem } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://senyao-system.xiangyu97-wang.workers.dev'

function getFileType(filename: string, contentType: string): FileItem['type'] {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg']
  const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md']

  const ext = filename.split('.').pop()?.toLowerCase() || ''

  if (contentType.startsWith('image/') || imageExts.includes(ext)) {
    return 'image'
  }
  if (docExts.includes(ext) || contentType.includes('pdf') || contentType.includes('document')) {
    return 'document'
  }
  return 'other'
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    })

    const data: UploadResponse = await response.json()
    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

export async function listFiles(): Promise<ListFilesResponse> {
  try {
    const response = await fetch(`${API_BASE}/files`)
    const data = await response.json()

    if (data.success && Array.isArray(data.data)) {
      data.data = data.data.map((item: FileItem) => ({
        ...item,
        type: getFileType(item.filename, ''),
      }))
    }

    return data
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch files',
    }
  }
}

export async function deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/files/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    })
    return await response.json()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}

export function generateLink(url: string, filename: string, format: 'markdown' | 'url' | 'html'): string {
  switch (format) {
    case 'markdown':
      return `![${filename}](${url})`
    case 'url':
      return url
    case 'html':
      return `<img src="${url}" alt="${filename}">`
    default:
      return url
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getFileIcon(_filename: string, type: FileItem['type']): string {
  const iconMap: Record<FileItem['type'], string> = {
    image: 'image',
    document: 'file-text',
    other: 'file',
  }
  return iconMap[type] || 'file'
}
