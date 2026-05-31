import { Link } from 'react-router-dom'
import { Check, Target, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'paid' | 'free'
type Theme = 'light' | 'dark'

interface Props {
  variant: Variant
  theme?: Theme
  onFreeTrial?: () => void
}

export default function AssessmentOptionCard({
  variant,
  theme = 'light',
  onFreeTrial,
}: Props) {
  const isPaid = variant === 'paid'
  const dark = theme === 'dark'

  const shell = dark
    ? 'border-white/10 bg-[#141414]'
    : 'border-gray-200 bg-white shadow-sm'

  const body = dark ? 'text-gray-400' : 'text-gray-600'
  const title = dark ? 'text-white' : 'text-gray-900'

  const content = isPaid ? (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a5f]">
          <Target className="h-5 w-5 text-blue-300" />
        </div>
        <span className="rounded-full bg-[#002D5B] px-2.5 py-0.5 text-xs font-medium text-white">
          Paid
        </span>
      </div>
      <h3 className={cn('mt-4 text-lg font-semibold', title)}>Choose Your Assessment</h3>
      <p className={cn('mt-2 text-sm leading-relaxed', body)}>
        Pick a 1-Step or 2-Step simulated skill assessment built around clear targets,
        risk limits, and transparent program terms.
      </p>
      <ul className="mt-4 space-y-2">
        {[
          '1-Step & 2-Step evaluation paths',
          'Objective rules with measurable milestones',
          'Pathway to Rewards Account eligibility',
        ].map((item) => (
          <li key={item} className={cn('flex items-start gap-2 text-sm', dark ? 'text-gray-300' : 'text-gray-700')}>
            <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-600">
              <Check className="h-2.5 w-2.5 text-white" />
            </span>
            {item}
          </li>
        ))}
      </ul>
      <p className={cn('mt-4 text-sm', body)}>
        Starts from <strong className={dark ? 'text-white' : 'text-gray-900'}>₹2,999</strong>
        {' '}· One-time payment · Structured evaluation service
      </p>
      <Link
        to="/evaluation"
        className="mt-4 inline-block text-sm font-medium text-[#3b82f6] hover:underline"
      >
        Get Started →
      </Link>
    </>
  ) : (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', dark ? 'bg-gray-700' : 'bg-gray-100')}>
          <Zap className={cn('h-5 w-5', dark ? 'text-gray-300' : 'text-gray-500')} />
        </div>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600')}>
          Free
        </span>
      </div>
      <h3 className={cn('mt-4 text-lg font-semibold', title)}>Start Free Trial</h3>
      <p className={cn('mt-2 text-sm leading-relaxed', body)}>
        Explore the platform in a simulated demo account, get familiar with the interface,
        and see how assessment rules are measured.
      </p>
      <ul className="mt-4 space-y-2">
        {[
          'Try a guided assessment',
          'Explore the workspace and performance stats',
          'No Rewards Account eligibility',
        ].map((item) => (
          <li key={item} className={cn('flex items-start gap-2 text-sm', body)}>
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
            {item}
          </li>
        ))}
      </ul>
      <p className={cn('mt-4 text-sm', body)}>
        No payment required · Trial accounts are not eligible for rewards.
      </p>
      <button
        type="button"
        onClick={onFreeTrial}
        className={cn(
          'mt-4 text-sm font-medium hover:underline',
          dark ? 'text-white' : 'text-gray-900',
        )}
      >
        Get Started →
      </button>
    </>
  )

  return (
    <div className={cn('rounded-2xl border p-6', shell)}>
      {content}
    </div>
  )
}
