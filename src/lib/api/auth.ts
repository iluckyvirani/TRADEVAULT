import type { AuthUser, RegistrationStep } from '@/store/authStore'
import { apiFetch, setAccessToken } from '@/lib/api/client'

export interface AuthSession {
  user: AuthUser
  registrationStep: RegistrationStep | null
  onboardingComplete: boolean
  accessToken: string
}

export interface MeResponse {
  user: AuthUser
  registrationStep: RegistrationStep | null
  onboardingComplete: boolean
}

function applySession(session: AuthSession) {
  setAccessToken(session.accessToken)
  return session
}

export async function register(input: { email: string; password: string }) {
  const session = await apiFetch<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return applySession(session)
}

export async function login(input: { email: string; password: string }) {
  const session = await apiFetch<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return applySession(session)
}

export async function refresh() {
  const session = await apiFetch<AuthSession>('/auth/refresh', { method: 'POST' })
  return applySession(session)
}

export async function logout() {
  await apiFetch<{ ok: boolean }>('/auth/logout', { method: 'POST' })
  setAccessToken(null)
}

export async function getMe() {
  return apiFetch<MeResponse>('/auth/me')
}

export async function completeProfile(input: {
  title: string
  fullName: string
  phone: string
  onboardingHelp: boolean
  affiliateCode?: string
}) {
  const session = await apiFetch<AuthSession>('/auth/complete-profile', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return applySession(session)
}

export async function verifyEmail(token?: string) {
  const session = await apiFetch<AuthSession>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(token ? { token } : {}),
  })
  return applySession(session)
}

export async function resendVerification() {
  return apiFetch<{ ok: boolean; message: string }>('/auth/resend-verification', {
    method: 'POST',
  })
}

export async function hydrateSession(): Promise<AuthSession | null> {
  try {
    if (sessionStorage.getItem('tv-access-token')) {
      const me = await getMe()
      const token = sessionStorage.getItem('tv-access-token')!
      return {
        ...me,
        accessToken: token,
      }
    }
    return await refresh()
  } catch {
    setAccessToken(null)
    return null
  }
}
