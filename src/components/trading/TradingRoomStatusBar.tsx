import type { EvaluationAccount } from '@/lib/mock/mockEvaluationAccounts'
import { useThemeStore } from '@/store/themeStore'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  account: EvaluationAccount
}

export default function TradingRoomStatusBar({ account }: Props) {
  const isDark = useThemeStore((s) => s.mode === 'dark')
  const todayPositive = account.todayPnL >= 0
  const totalPositive = account.unrealizedPnL >= 0

  return (
    <footer
      className={cn(
        'flex flex-shrink-0 flex-wrap items-center gap-x-6 gap-y-2 border-t px-4 py-2 font-mono text-[11px]',
        isDark
          ? 'border-white/10 bg-[#0a0a0a]'
          : 'border-gray-200 bg-white',
      )}
    >
      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{account.id}</span>
      <Stat label="FREE MARGIN" value={formatCurrency(account.freeMargin)} isDark={isDark} />
      <Stat label="MARGIN USED" value={formatCurrency(account.marginUsed)} isDark={isDark} />
      <Stat
        label="TODAY"
        value={formatCurrency(account.todayPnL)}
        positive={todayPositive}
        isDark={isDark}
      />
      <Stat
        label="TOTAL"
        value={formatCurrency(account.unrealizedPnL)}
        positive={totalPositive}
        isDark={isDark}
      />
    </footer>
  )
}

function Stat({
  label,
  value,
  positive,
  isDark,
}: {
  label: string
  value: string
  positive?: boolean
  isDark: boolean
}) {
  return (
    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
      {label}{' '}
      <span
        className={cn(
          'font-semibold',
          positive === undefined
            ? isDark
              ? 'text-white'
              : 'text-gray-900'
            : positive
              ? 'text-green-500'
              : 'text-red-500',
        )}
      >
        {value}
      </span>
    </span>
  )
}
