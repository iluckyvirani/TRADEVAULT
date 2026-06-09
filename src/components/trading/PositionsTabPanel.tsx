import { useMemo } from 'react'
import { ArrowDown, ArrowUp, Briefcase, List } from 'lucide-react'
import { useEvaluationTradingStore } from '@/store/evaluationTradingStore'
import { useTradingPanelTheme } from '@/hooks/useTradingPanelTheme'
import { cn, formatCurrency } from '@/lib/utils'

interface Props {
  accountId: string
}

export default function PositionsTabPanel({ accountId }: Props) {
  const t = useTradingPanelTheme()
  const allPositions = useEvaluationTradingStore((s) => s.positions)

  const positions = useMemo(
    () => allPositions.filter((p) => p.accountId === accountId && p.lots > 0),
    [allPositions, accountId],
  )

  const totalPnL = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0)
  const pnlPositive = totalPnL >= 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn('border-b px-2 py-2', t.border)}>
        <div
          className={cn(
            'flex items-center justify-between rounded-xl border p-3',
            t.border,
            t.cardBg,
          )}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                t.iconBg,
              )}
            >
              <Briefcase className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Positions
              </p>
              <p className={cn('text-sm font-semibold', t.textPrimary)}>
                {positions.length} open
              </p>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
              pnlPositive
                ? t.isDark
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-emerald-100 text-emerald-700'
                : t.isDark
                  ? 'bg-rose-500/15 text-rose-400'
                  : 'bg-rose-100 text-rose-700',
            )}
          >
            {pnlPositive ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )}
            {formatCurrency(totalPnL)}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {positions.length === 0 ? (
          <div
            className={cn(
              'flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center',
              t.borderDashed,
            )}
          >
            <List className={cn('h-8 w-8', t.textFaint)} strokeWidth={1.5} />
            <p className={cn('mt-3 text-sm font-semibold', t.textPrimary)}>No open positions</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {positions.map((p) => (
              <li
                key={p.id}
                className={cn('rounded-xl border p-3', t.border, t.cardBg)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={cn('text-xs font-semibold', t.textPrimary)}>{p.name}</p>
                    <p className="mt-0.5 text-[10px] text-gray-500">{p.symbol}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase',
                      t.isDark
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-emerald-100 text-emerald-700',
                    )}
                  >
                    Long
                  </span>
                </div>
                <div className={cn('mt-2 flex items-center justify-between text-[11px]', t.textMuted)}>
                  <span>
                    {p.lots} lot · Entry {formatCurrency(p.avgEntry)}
                  </span>
                  <span className="text-gray-500">LTP {formatCurrency(p.ltp)}</span>
                </div>
                <p
                  className={cn(
                    'mt-1.5 text-sm font-semibold',
                    p.unrealizedPnL >= 0
                      ? t.isDark
                        ? 'text-emerald-400'
                        : 'text-emerald-600'
                      : t.isDark
                        ? 'text-rose-400'
                        : 'text-rose-600',
                  )}
                >
                  P&L {formatCurrency(p.unrealizedPnL)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
