import { Rocket, DollarSign, TrendingUp } from 'lucide-react'

const STEPS = [
  {
    Icon: Rocket,
    step: '01',
    title: 'Sign Up Free',
    body: 'Create your account in 30 seconds. No credit card, no commitment.',
  },
  {
    Icon: DollarSign,
    step: '02',
    title: 'Get $100K Virtual Cash',
    body: 'Your portfolio is loaded instantly with $100,000 in paper money.',
  },
  {
    Icon: TrendingUp,
    step: '03',
    title: 'Trade Like a Pro',
    body: 'Place real-time orders, track P&L, and sharpen your strategy risk-free.',
  },
]

export default function HowItWorks() {
  return (
    <section id="markets" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="text-3xl font-bold text-foreground lg:text-5xl">
            Up and trading in minutes
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            No learning curve. Sign up, get your virtual cash, and start trading
            real markets — risk-free.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map(({ Icon, step, title, body }) => (
            <div
              key={step}
              className="relative rounded-2xl border border-border bg-card p-8 text-center transition-colors hover:border-primary/30"
            >
              {/* Ghost step number */}
              <span className="absolute right-4 top-2 select-none font-mono text-6xl font-black text-muted-foreground/10">
                {step}
              </span>

              {/* Icon */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                <Icon className="h-7 w-7 text-primary" />
              </div>

              <h3 className="mb-3 text-xl font-semibold text-foreground">{title}</h3>
              <p className="leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
