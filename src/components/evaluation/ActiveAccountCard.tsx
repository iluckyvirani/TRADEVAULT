import { Link } from 'react-router-dom'
import { BarChart3, ExternalLink, Wallet } from 'lucide-react'
import type { EvaluationAccount } from '@/lib/mock/mockEvaluationAccounts'
import { useThemeStore } from '@/store/themeStore'
import { formatCurrencyWhole } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  account: EvaluationAccount
}

const BADGE_STYLES: Record<string, string> = {
  ACTIVE: 'bg-amber-100 text-amber-800 border-amber-200',
  'FREE TRIAL': 'bg-sky-100 text-sky-700 border-sky-200',
  '2-Step': 'bg-violet-100 text-violet-700 border-violet-200',
  '1-Step': 'bg-violet-100 text-violet-700 border-violet-200',
}

export default function ActiveAccountCard({ account }: Props) {
  const isDark = useThemeStore((s) => s.mode === 'dark')

  return (
    <div
      className={cn(
        'rounded-2xl border p-6 shadow-sm',
        isDark
          ? 'border-white/10 bg-[#141414]'
          : 'border-gray-200 bg-white',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'font-mono text-sm font-medium',
              isDark ? 'text-gray-300' : 'text-gray-800',
            )}
          >
            {account.id}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {account.labels.map((label) => (
              <span
                key={label}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  BADGE_STYLES[label] ?? 'bg-gray-100 text-gray-600 border-gray-200',
                )}
              >
                {label === 'FREE TRIAL' && (
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                )}
                {label}
              </span>
            ))}
          </div>

          <div
            className={cn(
              'mt-5 flex items-center gap-2',
              isDark ? 'text-gray-400' : 'text-gray-500',
            )}
          >
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Account Size</span>
          </div>
          <p className={cn('mt-1 text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
            {formatCurrencyWhole(account.accountSize)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/accounts/${account.id}/stats`}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
            isDark
              ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
              : 'border-[#002D5B] bg-white text-[#002D5B] hover:bg-gray-50',
          )}
        >
          <BarChart3 className="h-4 w-4" />
          View Stats
        </Link>
        <Link
          to={`/accounts/${account.id}/trading-room`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#002D5B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#003d7a]"
        >
          <ExternalLink className="h-4 w-4" />
          Trading Room
        </Link>
      </div>
    </div>
  )
}
