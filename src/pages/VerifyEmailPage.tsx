import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import { useAuthStore } from '@/store/authStore'
import { ApiError } from '@/lib/api/client'
import * as authApi from '@/lib/api/auth'
import { cn } from '@/lib/utils'

const RESEND_SECONDS = 60

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const user = useAuthStore((s) => s.user)

  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  async function handleVerifyNow() {
    setVerifying(true)
    setError('')
    try {
      const session = await authApi.verifyEmail()
      setSession(session)
      navigate('/auth/loading', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  async function handleResend() {
    if (secondsLeft > 0) return
    setError('')
    try {
      await authApi.resendVerification()
      setSecondsLeft(RESEND_SECONDS)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend email')
    }
  }

  return (
    <AuthLayout
      title=""
      subtitle=""
      showLogo={false}
    >
      <div className="-mt-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200">
            <Mail className="h-5 w-5 text-[#002D5B]" />
          </div>
          <h1 className="text-xl font-bold text-[#002D5B]">Email verification</h1>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          We sent a verification link to{' '}
          <span className="font-medium text-gray-800">{user?.email ?? 'your email'}</span>.
        </p>

        <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <ul className="list-disc space-y-2 pl-4">
            <li>Open the link sent to your inbox.</li>
            <li>Check spam or promotions if you don&apos;t see it.</li>
            <li>You can request another email after 60s.</li>
          </ul>
        </div>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleVerifyNow}
          disabled={verifying}
          className="mb-2 w-full rounded-lg bg-[#002D5B] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#001f3f] disabled:opacity-70"
        >
          {verifying ? 'Verifying…' : "I've verified my email"}
        </button>
        <p className="mb-6 text-center text-xs text-gray-400">
          Demo mode — no real email is sent. Click above to continue.
        </p>

        <div className="flex items-center justify-between">
          <Link
            to="/auth?tab=signin"
            className="text-sm font-medium text-[#002D5B] hover:underline"
          >
            ← Back to login
          </Link>
          <button
            type="button"
            onClick={handleResend}
            disabled={secondsLeft > 0}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              secondsLeft > 0
                ? 'cursor-not-allowed text-gray-400'
                : 'bg-[#002D5B] text-white hover:bg-[#001f3f]',
            )}
          >
            {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend email'}
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
