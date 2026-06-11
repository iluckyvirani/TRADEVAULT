import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchEquityCurve } from '@/lib/api/accounts'
import { buildMockEquityCurve } from '@/lib/mock/mockEquityCurve'
import type { EvaluationAccount } from '@/lib/mock/mockEvaluationAccounts'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  account: EvaluationAccount
}

export default function EquityCurveChart({ account }: Props) {
  const [mode, setMode] = useState<'absolute' | 'percent'>('absolute')
  const [showObjectives, setShowObjectives] = useState(true)
  const [apiPoints, setApiPoints] = useState<ReturnType<typeof buildMockEquityCurve> | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false
    fetchEquityCurve(account.id)
      .then((res) => {
        if (!cancelled && res.points.length > 0) setApiPoints(res.points)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [account.id])

  const data = useMemo(() => {
    const points =
      apiPoints ?? buildMockEquityCurve(account.id, account.accountSize)
    const base = account.accountSize
    return points.map((p) => {
      const d = new Date(p.timestamp)
      return {
        label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        equity: p.equity,
        pct: base > 0 ? ((p.equity - base) / base) * 100 : 0,
      }
    })
  }, [account.id, account.accountSize, apiPoints])

  const targetLine = account.accountSize + account.profitTarget
  const breachLine = account.accountSize - account.dailyMaxLoss

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Equity Curve</h3>
          <p className="text-xs text-muted-foreground">
            Live account performance · IST (Asia/Kolkata)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5">
            {(['absolute', 'percent'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[10px] font-medium capitalize',
                  mode === m ? 'bg-[#002D5B] text-white' : 'text-muted-foreground',
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[10px] text-muted-foreground">
            <span>Objectives</span>
            <button
              type="button"
              role="switch"
              aria-checked={showObjectives}
              onClick={() => setShowObjectives((v) => !v)}
              className={cn(
                'relative h-5 w-9 rounded-full transition-colors',
                showObjectives ? 'bg-emerald-500' : 'bg-gray-300',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                  showObjectives ? 'left-4' : 'left-0.5',
                )}
              />
            </button>
          </label>
        </div>
      </div>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="currentColor" opacity={0.5} />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke="currentColor"
              opacity={0.5}
              tickFormatter={(v) =>
                mode === 'percent' ? `${v.toFixed(1)}%` : formatCurrency(v)
              }
            />
            <Tooltip
              formatter={(v) => {
                const n = typeof v === 'number' ? v : Number(v ?? 0)
                return mode === 'percent' ? `${n.toFixed(2)}%` : formatCurrency(n)
              }}
            />
            {mode === 'absolute' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#002D5B"
                  fill="#002D5B22"
                  strokeWidth={2}
                />
                {showObjectives && (
                  <>
                    <Line
                      type="monotone"
                      dataKey={() => targetLine}
                      stroke="#22c55e"
                      strokeDasharray="4 4"
                      dot={false}
                      name="Profit target"
                    />
                    <Line
                      type="monotone"
                      dataKey={() => breachLine}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      dot={false}
                      name="Daily loss limit"
                    />
                  </>
                )}
              </>
            ) : (
              <Area
                type="monotone"
                dataKey="pct"
                stroke="#002D5B"
                fill="#002D5B22"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
