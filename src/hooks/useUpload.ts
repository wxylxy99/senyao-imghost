import { useState, useCallback } from 'react'
import { uploadFile } from '@/services/api'
import type { UploadResponse } from '@/types'

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  })

  const upload = useCallback(async (file: File): Promise<UploadResponse> => {
    setState({ isUploading: true, progress: 0, error: null })

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        progress: Math.min(prev.progress + 10, 90),
      }))
    }, 100)

    try {
      const response = await uploadFile(file)

      clearInterval(progressInterval)

      if (response.success) {
        setState({ isUploading: false, progress: 100, error: null })
      } else {
        setState({ isUploading: false, progress: 0, error: response.error || 'Upload failed' })
      }

      return response
    } catch (error) {
      clearInterval(progressInterval)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setState({ isUploading: false, progress: 0, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }, [])

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, error: null })
  }, [])

  return { ...state, upload, reset }
}
