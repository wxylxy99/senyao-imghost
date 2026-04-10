export interface UploadResponse {
  success: boolean
  data?: {
    key: string
    url: string
    filename: string
    size: number
    createdAt: string
  }
  error?: string
}

export interface FileItem {
  key: string
  url: string
  filename: string
  size: number
  createdAt: string
  type: 'image' | 'document' | 'other'
}

export interface ListFilesResponse {
  success: boolean
  data: FileItem[]
  error?: string
}

export type LinkFormat = 'markdown' | 'url' | 'html'

export type FileCategory = 'all' | 'images' | 'documents' | 'other'
