import { Check } from 'lucide-react'
import type { TradingProgram } from '@/lib/mock/mockAssessmentPlans'
import { cn } from '@/lib/utils'

interface Props {
  program: TradingProgram
  selected: boolean
  showRules: boolean
  onSelect: () => void
}

export default function TradingProgramCard({
  program,
  selected,
  showRules,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative w-full rounded-2xl border p-5 text-left transition-all',
        selected
          ? 'border-[#002D5B] bg-[#002D5B] text-white shadow-md'
          : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300',
      )}
    >
      <span
        className={cn(
          'absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2',
          selected ? 'border-white bg-white' : 'border-gray-300 bg-transparent',
        )}
      >
        {selected && <Check className="h-3 w-3 text-[#002D5B]" />}
      </span>

      <h3 className="text-lg font-bold">{program.title}</h3>
      <p className={cn('mt-1 text-sm', selected ? 'text-blue-100' : 'text-gray-500')}>
        {program.subtitle}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {program.stages.map((stage, i) => (
          <span key={stage} className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium',
                selected
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-700',
              )}
            >
              {stage}
            </span>
            {i < program.stages.length - 1 && (
              <span className={selected ? 'text-blue-200' : 'text-gray-300'}>→</span>
            )}
          </span>
        ))}
      </div>

      {showRules && (
        <ul className="mt-4 space-y-2 border-t border-white/20 pt-4">
          {program.rules.map((r) => (
            <li
              key={r.label}
              className={cn(
                'flex justify-between text-xs',
                selected ? 'text-blue-50' : 'text-gray-600',
              )}
            >
              <span>{r.label}</span>
              <span className="font-medium">{r.value}</span>
            </li>
          ))}
        </ul>
      )}
    </button>
  )
}
