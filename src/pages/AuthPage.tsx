import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthTabSwitcher, { type AuthTab } from '@/components/auth/AuthTabSwitcher'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { useAuthStore } from '@/store/authStore'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'
import { useCheckoutStore } from '@/store/checkoutStore'
import { ApiError } from '@/lib/api/client'
import * as authApi from '@/lib/api/auth'
import { navigateAfterAuth } from '@/lib/api/navigateAfterAuth'
import { cn } from '@/lib/utils'

export default function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'signin' ? 'signin' : 'create'

  const setSession = useAuthStore((s) => s.setSession)
  const affiliateCode = useCheckoutStore((s) => s.affiliateCode)
  const setAffiliateCode = useCheckoutStore((s) => s.setAffiliateCode)

  const [tab, setTab] = useState<AuthTab>(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && !affiliateCode) {
      setAffiliateCode(ref.toUpperCase())
    }
  }, [searchParams, affiliateCode, setAffiliateCode])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.includes('@')) {
      setError('Enter a valid email address')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      if (tab === 'create') {
        const session = await authApi.register({ email, password })
        setSession(session)
        const ref = searchParams.get('ref') ?? undefined
        navigateAfterAuth(navigate, session.registrationStep, { ref })
      } else {
        const session = await authApi.login({ email, password })
        setSession(session)
        if (
          session.registrationStep === 'email_verified' ||
          session.registrationStep === 'evaluation_started'
        ) {
          await useEvaluationAccountStore.getState().hydrateAccounts()
        }
        navigateAfterAuth(navigate, session.registrationStep)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.code === 'ACCOUNT_LOCKED') {
          useAuthStore.getState().recordFailedAttempt()
        }
      } else {
        setError('Something went wrong. Is the API server running?')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome to tradeox"
      subtitle="Create your profile to get started"
    >
      <AuthTabSwitcher active={tab} onChange={setTab} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none transition-colors focus:border-[#002D5B] focus:ring-1 focus:ring-[#002D5B]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'create' ? 'new-password' : 'current-password'}
              className="h-11 w-full rounded-lg border border-gray-300 px-3 pr-10 text-sm text-gray-900 outline-none transition-colors focus:border-[#002D5B] focus:ring-1 focus:ring-[#002D5B]"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'h-12 w-full rounded-lg bg-[#002D5B] text-sm font-semibold text-white transition-colors hover:bg-[#001f3f]',
            loading && 'opacity-70',
          )}
        >
          {loading ? 'Please wait…' : tab === 'create' ? 'Create Profile' : 'Sign in'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">or continue with</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <GoogleSignInButton onClick={() => setError('Google sign-in is not available in demo mode.')} />

      <p className="mt-6 text-center text-xs leading-relaxed text-gray-400">
        Note that only one registration is allowed per client. Multiple registrations
        or registrations with invalid data may lead to the termination of the services.
      </p>
    </AuthLayout>
  )
}
