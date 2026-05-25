import { useLocation } from 'react-router-dom'
import { Menu, ChevronsLeft, ChevronsRight, Search, Bell } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/trade':       'Trade',
  '/portfolio':   'Portfolio',
  '/watchlist':   'Watchlist',
  '/analytics':   'Analytics',
  '/journal':     'Trade Journal',
  '/leaderboard': 'Leaderboard',
  '/settings':    'Settings',
}

const AVATAR_EMOJI: Record<string, string> = {
  av1: '🦊', av2: '🐬', av3: '🦁', av4: '🐉',
  av5: '🦋', av6: '🦅', av7: '🐺', av8: '🦈',
}

interface Props {
  collapsed: boolean
  onToggleCollapse: () => void
  onMobileToggle: () => void
  onOpenCmd: () => void
}

export default function Topbar({
  collapsed,
  onToggleCollapse,
  onMobileToggle,
  onOpenCmd,
}: Props) {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)

  const key = '/' + pathname.split('/')[1]
  const title = PAGE_TITLES[key] ?? 'TradeVault'
  const emoji = AVATAR_EMOJI[user?.avatar ?? 'av1'] ?? '🦊'

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-background px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileToggle}
          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-1.5 text-muted-foreground hover:text-foreground lg:flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronsRight className="h-5 w-5" />
          ) : (
            <ChevronsLeft className="h-5 w-5" />
          )}
        </button>

        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Cmd+K search trigger */}
        <button
          onClick={onOpenCmd}
          className={cn(
            'flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-1.5',
            'text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground',
          )}
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded bg-border px-1.5 py-0.5 text-[10px] font-mono sm:inline">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Unread dot */}
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* User avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-base">
          {emoji}
        </div>
      </div>
    </header>
  )
}
