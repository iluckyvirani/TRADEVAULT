import { useEffect, useMemo, useState } from 'react'
import { mockQuotes } from '@/lib/mock'
import { useEvaluationTradingStore } from '@/store/evaluationTradingStore'
import { useTradingRoomStore, type RoomTab } from '@/store/tradingRoomStore'
import { useThemeStore } from '@/store/themeStore'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { EvaluationAccount } from '@/lib/mock/mockEvaluationAccounts'
import type { Instrument } from '@/lib/mock/mockInstruments'
import BasketsTabPanel from '@/components/trading/BasketsTabPanel'
import OrdersTabPanel from '@/components/trading/OrdersTabPanel'
import PositionsTabPanel from '@/components/trading/PositionsTabPanel'
import WatchTabPanel from '@/components/trading/WatchTabPanel'
import { useInstrumentStore } from '@/store/instrumentStore'

type OrderTab = 'market' | 'limit' | 'stop'

const BOTTOM_TABS: { id: RoomTab; label: string }[] = [
  { id: 'watch', label: 'Watchlist' },
  { id: 'baskets', label: 'Basket' },
  { id: 'orders', label: 'Orders' },
  { id: 'positions', label: 'Positions' },
]

interface Props {
  account: EvaluationAccount
  instrument?: Instrument
  symbol?: string
  viewOnly?: boolean
  onSelectInstrument: (id: string) => void
  onOpenSearch: () => void
  initialSide?: 'buy' | 'sell'
}

function parseOptionalPrice(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const n = parseFloat(trimmed)
  return Number.isFinite(n) ? n : undefined
}

export default function TradingRoomTradePanel({
  account,
  instrument,
  symbol = 'NIFTY',
  viewOnly = true,
  onSelectInstrument,
  onOpenSearch,
  initialSide,
}: Props) {
  const [side, setSide] = useState<'buy' | 'sell'>(initialSide ?? 'buy')

  useEffect(() => {
    if (initialSide) setSide(initialSide)
  }, [initialSide])

  const [orderTab, setOrderTab] = useState<OrderTab>('market')
  const [lots, setLots] = useState('1')
  const [orderPrice, setOrderPrice] = useState('')
  const [optionalTrigger, setOptionalTrigger] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isDark = useThemeStore((s) => s.mode === 'dark')
  const activeInstrumentId = useInstrumentStore((s) => s.activeInstrumentId)
  const activeTab = useTradingRoomStore((s) => s.activeTab)
  const setActiveTab = useTradingRoomStore((s) => s.setActiveTab)
  const showToast = useTradingRoomStore((s) => s.showToast)
  const placeOrder = useEvaluationTradingStore((s) => s.placeOrder)

  const quote = mockQuotes[symbol]
  const name = instrument?.displayName ?? quote?.name ?? symbol
  const bid = instrument?.bid ?? quote?.price ?? 23350.95
  const ask = instrument?.ask ?? quote?.price ?? 23350.95
  const ltp = instrument?.lastPrice ?? quote?.price ?? (bid + ask) / 2

  const border = isDark ? 'border-white/10' : 'border-gray-200'
  const panelBg = isDark ? 'bg-[#0f1115]' : 'bg-white'
  const inputCls = isDark
    ? 'border-white/10 bg-black/40 text-white placeholder:text-gray-600'
    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400'
  const actionPrice = side === 'buy' ? ask : bid

  const lotsNum = Math.max(1, parseInt(lots, 10) || 1)
  const lotSize = instrument?.lotSize ?? 1

  const marginRequired = useMemo(() => {
    const notional = actionPrice * lotsNum * lotSize
    return parseFloat((notional * 0.2).toFixed(2))
  }, [actionPrice, lotsNum, lotSize])

  const freezeDisplay = 100000

  async function handleSubmit() {
    if (viewOnly || !instrument) return

    const limitPrice =
      orderTab === 'limit' ? parseOptionalPrice(orderPrice) : undefined
    const stopPrice =
      orderTab === 'stop' ? parseOptionalPrice(orderPrice) : undefined
    const triggerPrice =
      orderTab === 'market' ? parseOptionalPrice(optionalTrigger) : undefined
    const takeProfitPrice = parseOptionalPrice(takeProfit)
    const stopLossPrice = parseOptionalPrice(stopLoss)

    if (orderTab === 'limit' && limitPrice === undefined) {
      showToast('Enter a valid limit price')
      return
    }
    if (orderTab === 'stop' && stopPrice === undefined) {
      showToast('Enter a valid stop trigger price')
      return
    }
    if (
      orderTab === 'market' &&
      optionalTrigger.trim() &&
      triggerPrice === undefined
    ) {
      showToast('Enter a valid trigger price')
      return
    }

    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 300))

    const order = placeOrder({
      accountId: account.id,
      instrument,
      side,
      type: orderTab,
      lots: lotsNum,
      limitPrice,
      stopPrice,
      triggerPrice,
      takeProfitPrice,
      stopLossPrice,
    })

    setSubmitting(false)

    if (order.status === 'rejected') {
      showToast('Order rejected — check margin or position')
      setActiveTab('orders')
      return
    }

    if (order.status === 'filled') {
      showToast(
        `${side.toUpperCase()} ${lotsNum} lot filled @ ${formatCurrency(order.filledPrice ?? ask)}`,
      )
      setActiveTab('positions')
    } else {
      showToast(`${side.toUpperCase()} ${lotsNum} lot ${order.type} order placed`)
      setActiveTab('orders')
    }
  }

  const submitLabel = viewOnly
    ? 'View-only instrument'
    : submitting
      ? 'Placing…'
      : `${side === 'buy' ? 'BUY' : 'SELL'} ${lotsNum} lot ${orderTab.toUpperCase()}`

  return (
    <div className={cn('flex h-full flex-col border-l', border, panelBg)}>
      <div className={cn('flex-shrink-0 border-b px-4 py-3', border)}>
        <p
          className={cn(
            'text-[10px] font-semibold uppercase tracking-wider',
            isDark ? 'text-gray-500' : 'text-gray-400',
          )}
        >
          Trade
        </p>
        <p className={cn('text-sm font-bold', isDark ? 'text-white' : 'text-gray-900')}>
          {name}
        </p>
        <p
          className={cn(
            'mt-0.5 font-mono text-[10px]',
            isDark ? 'text-gray-500' : 'text-gray-400',
          )}
        >
          {account.id.slice(0, 20)}… · Lot {lotSize}
        </p>
      </div>

      <div className="flex-shrink-0 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSide('sell')}
            className={cn(
              'rounded-md border py-2 text-center transition-all',
              isDark ? 'border-white/10' : 'border-red-200',
              side === 'sell'
                ? 'bg-[#e0002b] text-white ring-1 ring-white/30'
                : 'bg-[#e0002b] text-white/95 hover:brightness-105',
            )}
          >
            <span className="block text-[9px] font-semibold tracking-wide">SELL</span>
            <span className="mt-0.5 block text-base font-bold leading-none">
              {bid.toFixed(2)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSide('buy')}
            className={cn(
              'rounded-md border py-2 text-center transition-all',
              isDark ? 'border-white/10' : 'border-blue-200',
              side === 'buy'
                ? 'bg-[#2563eb] text-white ring-1 ring-white/30'
                : 'bg-[#2563eb] text-white/95 hover:brightness-105',
            )}
          >
            <span className="block text-[9px] font-semibold tracking-wide">BUY</span>
            <span className="mt-0.5 block text-base font-bold leading-none">
              {ask.toFixed(2)}
            </span>
          </button>
        </div>

        <div className={cn('mt-4 flex border-b', border)}>
          {(['market', 'limit', 'stop'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setOrderTab(t)}
              className={cn(
                'flex-1 pb-2 text-xs font-medium capitalize transition-colors',
                orderTab === t
                  ? isDark
                    ? 'border-b-2 border-white text-white'
                    : 'border-b-2 border-gray-900 text-gray-900'
                  : isDark
                    ? 'text-gray-500 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="text-xs text-gray-500">Lots</span>
          <input
            type="number"
            min={1}
            value={lots}
            onChange={(e) => setLots(e.target.value)}
            className={cn(
              'mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500',
              inputCls,
            )}
          />
          <p className={cn('mt-1 text-[10px]', isDark ? 'text-gray-500' : 'text-gray-400')}>
            Lot {lotSize} · Freeze {freezeDisplay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </label>

        {orderTab === 'market' && (
          <label className="mt-3 block">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Trigger (optional)</span>
              <span className={cn('text-[10px]', isDark ? 'text-gray-500' : 'text-gray-400')}>
                LTP {ltp.toFixed(2)}
              </span>
            </div>
            <input
              type="number"
              step="0.05"
              value={optionalTrigger}
              onChange={(e) => setOptionalTrigger(e.target.value)}
              placeholder={String(ltp.toFixed(2))}
              className={cn(
                'mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500',
                inputCls,
              )}
            />
          </label>
        )}

        {orderTab !== 'market' && (
          <label className="mt-3 block">
            <span className="text-xs text-gray-500">
              {orderTab === 'limit' ? 'Limit price' : 'Trigger price'}
            </span>
            <input
              type="number"
              step="0.05"
              value={orderPrice}
              onChange={(e) => setOrderPrice(e.target.value)}
              placeholder={String(actionPrice.toFixed(2))}
              className={cn(
                'mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500',
                inputCls,
              )}
            />
          </label>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="block">
            <span className="text-xs text-emerald-600 dark:text-emerald-400">TP</span>
            <input
              type="number"
              step="0.05"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="Optional"
              className={cn(
                'mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500',
                isDark
                  ? 'border-emerald-500/40 bg-black/40 text-white placeholder:text-gray-600'
                  : 'border-emerald-300 bg-emerald-50/50 text-gray-900 placeholder:text-gray-400',
              )}
            />
          </label>
          <label className="block">
            <span className="text-xs text-red-600 dark:text-red-400">SL</span>
            <input
              type="number"
              step="0.05"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="Optional"
              className={cn(
                'mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-red-500',
                isDark
                  ? 'border-red-500/40 bg-black/40 text-white placeholder:text-gray-600'
                  : 'border-red-300 bg-red-50/50 text-gray-900 placeholder:text-gray-400',
              )}
            />
          </label>
        </div>

        {!viewOnly && instrument && (
          <div className={cn('mt-3 space-y-0.5 text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>
            <p>
              Single order of {lotsNum} lot{lotsNum > 1 ? 's' : ''}
            </p>
            <p>
              Margin required{' '}
              <span className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(marginRequired)}
              </span>
            </p>
          </div>
        )}

        {viewOnly && (
          <p className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
            This instrument is view-only. Select an options or futures contract to trade.
          </p>
        )}

        <button
          type="button"
          disabled={viewOnly || submitting || !instrument}
          onClick={handleSubmit}
          className={cn(
            'mt-4 w-full rounded-md py-3 text-sm font-semibold uppercase tracking-wide transition-colors',
            viewOnly || !instrument
              ? 'cursor-not-allowed bg-blue-600/40 text-blue-200'
              : side === 'buy'
                ? 'bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60'
                : 'bg-red-600 text-white hover:bg-red-500 disabled:opacity-60',
          )}
        >
          {submitLabel}
        </button>
      </div>

      <div className={cn('min-h-0 flex-1 overflow-hidden border-t', border)}>
        {activeTab === 'watch' ? (
          <WatchTabPanel
            activeInstrumentId={activeInstrumentId}
            onOpenSearch={onOpenSearch}
            onSelectInstrument={onSelectInstrument}
          />
        ) : activeTab === 'baskets' ? (
          <BasketsTabPanel
            accountId={account.id}
            activeInstrumentId={activeInstrumentId}
            onSelectInstrument={onSelectInstrument}
          />
        ) : activeTab === 'orders' ? (
          <OrdersTabPanel accountId={account.id} />
        ) : (
          <PositionsTabPanel accountId={account.id} />
        )}
      </div>

      <div className={cn('flex flex-shrink-0 border-t', border)}>
        {BOTTOM_TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex-1 py-2 text-[10px] font-medium transition-colors',
              activeTab === id
                ? isDark
                  ? 'border-t-2 border-white text-white'
                  : 'border-t-2 border-[#002D5B] text-[#002D5B]'
                : isDark
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-400',
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
