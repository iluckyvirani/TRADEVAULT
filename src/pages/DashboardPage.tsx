import { useState } from 'react'
import { useMockTicker } from '@/hooks/useMockTicker'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useOrdersStore } from '@/store/ordersStore'
import { ChartPanel } from '@/components/dashboard/ChartPanel'
import { OrderEntryPanel } from '@/components/dashboard/OrderEntryPanel'
import { WatchlistCard } from '@/components/dashboard/WatchlistCard'
import { PortfolioSummaryCard } from '@/components/dashboard/PortfolioSummaryCard'
import { MarketOverviewCard } from '@/components/dashboard/MarketOverviewCard'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function DashboardPage() {
  // Start mock price simulation
  useMockTicker(1500)

  const [activeSymbol, setActiveSymbol] = useState('AAPL')
  const portfolio = usePortfolioStore((s) => s.portfolio)
  const orders = useOrdersStore((s) => s.orders)
  const cancelOrder = useOrdersStore((s) => s.cancelOrder)

  const recentOrders = orders.slice(0, 8)

  return (
    <div className="space-y-4">
      {/* ── Row 1: Chart (left, fixed height) + Right panel (stacks naturally) ── */}
      <div className="grid grid-cols-1 gap-4 lg:items-start lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]">

        {/* Left — Chart (fixed height) */}
        <div className="h-[480px]">
          <ChartPanel activeSymbol={activeSymbol} onSymbolChange={setActiveSymbol} />
        </div>

        {/* Right panel — natural height, scrollable if needed */}
        <div className="flex flex-col gap-4">
          <PortfolioSummaryCard />
          <WatchlistCard activeSymbol={activeSymbol} onSymbolClick={setActiveSymbol} />
        </div>
      </div>

      {/* ── Row 2: Positions (left) + Order Entry (right) ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]">
        {/* Positions table */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Open Positions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2 text-left">Symbol</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Avg Cost</th>
                  <th className="px-4 py-2 text-right">Current</th>
                  <th className="px-4 py-2 text-right">Mkt Val</th>
                  <th className="px-4 py-2 text-right">P&L</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.positions.slice(0, 5).map((pos, i) => (
                  <tr
                    key={pos.symbol}
                    onClick={() => setActiveSymbol(pos.symbol)}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-primary/5',
                      i < portfolio.positions.length - 1 && 'border-b border-border/30',
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <div>
                        <span className="font-mono font-bold text-foreground">{pos.symbol}</span>
                        <p className="text-[10px] text-muted-foreground">{pos.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{pos.quantity}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">
                      ${pos.avgCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                      ${pos.currentPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-foreground">
                      ${pos.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-2.5 text-right font-semibold tabular-nums',
                        pos.unrealizedPnL >= 0 ? 'text-accent' : 'text-destructive',
                      )}
                    >
                      {pos.unrealizedPnL >= 0 ? '+' : ''}${pos.unrealizedPnL.toFixed(2)}
                      <span className="ml-1 text-[10px] opacity-70">
                        ({pos.unrealizedPnLPct >= 0 ? '+' : ''}{pos.unrealizedPnLPct.toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Entry */}
        <OrderEntryPanel defaultSymbol={activeSymbol} />
      </div>

      {/* ── Row 3: Market Overview + Recent Orders ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MarketOverviewCard />

        {/* Recent Orders */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
          </div>
          <div className="divide-y divide-border/40">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                <span
                  className={cn(
                    'flex-shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold',
                    o.side === 'buy'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-destructive/10 text-destructive',
                  )}
                >
                  {o.side.toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-bold text-foreground">{o.symbol}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {o.quantity} shares · {o.type}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
                      o.status === 'filled'
                        ? 'bg-accent/10 text-accent'
                        : o.status === 'open'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : o.status === 'cancelled'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-destructive/10 text-destructive',
                    )}
                  >
                    {o.status}
                  </span>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {format(new Date(o.createdAt), 'MMM d')}
                  </p>
                </div>
                {(o.status === 'open' || o.status === 'pending') && (
                  <button
                    onClick={() => cancelOrder(o.id)}
                    className="flex-shrink-0 rounded-lg border border-border px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
