import { Link } from 'react-router-dom'
import { Check, ArrowRight, Shield } from 'lucide-react'
import { formatCurrencyWhole } from '@/lib/utils'

const TRUST = [
  'Built for NIFTY & BANKNIFTY',
  'INR simulated environment',
  'Transparent rule-based evaluation',
]

const STATS = [
  { value: '90%', label: 'Profit split on rewards' },
  { value: '1 & 2', label: 'Step evaluation paths' },
  { value: '₹2L–₹25L', label: 'Account sizes' },
  { value: '3:15 PM', label: 'Intraday square-off' },
]

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="hero-gradient absolute inset-0 opacity-70" aria-hidden />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center gap-14 px-6 pb-16 pt-28 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#002D5B]/20 bg-[#002D5B]/10 px-4 py-1.5 text-xs font-medium text-[#002D5B] dark:text-blue-300">
            <Shield className="h-3.5 w-3.5" />
            Prop firm evaluation · India markets
          </div>

          <h1 className="mb-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Prove your discipline.
            <br />
            <span className="bg-gradient-to-r from-[#002D5B] to-blue-500 bg-clip-text text-transparent">
              Earn your rewards account.
            </span>
          </h1>

          <p className="mb-8 max-w-xl text-lg text-muted-foreground lg:text-xl">
            tradeox is a structured, rules-based evaluation for intraday traders on Indian
            index derivatives, equities, and commodities — with a professional dashboard,
            trading room, and performance analytics.
          </p>

          <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              to="/auth?tab=create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#002D5B] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#002D5B]/25 transition-all hover:bg-[#003d7a]"
            >
              Start evaluation
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/free-trial"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 text-base font-medium text-foreground transition-colors hover:border-[#002D5B]/40"
            >
              Try free evaluation
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
            {TRUST.map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full max-w-md flex-1">
          <MockEvaluationDashboard />
        </div>
      </div>

      <div className="relative w-full border-t border-border bg-card/40 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-foreground lg:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MockEvaluationDashboard() {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-black/40">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Qualifier · 2-Step
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrencyWhole(1_000_000)} account
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Active
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-background/50 p-3">
          <p className="text-[10px] text-muted-foreground">Profit target</p>
          <p className="text-sm font-semibold text-foreground">67% reached</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[67%] rounded-full bg-[#002D5B]" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background/50 p-3">
          <p className="text-[10px] text-muted-foreground">Today&apos;s P&L</p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            +₹12,450
          </p>
        </div>
      </div>

      <div className="mb-3 overflow-hidden rounded-lg border border-border bg-[#0f1115] p-3">
        <div className="mb-2 flex items-center justify-between text-[10px] text-gray-400">
          <span>HDFCBANK · Trading room</span>
          <span className="text-emerald-400">BUY 750.25</span>
        </div>
        <svg viewBox="0 0 280 64" className="h-14 w-full" preserveAspectRatio="none">
          <path
            d="M0 52 C30 48 50 38 80 32 C110 26 130 40 160 28 C190 16 210 12 280 8"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Daily loss used</span>
          <span className="text-foreground">2.1% / 5%</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Max drawdown</span>
          <span className="text-foreground">4.2% / 10%</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Trading days</span>
          <span className="text-foreground">3 / 4 min</span>
        </div>
      </div>

      <Link
        to="/auth?tab=create"
        className="mt-4 block w-full rounded-xl bg-[#002D5B] py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#003d7a]"
      >
        Open your dashboard
      </Link>
    </div>
  )
}
