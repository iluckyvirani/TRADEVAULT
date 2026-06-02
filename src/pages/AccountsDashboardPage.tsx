import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'
import { useThemeStore } from '@/store/themeStore'
import OnboardingStepper from '@/components/evaluation/OnboardingStepper'
import ActiveAccountCard from '@/components/evaluation/ActiveAccountCard'
import AssessmentOptionCard from '@/components/evaluation/AssessmentOptionCard'
import { cn } from '@/lib/utils'

export default function AccountsDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isDark = useThemeStore((s) => s.mode === 'dark')
  const cardTheme = isDark ? 'dark' : 'light'

  const allAccounts = useEvaluationAccountStore((s) => s.accounts)

  const accounts = useMemo(
    () => (user ? allAccounts.filter((a) => a.userId === user.id) : []),
    [allAccounts, user?.id],
  )
  const hasAccounts = accounts.length > 0

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
          Dashboard
        </h1>
        <p className={cn('mt-1 text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
          Manage all your trading accounts.
        </p>
      </div>

      {!hasAccounts && <OnboardingStepper />}

      {hasAccounts && (
        <section className="mb-6 space-y-4">
          <h2 className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
            Active accounts
          </h2>
          {accounts.map((account) => (
            <ActiveAccountCard key={account.id} account={account} />
          ))}
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AssessmentOptionCard variant="paid" theme={cardTheme} />
        <AssessmentOptionCard
          variant="free"
          theme={cardTheme}
          onFreeTrial={() => navigate('/free-trial')}
        />
      </section>

      <p
        className={cn(
          'mt-8 text-center text-xs leading-relaxed',
          isDark ? 'text-gray-500' : 'text-gray-400',
        )}
      >
        All activity is simulated. tradeox provides evaluation services only and does not
        provide access to live capital markets. Rewards Account eligibility is subject to
        rules and terms.
      </p>
    </div>
  )
}
