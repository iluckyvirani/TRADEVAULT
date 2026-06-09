import { Check } from 'lucide-react'
import type { EvaluationPlanTier, TradingProgram } from '@/lib/mock/mockAssessmentPlans'
import { cn, formatCurrencyWhole } from '@/lib/utils'

interface Props {
  plan: EvaluationPlanTier
  program: TradingProgram
  selected: boolean
  showObjectives: boolean
  onSelect: () => void
}

export default function EvaluationPlanCard({
  plan,
  program,
  selected,
  showObjectives,
  onSelect,
}: Props) {
  const balanceLabel = `${plan.balance / 100_000}L`

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative rounded-2xl border p-5 text-left transition-all',
        selected
          ? 'border-[#002D5B] bg-[#002D5B] text-white shadow-md'
          : 'border-border bg-card hover:border-muted-foreground/40',
      )}
    >
      {plan.popular && (
        <span className="absolute -top-2.5 left-3 rounded bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-950">
          ★ Popular
        </span>
      )}
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-white">
          <Check className="h-3 w-3 text-[#002D5B]" />
        </span>
      )}

      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{program.title}</p>
      <p className={cn('text-[11px]', selected ? 'text-blue-100' : 'text-muted-foreground')}>
        {program.subtitle}
      </p>
      <p className="mt-2 text-2xl font-bold">{balanceLabel}</p>
      <p className={cn('mt-1 text-sm', selected ? 'text-blue-100' : 'text-muted-foreground')}>
        {formatCurrencyWhole(plan.balance)}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {program.stages.map((stage, i) => (
          <span key={stage} className="flex items-center gap-1.5">
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[10px] font-medium',
                selected ? 'bg-white/20 text-white' : 'bg-muted text-foreground',
              )}
            >
              {stage}
            </span>
            {i < program.stages.length - 1 && (
              <span className={cn('text-[10px]', selected ? 'text-blue-200' : 'text-muted-foreground')}>
                →
              </span>
            )}
          </span>
        ))}
      </div>

      {showObjectives && (
        <ul
          className={cn(
            'mt-3 space-y-1 border-t pt-3',
            selected ? 'border-white/20' : 'border-border',
          )}
        >
          {program.rules.map((rule) => (
            <li
              key={rule.label}
              className={cn(
                'flex justify-between gap-2 text-[10px]',
                selected ? 'text-blue-50' : 'text-muted-foreground',
              )}
            >
              <span>{rule.label}</span>
              <span className="font-medium">{rule.value}</span>
            </li>
          ))}
        </ul>
      )}

      <p className={cn('mt-4 text-lg font-semibold', selected ? 'text-white' : 'text-foreground')}>
        ₹ {plan.evaluationFee.toLocaleString('en-IN')}
      </p>
      <p className={cn('text-xs line-through', selected ? 'text-blue-200' : 'text-muted-foreground')}>
        ₹ {plan.originalFee.toLocaleString('en-IN')}
      </p>
      <p className={cn('mt-1 text-xs', selected ? 'text-green-300' : 'text-green-600')}>
        Save ₹ {plan.savings.toLocaleString('en-IN')}
      </p>
    </button>
  )
}
