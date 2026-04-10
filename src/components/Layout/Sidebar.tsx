import { NavLink } from 'react-router-dom'
import { Image, FolderArchive, Home, PanelLeftClose, PanelLeft } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import './Sidebar.css'

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/image-bed', icon: Image, label: '图床' },
  { path: '/resources', icon: FolderArchive, label: '资源中心' },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <svg className="logo-icon" viewBox="0 0 100 100">
            <rect fill="#e85d04" rx="20" width="100" height="100"/>
            <path d="M30 70 L45 50 L55 60 L70 35 L75 40" stroke="white" stroke-width="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="35" cy="35" r="8" fill="white"/>
          </svg>
          <span className="logo-text">SenYao</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {sidebarCollapsed ? (
            <PanelLeft size={20} />
          ) : (
            <>
              <PanelLeftClose size={20} />
              <span>收起</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
