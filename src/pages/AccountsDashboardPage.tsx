import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'
import OnboardingStepper from '@/components/evaluation/OnboardingStepper'
import ActiveAccountCard from '@/components/evaluation/ActiveAccountCard'
import AssessmentOptionCard from '@/components/evaluation/AssessmentOptionCard'

export default function AccountsDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const markEvaluationStarted = useAuthStore((s) => s.markEvaluationStarted)

  const allAccounts = useEvaluationAccountStore((s) => s.accounts)
  const createFreeTrial = useEvaluationAccountStore((s) => s.createFreeTrial)

  const accounts = useMemo(
    () => (user ? allAccounts.filter((a) => a.userId === user.id) : []),
    [allAccounts, user?.id],
  )
  const hasAccounts = accounts.length > 0
  const cardTheme = hasAccounts ? 'dark' : 'light'

  function handleFreeTrial() {
    if (!user) return
    createFreeTrial(user.id)
    markEvaluationStarted()
  }

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className={hasAccounts ? 'text-2xl font-bold text-white' : 'text-2xl font-bold text-gray-900'}>
          Dashboard
        </h1>
        <p className={hasAccounts ? 'mt-1 text-sm text-gray-400' : 'mt-1 text-sm text-gray-500'}>
          Manage all your trading accounts.
        </p>
      </div>

      {!hasAccounts && <OnboardingStepper />}

      {hasAccounts && (
        <section className="mb-6 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">
            Active Accounts
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
          onFreeTrial={hasAccounts ? () => navigate('/evaluation') : handleFreeTrial}
        />
      </section>

      <p className={cnDisclaimer(hasAccounts)}>
        All activity is simulated. tradeox provides evaluation services only and does not
        provide access to live capital markets. Rewards Account eligibility is subject to
        rules and terms.
      </p>
    </div>
  )
}

function cnDisclaimer(dark: boolean) {
  return dark
    ? 'mt-8 text-center text-xs leading-relaxed text-gray-500'
    : 'mt-8 text-center text-xs leading-relaxed text-gray-400'
}
