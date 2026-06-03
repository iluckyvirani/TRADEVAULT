import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  mockEvaluationPlanTiers,
  mockTradingPrograms,
} from '@/lib/mock/mockAssessmentPlans'
import { formatCurrencyWhole } from '@/lib/utils'

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#002D5B] dark:text-blue-400">
            Evaluation access
          </p>
          <h2 className="text-3xl font-bold text-foreground lg:text-5xl">
            Choose your account size
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            One-time evaluation access fee in INR — not a deposit. Pick 1-Step or 2-Step rules,
            or practice first with a free trial account.
          </p>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {mockTradingPrograms.map((program) => (
            <div
              key={program.id}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{program.title}</h3>
                  <p className="text-sm text-muted-foreground">{program.subtitle}</p>
                </div>
                <span className="rounded-full bg-[#002D5B]/10 px-3 py-1 text-xs font-medium text-[#002D5B] dark:text-blue-300">
                  {program.stages.join(' → ')}
                </span>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {program.rules.map((rule) => (
                  <li
                    key={rule.label}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">{rule.label}</span>
                    <span className="font-medium text-foreground">{rule.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mockEvaluationPlanTiers.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-card p-6 ${
                plan.popular
                  ? 'border-[#002D5B] shadow-lg shadow-[#002D5B]/10'
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#002D5B] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Popular
                </span>
              )}
              <p className="text-sm text-muted-foreground">Account size</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formatCurrencyWhole(plan.balance)}
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-foreground">
                  {formatCurrencyWhole(plan.evaluationFee)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrencyWhole(plan.originalFee)}
                </span>
              </div>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Save {formatCurrencyWhole(plan.savings)}
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  Full platform access
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  Trading room & stats
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  Simulated INR environment
                </li>
              </ul>
              <Link
                to="/evaluation"
                className={`mt-6 block rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-[#002D5B] text-white hover:bg-[#003d7a]'
                    : 'border border-border text-foreground hover:border-[#002D5B]/40'
                }`}
              >
                Select plan
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground">Not ready to pay?</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Start a free trial with the same dashboard, trading room, and rule tracking — no
            payment required to explore the platform.
          </p>
          <Link
            to="/free-trial"
            className="mt-5 inline-flex rounded-xl border border-[#002D5B] px-8 py-3 text-sm font-semibold text-[#002D5B] transition-colors hover:bg-[#002D5B]/5 dark:text-blue-300"
          >
            Start free trial
          </Link>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
          tradeox provides simulated evaluation services only. Not a broker, investment
          adviser, or SEBI-registered intermediary. Rules, fees, and reward eligibility are
          defined in program terms at checkout.
        </p>
      </div>
    </section>
  )
}
