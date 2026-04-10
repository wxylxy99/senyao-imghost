import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Home } from '@/pages/Home'
import { ImageBed } from '@/pages/ImageBed'
import { ResourceCenter } from '@/pages/ResourceCenter'
import { Login } from '@/pages/Login'
import { useAppStore } from '@/stores/appStore'

export default function App() {
  const { theme } = useAppStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/image-bed" element={<ImageBed />} />
        <Route path="/resources" element={<ResourceCenter />} />
      </Route>
    </Routes>
  )
}
