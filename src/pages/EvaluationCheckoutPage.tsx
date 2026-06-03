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
import TradingProgramCard from '@/components/checkout/TradingProgramCard'
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
                <h1 className={cn('text-2xl font-bold', titleCls)}>About the Evaluation</h1>
                <p className={cn('mt-1 text-xs font-semibold uppercase tracking-wider', subCls)}>
                  Trading programs
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
            <p className={cn('mt-3 max-w-2xl text-sm leading-relaxed', subCls)}>
              Choose a path to your funded account. Complete objectives and unlock your
              rewards split.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {mockTradingPrograms.map((prog) => (
                <TradingProgramCard
                  key={prog.id}
                  program={prog}
                  selected={selectedProgram === prog.id}
                  showRules={showObjectives}
                  onSelect={() => setProgram(prog.id)}
                />
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className={cn('text-xl font-bold', titleCls)}>Evaluation Plans</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {mockEvaluationPlanTiers.map((plan) => (
                <EvaluationPlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlanId === plan.id}
                  onSelect={() => setPlanId(plan.id)}
                />
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {[
                { icon: Monitor, label: 'Platform', value: 'TradingView Web Terminal' },
                { icon: Shield, label: 'Risk Rules', value: 'Clear daily loss & max loss rules.' },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className={cn('flex items-center gap-3 rounded-xl border p-4', infoBar)}
                >
                  <Icon className={cn('h-5 w-5', subCls)} />
                  <div>
                    <p className={cn('text-xs', subCls)}>{label}</p>
                    <p className={cn('text-sm font-medium', titleCls)}>{value}</p>
                  </div>
                </div>
              ))}
              <div
                className={cn(
                  'flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4',
                  infoBar,
                )}
              >
                <div className="flex items-start gap-3">
                  <MessageCircle className={cn('h-5 w-5', subCls)} />
                  <div>
                    <p className={cn('text-sm font-medium', titleCls)}>Need help?</p>
                    <p className={cn('text-sm', subCls)}>We&apos;re here for you.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
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
