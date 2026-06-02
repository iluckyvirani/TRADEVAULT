import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import EvaluationSidebar from './EvaluationSidebar'
import EvaluationTopbar from './EvaluationTopbar'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/lib/utils'

export default function EvaluationShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDark = useThemeStore((s) => s.mode === 'dark')

  return (
    <div
      className={cn(
        'flex h-screen overflow-hidden',
        isDark ? 'bg-[#0a0a0a]' : 'bg-white',
      )}
    >
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
        <EvaluationTopbar onMobileToggle={() => setMobileOpen(true)} />
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            isDark ? 'bg-[#0a0a0a]' : 'bg-[#F9FAFB]',
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
