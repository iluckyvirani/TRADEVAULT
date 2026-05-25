import { useState } from 'react'
import { Trophy, TrendingUp, TrendingDown, Medal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Leader {
  rank: number
  name: string
  avatar: string
  returnPct: number
  value: number
  winRate: number
  trades: number
  isMe?: boolean
}

const ALL_TIME: Leader[] = [
  { rank: 1,  name: 'AlphaWolf',    avatar: '🐺', returnPct: 38.4,  value: 138_400, winRate: 74, trades: 182 },
  { rank: 2,  name: 'NvidiaKing',   avatar: '🐉', returnPct: 31.2,  value: 131_200, winRate: 68, trades: 94 },
  { rank: 3,  name: 'SwingMaster',  avatar: '🦅', returnPct: 27.8,  value: 127_800, winRate: 65, trades: 211 },
  { rank: 4,  name: 'TechBull99',   avatar: '🦁', returnPct: 22.1,  value: 122_100, winRate: 61, trades: 77 },
  { rank: 5,  name: 'FoxTrader',    avatar: '🦊', returnPct: 18.6,  value: 118_600, winRate: 58, trades: 130 },
  { rank: 6,  name: 'DolphinDiver', avatar: '🐬', returnPct: 14.3,  value: 114_300, winRate: 55, trades: 49 },
  { rank: 7,  name: 'ButterflyFX',  avatar: '🦋', returnPct: 11.9,  value: 111_900, winRate: 52, trades: 163 },
  { rank: 8,  name: 'SharkMode',    avatar: '🦈', returnPct:  8.7,  value: 108_700, winRate: 50, trades: 88 },
  { rank: 9,  name: 'You',          avatar: '🧑', returnPct:  2.3,  value: 102_300, winRate: 44, trades: 12, isMe: true },
  { rank: 10, name: 'CalmInvestor', avatar: '🐢', returnPct: -1.4,  value:  98_600, winRate: 40, trades: 31 },
]

const WEEKLY: Leader[] = [
  { rank: 1,  name: 'SwingMaster',  avatar: '🦅', returnPct: 6.4,   value: 106_400, winRate: 71, trades: 14 },
  { rank: 2,  name: 'TechBull99',   avatar: '🦁', returnPct: 4.9,   value: 104_900, winRate: 67, trades: 9 },
  { rank: 3,  name: 'AlphaWolf',    avatar: '🐺', returnPct: 3.8,   value: 103_800, winRate: 75, trades: 22 },
  { rank: 4,  name: 'FoxTrader',    avatar: '🦊', returnPct: 2.7,   value: 102_700, winRate: 60, trades: 7 },
  { rank: 5,  name: 'You',          avatar: '🧑', returnPct: 2.3,   value: 102_300, winRate: 44, trades: 4, isMe: true },
  { rank: 6,  name: 'NvidiaKing',   avatar: '🐉', returnPct: 1.1,   value: 101_100, winRate: 55, trades: 6 },
  { rank: 7,  name: 'SharkMode',    avatar: '🦈', returnPct: 0.3,   value: 100_300, winRate: 50, trades: 3 },
  { rank: 8,  name: 'DolphinDiver', avatar: '🐬', returnPct: -0.8,  value:  99_200, winRate: 43, trades: 5 },
  { rank: 9,  name: 'ButterflyFX',  avatar: '🦋', returnPct: -1.6,  value:  98_400, winRate: 38, trades: 8 },
  { rank: 10, name: 'CalmInvestor', avatar: '🐢', returnPct: -3.1,  value:  96_900, winRate: 33, trades: 2 },
]

const MONTHLY: Leader[] = [
  { rank: 1,  name: 'NvidiaKing',   avatar: '🐉', returnPct: 14.2,  value: 114_200, winRate: 70, trades: 38 },
  { rank: 2,  name: 'AlphaWolf',    avatar: '🐺', returnPct: 11.7,  value: 111_700, winRate: 74, trades: 62 },
  { rank: 3,  name: 'FoxTrader',    avatar: '🦊', returnPct:  9.3,  value: 109_300, winRate: 63, trades: 45 },
  { rank: 4,  name: 'SwingMaster',  avatar: '🦅', returnPct:  8.1,  value: 108_100, winRate: 66, trades: 71 },
  { rank: 5,  name: 'TechBull99',   avatar: '🦁', returnPct:  6.4,  value: 106_400, winRate: 59, trades: 29 },
  { rank: 6,  name: 'SharkMode',    avatar: '🦈', returnPct:  4.2,  value: 104_200, winRate: 53, trades: 33 },
  { rank: 7,  name: 'You',          avatar: '🧑', returnPct:  2.3,  value: 102_300, winRate: 44, trades: 12, isMe: true },
  { rank: 8,  name: 'DolphinDiver', avatar: '🐬', returnPct:  1.6,  value: 101_600, winRate: 48, trades: 19 },
  { rank: 9,  name: 'ButterflyFX',  avatar: '🦋', returnPct: -0.9,  value:  99_100, winRate: 42, trades: 24 },
  { rank: 10, name: 'CalmInvestor', avatar: '🐢', returnPct: -2.4,  value:  97_600, winRate: 36, trades: 11 },
]

type TabKey = 'alltime' | 'weekly' | 'monthly'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'alltime', label: 'All-Time' },
  { key: 'weekly',  label: 'This Week' },
  { key: 'monthly', label: 'This Month' },
]

const RANK_COLORS = ['text-yellow-400', 'text-slate-300', 'text-amber-600']
const MEDAL_EMOJI = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const [tab, setTab] = useState<TabKey>('alltime')

  const data: Record<TabKey, Leader[]> = { alltime: ALL_TIME, weekly: WEEKLY, monthly: MONTHLY }
  const leaders = data[tab]
  const top3 = leaders.slice(0, 3)
  const me = leaders.find((l) => l.isMe)

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Leaderboard</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Top traders ranked by portfolio return.
          </p>
        </div>
        {me && (
          <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2">
            <span className="text-lg">{me.avatar}</span>
            <div>
              <p className="text-xs font-semibold text-foreground">Your Rank: #{me.rank}</p>
              <p className={cn('text-xs font-bold', me.returnPct >= 0 ? 'text-accent' : 'text-destructive')}>
                {me.returnPct >= 0 ? '+' : ''}{me.returnPct}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-xl border border-border bg-card p-1 text-sm w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-lg px-4 py-1.5 font-medium transition-all',
              tab === t.key ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3">
        {top3.map((l, i) => (
          <div
            key={l.rank}
            className={cn(
              'flex flex-col items-center rounded-2xl border p-5 text-center transition-all',
              i === 0 ? 'border-yellow-500/40 bg-yellow-500/5 shadow-lg shadow-yellow-500/10' :
              i === 1 ? 'border-slate-400/30 bg-slate-400/5' :
                        'border-amber-600/30 bg-amber-600/5',
            )}
          >
            <div className="mb-2 text-3xl">{MEDAL_EMOJI[i]}</div>
            <div className="mb-1 text-2xl">{l.avatar}</div>
            <p className="text-sm font-bold text-foreground">{l.name}</p>
            <p className={cn('mt-0.5 text-lg font-bold', l.returnPct >= 0 ? 'text-accent' : 'text-destructive')}>
              {l.returnPct >= 0 ? '+' : ''}{l.returnPct}%
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{l.winRate}% win rate</p>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[36px_1fr_72px] items-center border-b border-border px-5 py-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:grid-cols-[36px_1fr_72px_84px_56px_64px]">
          <span>#</span>
          <span>Trader</span>
          <span className="text-right">Return</span>
          <span className="hidden text-right sm:block">Portfolio</span>
          <span className="hidden text-right sm:block">Win%</span>
          <span className="hidden text-right sm:block">Trades</span>
        </div>
        {leaders.map((l, i) => (
          <div
            key={`${tab}-${l.rank}`}
            className={cn(
              'grid grid-cols-[36px_1fr_72px] items-center px-5 py-3.5 transition-colors sm:grid-cols-[36px_1fr_72px_84px_56px_64px]',
              i < leaders.length - 1 && 'border-b border-border/50',
              l.isMe && 'border-l-2 border-l-primary bg-primary/5',
              'hover:bg-card/80',
            )}
          >
            <span className={cn('text-sm font-bold', l.rank <= 3 ? RANK_COLORS[l.rank - 1] : 'text-muted-foreground')}>
              {l.rank <= 3 ? <Medal className="h-4 w-4 inline" style={{ color: RANK_COLORS[l.rank - 1].replace('text-', '') }} /> : l.rank}
            </span>
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg flex-shrink-0">{l.avatar}</span>
              <div className="min-w-0">
                <p className={cn('truncate text-sm font-semibold', l.isMe ? 'text-primary' : 'text-foreground')}>
                  {l.name}{l.isMe && <span className="ml-1.5 text-xs text-primary/60">(you)</span>}
                </p>
                <p className="text-[10px] text-muted-foreground">{l.trades} trades</p>
              </div>
            </div>
            <div className={cn('flex items-center justify-end gap-1 font-bold text-sm', l.returnPct >= 0 ? 'text-accent' : 'text-destructive')}>
              {l.returnPct >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {l.returnPct >= 0 ? '+' : ''}{l.returnPct}%
            </div>
            <p className="hidden text-right text-sm text-muted-foreground sm:block">
              ${(l.value / 1000).toFixed(1)}k
            </p>
            <p className={cn('hidden text-right text-sm font-medium sm:block', l.winRate >= 55 ? 'text-accent' : l.winRate >= 45 ? 'text-foreground' : 'text-muted-foreground')}>
              {l.winRate}%
            </p>
            <p className="hidden text-right text-sm text-muted-foreground sm:block">{l.trades}</p>
          </div>
        ))}
      </div>

      {/* Trophy footer */}
      <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm text-muted-foreground">
        <Trophy className="h-4 w-4 flex-shrink-0 text-primary" />
        <span>Rankings update every 15 minutes during market hours. Paper trading only — no real money involved.</span>
      </div>
    </div>
  )
}

