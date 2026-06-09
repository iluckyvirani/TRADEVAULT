import { useMemo } from 'react'
import { useThemeStore } from '@/store/themeStore'

export function useTradingPanelTheme() {
  const isDark = useThemeStore((s) => s.mode === 'dark')

  return useMemo(
    () => ({
      isDark,
      border: isDark ? 'border-white/10' : 'border-gray-200',
      borderSubtle: isDark ? 'border-white/5' : 'border-gray-100',
      borderDashed: isDark ? 'border-white/15' : 'border-gray-300',
      panelBg: isDark ? 'bg-[#0b0e14]' : 'bg-white',
      cardBg: isDark ? 'bg-[#0d1017]' : 'bg-gray-50',
      iconBg: isDark ? 'bg-[#1a2030] text-gray-300' : 'bg-gray-100 text-gray-600',
      textPrimary: isDark ? 'text-white' : 'text-gray-900',
      textSecondary: isDark ? 'text-gray-500' : 'text-gray-500',
      textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
      textFaint: isDark ? 'text-gray-600' : 'text-gray-400',
      tabActive: isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900',
      tabInactive: isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700',
      pillActive: isDark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white',
      pillInactive: isDark
        ? 'bg-white/5 text-gray-400 hover:bg-white/10'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      inputBg: isDark
        ? 'border-white/10 bg-[#0d1017] text-gray-300'
        : 'border-gray-200 bg-gray-50 text-gray-700',
      btnBorder: isDark
        ? 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
        : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900',
      btnBorderStrong: isDark
        ? 'border-white/15 text-white hover:bg-white/10'
        : 'border-gray-300 text-gray-700 hover:bg-gray-50',
      btnDisabled: isDark
        ? 'border-white/5 text-gray-600'
        : 'border-gray-100 text-gray-400',
      filterActive: isDark ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-100 text-sky-700',
      filterInactive: isDark
        ? 'bg-white/5 text-gray-400 hover:bg-white/10'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      filterCountActive: isDark ? 'bg-sky-500/30' : 'bg-sky-200',
      filterCountInactive: isDark ? 'bg-white/10' : 'bg-gray-200',
      dashedBtn: isDark
        ? 'border-white/20 text-white hover:border-white/35 hover:bg-white/5'
        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50',
      placeBtn: isDark
        ? 'bg-gray-200 text-gray-900 hover:bg-white'
        : 'bg-gray-900 text-white hover:bg-gray-800',
      placeBtnDisabled: isDark
        ? 'bg-white/10 text-gray-500'
        : 'bg-gray-100 text-gray-400',
      badgeDefault: isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-600',
      viewOnlyBadge: isDark
        ? 'border-white/10 text-gray-400'
        : 'border-gray-200 text-gray-500',
    }),
    [isDark],
  )
}
