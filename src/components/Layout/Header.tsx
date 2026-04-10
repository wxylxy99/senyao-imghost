import { Sun, Moon, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'
import './Header.css'

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const navigate = useNavigate()
  const { theme, toggleTheme, setAuthenticated } = useAppStore()

  const handleLogout = () => {
    setAuthenticated(false)
    localStorage.removeItem('auth')
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-text">
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="切换主题">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="logout-btn" onClick={handleLogout} aria-label="退出登录">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
