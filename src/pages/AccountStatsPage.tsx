import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'

export default function AccountStatsPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const account = useEvaluationAccountStore((s) =>
    s.accounts.find((a) => a.id === accountId),
  )

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

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
      <Link
        to="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-xl font-bold text-white md:text-2xl">{account.id}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {account.labels.map((l) => (
              <span
                key={l}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-300"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
        <Link
          to={`/accounts/${account.id}/trading-room`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2563eb]"
        >
          Trading Room →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Balance', value: account.balance, green: true },
          { label: 'Equity', value: account.equity, green: true },
          { label: 'Unrealized PNL', value: account.unrealizedPnL },
          { label: "Today's PNL", value: account.todayPnL },
        ].map(({ label, value, green }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-[#141414] p-4"
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              {label}
            </p>
            <p className={`mt-1 font-mono text-lg font-bold ${green ? 'text-green-400' : 'text-white'}`}>
              ₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Full stats view (equity curve, objectives, journal) coming in the next build phase.
      </p>
    </div>
  )
}
