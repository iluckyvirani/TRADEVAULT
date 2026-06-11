import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Check,
  Copy,
  Inbox,
  Info,
  MoreHorizontal,
  X,
} from 'lucide-react'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'
import { useEvaluationTradingStore } from '@/store/evaluationTradingStore'
import {
  buildObjectives,
  buildPerformanceStats,
  formatIstDate,
} from '@/lib/evaluationStats'
import EquityCurveChart from '@/components/stats/EquityCurveChart'
import { formatCurrency, formatCurrencyWhole } from '@/lib/utils'
import { cn } from '@/lib/utils'

type JournalTab = 'calendar' | 'closed' | 'charts'

export default function AccountStatsPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const account = useEvaluationAccountStore((s) =>
    s.accounts.find((a) => a.id === accountId),
  )
  const [copied, setCopied] = useState(false)
  const [journalTab, setJournalTab] = useState<JournalTab>('calendar')
  const [menuOpen, setMenuOpen] = useState(false)
  const allOrders = useEvaluationTradingStore((s) => s.orders)
  const allPositions = useEvaluationTradingStore((s) => s.positions)
  const hydrateTrading = useEvaluationTradingStore((s) => s.hydrateTrading)

  useEffect(() => {
    if (accountId) void hydrateTrading(accountId)
  }, [accountId, hydrateTrading])

  if (!account) {
    return (
      <div className="p-6 text-white">
        <p>Account not found.</p>
        <Link to="/dashboard" className="mt-2 inline-block text-blue-400 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const orders = useMemo(
    () => allOrders.filter((o) => o.accountId === accountId),
    [allOrders, accountId],
  )
  const positions = useMemo(
    () =>
      allPositions.filter(
        (p) => p.accountId === accountId && p.lots > 0,
      ),
    [allPositions, accountId],
  )

  const objectives = buildObjectives(account)
  const stats = buildPerformanceStats(account)
  const maxLossLine = account.accountSize - account.maxLoss
  const dailyLossLine = account.accountSize - account.dailyMaxLoss
  const sizeLabel = formatCurrencyWhole(account.accountSize)
  const filledTrades = orders.filter((o) => o.status === 'filled')
  const tradeCount = filledTrades.length

  const dailySummary = Array.from(
    filledTrades.reduce((acc, order) => {
      const key = new Date(order.updatedAt).toLocaleDateString('en-IN')
      const current = acc.get(key) ?? { trades: 0, pnl: 0 }
      const signedValue = order.side === 'buy' ? -order.totalValue * 0.001 : order.totalValue * 0.001
      acc.set(key, {
        trades: current.trades + 1,
        pnl: current.pnl + signedValue,
      })
      return acc
    }, new Map<string, { trades: number; pnl: number }>()),
  )

  async function copyId() {
    await navigator.clipboard.writeText(account?.id ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6 lg:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate font-mono text-3xl font-semibold text-foreground">
              {account.id}
            </h1>
            <button
              type="button"
              onClick={copyId}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Copy account ID"
            >
              <Copy className="h-4 w-4" />
            </button>
            {copied && <span className="text-xs text-emerald-600">Copied!</span>}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {account.labels.map((l) => (
              <span
                key={l}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-xs',
                  l === 'ACTIVE'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : l.includes('Step')
                      ? 'border-violet-200 bg-violet-50 text-violet-700'
                      : 'border-border bg-muted text-muted-foreground',
                )}
              >
                {l}
              </span>
            ))}
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
              Size: {sizeLabel}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Created {formatIstDate(account.createdAt)} IST
          </p>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Fully simulated trading environment. Place trades in Trading Room to update
            objectives and stats.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/accounts/${account.id}/trading-room`}
            className="inline-flex items-center gap-2 rounded-full bg-[#003d7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#002d5b]"
          >
            Trading Room →
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-full border border-border p-2.5 text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-xl">
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  Reset account (mock)
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  Download report (mock)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Balance', value: account.balance, green: true },
          { label: 'Equity', value: account.equity, green: true },
          { label: 'Unrealized PNL', value: account.unrealizedPnL },
          { label: "Today's PNL", value: account.todayPnL },
        ].map(({ label, value, green }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p
              className={cn('mt-1 font-mono text-2xl font-semibold', green ? 'text-rose-600' : value >= 0 ? 'text-foreground' : 'text-rose-600')}
            >
              {formatCurrency(value)}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Loss Buffer</h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Your equity must stay above the loss lines. Daily max loss resets each trading day;
          max loss tracks from your account high-water mark.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <LossBar
            label="Max Loss"
            limit={account.maxLoss}
            line={maxLossLine}
            color="green"
          />
          <LossBar
            label="Daily Max Loss"
            limit={account.dailyMaxLoss}
            line={dailyLossLine}
            color="orange"
          />
        </div>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Tightest limit: {formatCurrency(account.dailyMaxLoss)} Daily Max Loss
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-4 py-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Rollover Profit
          </p>
          <p className="text-xs text-muted-foreground">No additional profit credited</p>
        </div>
        <p className="font-mono text-sm font-semibold text-foreground">
          {formatCurrency(account.rolloverProfit)}
        </p>
      </div>

      <EquityCurveChart account={account} />

      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-border">
          <span className="text-4xl font-semibold text-foreground">0</span>
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">Consistency Score</p>
        <p className="text-xs text-rose-500">Poor</p>
        <div className="mt-4 flex justify-center gap-16 text-xs text-muted-foreground">
          <span>DAYS</span>
          <span>UPDATED</span>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Objectives</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2">Trading Objectives</th>
              <th className="px-4 py-2">Result</th>
              <th className="px-4 py-2">Summary</th>
            </tr>
          </thead>
          <tbody>
            {objectives.map((obj) => (
              <tr key={obj.id} className="border-b border-border">
                <td className="px-4 py-3 text-foreground">{obj.label}</td>
                <td className="px-4 py-3 font-mono text-foreground">{obj.result}</td>
                <td className="px-4 py-3">
                  {obj.passed ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <X className="h-4 w-4 text-rose-600" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-4 py-2 text-[10px] text-muted-foreground">
          Updated {new Date().toLocaleString('en-IN')}
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Performance Stats</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <Info className="h-3 w-3 text-muted-foreground" />
              </div>
              <p
                className={cn(
                  'mt-1 font-mono text-base font-bold',
                  s.positive && 'text-emerald-600',
                  s.negative && 'text-rose-600',
                  !s.positive && !s.negative && 'text-foreground',
                )}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-foreground">Daily Summary</p>
        </div>
        {dailySummary.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No daily activity yet. Daily performance will appear here once trades are closed.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Trades</th>
                <th className="px-4 py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {dailySummary.map(([date, entry]) => (
                <tr key={date} className="border-t border-border">
                  <td className="px-4 py-2 text-foreground">{date}</td>
                  <td className="px-4 py-2 text-foreground">{entry.trades}</td>
                  <td className={cn('px-4 py-2 font-medium', entry.pnl < 0 ? 'text-rose-600' : 'text-emerald-600')}>
                    {entry.pnl >= 0 ? '+' : ''}{formatCurrency(entry.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Open Trades
        </p>
        <Inbox className="mx-auto mt-4 h-10 w-10 text-muted-foreground" />
        {positions.length === 0 ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">No open positions</p>
            <p className="mt-1 text-xs text-muted-foreground">
              When you open a trade, it will appear here.
            </p>
          </>
        ) : (
          <div className="mt-4 space-y-2 text-left">
            {positions.map((p) => (
              <div key={p.id} className="rounded-lg border border-border px-3 py-2">
                <p className="text-sm font-semibold text-foreground">{p.symbol}</p>
                <p className="text-xs text-muted-foreground">
                  {p.lots} lot · Entry {formatCurrency(p.avgEntry)} · LTP {formatCurrency(p.ltp)}
                </p>
                <p className={cn('text-xs font-medium', p.unrealizedPnL < 0 ? 'text-rose-600' : 'text-emerald-600')}>
                  {p.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(p.unrealizedPnL)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Trading Journal</p>
          <div className="mt-3 flex gap-2">
            {(
              [
                ['calendar', 'Calendar'],
                ['closed', 'Closed trades'],
                ['charts', 'Charts'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setJournalTab(id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium',
                  journalTab === id
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          {journalTab === 'calendar' && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">June 2026</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded bg-rose-100 px-2 py-0.5 text-rose-700">
                    Monthly PnL: {formatCurrency(account.todayPnL)}
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
                    Trading Days: {Math.max(1, account.tradingDaysCompleted)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-7 border border-border text-center text-xs">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="border-b border-border bg-muted py-2 font-medium text-muted-foreground">
                    {d}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => i + 1).map((cell) => {
                  const isTradeDay = tradeCount > 0 && cell === new Date().getDate()
                  return (
                    <div key={cell} className="min-h-[66px] border-r border-t border-border p-2 text-left">
                      <p className="text-[11px] text-muted-foreground">{cell}</p>
                      {isTradeDay && (
                        <div className="mt-1 rounded bg-rose-50 p-1">
                          <p className="text-[11px] font-semibold text-rose-700">{formatCurrency(account.todayPnL)}</p>
                          <p className="text-[10px] text-rose-600">Trades: {tradeCount}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
          {journalTab === 'closed' && (
            <div className="rounded-lg border border-border">
              <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] border-b border-border px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <p>Symbol</p>
                <p>Side</p>
                <p>Lots</p>
                <p>Price</p>
                <p>Time</p>
              </div>
              {filledTrades.length === 0 ? (
                <p className="px-3 py-4 text-sm text-muted-foreground">No closed trades for this account yet.</p>
              ) : (
                filledTrades.map((o) => (
                  <div key={o.id} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] px-3 py-2 text-sm text-foreground">
                    <p>{o.symbol}</p>
                    <p className={o.side === 'buy' ? 'text-emerald-600' : 'text-rose-600'}>{o.side.toUpperCase()}</p>
                    <p>{o.lots}</p>
                    <p>{formatCurrency(o.filledPrice ?? 0)}</p>
                    <p>{new Date(o.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                ))
              )}
            </div>
          )}
          {journalTab === 'charts' && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              P&L chart and win-rate chart will appear once you have more trade history.
            </p>
          )}
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        All activity is simulated. tradeox provides evaluation services only and does not
        provide access to live capital markets.
      </p>
    </div>
  )
}

function LossBar({
  label,
  limit,
  line,
  color,
}: {
  label: string
  limit: number
  line: number
  color: 'green' | 'orange'
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm text-foreground">{formatCurrency(limit)}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full w-full rounded-full',
            color === 'green' ? 'bg-emerald-500' : 'bg-amber-500',
          )}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">100% of limit left</p>
      <p className="text-xs text-muted-foreground">Line {formatCurrency(line)}</p>
    </div>
  )
}
