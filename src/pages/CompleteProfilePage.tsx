import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import AuthLayout from '@/components/auth/AuthLayout'
import { useAuthStore, type ProfileTitle } from '@/store/authStore'
import { cn } from '@/lib/utils'

const TITLES: ProfileTitle[] = ['Mr.', 'Ms.', 'Mrs.', 'Dr.']

export default function CompleteProfilePage() {
  const navigate = useNavigate()
  const completeProfile = useAuthStore((s) => s.completeProfile)

  const [title, setTitle] = useState<ProfileTitle>('Mr.')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [onboardingHelp, setOnboardingHelp] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (fullName.trim().length < 2) return

    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))

    completeProfile({
      title,
      fullName: fullName.trim(),
      phone: phone.trim() || '+91',
      onboardingHelp,
    })
    navigate('/auth/verify-email', { replace: true })
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
