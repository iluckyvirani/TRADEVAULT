import { Link } from 'react-router-dom'
import { ArrowRight, Check, Lock } from 'lucide-react'
const STEPS = [
  {
    title: 'Start from one place',
    description: 'Choose your account type on the next screen.',
  },
  {
    title: 'Pick instant or evaluation',
    description:
      'Go live with an instant funded account, or choose a 1-step or 2-step evaluation.',
  },
  {
    title: 'Activate rewards',
    description:
      'Once your Rewards account is active, payouts, invoices, and reward tracking unlock automatically.',
  },
] as const

export default function RewardsPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6 lg:p-7">
      <p className="text-xs text-muted-foreground">Home / Rewards</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>

        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Rewards access isn&apos;t active yet
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Rewards unlock when you have an active account. Start with an{' '}
          <span className="font-semibold text-foreground">instant funded account</span> or complete
          an <span className="font-semibold text-foreground">evaluation</span> to become eligible
          for payouts and reward tracking.
        </p>

        <ol className="mt-8 space-y-0">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
              {index < STEPS.length - 1 && (
                <span
                  className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-border"
                  aria-hidden
                />
              )}
              <span className="relative z-[1] flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-foreground">{step.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/evaluation"
            className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/accounts"
            className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            View My Accounts
          </Link>
          <Link
            to="/certificates"
            className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Certificates
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This section unlocks automatically once your Rewards account becomes active.
        </p>
      </div>
    </div>
  )
}
