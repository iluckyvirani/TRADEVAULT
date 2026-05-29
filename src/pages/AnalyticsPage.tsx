import { useState } from 'react'
import { TrendingUp, Activity, Shield, BarChart2, Target, Zap } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useOrdersStore } from '@/store/ordersStore'
import { dailyReturns, calcSharpeRatio, calcMaxDrawdown, calcWinRate, calcAvgWin, calcAvgLoss } from '@/lib/calculations'
import { cn, formatCurrency } from '@/lib/utils'

// Generate mock P&L history (90 trading days)
function genPnLHistory(startValue: number) {
  const data: { date: string; value: number; pnl: number }[] = []
  let v = startValue
  const start = new Date('2025-12-01')
  for (let i = 0; i < 90; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    const change = (Math.random() - 0.46) * 0.018 * v
    v = Math.max(v + change, startValue * 0.8)
    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat(v.toFixed(2)),
      pnl: parseFloat((v - startValue).toFixed(2)),
    })
  }
  return data
}

type Tab = 'pnl' | 'risk' | 'trades'

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('pnl')
  const portfolio = usePortfolioStore((s) => s.portfolio)
  const orders = useOrdersStore((s) => s.orders)

  const filled = orders.filter((o) => o.status === 'filled')
  const pnlHistory = genPnLHistory(100_000)
  const values = pnlHistory.map((d) => d.value)
  const rets = dailyReturns(values)

  // Derive per-trade P&L: sell fills use filledPrice vs limitPrice fallback; buys contribute 0 as placeholder
  const tradePnLs = filled
    .filter((o) => o.side === 'sell')
    .map((o) => (o.filledPrice ?? 0) * o.quantity - (o.limitPrice ?? o.filledPrice ?? 0) * o.quantity)

  const sharpe = calcSharpeRatio(rets)
  const maxDD = calcMaxDrawdown(values)
  const winRate = calcWinRate(tradePnLs.length > 0 ? tradePnLs : rets)
  const avgWin = calcAvgWin(tradePnLs.length > 0 ? tradePnLs : rets)
  const avgLoss = calcAvgLoss(tradePnLs.length > 0 ? tradePnLs : rets)
  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0
  const totalReturn = pnlHistory.length > 0
    ? ((pnlHistory[pnlHistory.length - 1].value - 100_000) / 100_000 * 100).toFixed(2)
    : '0.00'

  const riskCards = [
    { label: 'Sharpe Ratio',   value: sharpe.toFixed(2),          note: 'Risk-adjusted return',    icon: TrendingUp, color: sharpe >= 1 ? 'text-accent' : 'text-foreground' },
    { label: 'Max Drawdown',   value: `-${maxDD.toFixed(1)}%`,    note: 'Peak-to-trough decline',  icon: Shield,     color: 'text-destructive' },
    { label: 'Win Rate',       value: `${winRate.toFixed(0)}%`,   note: `${filled.length} closed trades`, icon: Target,  color: winRate >= 50 ? 'text-accent' : 'text-foreground' },
    { label: 'Profit Factor',  value: profitFactor.toFixed(2),    note: 'Avg win / avg loss',      icon: Zap,        color: profitFactor >= 1 ? 'text-accent' : 'text-destructive' },
    { label: 'Total Return',   value: `${Number(totalReturn) >= 0 ? '+' : ''}${totalReturn}%`, note: 'Since inception', icon: BarChart2, color: Number(totalReturn) >= 0 ? 'text-accent' : 'text-destructive' },
    { label: 'Portfolio Beta', value: '1.18',                     note: 'vs S&P 500',              icon: Activity,   color: 'text-foreground' },
  ]

  const lastPnl = pnlHistory[pnlHistory.length - 1]?.pnl ?? 0
  const chartColor = lastPnl >= 0 ? '#10B981' : '#EF4444'

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Analytics</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Performance attribution, risk metrics, and trade statistics.
          </p>
        </div>
        {/* Tabs */}
        <div className="flex rounded-xl border border-border bg-card p-1 text-sm">
          {(['pnl', 'risk', 'trades'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-lg px-3 py-1.5 font-medium capitalize transition-all',
                tab === t ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t === 'pnl' ? 'P&L' : t === 'risk' ? 'Risk' : 'Trades'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'pnl' && (
        <>
          {/* P&L Summary strip */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Portfolio Value',  value: formatCurrency(portfolio.totalValue) },
              { label: 'Unrealized P&L',  value: `${portfolio.totalPnL >= 0 ? '+' : ''}${formatCurrency(portfolio.totalPnL)}`, color: portfolio.totalPnL >= 0 ? 'text-accent' : 'text-destructive' },
              { label: 'Day P&L',          value: `${portfolio.dayPnL >= 0 ? '+' : ''}${formatCurrency(portfolio.dayPnL)}`, color: portfolio.dayPnL >= 0 ? 'text-accent' : 'text-destructive' },
              { label: 'Cash Balance',     value: formatCurrency(portfolio.cashBalance) },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={cn('mt-1 text-xl font-bold', s.color ?? 'text-foreground')}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* P&L Area Chart */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Portfolio P&L — 90 Days</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Simulated daily portfolio value</p>
              </div>
              <span className={cn('text-sm font-bold', lastPnl >= 0 ? 'text-accent' : 'text-destructive')}>
                {lastPnl >= 0 ? '+' : ''}{formatCurrency(lastPnl)}
              </span>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pnlHistory} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} tickLine={false} axisLine={false} interval={9} />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    width={46}
                  />
                  <Tooltip
                    contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                    labelStyle={{ color: '#94A3B8' }}
                    formatter={(v) => [formatCurrency(Number(v)), 'Portfolio']}
                  />
                  <ReferenceLine y={100_000} stroke="#334155" strokeDasharray="4 2" label={{ value: 'Start', fill: '#475569', fontSize: 10 }} />
                  <Area type="monotone" dataKey="value" stroke={chartColor} strokeWidth={2} fill="url(#pnlGrad)" dot={false} activeDot={{ r: 4, fill: chartColor }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {tab === 'risk' && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {riskCards.map((m) => (
            <div key={m.label} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <m.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
              </div>
              <p className={cn('text-2xl font-bold', m.color)}>{m.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'trades' && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="font-semibold text-foreground">Closed Trades</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{filled.length} filled orders</p>
          </div>
          {filled.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No filled orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 text-left">Symbol</th>
                    <th className="px-5 py-3 text-left">Side</th>
                    <th className="px-5 py-3 text-right">Qty</th>
                    <th className="px-5 py-3 text-right">Fill Price</th>
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filled.map((o, i) => (
                    <tr key={o.id} className={cn('transition-colors hover:bg-primary/5', i < filled.length - 1 && 'border-b border-border/30')}>
                      <td className="px-5 py-3 font-mono font-bold text-foreground">{o.symbol}</td>
                      <td className="px-5 py-3">
                        <span className={cn('rounded-lg px-2 py-0.5 text-[10px] font-bold', o.side === 'buy' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive')}>
                          {o.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-muted-foreground">{o.quantity}</td>
                      <td className="px-5 py-3 text-right font-medium text-foreground">
                        {o.filledPrice !== undefined ? formatCurrency(o.filledPrice) : '—'}
                      </td>
                      <td className="px-5 py-3 capitalize text-muted-foreground">{o.type}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

