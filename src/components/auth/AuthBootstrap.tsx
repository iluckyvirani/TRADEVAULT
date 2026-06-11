import { useEffect, type ReactNode } from 'react'
import { getMe, hydrateSession } from '@/lib/api/auth'
import { useAuthStore } from '@/store/authStore'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'

export default function AuthBootstrap({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession)
  const clearSession = useAuthStore((s) => s.clearSession)
  const setAuthReady = useAuthStore((s) => s.setAuthReady)
  const authReady = useAuthStore((s) => s.authReady)
  const hydrateAccounts = useEvaluationAccountStore((s) => s.hydrateAccounts)

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        const session = await hydrateSession()
        if (cancelled) return
        if (session) {
          setSession(session)
          await hydrateAccounts()
          const me = await getMe().catch(() => null)
          if (me && !cancelled) {
            setSession({
              user: me.user,
              registrationStep: me.registrationStep,
              onboardingComplete: me.onboardingComplete,
            })
          }
        } else {
          clearSession()
        }
      } finally {
        if (!cancelled) setAuthReady(true)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [setSession, clearSession, setAuthReady, hydrateAccounts])

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return <>{children}</>
}
