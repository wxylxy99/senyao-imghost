import { Navigate } from 'react-router-dom'
import { useAppStore } from '@/stores/appStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authenticated } = useAppStore()

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
