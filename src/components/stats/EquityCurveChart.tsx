import { useMemo, useState } from 'react'
import {
  Area,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
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

  const data = useMemo(() => {
    const points = buildMockEquityCurve(account.id, account.accountSize)
    const base = account.accountSize
    return points.map((p) => {
      const d = new Date(p.timestamp)
      return {
        label: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        equity: p.equity,
        pct: base > 0 ? ((p.equity - base) / base) * 100 : 0,
      }
    })
  }, [account.id, account.accountSize])

  const targetLine = account.accountSize + account.profitTarget
  const breachLine = account.accountSize - account.dailyMaxLoss

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Equity Curve</h3>
          <p className="text-xs text-gray-500">
            Live account performance · IST (Asia/Kolkata)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            {(['absolute', 'percent'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-md px-2 py-1 text-xs font-medium',
                  mode === m ? 'bg-gray-900 text-white' : 'text-gray-500',
                )}
              >
                {m === 'absolute' ? '₹ Absolute' : '% Change'}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            OBJECTIVES
            <button
              type="button"
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
          <button
            type="button"
            className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:text-gray-900"
          >
            Reset View
          </button>
        </div>
      </div>

      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickFormatter={(v) =>
                mode === 'absolute'
                  ? `₹${(v / 100000).toFixed(0)}L`
                  : `${Number(v).toFixed(1)}%`
              }
            />
            <Tooltip
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) =>
                mode === 'absolute'
                  ? formatCurrency(Number(value))
                  : `${Number(value).toFixed(2)}%`
              }
            />
            {mode === 'absolute' && showObjectives && (
              <>
                <Area
                  type="monotone"
                  dataKey={() => targetLine}
                  stroke="#dc2626"
                  fill="#fee2e2"
                  fillOpacity={0.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey={() => breachLine}
                  stroke="#dc2626"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  dot={false}
                  isAnimationActive={false}
                />
              </>
            )}
            <Line
              type="monotone"
              dataKey={mode === 'absolute' ? 'equity' : 'pct'}
              stroke="#dc2626"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
