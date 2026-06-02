import { useEffect } from 'react'
import { applyTheme, useThemeStore } from '@/store/themeStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode)

  useEffect(() => {
    applyTheme(mode)
  }, [mode])

  return children
}
