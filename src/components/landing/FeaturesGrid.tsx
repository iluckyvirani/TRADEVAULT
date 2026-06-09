import {
  LayoutDashboard,
  CandlestickChart,
  BarChart3,
  Gift,
  CreditCard,
  Mail,
  FileCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Feature {
  Icon: LucideIcon
  title: string
  desc: string
}

const FEATURES: Feature[] = [
  {
    Icon: LayoutDashboard,
    title: 'Evaluation dashboard',
    desc: 'Manage Qualifier, Validator, and Rewards accounts. Track balance, stage progress, and quick actions from one home screen.',
  },
  {
    Icon: CandlestickChart,
    title: 'Professional trading room',
    desc: 'Full-screen charts with indicators and drawing tools. Place market, limit, and stop orders with optional TP, SL, and trigger prices.',
  },
  {
    Icon: BarChart3,
    title: 'Account statistics',
    desc: 'Equity curve, daily P&L, win rate, drawdown, and rule compliance — everything you need to review performance before payout.',
  },
  {
    Icon: FileCheck,
    title: '1-Step & 2-Step programs',
    desc: 'Choose a faster single-stage path or the full Qualifier + Validator route to prove repeatable consistency.',
  },
  {
    Icon: Gift,
    title: 'Refer & Earn',
    desc: 'Share your referral code, track signups and commissions, and manage payouts from your profile.',
  },
  {
    Icon: CreditCard,
    title: 'Billing & checkout',
    desc: 'Transparent INR pricing for evaluation access. View payment history and receipts in one place after checkout.',
  },
  {
    Icon: Mail,
    title: 'Contact & support',
    desc: 'Submit feedback and reach the team when you need help with accounts, billing, or platform questions.',
  },
]

export default function FeaturesGrid() {
  return (
    <section id="features" className="bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#002D5B] dark:text-blue-400">
            Platform
          </p>
          <h2 className="text-3xl font-bold text-foreground lg:text-5xl">
            Everything in your evaluation workspace
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            The same tools you use after signup — dashboard, trading room, stats, referrals,
            billing, and support — built for disciplined Indian intraday trading.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:border-[#002D5B]/30 hover:shadow-lg hover:shadow-[#002D5B]/5 xl:col-span-1"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#002D5B]/20 bg-[#002D5B]/10 transition-colors group-hover:bg-[#002D5B]/15">
                <Icon className="h-5 w-5 text-[#002D5B] dark:text-blue-400" />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-background p-6 md:p-8">
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Built for Indian markets
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'NIFTY & BANKNIFTY options',
              'Index futures',
              'NSE equities',
              'MCX commodities',
              'INR accounting',
              '3:15 PM auto square-off',
              'Documented drawdown rules',
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
