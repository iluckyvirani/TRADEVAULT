import { PieChart as PieIcon, TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { usePortfolioStore } from '@/store/portfolioStore'
import { cn, formatCurrency } from '@/lib/utils'

const DONUT_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899']

export default function PortfolioPage() {
  const portfolio = usePortfolioStore((s) => s.portfolio)
  const p = portfolio
  const totalEquity = p.positions.reduce((s, pos) => s + pos.marketValue, 0)
  const donutData = p.positions.map((pos) => ({
    name: pos.symbol,
    value: parseFloat(pos.marketValue.toFixed(2)),
    pct: totalEquity > 0 ? ((pos.marketValue / totalEquity) * 100).toFixed(1) : '0',
  }))

  const summaryCards = [
    {
      label: 'Total Portfolio',
      value: formatCurrency(p.totalValue),
      sub: `${p.totalPnLPct >= 0 ? '+' : ''}${p.totalPnLPct.toFixed(2)}% all-time`,
      positive: p.totalPnLPct >= 0,
      icon: DollarSign,
    },
    {
      label: 'Day P&L',
      value: `${p.dayPnL >= 0 ? '+' : ''}${formatCurrency(p.dayPnL)}`,
      sub: `${p.dayPnLPct >= 0 ? '+' : ''}${p.dayPnLPct.toFixed(2)}% today`,
      positive: p.dayPnL >= 0,
      icon: p.dayPnL >= 0 ? TrendingUp : TrendingDown,
    },
    {
      label: 'Cash Available',
      value: formatCurrency(p.cashBalance),
      sub: `${totalEquity > 0 ? ((p.cashBalance / p.totalValue) * 100).toFixed(1) : '0'}% of portfolio`,
      positive: true,
      icon: BarChart2,
    },
    {
      label: 'Unrealized P&L',
      value: `${p.totalPnL >= 0 ? '+' : ''}${formatCurrency(p.totalPnL)}`,
      sub: 'Open positions',
      positive: p.totalPnL >= 0,
      icon: PieIcon,
    },
  ]

  return (
    <div className="mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Portfolio</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Your holdings, allocation, and performance.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <p className={cn('text-xl font-bold', s.positive ? 'text-foreground' : 'text-destructive')}>
              {s.value}
            </p>
            <p className={cn('mt-1 text-xs font-medium', s.positive ? 'text-accent' : 'text-destructive')}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Donut chart + Allocation breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
        {/* Donut chart */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Allocation</h3>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {donutData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ color: '#F1F5F9' }}
                  formatter={(value, name) => [formatCurrency(Number(value)), String(name)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-3 space-y-1.5">
            {donutData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                    style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                  />
                  <span className="font-mono font-semibold text-foreground">{d.name}</span>
                </div>
                <span className="text-muted-foreground">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Positions table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-semibold text-foreground">All Positions</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{p.positions.length} open positions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-left">Symbol</th>
                  <th className="px-5 py-3 text-right">Qty</th>
                  <th className="hidden px-5 py-3 text-right sm:table-cell">Avg Cost</th>
                  <th className="px-5 py-3 text-right">Current</th>
                  <th className="hidden px-5 py-3 text-right md:table-cell">Market Val</th>
                  <th className="px-5 py-3 text-right">P&L</th>
                  <th className="hidden px-5 py-3 text-right sm:table-cell">P&L %</th>
                  <th className="hidden px-5 py-3 text-right lg:table-cell">Weight</th>
                </tr>
              </thead>
              <tbody>
                {p.positions.map((pos, i) => (
                  <tr
                    key={pos.symbol}
                    className={cn(
                      'transition-colors hover:bg-primary/5',
                      i < p.positions.length - 1 && 'border-b border-border/30',
                    )}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                          style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                        />
                        <div>
                          <span className="font-mono font-bold text-foreground">{pos.symbol}</span>
                          <p className="text-[10px] text-muted-foreground">{pos.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{pos.quantity}</td>
                    <td className="hidden px-5 py-3 text-right text-muted-foreground sm:table-cell">{formatCurrency(pos.avgCost)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-foreground">{formatCurrency(pos.currentPrice)}</td>
                    <td className="hidden px-5 py-3 text-right font-medium text-foreground md:table-cell">
                      {formatCurrency(pos.marketValue)}
                    </td>
                    <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', pos.unrealizedPnL >= 0 ? 'text-accent' : 'text-destructive')}>
                      {pos.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(pos.unrealizedPnL)}
                    </td>
                    <td className={cn('hidden px-5 py-3 text-right font-medium sm:table-cell', pos.unrealizedPnLPct >= 0 ? 'text-accent' : 'text-destructive')}>
                      {pos.unrealizedPnLPct >= 0 ? '+' : ''}{pos.unrealizedPnLPct.toFixed(2)}%
                    </td>
                    <td className="hidden px-5 py-3 text-right text-muted-foreground lg:table-cell">
                      {totalEquity > 0 ? ((pos.marketValue / totalEquity) * 100).toFixed(1) : '0'}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-card/50 text-xs font-semibold text-muted-foreground">
                  <td className="px-5 py-3" colSpan={2}>Total Equity</td>
                  <td className="hidden px-5 py-3 sm:table-cell" />
                  <td className="px-5 py-3" />
                  <td className="hidden px-5 py-3 text-right text-foreground md:table-cell">
                    {formatCurrency(totalEquity)}
                  </td>
                  <td className={cn('px-5 py-3 text-right font-bold', p.totalPnL >= 0 ? 'text-accent' : 'text-destructive')}>
                    {p.totalPnL >= 0 ? '+' : ''}{formatCurrency(p.totalPnL)}
                  </td>
                  <td className="hidden sm:table-cell" />
                  <td className="hidden lg:table-cell" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
