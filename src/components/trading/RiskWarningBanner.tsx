import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export function RiskWarningBanner({ className }: Props) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-yellow-500/25 bg-yellow-500/5 px-4 py-3',
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400" />
      <p className="text-xs leading-relaxed text-yellow-300/80">
        <span className="font-semibold text-yellow-400">Paper Trading Only —</span>{' '}
        All orders are simulated with virtual funds. No real money is ever at risk. Prices are
        mocked and do not reflect live market conditions. This platform is for educational
        purposes only and is not financial advice.
      </p>
    </div>
  )
}
