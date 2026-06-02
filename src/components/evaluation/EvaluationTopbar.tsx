import { Link, useLocation } from 'react-router-dom'
import { Menu, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import ThemeToggle from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  accounts: 'Account Manager',
  profile: 'Profile',
  affiliate: 'Affiliate',
  certificates: 'Certificates',
  billing: 'Billing',
  rewards: 'Rewards',
  contact: 'Contact',
  chatbot: 'Chatbot',
  evaluation: 'Evaluation',
  'free-trial': 'Free Trial',
}

interface Props {
  onMobileToggle: () => void
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function EvaluationTopbar({ onMobileToggle }: Props) {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const isDark = useThemeStore((s) => s.mode === 'dark')

  const parts = pathname.split('/').filter(Boolean)
  const segment = parts[0] ?? 'dashboard'
  const isAccountStats = parts[0] === 'accounts' && parts[2] === 'stats'
  const pageLabel = isAccountStats
    ? parts[1]?.slice(0, 12) + '…'
    : BREADCRUMB_MAP[segment] ?? 'Dashboard'

  return (
    <header
      className={cn(
        'flex h-14 flex-shrink-0 items-center justify-between border-b px-4 md:px-6',
        isDark
          ? 'border-white/10 bg-[#0a0a0a] text-white'
          : 'border-gray-200 bg-white text-gray-900',
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileToggle}
          className={cn(
            'rounded-lg p-1.5 lg:hidden',
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900',
          )}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/dashboard" className="hidden items-center gap-2 lg:flex">
          <TrendingUp className={cn('h-5 w-5', isDark ? 'text-white' : 'text-[#002D5B]')} />
          <span className="font-bold">tradeox</span>
        </Link>

        <div
          className={cn(
            'hidden text-sm md:flex md:items-center md:gap-2',
            isDark ? 'text-gray-400' : 'text-gray-500',
          )}
        >
          <Link to="/dashboard" className={isDark ? 'hover:text-white' : 'hover:text-gray-900'}>
            Home
          </Link>
          <span>/</span>
          {isAccountStats ? (
            <>
              <Link
                to="/dashboard"
                className={isDark ? 'hover:text-white' : 'hover:text-gray-900'}
              >
                Dashboard
              </Link>
              <span>/</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{pageLabel}</span>
            </>
          ) : (
            <span className={isDark ? 'text-white' : 'text-gray-900'}>{pageLabel}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle
          className={
            isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:text-gray-900'
          }
        />
        <span
          className={cn(
            'hidden text-sm font-medium sm:inline',
            isDark ? 'text-white' : 'text-gray-900',
          )}
        >
          {user?.name ?? 'User'}
        </span>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold',
            isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700',
          )}
        >
          {getInitials(user?.name ?? 'U')}
        </div>
      </div>
    </header>
  )
}
