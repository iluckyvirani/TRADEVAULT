import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home, TrendingUp, PieChart, Bookmark, BarChart2,
  BookOpen, Trophy, Settings, LogOut, X,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

// ─── Nav config ───────────────────────────────────────────────────────────────
interface NavItem { icon: LucideIcon; label: string; path: string }

const NAV_ITEMS: NavItem[] = [
  { icon: Home,      label: 'Dashboard',   path: '/dashboard' },
  { icon: TrendingUp,label: 'Trade',       path: '/trade' },
  { icon: PieChart,  label: 'Portfolio',   path: '/portfolio' },
  { icon: Bookmark,  label: 'Watchlist',   path: '/watchlist' },
  { icon: BarChart2, label: 'Analytics',   path: '/analytics' },
  { icon: BookOpen,  label: 'Journal',     path: '/journal' },
  { icon: Trophy,    label: 'Leaderboard', path: '/leaderboard' },
]

const AVATAR_EMOJI: Record<string, string> = {
  av1: '🦊', av2: '🐬', av3: '🦁', av4: '🐉',
  av5: '🦋', av6: '🦅', av7: '🐺', av8: '🦈',
}

interface Props {
  collapsed: boolean
  mobileOpen: boolean
  onClose: () => void
}

export default function Sidebar({ collapsed, mobileOpen, onClose }: Props) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const emoji = AVATAR_EMOJI[user?.avatar ?? 'av1'] ?? '🦊'

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <aside
      className={cn(
        // Base
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-background',
        'transition-transform duration-200 ease-in-out',
        // Mobile: slide in/out. Desktop: always visible, no translate
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        // Desktop: part of flow, not fixed
        'lg:relative lg:inset-auto lg:z-auto',
        // Width
        'w-64 transition-[width,transform] lg:transition-[width]',
        collapsed ? 'lg:w-16' : 'lg:w-64',
      )}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className={cn(
          'flex h-14 flex-shrink-0 items-center border-b border-border px-4',
          collapsed ? 'lg:justify-center' : 'justify-between',
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <TrendingUp className="h-5 w-5 flex-shrink-0 text-primary" />
          <span
            className={cn(
              'font-bold text-foreground transition-all duration-200 whitespace-nowrap',
              collapsed && 'lg:hidden',
            )}
          >
            tradeox
          </span>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ── Nav links ──────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
            <li key={path}>
              <NavLink
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    collapsed ? 'lg:justify-center lg:px-0' : '',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-card hover:text-foreground',
                  )
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span
                  className={cn(
                    'whitespace-nowrap overflow-hidden transition-all duration-200',
                    collapsed && 'lg:hidden',
                  )}
                >
                  {label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-border p-2 space-y-0.5">
        {/* Settings */}
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              collapsed ? 'lg:justify-center lg:px-0' : '',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-card hover:text-foreground',
            )
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="h-[18px] w-[18px] flex-shrink-0" />
          <span className={cn('whitespace-nowrap overflow-hidden', collapsed && 'lg:hidden')}>
            Settings
          </span>
        </NavLink>

        {/* User row */}
        {!collapsed && (
          <div className="flex items-center justify-between rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">{emoji}</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{user?.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="ml-2 flex-shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Collapsed logout */}
        {collapsed && (
          <button
            onClick={handleLogout}
            title="Log out"
            className="flex w-full items-center justify-center rounded-xl py-2.5 text-muted-foreground transition-colors hover:text-destructive lg:px-0"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>
    </aside>
  )
}
