import { Link } from 'react-router-dom'
import { BarChart3, Monitor, Wallet } from 'lucide-react'
import type { EvaluationAccount } from '@/lib/mock/mockEvaluationAccounts'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  account: EvaluationAccount
}

const BADGE_STYLES: Record<string, string> = {
  ACTIVE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'FREE TRIAL': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  '2-Step': 'bg-white/5 text-gray-300 border-white/10',
  '1-Step': 'bg-white/5 text-gray-300 border-white/10',
}

export default function ActiveAccountCard({ account }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#141414] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-sm text-gray-300">{account.id}</p>
            {account.labels.map((label) => (
              <span
                key={label}
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  BADGE_STYLES[label] ?? 'bg-white/5 text-gray-300 border-white/10',
                )}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-gray-400">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Account Size</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-white">
            {formatCurrency(account.accountSize)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/accounts/${account.id}/stats`}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
          <BarChart3 className="h-4 w-4" />
          View Stats
        </Link>
        <Link
          to={`/accounts/${account.id}/trading-room`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563eb]"
        >
          <Monitor className="h-4 w-4" />
          Trading Room
        </Link>
      </div>
    </div>
  )
}
