import { useEffect, useMemo, useState } from 'react'
import {
  Banknote,
  Check,
  Clock,
  Copy,
  Link2,
  Share2,
  UserCheck,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAffiliateStore } from '@/store/affiliateStore'
import { REFERRAL_REWARD_AMOUNT } from '@/lib/mock/mockAffiliate'
import { cn, formatCurrency } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
}

export default function ProfileReferralSection() {
  const user = useAuthStore((s) => s.user)
  const getOrCreateCode = useAffiliateStore((s) => s.getOrCreateCode)
  const getReferrals = useAffiliateStore((s) => s.getReferrals)
  const getStats = useAffiliateStore((s) => s.getStats)

  const [code, setCode] = useState('')
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  const userId = user?.id

  useEffect(() => {
    if (!userId) return
    setCode(getOrCreateCode(userId, user?.name ?? 'Trader'))
  }, [userId, user?.name, getOrCreateCode])

  const referrals = getReferrals(userId ?? '')
  const stats = getStats(userId ?? '')

  const pendingReferrals = useMemo(
    () => referrals.filter((r) => r.status === 'pending'),
    [referrals],
  )
  const successfulReferrals = useMemo(
    () => referrals.filter((r) => r.status === 'approved' || r.status === 'paid'),
    [referrals],
  )

  const shareLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/signup?ref=${encodeURIComponent(code)}`
      : `/signup?ref=${code}`

  const earnLabel = `Earn ₹${REFERRAL_REWARD_AMOUNT.toLocaleString('en-IN')} for each referral`

  async function copyText(text: string, kind: 'code' | 'link') {
    await navigator.clipboard.writeText(text)
    setCopied(kind)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Share2 className="h-6 w-6" />
        </div>
        <h2 className="mt-3 text-xl font-bold text-foreground">{earnLabel}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Share your code — friends enter it at signup and you earn when they purchase an evaluation.
        </p>

        <div className="mx-auto mt-5 max-w-sm rounded-xl border border-border bg-muted/50 p-4 text-left">
          <ReferralStep
            icon={Share2}
            iconClass="bg-amber-100 text-amber-700"
            label="You refer a friend"
          />
          <div className="ml-5 h-4 border-l border-dashed border-border" />
          <ReferralStep
            icon={UserCheck}
            iconClass="bg-violet-100 text-violet-700"
            label="Your friend subscribes"
          />
          <div className="ml-5 h-4 border-l border-dashed border-border" />
          <ReferralStep
            icon={Banknote}
            iconClass="bg-emerald-100 text-emerald-700"
            label={`Get ₹${REFERRAL_REWARD_AMOUNT.toLocaleString('en-IN')} cash when payment completes`}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Your referral code
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-border bg-muted px-4 py-2 font-mono text-base font-bold text-foreground">
            {code || '—'}
          </span>
          <button
            type="button"
            onClick={() => code && copyText(code, 'code')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied === 'code' ? 'Copied!' : 'Copy code'}
          </button>
        </div>

        <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Share link
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground">
            {shareLink}
          </span>
          <button
            type="button"
            onClick={() => copyText(shareLink, 'link')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Link2 className="h-3.5 w-3.5" />
            {copied === 'link' ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Lifetime earnings</h3>
          <span className="text-[10px] text-muted-foreground">
            {stats.totalReferrals} total referral{stats.totalReferrals === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-3 space-y-2">
          <StatRow
            icon={Clock}
            iconClass="bg-amber-50 text-amber-700"
            rowClass="bg-amber-50/80 dark:bg-amber-950/20"
            label="Pending referrals"
            value={String(pendingReferrals.length)}
          />
          <StatRow
            icon={Check}
            iconClass="bg-violet-50 text-violet-700"
            rowClass="bg-violet-50/80 dark:bg-violet-950/20"
            label="Successful referrals"
            value={String(successfulReferrals.length)}
          />
          <StatRow
            icon={Banknote}
            iconClass="bg-emerald-50 text-emerald-700"
            rowClass="bg-emerald-50/80 dark:bg-emerald-950/20"
            label="Total cash earned"
            value={formatCurrency(stats.paidCommission)}
          />
        </div>

        <button
          type="button"
          onClick={() => copyText(shareLink, 'link')}
          className="mt-4 w-full rounded-full bg-black py-3 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Refer now
        </button>
      </section>

      {pendingReferrals.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Pending referrals</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Friends who signed up — commission unlocks after their evaluation payment.
          </p>
          <ul className="mt-3 space-y-2">
            {pendingReferrals.map((r) => (
              <ReferralListItem key={r.id} referral={r} />
            ))}
          </ul>
        </section>
      )}

      {successfulReferrals.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Successful referrals</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Completed purchases — commission approved or paid out.
          </p>
          <ul className="mt-3 space-y-2">
            {successfulReferrals.map((r) => (
              <ReferralListItem key={r.id} referral={r} />
            ))}
          </ul>
        </section>
      )}

      {referrals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center">
          <p className="text-sm font-medium text-foreground">No referrals yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Share your code or link to start earning commissions.
          </p>
        </div>
      )}
    </div>
  )
}

function ReferralStep({
  icon: Icon,
  iconClass,
  label,
}: {
  icon: typeof Share2
  iconClass: string
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', iconClass)}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </div>
  )
}

function StatRow({
  icon: Icon,
  iconClass,
  rowClass,
  label,
  value,
}: {
  icon: typeof Clock
  iconClass: string
  rowClass: string
  label: string
  value: string
}) {
  return (
    <div className={cn('flex items-center justify-between rounded-xl px-3 py-2.5', rowClass)}>
      <div className="flex items-center gap-2.5">
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-card', iconClass)}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  )
}

function ReferralListItem({
  referral,
}: {
  referral: {
    id: string
    referredName: string
    referredEmail: string
    program: string
    commissionAmount: number
    status: string
    createdAt: string
  }
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-foreground">{referral.referredName}</p>
        <p className="truncate text-[10px] text-muted-foreground">{referral.referredEmail}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{referral.program}</p>
      </div>
      <div className="text-right">
        <span
          className={cn(
            'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
            STATUS_STYLES[referral.status],
          )}
        >
          {referral.status}
        </span>
        <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(referral.commissionAmount)}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {new Date(referral.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      </div>
    </li>
  )
}
