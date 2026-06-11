import type { NavigateFunction } from 'react-router-dom'
import type { RegistrationStep } from '@/store/authStore'

export function navigateAfterAuth(
  navigate: NavigateFunction,
  step: RegistrationStep | null,
  options?: { ref?: string },
) {
  if (step === 'registered') {
    const next = options?.ref
      ? `/auth/complete-profile?ref=${encodeURIComponent(options.ref)}`
      : '/auth/complete-profile'
    navigate(next, { replace: true })
    return
  }
  if (step === 'profile_completed') {
    navigate('/auth/verify-email', { replace: true })
    return
  }
  navigate('/auth/loading', { replace: true })
}
