import { useRef, useState, useCallback } from 'react'
import { Upload, Image as ImageIcon } from 'lucide-react'
import './UploadZone.css'

interface UploadZoneProps {
  onUpload: (file: File) => void
  isUploading: boolean
  progress: number
  accept?: string
  maxSize?: number
}

export function UploadZone({
  onUpload,
  isUploading,
  progress,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('application/')) {
        alert('请上传图片或文档文件')
        return
      }
      if (file.size > maxSize) {
        alert(`文件大小不能超过 ${maxSize / 1024 / 1024}MB`)
        return
      }
      onUpload(file)
    },
    [onUpload, maxSize]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div
      className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="upload-input"
      />

      {isUploading ? (
        <div className="upload-progress">
          <div className="progress-ring">
            <svg viewBox="0 0 36 36">
              <path
                className="progress-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="progress-fill"
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="progress-text">{progress}%</span>
          </div>
          <p>上传中...</p>
        </div>
      ) : (
        <>
          <div className="upload-icon">
            <Upload size={32} />
          </div>
          <h3>拖拽文件到这里</h3>
          <p>或点击选择文件上传</p>
          <div className="upload-formats">
            <ImageIcon size={14} />
            <span>支持图片、PDF、文档 (最大 10MB)</span>
          </div>
        </>
      )}
    </div>
  )
}
