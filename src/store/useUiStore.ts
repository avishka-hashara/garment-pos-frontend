import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface UiState {
  theme: Theme
  sidebarCollapsed: boolean
  mobileOpen: boolean
  toggleTheme: () => void
  setTheme: (t: Theme) => void
  toggleSidebar: () => void
  setMobileOpen: (open: boolean) => void
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
}

const stored = (localStorage.getItem('loom-theme') as Theme) || 'light'
applyTheme(stored)

export const useUiStore = create<UiState>((set) => ({
  theme: stored,
  sidebarCollapsed: false,
  mobileOpen: false,
  toggleTheme: () =>
    set((s) => {
      const theme = s.theme === 'light' ? 'dark' : 'light'
      applyTheme(theme)
      localStorage.setItem('loom-theme', theme)
      return { theme }
    }),
  setTheme: (theme) =>
    set(() => {
      applyTheme(theme)
      localStorage.setItem('loom-theme', theme)
      return { theme }
    }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
}))
