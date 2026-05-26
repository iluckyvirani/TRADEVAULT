import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { FormEvent, ReactNode } from 'react'
import { z } from 'zod'
import { TrendingUp, Eye, EyeOff, Check } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

// ─── Validation schema ───────────────────────────────────────────────────────
const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'At least 2 characters')
      .max(60, 'Max 60 characters')
      .regex(/^[a-zA-Z\s'-]+$/, "Letters, spaces, hyphens and apostrophes only"),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type Fields = { fullName: string; email: string; password: string; confirmPassword: string }
type Errs = Partial<Record<keyof Fields, string>>

// ─── Password strength helper ─────────────────────────────────────────────────
function pwStrength(pw: string) {
  if (!pw) return null
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const cfg = [
    { label: 'Very weak', filled: 1, color: 'bg-destructive' },
    { label: 'Weak',      filled: 1, color: 'bg-destructive' },
    { label: 'Fair',      filled: 2, color: 'bg-warning' },
    { label: 'Good',      filled: 3, color: 'bg-primary' },
    { label: 'Strong',    filled: 4, color: 'bg-accent' },
  ]
  return cfg[score]
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [fields, setFields] = useState<Fields>({
    fullName: '', email: '', password: '', confirmPassword: '',
  })
  const [errors, setErrors] = useState<Errs>({})
  const [terms, setTerms] = useState(false)
  const [termsErr, setTermsErr] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const strength = pwStrength(fields.password)

  function updateField(k: keyof Fields, v: string) {
    setFields((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const result = signupSchema.safeParse(fields)
    const newErrs: Errs = {}
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        if (typeof key === 'string' && key in fields && !newErrs[key as keyof Fields]) {
          newErrs[key as keyof Fields] = issue.message
        }
      }
    }
    if (!terms) setTermsErr('You must accept the terms')
    else setTermsErr('')

    if (!result.success || !terms) {
      setErrors(newErrs)
      return
    }

    setLoading(true)
    await new Promise<void>((r) => setTimeout(r, 700))
    login(fields.email, fields.fullName)
    navigate('/onboarding')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Left brand panel ── */}
      <div className="hero-gradient relative hidden flex-col justify-between overflow-hidden border-r border-border p-12 lg:flex lg:w-5/12 xl:w-1/2">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <TrendingUp className="h-6 w-6 text-primary" />
          tradeox
        </Link>
        <div>
          <h2 className="mb-4 text-4xl font-bold text-foreground">
            Your trading journey<br />starts here.
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join 50,000+ traders learning to navigate markets — risk-free.
          </p>
          <ul className="space-y-3">
            {[
              '$100,000 virtual portfolio on signup',
              'Real-time prices via Polygon.io',
              'Market, Limit, Stop, and trailing orders',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-foreground/80">
                <Check className="h-5 w-5 flex-shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 tradeox Inc.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link to="/" className="mb-8 flex items-center gap-2 text-xl font-bold text-foreground lg:hidden">
          <TrendingUp className="h-6 w-6 text-primary" />
          tradeox
        </Link>

        <div className="w-full max-w-md">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Create your account</h1>
          <p className="mb-8 text-muted-foreground">
            Already have one?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field label="Full Name" error={errors.fullName}>
              <input
                type="text"
                placeholder="Alex Morgan"
                autoComplete="name"
                value={fields.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className={inputCls(!!errors.fullName)}
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={fields.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={inputCls(!!errors.email)}
              />
            </Field>

            <Field label="Password" error={errors.password}>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 8 chars, uppercase + number"
                  autoComplete="new-password"
                  value={fields.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className={cn(inputCls(!!errors.password), 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength meter */}
              {strength && fields.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-all duration-300',
                          i <= strength.filled ? strength.color : 'bg-border',
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{strength.label}</p>
                </div>
              )}
            </Field>

            <Field label="Confirm Password" error={errors.confirmPassword}>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  value={fields.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className={cn(inputCls(!!errors.confirmPassword), 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle confirm password"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {/* Terms */}
            <div>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => { setTerms(e.target.checked); setTermsErr('') }}
                  className="mt-0.5 accent-primary"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                </span>
              </label>
              {termsErr && <p className="mt-1 text-xs text-destructive">{termsErr}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function inputCls(hasError: boolean) {
  return cn(
    'w-full rounded-xl border bg-card px-4 py-2.5 text-sm text-foreground',
    'placeholder:text-muted-foreground/40 outline-none transition-colors',
    'focus:border-primary focus:ring-1 focus:ring-primary/30',
    hasError ? 'border-destructive' : 'border-border',
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
