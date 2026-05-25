import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import type { FormEvent } from 'react'
import { TrendingUp, Eye, EyeOff, Lock, BarChart2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

// ─── Mock credentials (frontend-only) ────────────────────────────────────────
const MOCK_EMAIL = 'trader@tradevault.io'
const MOCK_PASS = 'Password1'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const { login, recordFailedAttempt, clearLock, failedAttempts, lockedUntil } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailErr, setEmailErr] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  // Lockout countdown timer
  useEffect(() => {
    if (!lockedUntil) { setTimeLeft(0); return }
    const tick = () => {
      const rem = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
      setTimeLeft(rem)
      if (rem === 0) clearLock()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lockedUntil, clearLock])

  const isLocked = timeLeft > 0

  function validate(): boolean {
    let ok = true
    if (!email.includes('@')) { setEmailErr('Enter a valid email'); ok = false }
    else setEmailErr('')
    if (password.length < 1) { setPwErr('Enter your password'); ok = false }
    else setPwErr('')
    return ok
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLocked || !validate()) return

    setLoading(true)
    await new Promise<void>((r) => setTimeout(r, 600))

    // Mock auth: accept the demo credentials or any email/password combo
    const isValid = email === MOCK_EMAIL && password === MOCK_PASS
    const mockAccepted = email.includes('@') && password.length >= 8

    if (!isValid && !mockAccepted) {
      recordFailedAttempt()
      setPwErr(`Incorrect credentials (${3 - failedAttempts - 1} attempts left)`)
      setLoading(false)
      return
    }

    login(email, email.split('@')[0])
    navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Left brand panel ── */}
      <div className="hero-gradient relative hidden flex-col justify-between overflow-hidden border-r border-border p-12 lg:flex lg:w-5/12 xl:w-1/2">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <TrendingUp className="h-6 w-6 text-primary" />
          TradeVault
        </Link>

        {/* Mock portfolio card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <p className="mb-1 text-xs text-muted-foreground">Portfolio Value</p>
          <p className="mb-4 text-3xl font-bold text-foreground">$102,415.80</p>
          <div className="space-y-2">
            {[
              { symbol: 'NVDA', change: '+2.55%', up: true },
              { symbol: 'AAPL', change: '+1.29%', up: true },
              { symbol: 'TSLA', change: '-2.34%', up: false },
            ].map((r) => (
              <div key={r.symbol} className="flex justify-between border-t border-border/50 pt-2 text-sm">
                <span className="font-semibold text-foreground">{r.symbol}</span>
                <span className={r.up ? 'text-accent font-medium' : 'text-destructive font-medium'}>
                  {r.change}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart2 className="h-4 w-4 text-primary" />
            Updated in real-time during market hours
          </div>
        </div>

        <p className="text-sm text-muted-foreground">© 2026 TradeVault Inc.</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link to="/" className="mb-8 flex items-center gap-2 text-xl font-bold text-foreground lg:hidden">
          <TrendingUp className="h-6 w-6 text-primary" />
          TradeVault
        </Link>

        <div className="w-full max-w-md">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="mb-8 text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Sign up free
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Demo: </span>
            {MOCK_EMAIL} / {MOCK_PASS}
            {' — '}or enter any valid email + 8-char password.
          </div>

          {/* Lockout banner */}
          {isLocked && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <Lock className="h-4 w-4 flex-shrink-0" />
              Too many attempts. Try again in <strong className="ml-1">{timeLeft}s</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailErr('') }}
                className={inputCls(!!emailErr)}
                disabled={isLocked}
              />
              {emailErr && <p className="text-xs text-destructive">{emailErr}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPwErr('') }}
                  className={cn(inputCls(!!pwErr), 'pr-10')}
                  disabled={isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  disabled={isLocked}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwErr && <p className="text-xs text-destructive">{pwErr}</p>}
            </div>

            {/* Attempts warning */}
            {failedAttempts > 0 && !isLocked && (
              <p className="text-xs text-warning">
                {failedAttempts} failed attempt{failedAttempts > 1 ? 's' : ''}.
                Account locks after 3.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] hover:bg-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function inputCls(hasError: boolean) {
  return cn(
    'w-full rounded-xl border bg-card px-4 py-2.5 text-sm text-foreground',
    'placeholder:text-muted-foreground/40 outline-none transition-colors',
    'focus:border-primary focus:ring-1 focus:ring-primary/30',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    hasError ? 'border-destructive' : 'border-border',
  )
}
