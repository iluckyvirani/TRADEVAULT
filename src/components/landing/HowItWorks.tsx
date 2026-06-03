import { Link } from 'react-router-dom'
import { ClipboardList, LineChart, BadgeCheck, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const STEPS: {
  Icon: LucideIcon
  step: string
  title: string
  body: string
}[] = [
  {
    Icon: ClipboardList,
    step: '01',
    title: 'Choose your path',
    body: 'Pick 1-Step (Qualifier → Rewards) or 2-Step (Qualifier → Validator → Rewards). Select account size from ₹2L to ₹25L, or start a free trial.',
  },
  {
    Icon: LineChart,
    step: '02',
    title: 'Trade in the evaluation room',
    body: 'Trade NIFTY, BANKNIFTY, equities, and more in a simulated INR environment. Market, limit, and stop orders with optional TP/SL — all under documented intraday rules.',
  },
  {
    Icon: BadgeCheck,
    step: '03',
    title: 'Meet objectives & pass review',
    body: 'Hit profit targets while respecting daily loss, max drawdown, and minimum trading days. Your account stats and equity curve track progress in real time.',
  },
  {
    Icon: Wallet,
    step: '04',
    title: 'Unlock rewards & certificates',
    body: 'After verification, progress to a Rewards Account with up to 90% profit split, payout cycles, certificates, billing history, and affiliate rewards.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#002D5B] dark:text-blue-400">
            Evaluation process
          </p>
          <h2 className="text-3xl font-bold text-foreground lg:text-5xl">
            From signup to rewards account
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            tradeox measures consistency, risk control, and rule adherence — not lucky
            single-day wins. Objectives and loss limits are documented before you begin.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ Icon, step, title, body }) => (
            <div
              key={step}
              className="relative rounded-2xl border border-border bg-card p-6 transition-colors hover:border-[#002D5B]/30"
            >
              <span className="absolute right-4 top-3 select-none font-mono text-5xl font-black text-muted-foreground/10">
                {step}
              </span>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#002D5B]/20 bg-[#002D5B]/10">
                <Icon className="h-6 w-6 text-[#002D5B] dark:text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/evaluation"
            className="rounded-xl bg-[#002D5B] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#003d7a]"
          >
            View evaluation plans
          </Link>
          <Link
            to="/free-trial"
            className="rounded-xl border border-border px-8 py-3 text-sm font-medium text-foreground transition-colors hover:border-[#002D5B]/40"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </section>
  )
}
