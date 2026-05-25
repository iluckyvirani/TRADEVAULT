import {
  BarChart2,
  Activity,
  ShoppingCart,
  PieChart,
  Bookmark,
  BookOpen,
  Trophy,
  Shield,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Feature {
  Icon: LucideIcon
  title: string
  desc: string
}

const FEATURES: Feature[] = [
  {
    Icon: BarChart2,
    title: 'Real-Time Charts',
    desc: 'TradingView-grade candlestick charts with 50+ technical indicators and drawing tools.',
  },
  {
    Icon: Activity,
    title: 'Live Market Quotes',
    desc: 'Streaming prices via Polygon.io. See every tick as it happens, without delay.',
  },
  {
    Icon: ShoppingCart,
    title: 'All Order Types',
    desc: 'Market, Limit, Stop-Loss, and Trailing Stop orders with instant paper simulation.',
  },
  {
    Icon: PieChart,
    title: 'Portfolio Analytics',
    desc: 'Sector allocation, beta, Sharpe ratio, and max drawdown — all in one view.',
  },
  {
    Icon: Bookmark,
    title: 'Smart Watchlists',
    desc: 'Organize symbols into multiple lists with customizable columns and price alerts.',
  },
  {
    Icon: BookOpen,
    title: 'Trade Journal',
    desc: 'Auto-log every trade. Add notes, screenshots, emotional tags, and retrospectives.',
  },
  {
    Icon: Trophy,
    title: 'Leaderboard',
    desc: 'Compete with thousands of traders. Weekly and all-time performance rankings.',
  },
  {
    Icon: Shield,
    title: 'Risk Simulator',
    desc: 'Model what-if scenarios and estimate Value at Risk before pulling the trigger.',
  },
]

export default function FeaturesGrid() {
  return (
    <section id="features" className="bg-card/20 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Features
          </p>
          <h2 className="text-3xl font-bold text-foreground lg:text-5xl">
            Everything a real trader needs
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            TradeVault gives you a full brokerage experience — charts, analytics,
            orders, and social features — without risking a cent.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
