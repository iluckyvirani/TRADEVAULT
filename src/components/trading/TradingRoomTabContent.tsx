import { useMemo } from 'react'
import { format } from 'date-fns'
import { XCircle } from 'lucide-react'
import { getInstrumentById } from '@/lib/mock/mockInstruments'
import {
  useEvaluationTradingStore,
  type EvaluationOrder,
} from '@/store/evaluationTradingStore'
import { useInstrumentStore } from '@/store/instrumentStore'
import type { RoomTab } from '@/store/tradingRoomStore'
import { useThemeStore } from '@/store/themeStore'
import { cn, formatCurrency } from '@/lib/utils'

interface Props {
  accountId: string
  tab: RoomTab
  onSelectInstrument: (id: string) => void
  onOpenSearch: () => void
}

export default function TradingRoomTabContent({
  accountId,
  tab,
  onSelectInstrument,
  onOpenSearch,
}: Props) {
  const isDark = useThemeStore((s) => s.mode === 'dark')
  const allOrders = useEvaluationTradingStore((s) => s.orders)
  const allPositions = useEvaluationTradingStore((s) => s.positions)
  const baskets = useEvaluationTradingStore((s) => s.baskets)
  const watchlistIds = useInstrumentStore((s) => s.watchlistIds)
  const cancelOrder = useEvaluationTradingStore((s) => s.cancelOrder)

  const orders = useMemo(
    () => allOrders.filter((o) => o.accountId === accountId),
    [allOrders, accountId],
  )
  const positions = useMemo(
    () =>
      allPositions.filter(
        (p) => p.accountId === accountId && p.lots > 0,
      ),
    [allPositions, accountId],
  )
  const basketIds = useMemo(
    () => baskets[accountId] ?? [],
    [baskets, accountId],
  )

  const emptyCls = isDark ? 'text-gray-500' : 'text-gray-400'

  if (tab === 'watch') {
    const ids = watchlistIds.length > 0 ? watchlistIds : []
    if (ids.length === 0) {
      return (
        <div className={cn('px-2 py-6 text-center text-xs', emptyCls)}>
          <p>No watchlist yet</p>
          <p className="mt-1">Create a watchlist and add contracts you want to track.</p>
          <button
            type="button"
            onClick={onOpenSearch}
            className="mt-3 text-blue-400 hover:underline"
          >
            + Add symbol
          </button>
        </div>
      )
    }
    return (
      <ul className="space-y-1 p-2">
        {ids.map((id) => {
          const inst = getInstrumentById(id)
          if (!inst) return null
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelectInstrument(id)}
                className={cn(
                  'w-full rounded-lg px-2 py-2 text-left text-xs hover:bg-white/5',
                  isDark ? 'text-white' : 'text-gray-900',
                )}
              >
                <span className="font-semibold">{inst.symbol}</span>
                <span className={cn('ml-2 font-mono', emptyCls)}>
                  {formatCurrency(inst.lastPrice)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  if (tab === 'baskets') {
    if (basketIds.length === 0) {
      return (
        <p className={cn('px-2 py-8 text-center text-xs', emptyCls)}>
          No baskets yet. Add symbols from search to build a basket.
        </p>
      )
    }
    return (
      <ul className="space-y-1 p-2">
        {basketIds.map((id) => {
          const inst = getInstrumentById(id)
          if (!inst) return null
          return (
            <li
              key={id}
              className={cn(
                'flex items-center justify-between rounded-lg px-2 py-2 text-xs',
                isDark ? 'bg-white/5 text-white' : 'bg-gray-50 text-gray-900',
              )}
            >
              <span>{inst.displayName}</span>
              <button
                type="button"
                onClick={() => onSelectInstrument(id)}
                className="text-blue-400 hover:underline"
              >
                Trade
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  if (tab === 'orders') {
    if (orders.length === 0) {
      return (
        <p className={cn('px-2 py-8 text-center text-xs', emptyCls)}>No orders yet</p>
      )
    }
    return (
      <ul className="max-h-full space-y-1 overflow-y-auto p-2">
        {orders.map((o) => (
          <OrderRow
            key={o.id}
            order={o}
            isDark={isDark}
            onCancel={() => cancelOrder(o.id)}
          />
        ))}
      </ul>
    )
  }

  if (positions.length === 0) {
    return (
      <p className={cn('px-2 py-8 text-center text-xs', emptyCls)}>No open positions</p>
    )
  }

  return (
    <ul className="space-y-1 p-2">
      {positions.map((p) => (
        <li
          key={p.id}
          className={cn(
            'rounded-lg border p-2 text-xs',
            isDark ? 'border-white/10 text-white' : 'border-gray-200',
          )}
        >
          <div className="flex justify-between font-semibold">
            <span>{p.symbol}</span>
            <span className="text-green-400">LONG</span>
          </div>
          <p className={cn('mt-1', emptyCls)}>
            {p.lots} lot · Entry {formatCurrency(p.avgEntry)}
          </p>
          <p
            className={cn(
              'mt-0.5 font-mono',
              p.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400',
            )}
          >
            P&L {formatCurrency(p.unrealizedPnL)}
          </p>
        </li>
      ))}
    </ul>
  )
}

function OrderRow({
  order,
  isDark,
  onCancel,
}: {
  order: EvaluationOrder
  isDark: boolean
  onCancel: () => void
}) {
  const sideCls =
    order.side === 'buy'
      ? 'text-green-400'
      : 'text-red-400'
  const statusCls: Record<string, string> = {
    filled: 'text-green-400',
    open: 'text-amber-400',
    rejected: 'text-red-400',
    cancelled: 'text-gray-500',
    pending: 'text-amber-400',
    partially_filled: 'text-blue-400',
  }

  return (
    <li
      className={cn(
        'rounded-lg border p-2 text-[11px]',
        isDark ? 'border-white/10' : 'border-gray-200',
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <div>
          <span className={cn('font-bold uppercase', sideCls)}>{order.side}</span>
          <span className={isDark ? ' text-white' : ' text-gray-900'}>
            {' '}
            {order.lots} · {order.symbol}
          </span>
        </div>
        <span className={statusCls[order.status] ?? 'text-gray-400'}>
          {order.status}
        </span>
      </div>
      <p className={cn('mt-0.5', isDark ? 'text-gray-500' : 'text-gray-400')}>
        {order.type.toUpperCase()}
        {order.filledPrice != null && ` @ ${formatCurrency(order.filledPrice)}`}
      </p>
      <p className={isDark ? 'text-gray-600' : 'text-gray-400'}>
        {format(new Date(order.createdAt), 'MMM d, HH:mm')}
      </p>
      {order.status === 'open' && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-1 flex items-center gap-0.5 text-red-400 hover:underline"
        >
          <XCircle className="h-3 w-3" />
          Cancel
        </button>
      )}
    </li>
  )
}
