import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import {
  FILTER_CHIPS,
  mockInstruments,
  type Instrument,
  type InstrumentCategory,
  type InstrumentFilter,
} from '@/lib/mock/mockInstruments'
import { useThemeStore } from '@/store/themeStore'
import { cn, formatCurrency } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (instrument: Instrument) => void
}

const CATEGORY_ORDER: InstrumentCategory[] = ['index', 'future', 'equity', 'commodity']
const CATEGORY_LABELS: Record<InstrumentCategory, string> = {
  index: 'INDICES',
  future: 'FUTURES',
  equity: 'EQUITY',
  commodity: 'COMMODITY',
}

const BADGE_STYLES: Record<string, string> = {
  INDEX: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  FUT: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  EQ: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  MCX: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

function matchesSearch(instrument: Instrument, query: string) {
  if (!query.trim()) return true
  const q = query.toLowerCase().trim()
  return (
    instrument.displayName.toLowerCase().includes(q) ||
    instrument.symbol.toLowerCase().includes(q)
  )
}

function matchesFilter(instrument: Instrument, filter: InstrumentFilter) {
  if (filter === 'all') return true
  return instrument.filterTags.includes(filter)
}

export default function SearchInstrumentsModal({ open, onClose, onSelect }: Props) {
  const isDark = useThemeStore((s) => s.mode === 'dark')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<InstrumentFilter>('all')

  useEffect(() => {
    if (!open) {
      setQuery('')
      setFilter('all')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const filtered = useMemo(
    () =>
      mockInstruments.filter(
        (i) => matchesFilter(i, filter) && matchesSearch(i, query),
      ),
    [filter, query],
  )

  const grouped = useMemo(() => {
    const map = new Map<InstrumentCategory, Instrument[]>()
    for (const cat of CATEGORY_ORDER) map.set(cat, [])
    for (const inst of filtered) {
      map.get(inst.category)?.push(inst)
    }
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      items: map.get(cat) ?? [],
    })).filter((g) => g.items.length > 0)
  }, [filtered])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[8vh] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Search instruments"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        className={cn(
          'relative flex max-h-[min(640px,85vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl',
          isDark
            ? 'border-white/10 bg-[#1a1d24] text-white'
            : 'border-gray-200 bg-white text-gray-900',
        )}
      >
        <div className={cn('border-b p-4', isDark ? 'border-white/10' : 'border-gray-200')}>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex flex-1 items-center gap-2 rounded-xl border px-3 py-2.5',
                isDark ? 'border-white/10 bg-black/30' : 'border-gray-200 bg-gray-50',
              )}
            >
              <Search
                className={cn('h-4 w-4 flex-shrink-0', isDark ? 'text-gray-500' : 'text-gray-400')}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search instruments..."
                autoFocus
                className={cn(
                  'min-w-0 flex-1 bg-transparent text-sm outline-none',
                  isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400',
                )}
              />
            </div>
            <button
              type="button"
              className={cn(
                'rounded-lg p-2.5',
                isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100',
              )}
              aria-label="Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'rounded-lg p-2.5',
                isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100',
              )}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {FILTER_CHIPS.map((chip) => {
              const active = filter === chip.id
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setFilter(chip.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                    active
                      ? isDark
                        ? 'bg-white text-gray-900'
                        : 'bg-gray-900 text-white'
                      : isDark
                        ? 'bg-white/5 text-gray-400 hover:bg-white/10'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {chip.dot && (
                    <span className={cn('h-1.5 w-1.5 rounded-full', chip.dot)} />
                  )}
                  {chip.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {grouped.length === 0 ? (
            <p
              className={cn(
                'py-12 text-center text-sm',
                isDark ? 'text-gray-500' : 'text-gray-400',
              )}
            >
              No instruments match your search.
            </p>
          ) : (
            grouped.map(({ category, label, items }) => (
              <section key={category} className="mb-3">
                <div className="flex items-center gap-2 px-2 py-2">
                  <h3
                    className={cn(
                      'text-[11px] font-semibold uppercase tracking-wider',
                      isDark ? 'text-gray-500' : 'text-gray-400',
                    )}
                  >
                    {label}
                  </h3>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-medium',
                      isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500',
                    )}
                  >
                    {items.length}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {items.map((inst) => (
                    <li key={inst.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(inst)
                          onClose()
                        }}
                        className={cn(
                          'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                          isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50',
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{inst.displayName}</p>
                          <p
                            className={cn(
                              'truncate text-xs',
                              isDark ? 'text-gray-500' : 'text-gray-400',
                            )}
                          >
                            {inst.symbol}
                            {inst.expiry ? ` · ${inst.expiry}` : ''}
                          </p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <span className="hidden font-mono text-xs sm:block">
                            {formatCurrency(inst.lastPrice)}
                          </span>
                          <span
                            className={cn(
                              'rounded border px-1.5 py-0.5 text-[10px] font-semibold',
                              BADGE_STYLES[inst.badge],
                            )}
                          >
                            {inst.badge}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
