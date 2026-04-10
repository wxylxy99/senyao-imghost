import { Copy, Trash2, FileText, File } from 'lucide-react'
import type { FileItem } from '@/types'
import { formatDate, formatFileSize, generateLink } from '@/services/api'
import './FileCard.css'

interface FileCardProps {
  file: FileItem
  onCopy: (text: string) => void
  onDelete: (key: string) => void
  onPreview: (file: FileItem) => void
  linkFormat: 'markdown' | 'url' | 'html'
}

const fileIcons: Record<string, typeof FileText> = {
  document: FileText,
  other: File,
}

const fileColors: Record<string, string> = {
  document: '#3b82f6',
  other: '#6b7280',
}

export function FileCard({ file, onCopy, onDelete, onPreview, linkFormat }: FileCardProps) {
  const Icon = fileIcons[file.type] ?? File
  const color = fileColors[file.type] ?? '#6b7280'

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
    <div className="file-card" onClick={() => onPreview(file)}>
      <div className="file-card-icon" style={{ backgroundColor: `${color}15`, color }}>
        <Icon size={28} />
      </div>
      <div className="file-card-info">
        <div className="file-card-name" title={file.filename}>
          {file.filename}
        </div>
        <div className="file-card-meta">
          <span>{formatFileSize(file.size)}</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>
      </div>
      <div className="file-card-actions">
        <button className="file-action-btn" onClick={handleCopy} title="复制链接">
          <Copy size={16} />
        </button>
        <button className="file-action-btn delete" onClick={handleDelete} title="删除">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
