import { useMemo, useState } from 'react'
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
            <h1 className="truncate font-mono text-3xl font-semibold text-gray-900">
              {account.id}
            </h1>
            <button
              type="button"
              onClick={copyId}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
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
                      : 'border-gray-200 bg-gray-100 text-gray-600',
                )}
              >
                {l}
              </span>
            ))}
            <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs text-gray-600">
              Size: {sizeLabel}
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Created {formatIstDate(account.createdAt)} IST
          </p>
          <p className="mt-2 max-w-xl text-sm text-gray-500">
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
              className="rounded-full border border-gray-200 p-2.5 text-gray-500 hover:text-gray-900"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Reset account (mock)
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
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
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              {label}
            </p>
            <p
              className={cn('mt-1 font-mono text-2xl font-semibold', green ? 'text-rose-600' : value >= 0 ? 'text-gray-900' : 'text-rose-600')}
            >
              {formatCurrency(value)}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Loss Buffer</h2>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
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

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Rollover Profit
          </p>
          <p className="text-xs text-gray-400">No additional profit credited</p>
        </div>
        <p className="font-mono text-sm font-semibold text-gray-900">
          {formatCurrency(account.rolloverProfit)}
        </p>
      </div>

      <EquityCurveChart account={account} />

      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-gray-100">
          <span className="text-4xl font-semibold text-gray-900">0</span>
        </div>
        <p className="mt-3 text-sm font-medium text-gray-900">Consistency Score</p>
        <p className="text-xs text-rose-500">Poor</p>
        <div className="mt-4 flex justify-center gap-16 text-xs text-gray-500">
          <span>DAYS</span>
          <span>UPDATED</span>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">Objectives</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-[10px] uppercase tracking-wider text-gray-500">
              <th className="px-4 py-2">Trading Objectives</th>
              <th className="px-4 py-2">Result</th>
              <th className="px-4 py-2">Summary</th>
            </tr>
          </thead>
          <tbody>
            {objectives.map((obj) => (
              <tr key={obj.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-700">{obj.label}</td>
                <td className="px-4 py-3 font-mono text-gray-900">{obj.result}</td>
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
        <p className="px-4 py-2 text-[10px] text-gray-600">
          Updated {new Date().toLocaleString('en-IN')}
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Performance Stats</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                  {s.label}
                </p>
                <Info className="h-3 w-3 text-gray-600" />
              </div>
              <p
                className={cn(
                  'mt-1 font-mono text-base font-bold',
                  s.positive && 'text-emerald-600',
                  s.negative && 'text-rose-600',
                  !s.positive && !s.negative && 'text-gray-900',
                )}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-b border-gray-200 px-4 py-3">
          <p className="text-sm font-medium text-gray-900">Daily Summary</p>
        </div>
        {dailySummary.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">
            No daily activity yet. Daily performance will appear here once trades are closed.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-gray-500">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Trades</th>
                <th className="px-4 py-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {dailySummary.map(([date, entry]) => (
                <tr key={date} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-800">{date}</td>
                  <td className="px-4 py-2 text-gray-800">{entry.trades}</td>
                  <td className={cn('px-4 py-2 font-medium', entry.pnl < 0 ? 'text-rose-600' : 'text-emerald-600')}>
                    {entry.pnl >= 0 ? '+' : ''}{formatCurrency(entry.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-medium text-gray-900">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Open Trades
        </p>
        <Inbox className="mx-auto mt-4 h-10 w-10 text-gray-600" />
        {positions.length === 0 ? (
          <>
            <p className="mt-2 text-sm text-gray-500">No open positions</p>
            <p className="mt-1 text-xs text-gray-500">
              When you open a trade, it will appear here.
            </p>
          </>
        ) : (
          <div className="mt-4 space-y-2 text-left">
            {positions.map((p) => (
              <div key={p.id} className="rounded-lg border border-gray-200 px-3 py-2">
                <p className="text-sm font-semibold text-gray-900">{p.symbol}</p>
                <p className="text-xs text-gray-500">
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

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <p className="text-sm font-semibold text-gray-900">Trading Journal</p>
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
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600',
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
                <p className="text-sm font-medium text-gray-900">June 2026</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded bg-rose-100 px-2 py-0.5 text-rose-700">
                    Monthly PnL: {formatCurrency(account.todayPnL)}
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
                    Trading Days: {Math.max(1, account.tradingDaysCompleted)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-7 border border-gray-200 text-center text-xs">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div key={d} className="border-b border-gray-200 bg-gray-50 py-2 font-medium text-gray-500">
                    {d}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => i + 1).map((cell) => {
                  const isTradeDay = tradeCount > 0 && cell === new Date().getDate()
                  return (
                    <div key={cell} className="min-h-[66px] border-r border-t border-gray-100 p-2 text-left">
                      <p className="text-[11px] text-gray-500">{cell}</p>
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
            <div className="rounded-lg border border-gray-200">
              <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] border-b border-gray-200 px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500">
                <p>Symbol</p>
                <p>Side</p>
                <p>Lots</p>
                <p>Price</p>
                <p>Time</p>
              </div>
              {filledTrades.length === 0 ? (
                <p className="px-3 py-4 text-sm text-gray-500">No closed trades for this account yet.</p>
              ) : (
                filledTrades.map((o) => (
                  <div key={o.id} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr] px-3 py-2 text-sm text-gray-800">
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
            <p className="py-6 text-center text-sm text-gray-500">
              P&L chart and win-rate chart will appear once you have more trade history.
            </p>
          )}
        </div>
      </section>

      <p className="text-center text-xs text-gray-500">
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
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm text-gray-900">{formatCurrency(limit)}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={cn(
            'h-full w-full rounded-full',
            color === 'green' ? 'bg-emerald-500' : 'bg-amber-500',
          )}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">100% of limit left</p>
      <p className="text-xs text-gray-400">Line {formatCurrency(line)}</p>
    </div>
  )
}
