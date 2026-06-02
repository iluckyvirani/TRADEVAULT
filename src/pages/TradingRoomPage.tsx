import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, TrendingUp, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'
import { useEvaluationTradingStore } from '@/store/evaluationTradingStore'
import { useInstrumentStore } from '@/store/instrumentStore'
import { useTradingRoomStore } from '@/store/tradingRoomStore'
import { useThemeStore } from '@/store/themeStore'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useMockTicker } from '@/hooks/useMockTicker'
import type { Instrument } from '@/lib/mock/mockInstruments'
import { getInstrumentById } from '@/lib/mock/mockInstruments'
import { ChartPanel } from '@/components/dashboard/ChartPanel'
import ThemeToggle from '@/components/ThemeToggle'
import MarketsPanel from '@/components/trading/MarketsPanel'
import TradingRoomTradePanel from '@/components/trading/TradingRoomTradePanel'
import TradingRoomStatusBar from '@/components/trading/TradingRoomStatusBar'
import SearchInstrumentsModal from '@/components/trading/SearchInstrumentsModal'
import { cn } from '@/lib/utils'

export default function TradingRoomPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const account = useEvaluationAccountStore((s) =>
    s.accounts.find((a) => a.id === accountId),
  )
  const isDark = useThemeStore((s) => s.mode === 'dark')
  const toast = useTradingRoomStore((s) => s.toast)

  const searchOpen = useInstrumentStore((s) => s.searchOpen)
  const setSearchOpen = useInstrumentStore((s) => s.setSearchOpen)
  const setActiveInstrument = useInstrumentStore((s) => s.setActiveInstrument)
  const addToWatchlist = useInstrumentStore((s) => s.addToWatchlist)
  const activeInstrumentId = useInstrumentStore((s) => s.activeInstrumentId)
  const getActiveChartSymbol = useInstrumentStore((s) => s.getActiveChartSymbol)

  const addToBasket = useEvaluationTradingStore((s) => s.addToBasket)
  const tryFillPendingOrders = useEvaluationTradingStore((s) => s.tryFillPendingOrders)
  const updatePositionLtp = useEvaluationTradingStore((s) => s.updatePositionLtp)

  const liveQuotes = usePortfolioStore((s) => s.liveQuotes)

  const activeInstrument = getInstrumentById(activeInstrumentId)
  const [chartSymbol, setChartSymbol] = useState(() => getActiveChartSymbol())
  const [mobileSheet, setMobileSheet] = useState<null | { side?: 'buy' | 'sell' }>(null)

  useMockTicker(1500)

  useEffect(() => {
    setChartSymbol(getActiveChartSymbol())
  }, [activeInstrumentId, getActiveChartSymbol])

  useEffect(() => {
    if (!activeInstrument || !accountId) return
    const sym = activeInstrument.symbol
    const chartQuote = liveQuotes[chartSymbol]
    const directQuote = liveQuotes[sym]
    const price =
      directQuote?.price ??
      chartQuote?.price ??
      activeInstrument.lastPrice

    tryFillPendingOrders(sym, price)
    updatePositionLtp(sym, price)
  }, [
    liveQuotes,
    activeInstrument,
    chartSymbol,
    accountId,
    tryFillPendingOrders,
    updatePositionLtp,
  ])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  const handleSelectInstrument = useCallback(
    (instrument: Instrument) => {
      if (!accountId) return
      const result = setActiveInstrument(instrument.id)
      setChartSymbol(result.chartSymbol)
      addToWatchlist(instrument.id)
      addToBasket(accountId, instrument.id)
    },
    [accountId, setActiveInstrument, addToWatchlist, addToBasket],
  )

  const handleSelectById = useCallback(
    (id: string) => {
      const inst = getInstrumentById(id)
      if (inst) handleSelectInstrument(inst)
    },
    [handleSelectInstrument],
  )

  if (!account) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <p>Account not found.</p>
          <Link to="/dashboard" className="mt-2 inline-block text-blue-400 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const tradeSymbol = activeInstrument?.symbol ?? 'NIFTY'
  const viewOnly = activeInstrument?.viewOnly ?? true

  const tradeQuote = liveQuotes[tradeSymbol]
  const sellPrice = activeInstrument?.bid ?? tradeQuote?.price ?? 0
  const buyPrice = activeInstrument?.ask ?? tradeQuote?.price ?? 0

  return (
    <div
      className={cn(
        'flex h-screen flex-col',
        isDark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-100 text-gray-900',
      )}
    >
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-lg bg-[#1a1d24] px-4 py-2 text-center text-sm text-white shadow-lg ring-1 ring-white/10">
          {toast}
        </div>
      )}

      <header
        className={cn(
          'flex h-12 flex-shrink-0 items-center justify-between border-b px-4',
          isDark ? 'border-white/10' : 'border-gray-200 bg-white',
        )}
      >
        <div className="flex items-center gap-4">
          <Link
            to={`/accounts/${account.id}/stats`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              isDark
                ? 'border-white/10 text-gray-300 hover:bg-white/5 hover:text-white'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50',
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Stats
          </Link>
          <div className={cn('hidden h-5 w-px sm:block', isDark ? 'bg-white/10' : 'bg-gray-200')} />
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-bold">tradeox</span>
            <span
              className={cn(
                'text-xs font-semibold uppercase tracking-widest',
                isDark ? 'text-gray-500' : 'text-gray-400',
              )}
            >
              Trading Room
            </span>
          </div>
        </div>
        <ThemeToggle
          className={
            isDark
              ? 'text-gray-400 hover:bg-white/5 hover:text-white'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }
          iconClassName="h-4 w-4"
        />
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[260px] flex-shrink-0 md:block">
          <MarketsPanel
            accountId={account.id}
            instrumentLabel={activeInstrument?.displayName ?? 'Nifty 50'}
            onOpenSearch={() => setSearchOpen(true)}
            onSelectInstrument={handleSelectById}
          />
        </div>

        <div className="min-w-0 flex-1">
          <ChartPanel
            variant="terminal"
            activeSymbol={chartSymbol}
            symbolLabel={activeInstrument?.displayName}
            onSymbolChange={setChartSymbol}
            onOpenSymbolSearch={() => setSearchOpen(true)}
          />
        </div>

        <div className="hidden w-[300px] flex-shrink-0 lg:block">
          <TradingRoomTradePanel
            account={account}
            instrument={activeInstrument}
            symbol={tradeSymbol}
            viewOnly={viewOnly}
            onSelectInstrument={handleSelectById}
            onOpenSearch={() => setSearchOpen(true)}
          />
        </div>
      </div>

      {/* Desktop margin footer */}
      <div className="hidden md:block">
        <TradingRoomStatusBar account={account} />
      </div>

      {/* Mobile account bar + SELL/BUY */}
      <div
        className={cn(
          'flex-shrink-0 border-t px-4 pb-4 pt-3 md:hidden',
          isDark ? 'border-white/10 bg-[#0a0a0a]' : 'border-gray-200 bg-white',
        )}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider',
                isDark ? 'text-gray-500' : 'text-gray-400',
              )}
            >
              Account ID
            </p>
            <p
              className={cn(
                'truncate font-mono text-xs font-semibold',
                isDark ? 'text-white' : 'text-gray-900',
              )}
            >
              {account.id}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileSheet({})}
            className={cn(
              'flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              isDark
                ? 'border-white/10 text-gray-300 hover:bg-white/5'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50',
            )}
          >
            View Details
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMobileSheet({ side: 'sell' })}
            className="rounded-md bg-[#e0002b] py-2.5 text-center text-white"
          >
            <span className="block text-[10px] font-semibold tracking-wide">SELL</span>
            <span className="mt-0.5 block text-lg font-bold leading-none">
              {sellPrice.toFixed(2)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMobileSheet({ side: 'buy' })}
            className="rounded-md bg-[#2563eb] py-2.5 text-center text-white"
          >
            <span className="block text-[10px] font-semibold tracking-wide">BUY</span>
            <span className="mt-0.5 block text-lg font-bold leading-none">
              {buyPrice.toFixed(2)}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile trade sheet */}
      {mobileSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setMobileSheet(null)}
            className="absolute inset-0 bg-black/50"
          />
          <div
            className={cn(
              'relative flex h-[80vh] flex-col rounded-t-2xl',
              isDark ? 'bg-[#0f1115]' : 'bg-white',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-between border-b px-4 py-3',
                isDark ? 'border-white/10' : 'border-gray-200',
              )}
            >
              <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                {activeInstrument?.displayName ?? tradeSymbol}
              </span>
              <button
                type="button"
                onClick={() => setMobileSheet(null)}
                className={isDark ? 'text-gray-400' : 'text-gray-500'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <TradingRoomTradePanel
                account={account}
                instrument={activeInstrument}
                symbol={tradeSymbol}
                viewOnly={viewOnly}
                initialSide={mobileSheet.side}
                onSelectInstrument={handleSelectById}
                onOpenSearch={() => setSearchOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      <SearchInstrumentsModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleSelectInstrument}
      />
    </div>
  )
}
