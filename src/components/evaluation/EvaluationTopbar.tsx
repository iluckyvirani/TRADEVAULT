import { Link, useLocation } from 'react-router-dom'
import { Menu, Moon, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const BREADCRUMB_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  accounts: 'Accounts',
  profile: 'Profile',
  affiliate: 'Affiliate',
  certificates: 'Certificates',
  billing: 'Billing',
  rewards: 'Rewards',
  contact: 'Contact',
  chatbot: 'Chatbot',
  evaluation: 'Evaluation',
}

interface Props {
  onMobileToggle: () => void
  dark?: boolean
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function EvaluationTopbar({ onMobileToggle, dark = false }: Props) {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)

  const segment = pathname.split('/')[1] ?? 'dashboard'
  const pageLabel = BREADCRUMB_MAP[segment] ?? 'Dashboard'

  return (
    <header
      className={cn(
        'flex h-14 flex-shrink-0 items-center justify-between border-b px-4 md:px-6',
        dark
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
            dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900',
          )}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/dashboard" className="hidden items-center gap-2 lg:flex">
          <TrendingUp className={cn('h-5 w-5', dark ? 'text-white' : 'text-[#002D5B]')} />
          <span className="font-bold">tradeox</span>
        </Link>

        <div
          className={cn(
            'hidden text-sm md:flex md:items-center md:gap-2',
            dark ? 'text-gray-400' : 'text-gray-500',
          )}
        >
          <Link to="/dashboard" className={dark ? 'hover:text-white' : 'hover:text-gray-900'}>
            Home
          </Link>
          <span>/</span>
          <span className={dark ? 'text-white' : 'text-gray-900'}>{pageLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className={cn(
            'rounded-lg p-2',
            dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900',
          )}
          aria-label="Toggle theme"
        >
          <Moon className="h-5 w-5" />
        </button>
        <span className={cn('hidden text-sm font-medium sm:inline', dark ? 'text-white' : 'text-gray-900')}>
          {user?.name ?? 'User'}
        </span>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold',
            dark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700',
          )}
        >
          {getInitials(user?.name ?? 'U')}
        </div>
      </div>
    </header>
  )
}
