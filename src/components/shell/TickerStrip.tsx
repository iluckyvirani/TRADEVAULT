import { mockQuotes } from '@/lib/mock'
import { formatCurrency } from '@/lib/utils'

const QUOTES = Object.values(mockQuotes)

export default function TickerStrip() {
  // Duplicate for seamless infinite scroll loop
  const items = [...QUOTES, ...QUOTES]

  return (
    <div className="flex-shrink-0 overflow-hidden border-b border-border bg-card/40">
      <div className="flex animate-ticker items-center whitespace-nowrap py-1.5">
        {items.map((q, i) => (
          <div
            key={`${q.symbol}-${i}`}
            className="inline-flex items-center gap-1.5 px-5 text-xs"
          >
            <span className="font-mono font-bold text-foreground">{q.symbol}</span>
            <span
              className={
                q.changePct >= 0 ? 'font-medium text-accent' : 'font-medium text-destructive'
              }
            >
              {formatCurrency(q.price)}
            </span>
            <span
              className={
                q.changePct >= 0
                  ? 'rounded bg-accent/10 px-1 text-[10px] text-accent'
                  : 'rounded bg-destructive/10 px-1 text-[10px] text-destructive'
              }
            >
              {q.changePct >= 0 ? '+' : ''}
              {q.changePct.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
