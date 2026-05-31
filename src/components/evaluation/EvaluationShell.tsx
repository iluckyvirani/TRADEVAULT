import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import EvaluationSidebar from './EvaluationSidebar'
import EvaluationTopbar from './EvaluationTopbar'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

export default function EvaluationShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const userId = useAuthStore((s) => s.user?.id)
  const allAccounts = useEvaluationAccountStore((s) => s.accounts)

  const hasAccounts = useMemo(
    () => (userId ? allAccounts.some((a) => a.userId === userId) : false),
    [allAccounts, userId],
  )
  const isStatsRoute = pathname.includes('/stats')
  const dashboardDark = pathname === '/dashboard' && hasAccounts
  const darkMain = isStatsRoute || dashboardDark

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <EvaluationSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <EvaluationTopbar
          onMobileToggle={() => setMobileOpen(true)}
          dark={darkMain}
        />
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            darkMain ? 'bg-[#0a0a0a]' : 'bg-[#F9FAFB]',
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
