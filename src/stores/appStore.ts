import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  authenticated: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
  setAuthenticated: (value: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarCollapsed: false,
      authenticated: localStorage.getItem('auth') === 'true',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setAuthenticated: (value: boolean) => set({ authenticated: value }),
    }),
    {
      name: 'senyao-app-storage',
    }
  )
)
