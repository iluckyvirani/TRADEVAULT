import { Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PricingRow {
  label: string
  free: string | boolean
  pro: string | boolean
}

const ROWS: PricingRow[] = [
  { label: 'Virtual portfolio', free: '$100,000', pro: '$1,000,000' },
  { label: 'Watchlists', free: '3', pro: 'Unlimited' },
  { label: 'Chart indicators', free: '10', pro: '50+' },
  { label: 'Trade history', free: '30 days', pro: 'Unlimited' },
  { label: 'Options paper trading', free: false, pro: true },
  { label: 'Crypto pairs', free: '5', pro: '500+' },
  { label: 'AI strategy assistant', free: false, pro: true },
  { label: 'Export CSV / PDF', free: false, pro: true },
]

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-4 w-4 text-accent" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground/30" />
    )
  }
  return <span className="font-medium text-foreground">{value}</span>
}

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-background py-24">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="text-3xl font-bold text-foreground lg:text-5xl">
            Start free. Scale when ready.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Everything you need to learn is in the free tier. Upgrade when
            you're ready to go deeper.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          {/* Free tier */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Free
            </p>
            <div className="mb-6 flex items-end gap-1">
              <span className="text-5xl font-extrabold text-foreground">$0</span>
              <span className="pb-1 text-muted-foreground">/month</span>
            </div>
            <Link
              to="/signup"
              className="mb-8 block rounded-xl border border-border py-3 text-center font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              Get Started Free
            </Link>
            <ul className="space-y-3">
              {ROWS.map(r => (
                <li key={r.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{r.label}</span>
                  <Cell value={r.free} />
                </li>
              ))}
            </ul>
          </div>

          {/* Pro tier */}
          <div className="relative rounded-2xl border border-primary/50 bg-card p-8 shadow-xl shadow-primary/10">
            {/* Popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">
                Most Popular
              </span>
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Pro
            </p>
            <div className="mb-6 flex items-end gap-1">
              <span className="text-5xl font-extrabold text-foreground">$9</span>
              <span className="pb-1 text-muted-foreground">/month</span>
            </div>
            <Link
              to="/signup"
              className="mb-8 block rounded-xl bg-primary py-3 text-center font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-[1.02] hover:bg-[#4F46E5]"
            >
              Start Pro Trial
            </Link>
            <ul className="space-y-3">
              {ROWS.map(r => (
                <li key={r.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{r.label}</span>
                  <Cell value={r.pro} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
