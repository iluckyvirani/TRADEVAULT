import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, HelpCircle, Search } from 'lucide-react'
import { useFaq } from '@/hooks/useFaq'
import { cn } from '@/lib/utils'

export default function FaqPage() {
  const { categories } = useFaq()
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  useEffect(() => {
    if (!openId && categories[0]?.items[0]?.id) {
      setOpenId(categories[0].items[0].id)
    }
  }, [categories, openId])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return categories.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        const matchesCategory = activeCategory === 'all' || cat.id === activeCategory
        if (!matchesCategory) return false
        if (!q) return true
        return (
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
        )
      }),
    })).filter((cat) => cat.items.length > 0)
  }, [query, activeCategory, categories])

  const totalMatches = filtered.reduce((n, cat) => n + cat.items.length, 0)

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-7">
      <p className="text-xs text-muted-foreground">Home / FAQ</p>

      <div className="mt-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef3fa] text-[#003d7a]">
          <HelpCircle className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Frequently asked questions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quick answers about evaluations, trading rules, billing, and referrals.
          </p>
        </div>
      </div>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none focus:border-[#003d7a]"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <CategoryPill
          active={activeCategory === 'all'}
          label="All topics"
          onClick={() => setActiveCategory('all')}
        />
        {categories.map((cat) => (
          <CategoryPill
            key={cat.id}
            active={activeCategory === cat.id}
            label={cat.title}
            onClick={() => setActiveCategory(cat.id)}
          />
        ))}
      </div>

      {totalMatches === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No matching questions</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a different search or browse all topics.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {filtered.map((category) => (
            <section key={category.id}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#0a4f84]">
                {category.title}
              </h2>
              <ul className="mt-2 space-y-2">
                {category.items.map((item) => {
                  const isOpen = openId === item.id
                  return (
                    <li
                      key={item.id}
                      className="overflow-hidden rounded-xl border border-border bg-card"
                    >
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      >
                        <span className="text-sm font-medium text-foreground">{item.question}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                            isOpen && 'rotate-180',
                          )}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-border px-4 py-3">
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-5">
        <p className="text-sm font-semibold text-foreground">Still need help?</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Our team can help with account access, billing, and evaluation rules.
        </p>
        <Link
          to="/contact"
          className="mt-3 inline-flex rounded-full bg-[#003d7a] px-5 py-2 text-xs font-semibold text-white hover:bg-[#002d5b]"
        >
          Contact support
        </Link>
      </div>
    </div>
  )
}

function CategoryPill({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-[#003d7a] text-white'
          : 'border border-border bg-card text-foreground hover:bg-muted',
      )}
    >
      {label}
    </button>
  )
}
