import { Image, FolderArchive, Upload, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/Layout'
import { useFiles } from '@/hooks/useFiles'
import './Home.css'

export function Home() {
  const { allFiles } = useFiles()

  const imageCount = allFiles.filter((f) => f.type === 'image').length
  const documentCount = allFiles.filter((f) => f.type === 'document').length
  const totalSize = allFiles.reduce((acc, f) => acc + f.size, 0)

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <div className="home">
      <Header title="首页" description="欢迎使用 SenYao 资源管理系统" />

      <div className="home-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(232, 93, 4, 0.1)', color: 'var(--accent)' }}>
            <Image size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{imageCount}</span>
            <span className="stat-label">图片</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <FolderArchive size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{documentCount}</span>
            <span className="stat-label">文档</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <Upload size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatSize(totalSize)}</span>
            <span className="stat-label">已用存储</span>
          </div>
        </div>
      </div>

      <div className="home-quick-actions">
        <h2>快速开始</h2>
        <div className="quick-actions-grid">
          <Link to="/image-bed" className="quick-action-card">
            <div className="quick-action-icon">
              <Upload size={28} />
            </div>
            <div className="quick-action-text">
              <h3>上传图片</h3>
              <p>将图片上传到图床，获取链接</p>
            </div>
            <ArrowRight size={20} />
          </Link>

          <Link to="/resources" className="quick-action-card">
            <div className="quick-action-icon">
              <FolderArchive size={28} />
            </div>
            <div className="quick-action-text">
              <h3>资源中心</h3>
              <p>管理所有图片和文档资源</p>
            </div>
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {allFiles.length > 0 && (
        <div className="home-recent">
          <h2>最近上传</h2>
          <div className="recent-grid">
            {allFiles.slice(0, 6).map((file) => (
              <div key={file.key} className="recent-item">
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.filename} />
                ) : (
                  <div className="recent-file">
                    <FolderArchive size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
