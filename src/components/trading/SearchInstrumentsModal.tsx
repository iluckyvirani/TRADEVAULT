import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import {
  COMMODITY_TAGS,
  FILTER_CHIPS,
  mockInstruments,
  type Instrument,
  type InstrumentCategory,
  type InstrumentFilter,
} from '@/lib/mock/mockInstruments'
import {
  buildOptionInstrument,
  formatStrike,
  getAtmStrikeIndex,
  getOptionChainForFilter,
  type OptionChainConfig,
} from '@/lib/mock/mockOptionChains'
import { cn } from '@/lib/utils'

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
  commodity: 'COMMODITY FUTURES',
  option: 'OPTIONS',
}

const BADGE_STYLES: Record<string, string> = {
  INDEX: 'bg-violet-600/30 text-violet-200',
  FUT: 'bg-blue-600/30 text-blue-200',
  EQ: 'bg-emerald-600/30 text-emerald-200',
  MCX: 'bg-amber-600/30 text-amber-200',
}

const INDEX_FILTERS: InstrumentFilter[] = [
  'nifty',
  'banknifty',
  'finnifty',
  'midcapnifty',
  'sensex',
]

function matchesSearch(instrument: Instrument, query: string) {
  if (!query.trim()) return true
  const q = query.toLowerCase().trim()
  return (
    instrument.displayName.toLowerCase().includes(q) ||
    instrument.symbol.toLowerCase().includes(q) ||
    (instrument.commodityTag?.toLowerCase().includes(q) ?? false)
  )
}

function matchesFilter(instrument: Instrument, filter: InstrumentFilter) {
  if (filter === 'all') return true
  return instrument.filterTags.includes(filter)
}

function matchesCommodityTag(instrument: Instrument, tag: string | null) {
  if (!tag) return true
  return instrument.commodityTag === tag
}

export default function SearchInstrumentsModal({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<InstrumentFilter>('all')
  const [commodityTag, setCommodityTag] = useState<string | null>(null)
  const [selectedExpiry, setSelectedExpiry] = useState<string | null>(null)

  const optionChain = getOptionChainForFilter(filter)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setFilter('all')
      setCommodityTag(null)
      setSelectedExpiry(null)
    }
  }, [open])

  useEffect(() => {
    if (optionChain) {
      setSelectedExpiry(optionChain.expiries[0] ?? null)
    } else {
      setSelectedExpiry(null)
    }
  }, [filter, optionChain?.underlying])

  useEffect(() => {
    if (filter === 'commodity' && !commodityTag) {
      setCommodityTag(COMMODITY_TAGS[0]?.id ?? null)
    }
    if (filter !== 'commodity') setCommodityTag(null)
  }, [filter, commodityTag])

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
        (i) =>
          matchesFilter(i, filter) &&
          matchesCommodityTag(i, commodityTag) &&
          matchesSearch(i, query),
      ),
    [filter, commodityTag, query],
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

  const showOptionChain = Boolean(optionChain && selectedExpiry && !query.trim())

  const visibleGrouped = useMemo(() => {
    if (!INDEX_FILTERS.includes(filter)) return grouped
    return grouped.filter((g) => g.category !== 'index')
  }, [grouped, filter])

  const atmIndex = optionChain ? getAtmStrikeIndex(optionChain.strikes, optionChain.atm) : -1

  function handleSelect(inst: Instrument) {
    onSelect(inst)
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 pt-[6vh] sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search instruments"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative flex max-h-[min(720px,88vh)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12151c] text-white shadow-2xl">
        <div className="border-b border-white/10 p-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#0d1017] px-3 py-2">
              <Search className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search instruments..."
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>
            <button
              type="button"
              className="rounded-lg border border-white/10 p-2.5 text-gray-400 hover:bg-white/5"
              aria-label="Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 p-2.5 text-gray-400 hover:bg-white/5"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTER_CHIPS.map((chip) => {
              const active = filter === chip.id
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setFilter(chip.id)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    active
                      ? 'bg-white text-gray-900'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10',
                  )}
                >
                  {chip.dot && <span className={cn('h-1.5 w-1.5 rounded-full', chip.dot)} />}
                  {chip.label}
                </button>
              )
            })}
          </div>

          {filter === 'commodity' && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {COMMODITY_TAGS.map((tag) => {
                const active = commodityTag === tag.id
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setCommodityTag(tag.id)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                      active
                        ? 'border-amber-400/60 bg-amber-500/10 text-amber-200'
                        : 'border-white/10 text-gray-400 hover:border-white/20',
                    )}
                  >
                    {tag.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {visibleGrouped.length === 0 && !showOptionChain ? (
            <p className="py-16 text-center text-sm text-gray-500">No instruments match your search.</p>
          ) : (
            <>
              {visibleGrouped.map(({ category, label, items }) => (
                <section key={category} className="border-b border-white/5 last:border-0">
                  <SectionHeader label={label} count={items.length} />
                  <ul>
                    {items.map((inst) => (
                      <li key={inst.id} className="border-b border-white/5 last:border-0">
                        {category === 'equity' ? (
                          <EquityRow instrument={inst} onSelect={handleSelect} />
                        ) : (
                          <InstrumentRow instrument={inst} onSelect={handleSelect} />
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              {showOptionChain && optionChain && selectedExpiry && (
                <OptionsChainSection
                  chain={optionChain}
                  expiry={selectedExpiry}
                  onExpiryChange={setSelectedExpiry}
                  atmIndex={atmIndex}
                  onSelect={(side, strike) =>
                    handleSelect(buildOptionInstrument(optionChain, side, strike, selectedExpiry))
                  }
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</h3>
      <span className="text-[10px] font-medium text-gray-500">{count}</span>
    </div>
  )
}

function InstrumentRow({
  instrument,
  onSelect,
}: {
  instrument: Instrument
  onSelect: (inst: Instrument) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(instrument)}
      className="flex w-full items-start gap-2 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white">{instrument.displayName}</span>
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[9px] font-bold uppercase',
              BADGE_STYLES[instrument.badge],
            )}
          >
            {instrument.badge}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">{instrument.symbol}</p>
      </div>
    </button>
  )
}

function EquityRow({
  instrument,
  onSelect,
}: {
  instrument: Instrument
  onSelect: (inst: Instrument) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(instrument)}
      className="w-full px-4 py-2 text-left text-sm font-semibold text-white transition-colors hover:bg-white/5"
    >
      {instrument.symbol}
    </button>
  )
}

function OptionsChainSection({
  chain,
  expiry,
  onExpiryChange,
  atmIndex,
  onSelect,
}: {
  chain: OptionChainConfig
  expiry: string
  onExpiryChange: (e: string) => void
  atmIndex: number
  onSelect: (side: 'CE' | 'PE', strike: number) => void
}) {
  const optionCount = chain.strikes.length * 2

  return (
    <section className="border-t border-white/5">
      <SectionHeader label="OPTIONS" count={optionCount} />

      <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chain.expiries.map((exp) => {
          const active = exp === expiry
          return (
            <button
              key={exp}
              type="button"
              onClick={() => onExpiryChange(exp)}
              className={cn(
                'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors',
                active
                  ? 'border-white bg-white text-gray-900'
                  : 'border-white/15 text-gray-400 hover:border-white/30',
              )}
            >
              {exp}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center border-y border-white/10 bg-[#0d1017] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider">
        <span className="text-emerald-400">CE</span>
        <span className="px-3 text-center text-gray-500">Strike</span>
        <span className="text-right text-rose-400">PE</span>
      </div>

      <ul>
        {chain.strikes.map((strike, i) => {
          const showAtmAfter = i === atmIndex
          const isAtmNeighbor = i === atmIndex || i === atmIndex + 1
          return (
            <li key={strike}>
              <div
                className={cn(
                  'grid grid-cols-[1fr_auto_1fr] items-center border-b border-white/5',
                  isAtmNeighbor && 'bg-amber-950/20',
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect('CE', strike)}
                  className="px-3 py-2 text-left transition-colors hover:bg-white/5"
                >
                  <p className="text-xs font-semibold text-white">{chain.underlying}</p>
                  <p className="text-[10px] text-gray-500">{expiry}</p>
                </button>
                <button
                  type="button"
                  onClick={() => onSelect('CE', strike)}
                  className={cn(
                    'min-w-[4.5rem] px-2 py-2 text-center text-sm font-semibold transition-colors hover:bg-white/5',
                    i === atmIndex + 1 ? 'text-amber-400' : 'text-white',
                  )}
                >
                  {formatStrike(strike)}
                </button>
                <button
                  type="button"
                  onClick={() => onSelect('PE', strike)}
                  className="px-3 py-2 text-right transition-colors hover:bg-white/5"
                >
                  <p className="text-xs font-semibold text-white">{chain.underlying}</p>
                  <p className="text-[10px] text-gray-500">{expiry}</p>
                </button>
              </div>
              {showAtmAfter && (
                <div className="flex justify-center border-b border-white/5 py-1">
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-300">
                    ATM {chain.atm.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                  </span>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
