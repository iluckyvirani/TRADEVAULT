import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const RESEND_SECONDS = 60

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const verifyEmail = useAuthStore((s) => s.verifyEmail)
  const user = useAuthStore((s) => s.user)

  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  function handleVerifyNow() {
    verifyEmail()
    navigate('/auth/loading', { replace: true })
  }

  function handleResend() {
    if (secondsLeft > 0) return
    setSecondsLeft(RESEND_SECONDS)
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

        <button
          type="button"
          onClick={handleVerifyNow}
          className="mb-2 w-full rounded-lg bg-[#002D5B] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#001f3f]"
        >
          I&apos;ve verified my email
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
