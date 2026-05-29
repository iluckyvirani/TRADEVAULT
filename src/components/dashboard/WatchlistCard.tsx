import { useRef } from 'react'
import { usePortfolioStore } from '@/store/portfolioStore'
import { mockWatchlists } from '@/lib/mock'
import { cn, formatCurrency } from '@/lib/utils'
import { Bookmark, TrendingUp, TrendingDown, ShoppingCart } from 'lucide-react'

interface Props {
  onSymbolClick?: (symbol: string) => void
  activeSymbol?: string
}

/** Flashes price cells green/red on tick. Uses CSS transition trick. */
export function WatchlistCard({ onSymbolClick, activeSymbol }: Props) {
  const liveQuotes = usePortfolioStore((s) => s.liveQuotes)
  const prevPricesRef = useRef<Record<string, number>>({})

  const list = mockWatchlists[0]

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Bookmark className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{list.name}</h3>
        <span className="ml-auto text-xs text-muted-foreground">{list.items.length} symbols</span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-border/50 px-4 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>Symbol</span>
        <span className="text-right">Price</span>
        <span className="text-right w-14">Chg%</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {list.items.map((item) => {
          const q = liveQuotes[item.symbol]
          if (!q) return null

          const prev = prevPricesRef.current[item.symbol]
          const direction: 'up' | 'down' | 'flat' =
            prev === undefined ? 'flat' : q.price > prev ? 'up' : q.price < prev ? 'down' : 'flat'
          prevPricesRef.current[item.symbol] = q.price

          const up = q.changePct >= 0

          return (
            <button
              key={item.symbol}
              onClick={() => onSymbolClick?.(item.symbol)}
              className={cn(
                'group grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-primary/5',
                activeSymbol === item.symbol && 'bg-primary/10 border-l-2 border-l-primary',
              )}
            >
              {/* Symbol + name */}
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold text-foreground">{q.symbol}</p>
                <p className="truncate text-[10px] text-muted-foreground">{q.name}</p>
              </div>

              {/* Price — flash on tick */}
              <span
                className={cn(
                  'text-sm font-semibold tabular-nums transition-colors duration-300',
                  direction === 'up' && 'text-accent',
                  direction === 'down' && 'text-destructive',
                  direction === 'flat' && 'text-foreground',
                )}
              >
                {formatCurrency(q.price)}
              </span>

              {/* Change % badge */}
              <div
                className={cn(
                  'flex w-14 items-center justify-end gap-0.5 text-xs font-semibold',
                  up ? 'text-accent' : 'text-destructive',
                )}
              >
                {up ? (
                  <TrendingUp className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <TrendingDown className="h-3 w-3 flex-shrink-0" />
                )}
                {up ? '+' : ''}{q.changePct.toFixed(2)}%
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 px-4 py-2">
        <button className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
          <ShoppingCart className="h-3.5 w-3.5" />
          Quick Trade
        </button>
      </div>
    </div>
  )
}
