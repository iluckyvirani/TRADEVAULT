import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  TrendingUp,
  User,
  Users,
  Award,
  CreditCard,
  Star,
  Mail,
  MessageSquare,
  X,
  type LucideIcon,
} from 'lucide-react'
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
  { icon: Users, label: 'Affiliate', path: '/affiliate' },
  { icon: Award, label: 'Certificates', path: '/certificates' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: Star, label: 'Rewards', path: '/rewards' },
  { icon: Mail, label: 'Contact', path: '/contact' },
  { icon: MessageSquare, label: 'Chatbot', path: '/chatbot' },
]

interface Props {
  mobileOpen: boolean
  onClose: () => void
}

export default function EvaluationSidebar({ mobileOpen, onClose }: Props) {
  const navigate = useNavigate()

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:relative lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 lg:hidden">
        <span className="font-bold text-gray-900">tradeox</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-gray-500 hover:text-gray-900"
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
                        ? 'bg-gray-100 font-semibold text-gray-900'
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
