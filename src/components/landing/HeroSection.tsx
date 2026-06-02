import { Link } from 'react-router-dom'
import { Play, Check } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const TRUST = ['No credit card required', 'Free forever', 'Live Indian market data']

const STATS = [
  { value: '50,000+', label: 'Active traders' },
  { value: '₹2.4B', label: 'Virtual volume' },
  { value: '98.7%', label: 'Uptime SLA' },
  { value: '₹0', label: 'Real money at risk' },
]

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Ambient gradient */}
      <div className="hero-gradient absolute inset-0 opacity-80" aria-hidden />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
        aria-hidden
      />

      {/* Main content */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center gap-16 px-6 pb-16 pt-28 lg:flex-row lg:items-center">
        {/* Left — copy */}
        <div className="flex-1 text-center lg:text-left">
          {/* Live badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live market data · Updated every second
          </div>

          <h1 className="mb-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-foreground lg:text-7xl">
            Master the Market.<br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Risk Nothing.
            </span>
          </h1>

          <p className="mb-8 max-w-lg text-lg text-muted-foreground lg:text-xl">
            Trade Indian equities with{' '}
            <span className="font-semibold text-foreground">₹1,000,000 virtual cash</span>.
            Real-time NSE prices. Real strategies. Zero risk.
          </p>

          {/* CTAs */}
          <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              to="/auth?tab=create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105 hover:bg-[#4F46E5]"
            >
              Start Trading Free
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-8 py-3.5 text-base font-medium text-foreground transition-all duration-200 hover:border-primary/50 hover:text-primary"
            >
              <Play className="h-5 w-5" />
              Watch Demo
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-5 text-sm text-muted-foreground lg:justify-start">
            {TRUST.map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-accent" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right — mock dashboard */}
        <div className="flex-1 w-full max-w-md">
          <MockDashboard />
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative w-full border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-6 md:grid-cols-4">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-foreground lg:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MockDashboard() {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-black/50">
      {/* Live pulse dot */}
      <span className="absolute -right-1 -top-1 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
      </span>

      {/* Portfolio header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Portfolio Value</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(1845000)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">+₹325,000.00 all time</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-sm font-semibold text-accent">
          ▲ 21.38%
        </span>
      </div>

      {/* SVG chart */}
      <div className="mb-4 overflow-hidden rounded-lg bg-background/50" style={{ height: '120px' }}>
        <svg viewBox="0 0 320 80" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(239 84% 67%)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="hsl(239 84% 67%)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 68 C15 64 25 56 40 50 C55 44 65 36 85 30 C105 24 115 34 135 27 C155 20 165 13 185 16 C205 19 215 9 240 7 C260 5 275 11 320 4"
            fill="none"
            stroke="hsl(239 84% 67%)"
            strokeWidth="2"
          />
          <path
            d="M0 68 C15 64 25 56 40 50 C55 44 65 36 85 30 C105 24 115 34 135 27 C155 20 165 13 185 16 C205 19 215 9 240 7 C260 5 275 11 320 4 L320 80 L0 80 Z"
            fill="url(#chartFill)"
          />
        </svg>
      </div>

      {/* Positions */}
      <div className="space-y-0">
        {[
          { symbol: 'RELIANCE', qty: '40 shares', price: '₹2,925.60', pnl: '+₹74,024.00', up: true },
          { symbol: 'TCS', qty: '32 shares', price: '₹3,905.90', pnl: '+₹59,389.00', up: true },
          { symbol: 'ICICIBANK', qty: '110 shares', price: '₹1,246.70', pnl: '-₹31,070.00', up: false },
        ].map(item => (
          <div
            key={item.symbol}
            className="flex items-center justify-between border-t border-border/50 py-2 text-sm"
          >
            <div>
              <span className="font-semibold text-foreground">{item.symbol}</span>
              <span className="ml-2 text-xs text-muted-foreground">{item.qty}</span>
            </div>
            <span className="text-muted-foreground">{item.price}</span>
            <span className={item.up ? 'font-medium text-accent' : 'font-medium text-destructive'}>
              {item.pnl}
            </span>
          </div>
        ))}
      </div>

      {/* Buy button */}
      <button
        type="button"
        className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4F46E5]"
      >
        Place Order
      </button>
    </div>
  )
}
