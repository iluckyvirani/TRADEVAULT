import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageCircle, Monitor, Shield } from 'lucide-react'
import { ApiError } from '@/lib/api/client'
import * as checkoutApi from '@/lib/api/checkout'
import { getMe } from '@/lib/api/auth'
import { openRazorpayCheckout } from '@/lib/razorpay'
import { useAuthStore } from '@/store/authStore'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'
import { useCheckoutStore } from '@/store/checkoutStore'
import EvaluationPlanCard from '@/components/checkout/EvaluationPlanCard'
import OrderSummarySidebar from '@/components/checkout/OrderSummarySidebar'
import { usePlans } from '@/hooks/usePlans'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/lib/utils'

export default function EvaluationCheckoutPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setSession = useAuthStore((s) => s.setSession)
  const hydrateAccounts = useEvaluationAccountStore((s) => s.hydrateAccounts)
  const isDark = useThemeStore((s) => s.mode === 'dark')
  const [payError, setPayError] = useState('')

  const selectedPlanId = useCheckoutStore((s) => s.selectedPlanId)
  const setPlanId = useCheckoutStore((s) => s.setPlanId)
  const setPaying = useCheckoutStore((s) => s.setPaying)
  const setAffiliateCode = useCheckoutStore((s) => s.setAffiliateCode)
  const affiliateCode = useCheckoutStore((s) => s.affiliateCode)
  const termsAccepted = useCheckoutStore((s) => s.termsAccepted)
  const { tiers } = usePlans()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setAffiliateCode(ref.toUpperCase())
  }, [searchParams, setAffiliateCode])

  async function completeCheckout() {
    await hydrateAccounts()
    const me = await getMe()
    setSession({
      user: me.user,
      registrationStep: me.registrationStep,
      onboardingComplete: me.onboardingComplete,
    })
    navigate('/dashboard')
  }

  async function handlePay() {
    if (!user || !termsAccepted) return
    const plan = tiers.find((p) => p.id === selectedPlanId)
    if (!plan) return

    setPaying(true)
    setPayError('')

    try {
      const order = await checkoutApi.createCheckoutOrder({
        planId: plan.id,
        affiliateCode: affiliateCode.trim() || undefined,
      })

      if (order.mock) {
        await checkoutApi.mockCompleteCheckout(order.billingRecordId)
        await completeCheckout()
        return
      }

      if (!order.keyId || !order.razorpayOrderId) {
        throw new Error('Payment gateway is not configured')
      }

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || order.keyId

      await new Promise<void>((resolve, reject) => {
        void openRazorpayCheckout({
          keyId,
          orderId: order.razorpayOrderId!,
          amount: order.amount,
          currency: order.currency,
          name: 'tradeox',
          description: order.program,
          email: user.email,
          contact: user.phone ?? undefined,
          onSuccess: async (response) => {
            try {
              await checkoutApi.verifyCheckoutPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              await completeCheckout()
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          onDismiss: () => {
            reject(new Error('Payment cancelled'))
          },
        })
      })
    } catch (err) {
      if (err instanceof Error && err.message === 'Payment cancelled') {
        setPayError('Payment was cancelled')
      } else {
        setPayError(err instanceof ApiError ? err.message : 'Payment failed')
      }
    } finally {
      setPaying(false)
    }
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
            <div>
              <h1 className={cn('text-2xl font-bold', titleCls)}>Evaluation Plans</h1>
              <p className={cn('mt-2 max-w-2xl text-sm leading-relaxed', subCls)}>
                Choose your account size. Each plan includes the evaluation objectives below —
                complete them to unlock your reward.
              </p>
            </div>

            {payError && (
              <p className="mt-4 text-sm text-red-600">{payError}</p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {tiers.map((plan) => (
                <EvaluationPlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlanId === plan.id}
                  onSelect={() => setPlanId(plan.id)}
                />
              ))}
            </div>

            <div className="mt-6 space-y-2">
              {[
                { icon: Monitor, label: 'Platform', value: 'TradingView Web Terminal' },
                { icon: Shield, label: 'Risk Rules', value: 'Clear daily loss & max loss limits.' },
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
