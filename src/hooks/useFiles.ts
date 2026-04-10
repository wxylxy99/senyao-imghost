import { useState, useCallback, useEffect } from 'react'
import { listFiles, deleteFile } from '@/services/api'
import type { FileItem, FileCategory } from '@/types'

export function useFiles(category: FileCategory = 'all') {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await listFiles()

    if (response.success) {
      setFiles(response.data)
    } else {
      setError(response.error || 'Failed to fetch files')
    }

    setLoading(false)
  }, [])

  const removeFile = useCallback(async (key: string) => {
    const response = await deleteFile(key)

    if (response.success) {
      setFiles((prev) => prev.filter((f) => f.key !== key))
    }

    return response
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const filteredFiles = files.filter((file) => {
    if (category === 'all') return true
    if (category === 'images') return file.type === 'image'
    if (category === 'documents') return file.type === 'document'
    if (category === 'other') return file.type === 'other'
    return true
  })

  return {
    files: filteredFiles,
    allFiles: files,
    loading,
    error,
    refresh: fetchFiles,
    removeFile,
  }
}
