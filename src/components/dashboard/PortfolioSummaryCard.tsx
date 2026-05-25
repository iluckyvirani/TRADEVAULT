import { usePortfolioStore } from '@/store/portfolioStore'
import { mockCandles } from '@/lib/mock'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

/** Tiny SVG sparkline from an array of close prices */
function Sparkline({ closes, up }: { closes: number[]; up: boolean }) {
  if (closes.length < 2) return null
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const range = max - min || 1
  const w = 80
  const h = 28
  const pts = closes
    .map((v, i) => {
      const x = (i / (closes.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={up ? '#10B981' : '#EF4444'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PortfolioSummaryCard() {
  const portfolio = usePortfolioStore((s) => s.portfolio)

  // 7-day sparkline from AAPL candles as proxy for portfolio
  const aaplCandles = mockCandles['AAPL'] ?? []
  const last7 = aaplCandles.slice(-7).map((c) => c.close)

  const stats = [
    {
      label: 'Total Portfolio',
      value: `$${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub: `${portfolio.totalPnL >= 0 ? '+' : ''}$${portfolio.totalPnL.toFixed(2)} (${portfolio.totalPnLPct >= 0 ? '+' : ''}${portfolio.totalPnLPct.toFixed(2)}%)`,
      up: portfolio.totalPnL >= 0,
      icon: DollarSign,
      spark: true,
    },
    {
      label: 'Day P&L',
      value: `${portfolio.dayPnL >= 0 ? '+' : ''}$${portfolio.dayPnL.toFixed(2)}`,
      sub: `${portfolio.dayPnLPct >= 0 ? '+' : ''}${portfolio.dayPnLPct.toFixed(2)}% today`,
      up: portfolio.dayPnL >= 0,
      icon: Activity,
      spark: false,
    },
    {
      label: 'Cash Available',
      value: `$${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub: `${((portfolio.cashBalance / portfolio.totalValue) * 100).toFixed(1)}% of portfolio`,
      up: true,
      icon: TrendingUp,
      spark: false,
    },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Portfolio Summary</h3>
      </div>

      <div className="divide-y divide-border/50">
        {stats.map(({ label, value, sub, up, icon: Icon, spark }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3.5">
            <div
              className={cn(
                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
                up ? 'bg-accent/10' : 'bg-destructive/10',
              )}
            >
              {up ? (
                <Icon className="h-4 w-4 text-accent" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-bold text-foreground">{value}</p>
              <p className={cn('text-xs', up ? 'text-accent' : 'text-destructive')}>{sub}</p>
            </div>

            {spark && <Sparkline closes={last7} up={up} />}
          </div>
        ))}
      </div>
    </div>
  )
}
