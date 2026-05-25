import { useState, type FormEvent } from 'react'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useOrdersStore } from '@/store/ordersStore'
import { mockQuotes } from '@/lib/mock'
import type { OrderType, OrderTimeInForce } from '@/lib/mock'
import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle, X } from 'lucide-react'

const SYMBOLS = Object.keys(mockQuotes)

interface Props {
  defaultSymbol?: string
}

type Confirm = { show: true; summary: string } | { show: false }

export function OrderEntryPanel({ defaultSymbol = 'AAPL' }: Props) {
  const [symbol, setSymbol] = useState(defaultSymbol)
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [orderType, setOrderType] = useState<OrderType>('market')
  const [qty, setQty] = useState('10')
  const [limitPrice, setLimitPrice] = useState('')
  const [stopPrice, setStopPrice] = useState('')
  const [tif, setTif] = useState<OrderTimeInForce>('day')
  const [confirm, setConfirm] = useState<Confirm>({ show: false })
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const liveQuotes = usePortfolioStore((s) => s.liveQuotes)
  const portfolio = usePortfolioStore((s) => s.portfolio)
  const placeOrder = useOrdersStore((s) => s.placeOrder)

  const quote = liveQuotes[symbol]
  const currentPrice = quote?.price ?? 0
  const quantity = parseInt(qty, 10) || 0
  const estPrice =
    orderType === 'market'
      ? currentPrice
      : (parseFloat(limitPrice) || parseFloat(stopPrice) || currentPrice)
  const estTotal = parseFloat((estPrice * quantity).toFixed(2))

  const insufficientFunds = side === 'buy' && estTotal > portfolio.cashBalance
  const hasPosition = portfolio.positions.find((p) => p.symbol === symbol)
  const insufficientShares =
    side === 'sell' && quantity > (hasPosition?.quantity ?? 0)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!quantity || insufficientFunds || insufficientShares) return

    const lp = parseFloat(limitPrice) || undefined
    const sp = parseFloat(stopPrice) || undefined

    const summaryParts = [
      `${side.toUpperCase()} ${quantity} ${symbol}`,
      orderType === 'market'
        ? `@ Market (~$${currentPrice.toFixed(2)})`
        : orderType === 'limit'
          ? `@ Limit $${lp?.toFixed(2)}`
          : orderType === 'stop'
            ? `@ Stop $${sp?.toFixed(2)}`
            : `@ Stop $${sp?.toFixed(2)} / Limit $${lp?.toFixed(2)}`,
      `• Est. ${side === 'buy' ? 'Cost' : 'Proceeds'}: $${estTotal.toLocaleString()}`,
    ]
    setConfirm({ show: true, summary: summaryParts.join(' ') })
  }

  function handleConfirm() {
    const lp = parseFloat(limitPrice) || undefined
    const sp = parseFloat(stopPrice) || undefined
    const name = mockQuotes[symbol]?.name ?? symbol

    const order = placeOrder({
      symbol,
      name,
      side,
      type: orderType,
      quantity,
      limitPrice: lp,
      stopPrice: sp,
      currentPrice,
      timeInForce: tif,
    })

    setConfirm({ show: false })
    setToast({
      msg:
        order.status === 'filled'
          ? `Order filled: ${side.toUpperCase()} ${quantity} ${symbol} @ $${order.filledPrice?.toFixed(2)}`
          : `Order placed: ${side.toUpperCase()} ${quantity} ${symbol} (${order.status})`,
      ok: true,
    })
    setTimeout(() => setToast(null), 4000)

    // Reset qty
    setQty('10')
  }

  const needsLimit = orderType === 'limit' || orderType === 'stop_limit'
  const needsStop = orderType === 'stop' || orderType === 'stop_limit'

  return (
    <div className="relative flex flex-col rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Order Entry</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Cash available:{' '}
          <span className="font-medium text-accent">
            ${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
        {/* Buy / Sell toggle */}
        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setSide('buy')}
            className={cn(
              'py-2 text-sm font-bold transition-colors',
              side === 'buy' ? 'bg-accent text-white' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setSide('sell')}
            className={cn(
              'py-2 text-sm font-bold transition-colors',
              side === 'sell'
                ? 'bg-destructive text-white'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            SELL
          </button>
        </div>

        {/* Symbol */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Symbol</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono font-bold text-foreground outline-none focus:border-primary"
          >
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>
                {s} — ${liveQuotes[s]?.price.toFixed(2) ?? '—'}
              </option>
            ))}
          </select>
        </div>

        {/* Order type */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop">Stop</option>
            <option value="stop_limit">Stop-Limit</option>
          </select>
        </div>

        {/* Limit price */}
        {needsLimit && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Limit Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder={currentPrice.toFixed(2)}
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
        )}

        {/* Stop price */}
        {needsStop && (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Stop Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder={currentPrice.toFixed(2)}
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Quantity (shares)
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>

        {/* Time in Force */}
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Time in Force
          </label>
          <select
            value={tif}
            onChange={(e) => setTif(e.target.value as OrderTimeInForce)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="day">Day</option>
            <option value="gtc">GTC</option>
            <option value="ioc">IOC</option>
            <option value="fok">FOK</option>
          </select>
        </div>

        {/* Est total */}
        <div className="rounded-xl border border-border bg-background/50 px-4 py-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Est. {side === 'buy' ? 'Cost' : 'Proceeds'}
            </span>
            <span className="font-bold text-foreground">${estTotal.toLocaleString()}</span>
          </div>
          {orderType === 'market' && (
            <p className="mt-0.5 text-[10px] text-muted-foreground/70">
              Market orders execute at best available price
            </p>
          )}
        </div>

        {/* Warnings */}
        {insufficientFunds && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" />
            Insufficient buying power
          </p>
        )}
        {insufficientShares && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" />
            You only hold {hasPosition?.quantity ?? 0} shares of {symbol}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!quantity || insufficientFunds || insufficientShares}
          className={cn(
            'w-full rounded-xl py-2.5 text-sm font-bold text-white shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-40',
            side === 'buy'
              ? 'bg-accent shadow-accent/25 hover:bg-green-500'
              : 'bg-destructive shadow-destructive/25 hover:bg-red-500',
          )}
        >
          Review Order
        </button>

        <p className="text-center text-[10px] text-muted-foreground/60">
          Paper trading only — no real money at risk
        </p>
      </form>

      {/* Confirm modal */}
      {confirm.show && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-background/95 p-6 backdrop-blur-sm">
          <div className="w-full space-y-4 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-yellow-400" />
            <h4 className="font-bold text-foreground">Confirm Order</h4>
            <p className="rounded-xl border border-border bg-card px-4 py-3 text-xs leading-relaxed text-foreground">
              {confirm.summary}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Paper trade only. No real funds will be used.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm({ show: false })}
                className="flex-1 rounded-xl border border-border py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1.5 inline h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={cn(
                  'flex-1 rounded-xl py-2 text-sm font-bold text-white',
                  side === 'buy' ? 'bg-accent' : 'bg-destructive',
                )}
              >
                Confirm {side === 'buy' ? 'Buy' : 'Sell'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'absolute bottom-4 left-4 right-4 z-20 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-medium text-white shadow-xl',
            toast.ok ? 'bg-accent' : 'bg-destructive',
          )}
        >
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          {toast.msg}
        </div>
      )}
    </div>
  )
}
