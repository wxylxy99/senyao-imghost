import { useEffect, useCallback } from 'react'
import { X, Copy, Trash2, ExternalLink } from 'lucide-react'
import type { FileItem } from '@/types'
import { formatFileSize, formatDate, generateLink } from '@/services/api'
import './Lightbox.css'

interface LightboxProps {
  file: FileItem | null
  onClose: () => void
  onCopy: (text: string) => void
  onDelete: (key: string) => void
  linkFormat: 'markdown' | 'url' | 'html'
}

export function Lightbox({ file, onClose, onCopy, onDelete, linkFormat }: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (file) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [file, handleKeyDown])

  if (!file) return null

  const handleCopy = () => {
    const link = generateLink(file.url, file.filename, linkFormat)
    onCopy(link)
  }

  const handleDelete = () => {
    onDelete(file.key)
    onClose()
  }

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>
        <X size={24} />
      </button>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img src={file.url} alt={file.filename} className="lightbox-image" />

        <div className="lightbox-info">
          <h3>{file.filename}</h3>
          <p>
            {formatFileSize(file.size)} · {formatDate(file.createdAt)}
          </p>
        </div>

        <div className="lightbox-actions">
          <button className="lightbox-btn" onClick={handleCopy}>
            <Copy size={18} />
            复制链接
          </button>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="lightbox-btn"
          >
            <ExternalLink size={18} />
            打开
          </a>
          <button className="lightbox-btn delete" onClick={handleDelete}>
            <Trash2 size={18} />
            删除
          </button>
        </div>
      </div>
    </div>
  )
}
