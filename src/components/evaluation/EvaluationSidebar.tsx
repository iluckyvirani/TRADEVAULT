import { NavLink, useNavigate } from 'react-router-dom'
import {
  HelpCircle,
  Home,
  TrendingUp,
  User,
  CreditCard,
  Mail,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: LucideIcon
  label: string
  path: string
}

const NAV_ITEMS: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: TrendingUp, label: 'Accounts', path: '/accounts' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: HelpCircle, label: 'FAQ', path: '/faq' },
  { icon: Mail, label: 'Contact', path: '/contact' },
]

interface Props {
  mobileOpen: boolean
  onClose: () => void
}

export default function EvaluationSidebar({ mobileOpen, onClose }: Props) {
  const navigate = useNavigate()
  const isDark = useThemeStore((s) => s.mode === 'dark')

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r transition-transform duration-200 lg:relative lg:translate-x-0',
        isDark
          ? 'border-white/10 bg-[#111111]'
          : 'border-gray-200 bg-white',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center justify-between border-b px-4 lg:hidden',
          isDark ? 'border-white/10' : 'border-gray-200',
        )}
      >
        <span className={cn('font-bold', isDark ? 'text-white' : 'text-gray-900')}>
          tradeox
        </span>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'rounded-lg p-1',
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900',
          )}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <button
          type="button"
          onClick={() => {
            navigate('/evaluation')
            onClose()
          }}
          className="mb-4 w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
        >
          Start Evaluation
        </button>

        <nav>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? isDark
                          ? 'bg-white/10 font-semibold text-white'
                          : 'bg-gray-100 font-semibold text-gray-900'
                        : isDark
                          ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                    )
                  }
                >
                  <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
