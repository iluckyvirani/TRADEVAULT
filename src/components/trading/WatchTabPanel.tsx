import {
  LineChart,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { getInstrumentById } from '@/lib/mock/mockInstruments'
import { useInstrumentStore } from '@/store/instrumentStore'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useTradingPanelTheme } from '@/hooks/useTradingPanelTheme'
import { cn } from '@/lib/utils'

interface Props {
  activeInstrumentId: string
  onOpenSearch: () => void
  onSelectInstrument: (id: string) => void
}

const BADGE_STYLES: Record<string, string> = {
  INDEX: 'bg-white/10 text-gray-400',
  FUT: 'bg-blue-500/20 text-blue-300',
  EQ: 'bg-emerald-500/20 text-emerald-300',
  MCX: 'bg-amber-500/20 text-amber-300',
  CE: 'bg-emerald-500/20 text-emerald-300',
  PE: 'bg-rose-500/20 text-rose-300',
}

const BADGE_STYLES_LIGHT: Record<string, string> = {
  INDEX: 'bg-gray-100 text-gray-600',
  FUT: 'bg-blue-100 text-blue-700',
  EQ: 'bg-emerald-100 text-emerald-700',
  MCX: 'bg-amber-100 text-amber-700',
  CE: 'bg-emerald-100 text-emerald-700',
  PE: 'bg-rose-100 text-rose-700',
}

function formatLtp(price: number): string {
  return price.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function WatchTabPanel({
  activeInstrumentId,
  onOpenSearch,
  onSelectInstrument,
}: Props) {
  const t = useTradingPanelTheme()
  const watchlists = useInstrumentStore((s) => s.watchlists)
  const activeWatchlistId = useInstrumentStore((s) => s.activeWatchlistId)
  const setActiveWatchlist = useInstrumentStore((s) => s.setActiveWatchlist)
  const addWatchlist = useInstrumentStore((s) => s.addWatchlist)
  const addToWatchlist = useInstrumentStore((s) => s.addToWatchlist)
  const removeFromWatchlist = useInstrumentStore((s) => s.removeFromWatchlist)
  const clearActiveWatchlist = useInstrumentStore((s) => s.clearActiveWatchlist)
  const liveQuotes = usePortfolioStore((s) => s.liveQuotes)

  const activeInstrument = getInstrumentById(activeInstrumentId)
  const listIds = watchlists[activeWatchlistId] ?? []
  const isInList = listIds.includes(activeInstrumentId)
  const listKeys = Object.keys(watchlists).sort((a, b) => Number(a) - Number(b))
  const badgeStyles = t.isDark ? BADGE_STYLES : BADGE_STYLES_LIGHT

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn('flex items-center gap-1.5 border-b px-2 py-2', t.border)}>
        {listKeys.map((id) => {
          const active = id === activeWatchlistId
          const count = watchlists[id]?.length ?? 0
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveWatchlist(id)}
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-medium transition-colors',
                active ? t.pillActive : t.pillInactive,
              )}
            >
              Watchlist {id}
              {count > 0 && <span className="ml-1 text-gray-500">{count}</span>}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => addWatchlist()}
          className={cn(
            'ml-auto flex h-7 w-7 items-center justify-center rounded-lg border',
            t.btnBorder,
          )}
          aria-label="Add watchlist"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className={cn('flex items-center gap-1.5 border-b px-2 py-2', t.border)}>
        <div
          className={cn(
            'min-w-0 flex-1 truncate rounded-lg border px-2.5 py-1.5 text-xs',
            t.inputBg,
          )}
        >
          {activeInstrument?.displayName ?? 'Search instruments…'}{' '}
          <span className="text-gray-500">{listIds.length}</span>
        </div>
        <button
          type="button"
          disabled={!activeInstrument || isInList}
          onClick={() => activeInstrument && addToWatchlist(activeInstrumentId)}
          className={cn(
            'shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors',
            isInList ? t.btnDisabled : t.btnBorderStrong,
          )}
        >
          {isInList ? 'Added' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onOpenSearch}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
            t.btnBorder,
          )}
          aria-label="Search instruments"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onOpenSearch}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
            t.btnBorder,
          )}
          aria-label="Edit watchlist"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={clearActiveWatchlist}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-red-400',
            t.isDark ? 'border-white/10 hover:bg-red-500/10' : 'border-gray-200 hover:bg-red-50',
          )}
          aria-label="Clear watchlist"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {listIds.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <LineChart className={cn('h-8 w-8', t.textFaint)} strokeWidth={1.5} />
            <p className={cn('mt-3 text-sm font-semibold', t.textPrimary)}>Empty watchlist</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              Add selected or searched instruments to stream live LTP here.
            </p>
          </div>
        ) : (
          <ul>
            {listIds.map((id) => {
              const inst = getInstrumentById(id)
              if (!inst) return null

              const quote = liveQuotes[inst.symbol]
              const ltp = quote?.price ?? inst.lastPrice
              const bid = quote ? quote.price - 0.05 : inst.bid
              const ask = quote ? quote.price + 0.05 : inst.ask

              return (
                <li key={id} className={cn('border-b last:border-0', t.borderSubtle)}>
                  <div className="flex items-start gap-2 px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onSelectInstrument(id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={cn('text-sm font-semibold', t.textPrimary)}>
                          {inst.displayName}
                        </span>
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
                            badgeStyles[inst.badge] ?? t.badgeDefault,
                          )}
                        >
                          {inst.badge}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-gray-500">{inst.symbol}</p>
                      <p className="mt-1.5 text-[10px] text-gray-500">
                        Bid {formatLtp(bid)} · Ask {formatLtp(ask)}
                      </p>
                    </button>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <div className="text-right">
                        <p className={cn('text-sm font-semibold tabular-nums', t.textPrimary)}>
                          {formatLtp(ltp)}
                        </p>
                        <p className="text-[9px] uppercase tracking-wider text-gray-500">LTP</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {inst.viewOnly && (
                          <span
                            className={cn(
                              'rounded-full border px-2 py-0.5 text-[9px]',
                              t.viewOnlyBadge,
                            )}
                          >
                            View only
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFromWatchlist(id)}
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-md border',
                            t.btnBorder,
                          )}
                          aria-label="Remove from watchlist"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
