import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageCircle, Monitor, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'
import { useCheckoutStore } from '@/store/checkoutStore'
import {
  mockEvaluationPlanTiers,
  mockTradingPrograms,
} from '@/lib/mock/mockAssessmentPlans'
import EvaluationPlanCard from '@/components/checkout/EvaluationPlanCard'
import OrderSummarySidebar from '@/components/checkout/OrderSummarySidebar'
import { getPlanById } from '@/lib/mock/mockAssessmentPlans'
import { useAffiliateStore } from '@/store/affiliateStore'
import { useBillingStore } from '@/store/billingStore'
import { useThemeStore } from '@/store/themeStore'
import { cn, formatCurrencyWhole } from '@/lib/utils'

export default function EvaluationCheckoutPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const markEvaluationStarted = useAuthStore((s) => s.markEvaluationStarted)
  const createPaid = useEvaluationAccountStore((s) => s.createPaid)
  const isDark = useThemeStore((s) => s.mode === 'dark')

  const selectedProgram = useCheckoutStore((s) => s.selectedProgram)
  const selectedPlanId = useCheckoutStore((s) => s.selectedPlanId)
  const showObjectives = useCheckoutStore((s) => s.showObjectives)
  const setProgram = useCheckoutStore((s) => s.setProgram)
  const setPlanId = useCheckoutStore((s) => s.setPlanId)
  const setShowObjectives = useCheckoutStore((s) => s.setShowObjectives)
  const setPaying = useCheckoutStore((s) => s.setPaying)
  const setAffiliateCode = useCheckoutStore((s) => s.setAffiliateCode)
  const affiliateCode = useCheckoutStore((s) => s.affiliateCode)
  const termsAccepted = useCheckoutStore((s) => s.termsAccepted)
  const recordReferral = useAffiliateStore((s) => s.recordReferralFromCheckout)
  const addPayment = useBillingStore((s) => s.addPayment)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setAffiliateCode(ref.toUpperCase())
  }, [searchParams, setAffiliateCode])

  async function handlePay() {
    if (!user || !termsAccepted) return
    const plan = getPlanById(selectedPlanId)
    if (!plan) return

    setPaying(true)
    await new Promise((r) => setTimeout(r, 1500))

    createPaid(user.id, {
      stepType: selectedProgram,
      accountSize: plan.balance,
    })

    addPayment({
      userId: user.id,
      program: `${selectedProgram} · ${formatCurrencyWhole(plan.balance)}`,
      accountSize: plan.balance,
      amount: plan.evaluationFee,
      currency: 'INR',
      status: 'paid',
      paymentMethod: 'UPI · Mock',
    })

    if (affiliateCode.trim()) {
      recordReferral({
        affiliateCode,
        buyerUserId: user.id,
        buyerName: user.name,
        buyerEmail: user.email,
        orderAmount: plan.evaluationFee,
        program: `${selectedProgram} · ${formatCurrencyWhole(plan.balance)}`,
      })
    }

    markEvaluationStarted()
    setPaying(false)
    navigate('/dashboard')
  }

  const titleCls = isDark ? 'text-white' : 'text-gray-900'
  const subCls = isDark ? 'text-gray-400' : 'text-gray-500'
  const infoBar = isDark
    ? 'border-white/10 bg-[#141414]'
    : 'border-gray-200 bg-white'

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <section>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className={cn('text-2xl font-bold', titleCls)}>Evaluation Plans</h1>
                <p className={cn('mt-2 max-w-2xl text-sm leading-relaxed', subCls)}>
                  Choose your account size and program. Complete objectives and unlock your
                  rewards split.
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <span className={cn('text-sm', subCls)}>Objectives</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showObjectives}
                  onClick={() => setShowObjectives(!showObjectives)}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    showObjectives ? 'bg-[#002D5B]' : 'bg-gray-300',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                      showObjectives ? 'left-[22px]' : 'left-0.5',
                    )}
                  />
                </button>
              </label>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {mockEvaluationPlanTiers.flatMap((plan) =>
                mockTradingPrograms.map((program) => {
                  const selected =
                    selectedPlanId === plan.id && selectedProgram === program.id
                  return (
                    <EvaluationPlanCard
                      key={`${plan.id}-${program.id}`}
                      plan={plan}
                      program={program}
                      selected={selected}
                      showObjectives={showObjectives}
                      onSelect={() => {
                        setPlanId(plan.id)
                        setProgram(program.id)
                      }}
                    />
                  )
                }),
              )}
            </div>

            <div className="mt-6 space-y-2">
              {[
                { icon: Monitor, label: 'Platform', value: 'TradingView Web Terminal' },
                { icon: Shield, label: 'Risk Rules', value: 'Clear daily loss & max loss rules.' },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className={cn('flex items-center gap-2.5 rounded-xl border p-3', infoBar)}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', subCls)} />
                  <div>
                    <p className={cn('text-[10px]', subCls)}>{label}</p>
                    <p className={cn('text-xs font-medium', titleCls)}>{value}</p>
                  </div>
                </div>
              ))}
              <div
                className={cn(
                  'flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3',
                  infoBar,
                )}
              >
                <div className="flex items-start gap-2.5">
                  <MessageCircle className={cn('h-4 w-4 shrink-0', subCls)} />
                  <div>
                    <p className={cn('text-xs font-medium', titleCls)}>Need help?</p>
                    <p className={cn('text-[10px]', subCls)}>We&apos;re here for you.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Chat
                </button>
              </div>
            </div>
          </section>
        </div>

        <OrderSummarySidebar onPay={handlePay} />
      </div>
    </div>
  )
}
