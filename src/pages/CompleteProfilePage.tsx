import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { FormEvent } from 'react'
import { Tag } from 'lucide-react'
import AuthLayout from '@/components/auth/AuthLayout'
import { useAuthStore, type ProfileTitle } from '@/store/authStore'
import { useAffiliateStore } from '@/store/affiliateStore'
import { useCheckoutStore } from '@/store/checkoutStore'
import { ApiError } from '@/lib/api/client'
import * as authApi from '@/lib/api/auth'
import { cn } from '@/lib/utils'

const TITLES: ProfileTitle[] = ['Mr.', 'Ms.', 'Mrs.', 'Dr.']

export default function CompleteProfilePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const setSession = useAuthStore((s) => s.setSession)
  const affiliateCode = useCheckoutStore((s) => s.affiliateCode)
  const setAffiliateCode = useCheckoutStore((s) => s.setAffiliateCode)
  const validateCode = useAffiliateStore((s) => s.validateCode)

  const [title, setTitle] = useState<ProfileTitle>('Mr.')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [onboardingHelp, setOnboardingHelp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeHint, setCodeHint] = useState<{ valid: boolean; message: string } | null>(null)

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && !affiliateCode) {
      setAffiliateCode(ref.toUpperCase())
    }
  }, [searchParams, affiliateCode, setAffiliateCode])

  useEffect(() => {
    if (!affiliateCode.trim()) {
      setCodeHint(null)
      return
    }
    const t = setTimeout(() => {
      if (user) setCodeHint(validateCode(affiliateCode, user.id))
    }, 300)
    return () => clearTimeout(t)
  }, [affiliateCode, user, validateCode])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (fullName.trim().length < 2) return

    setLoading(true)
    setError('')
    try {
      const session = await authApi.completeProfile({
        title,
        fullName: fullName.trim(),
        phone: phone.trim() || '+91',
        onboardingHelp,
        affiliateCode: affiliateCode.trim() || undefined,
      })
      setSession(session)
      navigate('/auth/verify-email', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Complete your profile"
      subtitle="Just a couple of details to get you set."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Title
          </label>
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value as ProfileTitle)}
            className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-[#002D5B] focus:ring-1 focus:ring-[#002D5B]"
          >
            {TITLES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-[#002D5B] focus:ring-1 focus:ring-[#002D5B]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Phone
          </label>
          <div className="flex h-11 overflow-hidden rounded-lg border border-gray-300 focus-within:border-[#002D5B] focus-within:ring-1 focus-within:ring-[#002D5B]">
            <div className="flex items-center gap-1.5 border-r border-gray-300 bg-gray-50 px-3 text-sm text-gray-700">
              <span>🇮🇳</span>
              <span className="font-medium">+91</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder=""
              className="flex-1 px-3 text-sm text-gray-900 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Referral code <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={affiliateCode}
              onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              className={cn(
                'h-11 w-full rounded-lg border px-3 pl-9 text-sm text-gray-900 outline-none focus:ring-1',
                codeHint?.valid === false && affiliateCode.trim()
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                  : codeHint?.valid
                    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500'
                    : 'border-gray-300 focus:border-[#002D5B] focus:ring-[#002D5B]',
              )}
            />
          </div>
          {affiliateCode.trim() && codeHint ? (
            <p
              className={cn(
                'mt-1 text-xs',
                codeHint.valid ? 'text-emerald-600' : 'text-red-500',
              )}
            >
              {codeHint.message}
            </p>
          ) : (
            <p className="mt-1 text-xs text-gray-400">
              Have a referral link? Enter the code here — it will be applied at checkout.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={onboardingHelp}
              onChange={(e) => setOnboardingHelp(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#002D5B] focus:ring-[#002D5B]"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">
                Get onboarding help (optional)
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">
                We&apos;ll help you get started in the simulated Trading Room and share
                important account updates.
              </p>
              <p className="mt-2 text-[11px] text-gray-400">
                Used only for onboarding/support. You can opt out anytime.
              </p>
            </div>
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || fullName.trim().length < 2}
          className={cn(
            'h-12 w-full rounded-lg bg-[#002D5B] text-sm font-semibold text-white transition-colors hover:bg-[#001f3f]',
            (loading || fullName.trim().length < 2) && 'opacity-70',
          )}
        >
          {loading ? 'Please wait…' : 'Continue'}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-400">
        Next: verify email → simulated trading
      </p>
    </AuthLayout>
  )
}
