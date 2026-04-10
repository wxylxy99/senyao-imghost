import { useState } from 'react'
import { Copy, Trash2 } from 'lucide-react'
import type { FileItem } from '@/types'
import { formatDate, formatFileSize, generateLink } from '@/services/api'
import './ImageCard.css'

interface ImageCardProps {
  file: FileItem
  onCopy: (text: string) => void
  onDelete: (key: string) => void
  onPreview: (file: FileItem) => void
  linkFormat: 'markdown' | 'url' | 'html'
}

export function ImageCard({ file, onCopy, onDelete, onPreview, linkFormat }: ImageCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    const link = generateLink(file.url, file.filename, linkFormat)
    onCopy(link)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(file.key)
  }

  return (
    <div
      className="image-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onPreview(file)}
    >
      <div className="image-card-preview">
        {!imageLoaded && <div className="image-card-skeleton" />}
        <img
          src={file.url}
          alt={file.filename}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
        {showActions && (
          <div className="image-card-overlay">
            <button className="action-btn" onClick={handleCopy} title="复制链接">
              <Copy size={18} />
            </button>
            <button className="action-btn delete" onClick={handleDelete} title="删除">
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
      <div className="image-card-info">
        <div className="image-card-name" title={file.filename}>
          {file.filename}
        </div>
        <div className="image-card-meta">
          <span>{formatDate(file.createdAt)}</span>
          <span>{formatFileSize(file.size)}</span>
        </div>
      </div>
    </div>
  )
}
