import { useNavigate } from 'react-router-dom'
import { TrendingUp, LogOut, Rocket } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'

export default function DashboardPlaceholder() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const AVATARS: Record<string, string> = {
    av1: '🦊', av2: '🐬', av3: '🦁', av4: '🐉',
    av5: '🦋', av6: '🦅', av7: '🐺', av8: '🦈',
  }
  const emoji = user?.avatar ? (AVATARS[user.avatar] ?? '🦊') : '🦊'

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Topbar */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2 text-lg font-bold text-foreground">
          <TrendingUp className="h-5 w-5 text-primary" />
          tradeox
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {emoji} {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl">
          <Rocket className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard incoming, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Phase 4 — App Shell (Sidebar, Topbar, Ticker Strip) is up next.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 rounded-2xl border border-border bg-card p-6 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Portfolio</p>
            <p className="mt-1 font-bold text-foreground">
              {formatCurrency(user?.startingBalance ?? 100_000)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Currency</p>
            <p className="mt-1 font-bold text-foreground">{user?.currency ?? 'INR'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="mt-1 font-bold text-accent">Active</p>
          </div>
        </div>
      </main>
    </div>
  )
}
