import { Loader2, Shield, Tag, Zap } from 'lucide-react'
import { useCheckoutStore } from '@/store/checkoutStore'
import { getPlanById, mockEvaluationPlanTiers } from '@/lib/mock/mockAssessmentPlans'
import { cn, formatCurrencyWhole } from '@/lib/utils'

interface Props {
  onPay: () => void
}

export default function OrderSummarySidebar({ onPay }: Props) {
  const selectedProgram = useCheckoutStore((s) => s.selectedProgram)
  const selectedPlanId = useCheckoutStore((s) => s.selectedPlanId)
  const termsAccepted = useCheckoutStore((s) => s.termsAccepted)
  const setTermsAccepted = useCheckoutStore((s) => s.setTermsAccepted)
  const affiliateCode = useCheckoutStore((s) => s.affiliateCode)
  const setAffiliateCode = useCheckoutStore((s) => s.setAffiliateCode)
  const paying = useCheckoutStore((s) => s.paying)
  const plan = getPlanById(selectedPlanId) ?? mockEvaluationPlanTiers[2]

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Order summary</h2>

        <div className="mt-4 rounded-xl bg-slate-100 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Total payable
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ₹ {plan.evaluationFee.toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-gray-400 line-through">
              ₹ {plan.originalFee.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-green-600">
            You save ₹ {plan.savings.toLocaleString('en-IN')} 🎉
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { icon: Shield, label: 'Secure' },
              { icon: Zap, label: 'Fast' },
              { icon: Tag, label: 'Fixed Fee' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-500"
              >
                <Icon className="h-3 w-3" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <dl className="mt-4 space-y-3 text-sm">
          {[
            ['Program', selectedProgram],
            ['Account size', formatCurrencyWhole(plan.balance)],
            ['Currency', 'INR'],
            ['Platform', 'TradingView Web'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between border-b border-gray-100 pb-2"
            >
              <dt className="text-gray-500">{label}</dt>
              <dd className="font-medium text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 text-center text-xs text-gray-400">
          UPI · Card · Netbanking
        </p>

        <label className="mt-4 block">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Affiliate code
          </span>
          <div className="relative mt-1">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={affiliateCode}
              onChange={(e) => setAffiliateCode(e.target.value)}
              placeholder="e.g. ABC123"
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#002D5B]"
            />
          </div>
        </label>

        <label className="mt-4 flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1"
          />
          <span className="text-xs leading-relaxed text-gray-600">
            I agree to the payment &amp; service terms. Fees are non-refundable except for
            verified payment errors. See Refund Policy, Terms, and Privacy Policy.
          </span>
        </label>

        <button
          type="button"
          disabled={!termsAccepted || paying}
          onClick={onPay}
          className={cn(
            'mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-colors',
            termsAccepted && !paying
              ? 'bg-[#002D5B] hover:bg-[#003d7a]'
              : 'cursor-not-allowed bg-[#5B7FA6]/60',
          )}
        >
          {paying && <Loader2 className="h-4 w-4 animate-spin" />}
          Pay ₹ {plan.evaluationFee.toLocaleString('en-IN')}
        </button>

        <p className="mt-3 text-center text-[10px] text-gray-400">
          Account issued instantly after payment. In rare cases, up to 24 hours.
        </p>
      </div>
    </aside>
  )
}
