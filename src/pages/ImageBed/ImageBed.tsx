import { useState } from 'react'
import { Header } from '@/components/Layout'
import { UploadZone } from '@/components/UploadZone'
import { ImageCard } from '@/components/ImageCard'
import { Lightbox } from '@/components/Lightbox'
import { Toast } from '@/components/Toast'
import { useUpload } from '@/hooks/useUpload'
import { useFiles } from '@/hooks/useFiles'
import { useToast } from '@/hooks/useToast'
import type { FileItem } from '@/types'
import type { LinkFormat } from '@/types'
import './ImageBed.css'

export function ImageBed() {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [linkFormat, setLinkFormat] = useState<LinkFormat>('url')
  const { upload, isUploading, progress } = useUpload()
  const { files, loading, removeFile, refresh } = useFiles('images')
  const { toasts, addToast, removeToast } = useToast()

  const handleUpload = async (file: File) => {
    const result = await upload(file)
    if (result.success) {
      addToast('上传成功！', 'success')
      refresh()
    } else {
      addToast(result.error || '上传失败', 'error')
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    addToast('链接已复制', 'success')
  }

  const handleDelete = async (key: string) => {
    if (confirm('确定要删除这张图片吗？')) {
      const result = await removeFile(key)
      if (result.success) {
        addToast('图片已删除', 'success')
        setSelectedFile(null)
      } else {
        addToast(result.error || '删除失败', 'error')
      }
    }
  }

  return (
    <div className="image-bed">
      <Header
        title="图床"
        description="上传图片，获取 Markdown/URL/HTML 链接"
      />

      <UploadZone
        onUpload={handleUpload}
        isUploading={isUploading}
        progress={progress}
      />

      <div className="link-format-selector">
        <span>链接格式：</span>
        <div className="format-tabs">
          {(['markdown', 'url', 'html'] as const).map((format) => (
            <button
              key={format}
              className={`format-tab ${linkFormat === format ? 'active' : ''}`}
              onClick={() => setLinkFormat(format)}
            >
              {format === 'markdown' ? 'Markdown' : format === 'url' ? 'URL' : 'HTML'}
            </button>
          ))}
        </div>
      </div>

      <div className="gallery-header">
        <h2>图片库</h2>
        <span className="gallery-count">{files.length} 张图片</span>
      </div>

      {loading ? (
        <div className="gallery-grid">
          {Array(6).fill(null).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image" />
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <h3>还没有图片</h3>
          <p>上传第一张图片开始使用</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {files.map((file, i) => (
            <div key={file.key} style={{ animationDelay: `${i * 50}ms` }} className="gallery-item">
              <ImageCard
                file={file}
                onCopy={handleCopy}
                onDelete={handleDelete}
                onPreview={setSelectedFile}
                linkFormat={linkFormat}
              />
            </div>
          ))}
        </div>
      )}

      <Lightbox
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onCopy={handleCopy}
        onDelete={handleDelete}
        linkFormat={linkFormat}
      />

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
