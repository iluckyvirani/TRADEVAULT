import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'

/** Protects app routes — requires fully verified user. */
export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, registrationStep } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  if (registrationStep === 'registered') {
    return <Navigate to="/auth/complete-profile" replace />
  }

  if (registrationStep === 'profile_completed') {
    return <Navigate to="/auth/verify-email" replace />
  }

  return <>{children}</>
}

/** Protects mid-registration pages. */
export function RegistrationGuard({
  children,
  requiredStep,
}: {
  children: ReactNode
  requiredStep: 'registered' | 'profile_completed'
}) {
  const { isAuthenticated, registrationStep } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (registrationStep === 'registered' && requiredStep !== 'registered') {
    return <Navigate to="/auth/complete-profile" replace />
  }

  if (registrationStep === 'profile_completed' && requiredStep === 'registered') {
    return <Navigate to="/auth/verify-email" replace />
  }

  if (
    registrationStep === 'email_verified' ||
    registrationStep === 'evaluation_started'
  ) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

/** Redirect authenticated verified users away from /auth. */
export function GuestGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, registrationStep } = useAuthStore()

  if (!isAuthenticated) return <>{children}</>

  if (registrationStep === 'registered') {
    return <Navigate to="/auth/complete-profile" replace />
  }
  if (registrationStep === 'profile_completed') {
    return <Navigate to="/auth/verify-email" replace />
  }

  return <Navigate to="/dashboard" replace />
}
