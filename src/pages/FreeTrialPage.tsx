import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Monitor, MessageCircle, Star } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'
import type { EvaluationStep } from '@/lib/mock/mockEvaluationAccounts'
import { cn, formatCurrencyWhole } from '@/lib/utils'

const BALANCE_TIERS = [
  { id: '2L', size: 200_000, popular: false },
  { id: '5L', size: 500_000, popular: false },
  { id: '10L', size: 1_000_000, popular: true },
  { id: '25L', size: 2_500_000, popular: false },
] as const

const PROGRAMS: {
  step: EvaluationStep
  title: string
  rules: string[]
}[] = [
  {
    step: '1-Step',
    title: '1-Step',
    rules: [
      'EOD Trailing Drawdown',
      '3% Daily Loss',
      '10% Max Loss (EOD)',
    ],
  },
  {
    step: '2-Step',
    title: '2-Step',
    rules: [
      'Fixed Drawdown',
      '5% Daily Loss',
      '10% Max Loss (Static)',
    ],
  },
]

export default function FreeTrialPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const markEvaluationStarted = useAuthStore((s) => s.markEvaluationStarted)
  const createFreeTrial = useEvaluationAccountStore((s) => s.createFreeTrial)

  const [stepType, setStepType] = useState<EvaluationStep>('2-Step')
  const [accountSize, setAccountSize] = useState(1_000_000)

  function handleStart() {
    if (!user) return
    createFreeTrial(user.id, { stepType, accountSize })
    markEvaluationStarted()
    navigate('/dashboard')
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <h1 className="text-2xl font-bold text-foreground">About the Free Trial</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The Free Trial is a risk-free way to explore the platform in a simulated environment.
            You can practice trading, understand how evaluation rules work, and get familiar with
            the interface before starting a paid assessment.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Free Trial accounts are not eligible for Rewards Accounts. When you are ready for a
            formal evaluation, choose a paid assessment path from the dashboard.
          </p>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Program
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PROGRAMS.map((prog) => {
              const selected = stepType === prog.step
              return (
                <button
                  key={prog.step}
                  type="button"
                  onClick={() => setStepType(prog.step)}
                  className={cn(
                    'relative rounded-2xl border p-5 text-left transition-all',
                    selected
                      ? 'border-[#002D5B] bg-[#002D5B] text-white shadow-md'
                      : 'border-border bg-card text-foreground hover:border-muted-foreground/40',
                  )}
                >
                  {selected && (
                    <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-white">
                      <Check className="h-3 w-3 text-[#002D5B]" />
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{prog.title}</h3>
                  <ul className="mt-3 space-y-1.5">
                    {prog.rules.map((rule) => (
                      <li
                        key={rule}
                        className={cn(
                          'text-sm',
                          selected ? 'text-blue-100' : 'text-muted-foreground',
                        )}
                      >
                        {rule}
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Account Balance
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4">
            {BALANCE_TIERS.map((tier) => {
              const selected = accountSize === tier.size
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setAccountSize(tier.size)}
                  className={cn(
                    'relative rounded-2xl border p-5 text-left transition-all',
                    selected
                      ? 'border-[#002D5B] bg-[#002D5B] text-white shadow-md'
                      : 'border-border bg-card hover:border-muted-foreground/40',
                  )}
                >
                  {tier.popular && (
                    <span className="absolute -top-2.5 left-3 rounded bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-950">
                      ★ Most Popular
                    </span>
                  )}
                  {selected && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-white">
                      <Check className="h-3 w-3 text-[#002D5B]" />
                    </span>
                  )}
                  <p className="text-2xl font-bold">{tier.id}</p>
                  <p
                    className={cn(
                      'mt-1 text-sm',
                      selected ? 'text-blue-100' : 'text-muted-foreground',
                    )}
                  >
                    {formatCurrencyWhole(tier.size)}
                  </p>
                  <p
                    className={cn(
                      'mt-3 text-sm font-medium',
                      selected ? 'text-white' : 'text-foreground',
                    )}
                  >
                    Free
                  </p>
                  <p
                    className={cn(
                      'text-xs',
                      selected ? 'text-blue-200' : 'text-muted-foreground',
                    )}
                  >
                    Without risking
                  </p>
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <Monitor className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Platform</p>
              <p className="text-sm font-semibold text-foreground">TradingView Web Terminal</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Need some help?</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;re here for you. Write us a message.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg border border-muted-foreground/40 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Chat with us
            </button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">Summary</h2>

            <div className="mt-4 flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Free Trial</p>
                <p className="text-sm text-muted-foreground">
                  Account {formatCurrencyWhole(accountSize)}
                </p>
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Program</dt>
                <dd className="font-medium text-foreground">{stepType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Trading Account Currency</dt>
                <dd className="font-medium text-foreground">INR</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Platform</dt>
                <dd className="font-medium text-foreground">TradingView Web</dd>
              </div>
            </dl>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="text-lg font-bold text-green-600">Free</span>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="mt-4 w-full rounded-xl bg-[#002D5B] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#003d7a]"
            >
              Start Free Trial
            </button>

            <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
              By starting a free trial, you agree to our evaluation rules and understand this is
              a simulated environment.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
