import { usePortfolioStore } from '@/store/portfolioStore'
import { cn, formatCurrency } from '@/lib/utils'
import { Globe } from 'lucide-react'

const INDICES = [
  { symbol: 'NIFTY', label: 'NIFTY 50' },
  { symbol: 'BANKNIFTY', label: 'BANKNIFTY' },
]

const MOCK_INDICES = [
  { label: 'NSE 100', price: 28450.80, changePct: 0.57 },
  { label: 'India VIX', price: 14.32, changePct: -1.25 },
  { label: 'NSE Mid Cap', price: 18920.65, changePct: 0.82 },
]

const SECTORS = [
  { name: 'Technology',    changePct:  1.8 },
  { name: 'Healthcare',    changePct:  0.4 },
  { name: 'Financials',    changePct:  0.9 },
  { name: 'Energy',        changePct: -1.2 },
  { name: 'Consumer Disc', changePct:  0.6 },
  { name: 'Industrials',   changePct:  0.2 },
  { name: 'Utilities',     changePct: -0.5 },
  { name: 'Real Estate',   changePct: -0.8 },
]

export function MarketOverviewCard() {
  const liveQuotes = usePortfolioStore((s) => s.liveQuotes)

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Globe className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Market Overview</h3>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Mock Open
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Indices */}
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Indices
          </p>
          <div className="space-y-1.5">
            {/* Live from store */}
            {INDICES.map(({ symbol, label }) => {
              const q = liveQuotes[symbol]
              if (!q) return null
              const up = q.changePct >= 0
              return (
                <div key={symbol} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-foreground">
                      {formatCurrency(q.price)}
                    </span>
                    <span
                      className={cn(
                        'w-14 text-right text-xs font-semibold',
                        up ? 'text-accent' : 'text-destructive',
                      )}
                    >
                      {up ? '+' : ''}{q.changePct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )
            })}
            {/* Static mock */}
            {MOCK_INDICES.map((idx) => {
              const up = idx.changePct >= 0
              return (
                <div key={idx.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{idx.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-foreground">
                      {idx.label === 'India VIX' ? idx.price.toFixed(2) : formatCurrency(idx.price)}
                    </span>
                    <span
                      className={cn(
                        'w-14 text-right text-xs font-semibold',
                        up ? 'text-accent' : 'text-destructive',
                      )}
                    >
                      {up ? '+' : ''}{idx.changePct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sector heatmap */}
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Sectors
          </p>
          <div className="grid grid-cols-4 gap-1">
            {SECTORS.map((sector) => {
              const up = sector.changePct >= 0
              const intensity = Math.min(Math.abs(sector.changePct) / 2, 1)
              return (
                <div
                  key={sector.name}
                  title={sector.name}
                  className={cn(
                    'flex flex-col items-center justify-center rounded-lg p-1.5 text-center',
                    up ? 'bg-accent/10' : 'bg-destructive/10',
                  )}
                  style={{ opacity: 0.5 + intensity * 0.5 }}
                >
                  <p className="text-[9px] leading-tight text-muted-foreground">{sector.name}</p>
                  <p
                    className={cn(
                      'text-[10px] font-bold',
                      up ? 'text-accent' : 'text-destructive',
                    )}
                  >
                    {up ? '+' : ''}{sector.changePct.toFixed(1)}%
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
