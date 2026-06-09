import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ClipboardList, Layers, XCircle } from 'lucide-react'
import {
  useEvaluationTradingStore,
  type EvaluationOrder,
} from '@/store/evaluationTradingStore'
import { useTradingPanelTheme } from '@/hooks/useTradingPanelTheme'
import { cn, formatCurrency } from '@/lib/utils'

type OrderFilter = 'all' | 'live' | 'filled' | 'cancelled'

const FILTERS: { id: OrderFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'filled', label: 'Filled' },
  { id: 'cancelled', label: 'Cancelled' },
]

const LIVE_STATUSES = new Set(['open', 'pending', 'partially_filled'])

interface Props {
  accountId: string
}

export default function OrdersTabPanel({ accountId }: Props) {
  const t = useTradingPanelTheme()
  const allOrders = useEvaluationTradingStore((s) => s.orders)
  const cancelOrder = useEvaluationTradingStore((s) => s.cancelOrder)
  const [filter, setFilter] = useState<OrderFilter>('all')

  const orders = useMemo(
    () => allOrders.filter((o) => o.accountId === accountId),
    [allOrders, accountId],
  )

  const liveCount = orders.filter((o) => LIVE_STATUSES.has(o.status)).length

  const filtered = useMemo(() => {
    switch (filter) {
      case 'live':
        return orders.filter((o) => LIVE_STATUSES.has(o.status))
      case 'filled':
        return orders.filter((o) => o.status === 'filled')
      case 'cancelled':
        return orders.filter((o) => o.status === 'cancelled' || o.status === 'rejected')
      default:
        return orders
    }
  }, [orders, filter])

  const filterCounts = useMemo(
    () => ({
      all: orders.length,
      live: liveCount,
      filled: orders.filter((o) => o.status === 'filled').length,
      cancelled: orders.filter(
        (o) => o.status === 'cancelled' || o.status === 'rejected',
      ).length,
    }),
    [orders, liveCount],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn('border-b px-2 py-2', t.border)}>
        <div className={cn('rounded-xl border p-3', t.border, t.cardBg)}>
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                t.iconBg,
              )}
            >
              <ClipboardList className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Orders
              </p>
              <p className={cn('text-sm font-semibold', t.textPrimary)}>
                {orders.length} total • {liveCount} live
              </p>
            </div>
          </div>
          <div className={cn('mt-3 border-t pt-3', t.border)}>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map(({ id, label }) => {
                const active = filter === id
                const count = filterCounts[id]
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors',
                      active ? t.filterActive : t.filterInactive,
                    )}
                  >
                    {label}
                    <span
                      className={cn(
                        'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px]',
                        active ? t.filterCountActive : t.filterCountInactive,
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div
            className={cn(
              'flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center',
              t.borderDashed,
            )}
          >
            <Layers className={cn('h-8 w-8', t.textFaint)} strokeWidth={1.5} />
            <p className={cn('mt-3 text-sm font-semibold', t.textPrimary)}>No orders</p>
            <p className="mt-1 text-[11px] text-gray-500">Order activity will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {filtered.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                theme={t}
                onCancel={() => cancelOrder(order.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function OrderRow({
  order,
  theme: t,
  onCancel,
}: {
  order: EvaluationOrder
  theme: ReturnType<typeof useTradingPanelTheme>
  onCancel: () => void
}) {
  const sideCls = order.side === 'buy'
    ? t.isDark
      ? 'text-emerald-400'
      : 'text-emerald-600'
    : t.isDark
      ? 'text-rose-400'
      : 'text-rose-600'

  const statusStyles: Record<string, string> = t.isDark
    ? {
        filled: 'bg-emerald-500/15 text-emerald-300',
        open: 'bg-amber-500/15 text-amber-300',
        rejected: 'bg-rose-500/15 text-rose-300',
        cancelled: 'bg-white/10 text-gray-400',
        pending: 'bg-amber-500/15 text-amber-300',
        partially_filled: 'bg-sky-500/15 text-sky-300',
      }
    : {
        filled: 'bg-emerald-100 text-emerald-700',
        open: 'bg-amber-100 text-amber-700',
        rejected: 'bg-rose-100 text-rose-700',
        cancelled: 'bg-gray-100 text-gray-500',
        pending: 'bg-amber-100 text-amber-700',
        partially_filled: 'bg-sky-100 text-sky-700',
      }

  return (
    <li className={cn('rounded-xl border p-3', t.border, t.cardBg)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={cn('text-xs font-semibold', t.textPrimary)}>{order.name}</p>
          <p className="mt-0.5 text-[10px] text-gray-500">{order.symbol}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize',
            statusStyles[order.status] ?? t.badgeDefault,
          )}
        >
          {order.status.replace('_', ' ')}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span>
          <span className={cn('font-bold uppercase', sideCls)}>{order.side}</span>
          <span className={t.textMuted}>
            {' '}
            · {order.lots} lot · {order.type}
          </span>
        </span>
        {order.filledPrice != null && (
          <span className={cn('font-medium', t.textPrimary)}>
            {formatCurrency(order.filledPrice)}
          </span>
        )}
      </div>
      <p className={cn('mt-1 text-[10px]', t.textFaint)}>
        {format(new Date(order.createdAt), 'MMM d, HH:mm')}
      </p>
      {order.status === 'open' && (
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            'mt-2 flex items-center gap-1 text-[10px]',
            t.isDark ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-700',
          )}
        >
          <XCircle className="h-3 w-3" />
          Cancel
        </button>
      )}
    </li>
  )
}
