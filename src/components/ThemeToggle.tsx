import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
  iconClassName?: string
}

/** Single control: moon → switch to dark, sun → switch to light */
export default function ThemeToggle({ className, iconClassName }: Props) {
  const mode = useThemeStore((s) => s.mode)
  const toggle = useThemeStore((s) => s.toggle)
  const isDark = mode === 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'rounded-lg p-2 transition-colors',
        className,
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <Sun className={cn('h-5 w-5', iconClassName)} />
      ) : (
        <Moon className={cn('h-5 w-5', iconClassName)} />
      )}
    </button>
  )
}
