import { Bookmark, Plus, TrendingUp } from 'lucide-react'
import { mockWatchlists, mockQuotes } from '@/lib/mock'
import { cn, formatCurrency } from '@/lib/utils'

export default function WatchlistPage() {
  const [activeList] = [mockWatchlists[0]]
  const list = mockWatchlists[0]

  return (
    <div className="mx-auto  space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Watchlist</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Track your favourite symbols.</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-[#4F46E5]">
          <Plus className="h-4 w-4" />
          Add Symbol
        </button>
      </div>

      {/* List tabs */}
      <div className="flex gap-2">
        {mockWatchlists.map((wl) => (
          <button
            key={wl.id}
            className={cn(
              'rounded-xl border px-4 py-1.5 text-sm font-medium transition-all',
              wl.id === activeList.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/40',
            )}
          >
            <Bookmark className="mr-1.5 inline h-3.5 w-3.5" />
            {wl.name}
            <span className="ml-1.5 text-xs opacity-60">{wl.items.length}</span>
          </button>
        ))}
      </div>

      {/* Symbol cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.items.map((item) => {
          const q = mockQuotes[item.symbol]
          if (!q) return null
          const up = q.changePct >= 0
          return (
            <div
              key={item.symbol}
              className="cursor-pointer rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono font-bold text-foreground">{q.symbol}</p>
                  <p className="text-xs text-muted-foreground">{q.name}</p>
                </div>
                <TrendingUp className={cn('h-4 w-4', up ? 'text-accent' : 'text-destructive rotate-180')} />
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-xl font-bold text-foreground">{formatCurrency(q.price)}</p>
                <div className="text-right">
                  <p className={cn('text-sm font-semibold', up ? 'text-accent' : 'text-destructive')}>
                    {up ? '+' : ''}{q.changePct.toFixed(2)}%
                  </p>
                  <p className={cn('text-xs', up ? 'text-accent/70' : 'text-destructive/70')}>
                    {up ? '+' : ''}{formatCurrency(q.change)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
