import { useState } from 'react'
import { Header } from '@/components/Layout'
import { UploadZone } from '@/components/UploadZone'
import { ImageCard } from '@/components/ImageCard'
import { FileCard } from '@/components/FileCard'
import { Lightbox } from '@/components/Lightbox'
import { Toast } from '@/components/Toast'
import { useUpload } from '@/hooks/useUpload'
import { useFiles } from '@/hooks/useFiles'
import { useToast } from '@/hooks/useToast'
import type { FileItem, FileCategory } from '@/types'
import type { LinkFormat } from '@/types'
import './ResourceCenter.css'

export function ResourceCenter() {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [category, setCategory] = useState<FileCategory>('all')
  const [linkFormat, setLinkFormat] = useState<LinkFormat>('url')
  const { upload, isUploading, progress } = useUpload()
  const { files, loading, removeFile, refresh } = useFiles(category)
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
    if (confirm('确定要删除这个文件吗？')) {
      const result = await removeFile(key)
      if (result.success) {
        addToast('文件已删除', 'success')
        setSelectedFile(null)
      } else {
        addToast(result.error || '删除失败', 'error')
      }
    }
  }

  const categories: { value: FileCategory; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'images', label: '图片' },
    { value: 'documents', label: '文档' },
    { value: 'other', label: '其他' },
  ]

  return (
    <div className="resource-center">
      <Header
        title="资源中心"
        description="统一管理所有图片和文档资源"
      />

      <UploadZone
        onUpload={handleUpload}
        isUploading={isUploading}
        progress={progress}
      />

      <div className="resource-toolbar">
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`category-tab ${category === cat.value ? 'active' : ''}`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="format-tabs">
          {(['markdown', 'url', 'html'] as const).map((format) => (
            <button
              key={format}
              className={`format-tab ${linkFormat === format ? 'active' : ''}`}
              onClick={() => setLinkFormat(format)}
            >
              {format === 'markdown' ? 'MD' : format === 'url' ? 'URL' : 'HTML'}
            </button>
          ))}
        </div>
      </div>

      <div className="resource-count">
        {files.length} 个文件
      </div>

      {loading ? (
        <div className="file-list">
          {Array(5).fill(null).map((_, i) => (
            <div key={i} className="skeleton-file">
              <div className="skeleton-icon" />
              <div className="skeleton-info">
                <div className="skeleton-name" />
                <div className="skeleton-meta" />
              </div>
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <h3>还没有文件</h3>
          <p>上传第一个文件开始使用</p>
        </div>
      ) : (
        <div className="file-list">
          {files.map((file, i) => (
            <div key={file.key} style={{ animationDelay: `${i * 30}ms` }} className="file-list-item">
              {file.type === 'image' ? (
                <ImageCard
                  file={file}
                  onCopy={handleCopy}
                  onDelete={handleDelete}
                  onPreview={setSelectedFile}
                  linkFormat={linkFormat}
                />
              ) : (
                <FileCard
                  file={file}
                  onCopy={handleCopy}
                  onDelete={handleDelete}
                  onPreview={setSelectedFile}
                  linkFormat={linkFormat}
                />
              )}
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
