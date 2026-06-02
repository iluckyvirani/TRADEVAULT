import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

export function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  toggle: () => void
  isDark: () => boolean
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      setMode: (mode) => {
        applyTheme(mode)
        set({ mode })
      },
      toggle: () => {
        const next: ThemeMode = get().mode === 'light' ? 'dark' : 'light'
        get().setMode(next)
      },
      isDark: () => get().mode === 'dark',
    }),
    {
      name: 'tv-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.mode)
      },
    },
  ),
)
