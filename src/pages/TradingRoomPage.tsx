import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'
import TradePage from '@/pages/TradePage'

/** Trading Room — full terminal UI coming next; reuses trade workspace for now. */
export default function TradingRoomPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const account = useEvaluationAccountStore((s) =>
    s.accounts.find((a) => a.id === accountId),
  )

  if (!account) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <p>Account not found.</p>
          <Link to="/dashboard" className="mt-2 inline-block text-blue-400 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-white/10 px-4">
        <Link
          to={`/accounts/${account.id}/stats`}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Stats
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-white">tradeox</span>
          <span className="text-gray-500">|</span>
          <span className="font-medium uppercase tracking-wider text-gray-300">
            Trading Room
          </span>
        </div>
        <span className="font-mono text-xs text-gray-500">{account.id.slice(0, 12)}…</span>
      </header>
      <div className="flex-1 overflow-hidden">
        <TradePage />
      </div>
    </div>
  )
}
