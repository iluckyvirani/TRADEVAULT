import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import {
  Home, TrendingUp, PieChart, Bookmark, BarChart2,
  BookOpen, Trophy, Settings, Search, X,
  type LucideIcon,
} from 'lucide-react'
import { mockQuotes } from '@/lib/mock'
import { cn, formatCurrency } from '@/lib/utils'

interface NavAction { icon: LucideIcon; label: string; path: string }

const NAV_ACTIONS: NavAction[] = [
  { icon: Home,       label: 'Dashboard',   path: '/dashboard' },
  { icon: TrendingUp, label: 'Trade',       path: '/trade' },
  { icon: PieChart,   label: 'Portfolio',   path: '/portfolio' },
  { icon: Bookmark,   label: 'Watchlist',   path: '/watchlist' },
  { icon: BarChart2,  label: 'Analytics',   path: '/analytics' },
  { icon: BookOpen,   label: 'Journal',     path: '/journal' },
  { icon: Trophy,     label: 'Leaderboard', path: '/leaderboard' },
  { icon: Settings,   label: 'Settings',    path: '/settings' },
]

const QUOTES = Object.values(mockQuotes)

interface Props {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate()

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  function go(path: string) {
    navigate(path)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/50">
        <Command>
          {/* Input row */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Search symbols or navigate…"
              className="flex-1 bg-transparent py-1 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {/* Navigation */}
            <Command.Group heading="Navigate">
              {NAV_ACTIONS.map(({ icon: Icon, label, path }) => (
                <Command.Item
                  key={path}
                  value={label}
                  onSelect={() => go(path)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span>{label}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator />

            {/* Symbols */}
            <Command.Group heading="Symbols">
              {QUOTES.map((q) => (
                <Command.Item
                  key={q.symbol}
                  value={`${q.symbol} ${q.name}`}
                  onSelect={() => go(`/trade/${q.symbol}`)}
                >
                  <span
                    className={cn(
                      'w-14 flex-shrink-0 font-mono text-xs font-bold',
                      q.changePct >= 0 ? 'text-accent' : 'text-destructive',
                    )}
                  >
                    {q.symbol}
                  </span>
                  <span className="flex-1 truncate text-muted-foreground">{q.name}</span>
                  <span
                    className={cn(
                      'ml-2 flex-shrink-0 text-xs font-medium',
                      q.changePct >= 0 ? 'text-accent' : 'text-destructive',
                    )}
                  >
                    {formatCurrency(q.price)}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer hint */}
          <div className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground flex gap-4">
            <span><kbd className="font-mono">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono">↵</kbd> Select</span>
            <span><kbd className="font-mono">Esc</kbd> Close</span>
          </div>
        </Command>
      </div>
    </div>
  )
}
