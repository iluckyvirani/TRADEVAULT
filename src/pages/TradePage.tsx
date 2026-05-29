import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { TrendingUp, TrendingDown, XCircle } from 'lucide-react'
import { useMockTicker } from '@/hooks/useMockTicker'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useOrdersStore } from '@/store/ordersStore'
import { ChartPanel } from '@/components/dashboard/ChartPanel'
import { OrderEntryPanel } from '@/components/dashboard/OrderEntryPanel'
import { RiskWarningBanner } from '@/components/trading/RiskWarningBanner'
import { cn, formatCurrency } from '@/lib/utils'
import type { OrderStatus } from '@/lib/mock'

type OrderTab = 'open' | 'filled' | 'all'

const STATUS_STYLES: Record<OrderStatus, string> = {
  open: 'bg-yellow-500/10 text-yellow-400',
  pending: 'bg-yellow-500/10 text-yellow-400',
  filled: 'bg-accent/10 text-accent',
  partially_filled: 'bg-blue-500/10 text-blue-400',
  cancelled: 'bg-muted text-muted-foreground',
  rejected: 'bg-destructive/10 text-destructive',
}

export default function TradePage() {
  const { symbol: paramSymbol } = useParams<{ symbol?: string }>()
  const [activeSymbol, setActiveSymbol] = useState(paramSymbol?.toUpperCase() ?? 'RELIANCE')
  const [orderTab, setOrderTab] = useState<OrderTab>('open')

  useMockTicker(1500)

  const liveQuotes = usePortfolioStore((s) => s.liveQuotes)
  const portfolio = usePortfolioStore((s) => s.portfolio)
  const orders = useOrdersStore((s) => s.orders)
  const cancelOrder = useOrdersStore((s) => s.cancelOrder)

  const filteredOrders = orders.filter((o) => {
    if (orderTab === 'open') return o.status === 'open' || o.status === 'pending'
    if (orderTab === 'filled')
      return o.status === 'filled' || o.status === 'partially_filled'
    return true
  })

  const openCount = orders.filter(
    (o) => o.status === 'open' || o.status === 'pending',
  ).length

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Trade</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Place market, limit, stop, and stop-limit orders with virtual funds.
          </p>
        </div>
        {/* Portfolio quick stats */}
        <div className="flex flex-wrap gap-3 text-right">
          <div className="rounded-xl border border-border bg-card px-4 py-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cash</p>
            <p className="font-mono text-sm font-bold text-accent">
              {formatCurrency(portfolio.cashBalance)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Portfolio
            </p>
            <p className="font-mono text-sm font-bold text-foreground">
              {formatCurrency(portfolio.totalValue)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Realised P&amp;L
            </p>
            <p
              className={cn(
                'font-mono text-sm font-bold',
                portfolio.realizedPnL >= 0 ? 'text-accent' : 'text-destructive',
              )}
            >
              {portfolio.realizedPnL >= 0 ? '+' : ''}{formatCurrency(portfolio.realizedPnL)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Risk Warning ── */}
      <RiskWarningBanner />

      {/* ── Live Quote Cards ── */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {Object.values(liveQuotes).map((q) => (
          <button
            key={q.symbol}
            onClick={() => setActiveSymbol(q.symbol)}
            className={cn(
              'rounded-xl border p-2.5 text-left transition-all',
              activeSymbol === q.symbol
                ? 'border-primary bg-primary/10 shadow-sm shadow-primary/20'
                : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5',
            )}
          >
            <div className="mb-1 font-mono text-[11px] font-bold text-foreground">
              {q.symbol}
            </div>
            <div className="font-mono text-sm font-bold tabular-nums text-foreground">
              {formatCurrency(q.price)}
            </div>
            <div
              className={cn(
                'mt-0.5 flex items-center gap-0.5 text-[10px] font-medium',
                q.changePct >= 0 ? 'text-accent' : 'text-destructive',
              )}
            >
              {q.changePct >= 0 ? (
                <TrendingUp className="h-2.5 w-2.5" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5" />
              )}
              {q.changePct >= 0 ? '+' : ''}
              {q.changePct.toFixed(2)}%
            </div>
          </button>
        ))}
      </div>

      {/* ── Chart + Order Entry ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px]">
        {/* Chart — fixed height so it never gets squished */}
        <div className="h-[500px]">
          <ChartPanel activeSymbol={activeSymbol} onSymbolChange={setActiveSymbol} />
        </div>

        {/* Order entry — key forces remount on symbol change so defaultSymbol takes effect */}
        <OrderEntryPanel key={activeSymbol} defaultSymbol={activeSymbol} />
      </div>

      {/* ── Orders Table ── */}
      <div className="rounded-2xl border border-border bg-card">
        {/* Tab header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Orders</h3>
          {openCount > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary/20 px-1.5 text-[10px] font-bold text-primary">
              {openCount}
            </span>
          )}
          <div className="ml-auto flex gap-1">
            {(['open', 'filled', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setOrderTab(tab)}
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-medium capitalize transition-all',
                  orderTab === tab
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filteredOrders.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No {orderTab === 'all' ? '' : orderTab + ' '}orders to display.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 text-left">Symbol</th>
                  <th className="px-4 py-2.5 text-left">Side</th>
                  <th className="hidden px-4 py-2.5 text-left sm:table-cell">Type</th>
                  <th className="px-4 py-2.5 text-right">Qty</th>
                  <th className="hidden px-4 py-2.5 text-right md:table-cell">Limit / Stop</th>
                  <th className="hidden px-4 py-2.5 text-right sm:table-cell">Fill Price</th>
                  <th className="hidden px-4 py-2.5 text-right lg:table-cell">Value</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="hidden px-4 py-2.5 text-left md:table-cell">Date</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o, i) => (
                  <tr
                    key={o.id}
                    className={cn(
                      'transition-colors hover:bg-primary/5',
                      i < filteredOrders.length - 1 && 'border-b border-border/30',
                    )}
                  >
                    {/* Symbol */}
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => setActiveSymbol(o.symbol)}
                        className="font-mono font-bold text-foreground hover:text-primary"
                      >
                        {o.symbol}
                      </button>
                      <p className="max-w-[120px] truncate text-[10px] text-muted-foreground">
                        {o.name}
                      </p>
                    </td>

                    {/* Side */}
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          'rounded-lg px-2 py-0.5 text-[10px] font-bold',
                          o.side === 'buy'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-destructive/10 text-destructive',
                        )}
                      >
                        {o.side.toUpperCase()}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="hidden px-4 py-2.5 text-xs text-muted-foreground sm:table-cell">
                      <span className="capitalize">{o.type.replace('_', '-')}</span>
                      {o.stopTriggered && o.status === 'open' && (
                        <span className="ml-1 rounded bg-orange-500/10 px-1 text-[9px] text-orange-400">
                          triggered
                        </span>
                      )}
                    </td>

                    {/* Qty */}
                    <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                      {o.filledQuantity > 0 && o.filledQuantity < o.quantity ? (
                        <span>
                          <span className="font-medium text-blue-400">{o.filledQuantity}</span>
                          <span className="text-muted-foreground">/{o.quantity}</span>
                        </span>
                      ) : (
                        o.quantity
                      )}
                    </td>

                    {/* Limit / Stop prices */}
                    <td className="hidden px-4 py-2.5 text-right text-xs text-muted-foreground md:table-cell">
                      {o.limitPrice !== undefined && (
                        <div>
                          <span className="text-foreground">{formatCurrency(o.limitPrice)}</span>
                          <span className="ml-0.5 text-[9px]">lmt</span>
                        </div>
                      )}
                      {o.stopPrice !== undefined && (
                        <div>
                          <span className="text-foreground">{formatCurrency(o.stopPrice)}</span>
                          <span className="ml-0.5 text-[9px]">stp</span>
                        </div>
                      )}
                      {o.limitPrice === undefined && o.stopPrice === undefined && (
                        <span>—</span>
                      )}
                    </td>

                    {/* Fill price */}
                    <td className="hidden px-4 py-2.5 text-right tabular-nums sm:table-cell">
                      {o.filledPrice !== undefined ? (
                        <span className="font-medium text-foreground">
                          {formatCurrency(o.filledPrice)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Total value */}
                    <td className="hidden px-4 py-2.5 text-right tabular-nums text-foreground lg:table-cell">
                      {formatCurrency(o.totalValue)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                          STATUS_STYLES[o.status],
                        )}
                      >
                        {o.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="hidden px-4 py-2.5 text-xs text-muted-foreground md:table-cell">
                      {format(new Date(o.createdAt), 'MMM d, HH:mm')}
                    </td>

                    {/* Cancel */}
                    <td className="px-4 py-2.5">
                      {(o.status === 'open' || o.status === 'pending') && (
                        <button
                          onClick={() => cancelOrder(o.id)}
                          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                        >
                          <XCircle className="h-3 w-3" />
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
