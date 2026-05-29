import { useState } from 'react'
import { BookOpen, Plus, Tag, Trash2, Star, X, ChevronDown } from 'lucide-react'
import { useJournalStore } from '@/store/journalStore'
import type { JournalEntry } from '@/store/journalStore'
import { useOrdersStore } from '@/store/ordersStore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const PRESET_TAGS = ['momentum', 'breakout', 'reversal', 'swing', 'scalp', 'earnings', 'news']

function StarRating({ value, onChange }: { value: number; onChange: (v: 1 | 2 | 3 | 4 | 5) => void }) {
  return (
    <div className="flex gap-0.5">
      {([1, 2, 3, 4, 5] as const).map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)}>
          <Star className={cn('h-4 w-4 transition-colors', s <= value ? 'fill-yellow-400 text-yellow-400' : 'text-border')} />
        </button>
      ))}
    </div>
  )
}

interface EntryFormProps {
  initial?: Partial<JournalEntry>
  onSave: (data: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

function EntryForm({ initial, onSave, onCancel }: EntryFormProps) {
  const [symbol, setSymbol] = useState(initial?.symbol ?? '')
  const [side, setSide] = useState<'buy' | 'sell'>(initial?.side ?? 'buy')
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? ''))
  const [price, setPrice] = useState(String(initial?.price ?? ''))
  const [title, setTitle] = useState(initial?.title ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(initial?.rating ?? 3)
  const [tagInput, setTagInput] = useState('')

  function toggleTag(t: string) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }
  function addCustomTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!symbol || !quantity || !price) return
    onSave({
      symbol: symbol.toUpperCase(),
      side,
      quantity: Number(quantity),
      price: Number(price),
      date: new Date().toISOString(),
      title: title || `${side.toUpperCase()} ${symbol.toUpperCase()}`,
      notes,
      tags,
      rating,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{initial ? 'Edit Entry' : 'New Journal Entry'}</h3>
        <button type="button" onClick={onCancel} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Row 1: symbol + side + qty + price */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Symbol</label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="RELIANCE"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono font-bold uppercase text-foreground outline-none focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Side</label>
          <div className="flex rounded-xl border border-border overflow-hidden">
            {(['buy', 'sell'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className={cn(
                  'flex-1 py-2 text-xs font-bold uppercase transition-colors',
                  side === s
                    ? s === 'buy' ? 'bg-accent text-white' : 'bg-destructive text-white'
                    : 'bg-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Qty</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="10"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Price</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="189.50"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            required
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Breakout on high volume..."
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Trade rationale, entry thesis, lessons learned..."
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tags</label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTag(t)}
              className={cn(
                'flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] transition-all',
                tags.includes(t)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40',
              )}
            >
              <Tag className="h-2.5 w-2.5" />{t}
            </button>
          ))}
          <div className="flex items-center gap-1">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag() } }}
              placeholder="custom…"
              className="h-6 w-20 rounded-lg border border-border bg-background px-2 text-[10px] text-foreground outline-none focus:border-primary"
            />
            <button type="button" onClick={addCustomTag} className="text-muted-foreground hover:text-primary">
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Rating + submit */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Rating</span>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            Cancel
          </button>
          <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-[#4F46E5]">
            Save Entry
          </button>
        </div>
      </div>
    </form>
  )
}

export default function JournalPage() {
  const { entries, addEntry, updateEntry, deleteEntry } = useJournalStore()
  const orders = useOrdersStore((s) => s.orders)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState('')
  const [filterSymbol, setFilterSymbol] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Seed from filled orders if journal is empty
  const filledOrders = orders.filter((o) => o.status === 'filled').slice(0, 6)
  const displayEntries = entries.length > 0
    ? entries
    : filledOrders.map((o) => ({
        id: o.id,
        orderId: o.id,
        symbol: o.symbol,
        side: o.side,
        quantity: o.quantity,
        price: o.filledPrice ?? 0,
        date: o.createdAt,
        title: `${o.side.toUpperCase()} ${o.symbol} — ${o.type}`,
        notes: '',
        tags: ['momentum', 'breakout'].slice(0, 1 + (o.id.charCodeAt(4) % 2)),
        rating: (1 + (o.id.charCodeAt(5) % 5)) as 1 | 2 | 3 | 4 | 5,
        createdAt: o.createdAt,
        updatedAt: o.createdAt,
      }))

  const filtered = displayEntries.filter((e) => {
    if (filterSymbol && !e.symbol.toUpperCase().includes(filterSymbol.toUpperCase())) return false
    if (filterTag && !e.tags.includes(filterTag.toLowerCase())) return false
    return true
  })

  const allTags = [...new Set(displayEntries.flatMap((e) => e.tags))]

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Trade Journal</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Document your reasoning and lessons learned.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null) }}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-[#4F46E5]"
        >
          <Plus className="h-4 w-4" />
          New Entry
        </button>
      </div>

      {/* New-entry form */}
      {showForm && !editId && (
        <EntryForm
          onSave={(data) => { addEntry(data); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={filterSymbol}
          onChange={(e) => setFilterSymbol(e.target.value)}
          placeholder="Filter symbol…"
          className="h-8 rounded-xl border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-primary"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterTag('')}
            className={cn('rounded-lg border px-2 py-1 text-[10px] transition-all', filterTag === '' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40')}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTag(filterTag === t ? '' : t)}
              className={cn('flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] transition-all', filterTag === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40')}
            >
              <Tag className="h-2.5 w-2.5" />{t}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} entries</span>
      </div>

      {/* Entry cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card py-12">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No journal entries yet. Add your first entry above.</p>
          </div>
        )}
        {filtered.map((entry) => {
          const isEdit = editId === entry.id
          const isExpanded = expandedId === entry.id
          if (isEdit) {
            return (
              <EntryForm
                key={entry.id}
                initial={entry}
                onSave={(data) => { updateEntry(entry.id, data); setEditId(null) }}
                onCancel={() => setEditId(null)}
              />
            )
          }
          return (
            <div key={entry.id} className="rounded-2xl border border-border bg-card transition-all hover:border-primary/40">
              <div
                className="flex cursor-pointer items-start justify-between gap-4 p-5"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold', entry.side === 'buy' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive')}>
                    {entry.side.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-foreground">{entry.symbol}</p>
                      <span className="text-xs text-muted-foreground">·</span>
                      <p className="text-sm text-foreground">{entry.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {entry.quantity} shares @ ${entry.price > 0 ? entry.price.toFixed(2) : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <div className="flex gap-0.5">
                    {([1, 2, 3, 4, 5] as const).map((s) => (
                      <Star key={s} className={cn('h-3 w-3', s <= entry.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border')} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.date), 'MMM d, yyyy')}
                  </span>
                  <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border px-5 pb-5 pt-3 space-y-3">
                  {entry.notes ? (
                    <p className="rounded-xl border border-border/50 bg-background/50 px-4 py-2.5 text-sm text-foreground">
                      {entry.notes}
                    </p>
                  ) : (
                    <p className="rounded-xl border border-border/50 bg-background/50 px-4 py-2.5 text-sm italic text-muted-foreground">
                      No notes added yet.
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags.map((t) => (
                        <span key={t} className="flex items-center gap-1 rounded-lg border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground">
                          <Tag className="h-2.5 w-2.5" />{t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditId(entry.id)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

