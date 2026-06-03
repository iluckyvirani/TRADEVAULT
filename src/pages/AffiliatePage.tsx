import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  Copy,
  IndianRupee,
  Link2,
  Users,
  Wallet,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAffiliateStore } from '@/store/affiliateStore'
import { AFFILIATE_COMMISSION_RATE, MIN_PAYOUT_AMOUNT } from '@/lib/mock/mockAffiliate'
import { cn, formatCurrency } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

export default function AffiliatePage() {
  const user = useAuthStore((s) => s.user)
  const getOrCreateCode = useAffiliateStore((s) => s.getOrCreateCode)
  const getReferrals = useAffiliateStore((s) => s.getReferrals)
  const getPayouts = useAffiliateStore((s) => s.getPayouts)
  const getStats = useAffiliateStore((s) => s.getStats)
  const requestPayout = useAffiliateStore((s) => s.requestPayout)

  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null)

  const userId = user?.id
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!userId) return
    setCode(getOrCreateCode(userId, user?.name ?? 'Trader'))
  }, [userId, user?.name, getOrCreateCode])

  const referrals = getReferrals(userId ?? '')
  const payouts = getPayouts(userId ?? '')
  const stats = getStats(userId ?? '')

  const shareLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/evaluation?ref=${encodeURIComponent(code)}`
      : `/evaluation?ref=${code}`

  async function copyText(text: string, kind: 'code' | 'link') {
    await navigator.clipboard.writeText(text)
    setCopied(kind)
    setTimeout(() => setCopied(null), 2000)
  }

  function handleRequestPayout() {
    if (!userId) return
    const result = requestPayout(userId)
    setPayoutMsg(result.message)
    setTimeout(() => setPayoutMsg(null), 4000)
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-7">
      <p className="text-xs text-muted-foreground">Home / Affiliate</p>

      <h1 className="mt-3 text-3xl font-semibold text-foreground">Affiliate Program</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Share your link, earn {(AFFILIATE_COMMISSION_RATE * 100).toFixed(0)}% commission when
        referred traders purchase an evaluation. All amounts are simulated for demo purposes.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total referrals"
          value={String(stats.totalReferrals)}
        />
        <StatCard
          icon={IndianRupee}
          label="Pending commission"
          value={formatCurrency(stats.pendingCommission)}
          highlight={stats.pendingCommission > 0}
        />
        <StatCard
          icon={Wallet}
          label="Approved (payable)"
          value={formatCurrency(stats.approvedCommission)}
        />
        <StatCard
          icon={Check}
          label="Paid out"
          value={formatCurrency(stats.paidCommission)}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Your affiliate link</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Share this code at checkout or send the evaluation link below.
          </p>

          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Affiliate code
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="rounded-lg border border-border bg-muted px-4 py-2.5 font-mono text-lg font-bold text-foreground">
                {code}
              </span>
              <button
                type="button"
                onClick={() => copyText(code, 'code')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Copy className="h-4 w-4" />
                {copied === 'code' ? 'Copied!' : 'Copy code'}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Share link
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground">
                {shareLink}
              </span>
              <button
                type="button"
                onClick={() => copyText(shareLink, 'link')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Link2 className="h-4 w-4" />
                {copied === 'link' ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/evaluation"
              className="inline-flex items-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-black"
            >
              Go to checkout
            </Link>
            <button
              type="button"
              onClick={handleRequestPayout}
              disabled={stats.approvedCommission < MIN_PAYOUT_AMOUNT}
              className={cn(
                'rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition-colors',
                stats.approvedCommission >= MIN_PAYOUT_AMOUNT
                  ? 'text-foreground hover:bg-muted'
                  : 'cursor-not-allowed text-muted-foreground',
              )}
            >
              Request payout
            </button>
          </div>
          {payoutMsg && (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">{payoutMsg}</p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Minimum payout {formatCurrency(MIN_PAYOUT_AMOUNT)} from approved commissions.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">How it works</h2>
          <ol className="mt-4 space-y-4">
            {[
              'Copy your code or share link with traders.',
              'They enter the code on the evaluation checkout page.',
              `You earn ${(AFFILIATE_COMMISSION_RATE * 100).toFixed(0)}% commission when payment completes.`,
            ].map((text, i) => (
              <li key={text} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{text}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <strong className="text-foreground">Demo tip:</strong> Use code{' '}
            <button
              type="button"
              onClick={() => copyText('DEMO123', 'code')}
              className="font-mono font-semibold text-[#002D5B] hover:underline dark:text-[#8bb4e8]"
            >
              DEMO123
            </button>{' '}
            at checkout to simulate a referral (credits demo partner, not your account).
          </p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Referrals</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Traders who used your affiliate code at checkout.
        </p>

        {referrals.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            No referrals yet. Share your link to start earning commissions.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Trader</th>
                    <th className="px-4 py-3">Program</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Commission</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{r.referredName}</p>
                        <p className="text-xs text-muted-foreground">{r.referredEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-foreground">{r.program}</td>
                      <td className="px-4 py-3 text-foreground">
                        {formatCurrency(r.orderAmount)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(r.commissionAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize',
                            STATUS_STYLES[r.status],
                          )}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Payout history</h2>
        {payouts.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No payouts yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {payouts.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <span className="text-muted-foreground">
                  {new Date(p.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(p.amount)}
                </span>
                <span className="text-xs capitalize text-emerald-600 dark:text-emerald-400">
                  {p.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Users
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <p className="text-[10px] font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <p
        className={cn(
          'mt-2 text-2xl font-bold',
          highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground',
        )}
      >
        {value}
      </p>
    </div>
  )
}
