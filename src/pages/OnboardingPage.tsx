import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────
const AVATARS = [
  { id: 'av1', emoji: '🦊', bg: 'bg-orange-500/15 border-orange-500/40' },
  { id: 'av2', emoji: '🐬', bg: 'bg-blue-500/15 border-blue-500/40' },
  { id: 'av3', emoji: '🦁', bg: 'bg-yellow-500/15 border-yellow-500/40' },
  { id: 'av4', emoji: '🐉', bg: 'bg-green-500/15 border-green-500/40' },
  { id: 'av5', emoji: '🦋', bg: 'bg-purple-500/15 border-purple-500/40' },
  { id: 'av6', emoji: '🦅', bg: 'bg-red-500/15 border-red-500/40' },
  { id: 'av7', emoji: '🐺', bg: 'bg-slate-500/15 border-slate-500/40' },
  { id: 'av8', emoji: '🦈', bg: 'bg-cyan-500/15 border-cyan-500/40' },
]

const BALANCE_OPTIONS = [
  { label: '₹10K',  value: 10_000 },
  { label: '₹50K',  value: 50_000 },
  { label: '₹100K', value: 100_000 },
  { label: '₹500K', value: 500_000 },
]

const TRADING_STYLES = [
  { id: 'day',       label: 'Day Trading',         desc: 'Open & close within the day' },
  { id: 'swing',     label: 'Swing Trading',        desc: 'Hold for days or weeks' },
  { id: 'longterm',  label: 'Long-term Investing',  desc: 'Hold for months or years' },
  { id: 'passive',   label: 'Passive / Index',      desc: 'ETFs and diversification' },
]

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

const CURRENCIES = ['INR']

const SEED_SYMBOLS = [
  'RELIANCE', 'HDFCBANK', 'INFY', 'TCS', 'ICICIBANK', 'SBI',
  'BHARTIARTL', 'AXISBANK', 'NIFTY', 'BANKNIFTY', 'LT', 'SUNPHARMA',
  'MARUTI', 'ITC', 'POWERGRID', 'BAJAJFINANCE', 'M&M', 'DRREDDY',
]

const STEP_LABELS = ['Your Profile', 'Portfolio Setup', 'Seed Watchlist']

// ─── Component ────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, onboardingComplete, completeOnboarding } = useAuthStore()

  // Guards
  useEffect(() => {
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (onboardingComplete) { navigate('/dashboard', { replace: true }) }
  }, [isAuthenticated, onboardingComplete, navigate])

  // Step state
  const [step, setStep] = useState(1)

  // Step 1 state
  const [displayName, setDisplayName] = useState(user?.name ?? '')
  const [avatar, setAvatar] = useState('av1')
  const [currency, setCurrency] = useState('INR')
  const [nameErr, setNameErr] = useState('')

  // Step 2 state
  const [balance, setBalance] = useState(100_000)
  const [tradingStyle, setTradingStyle] = useState('swing')
  const [experience, setExperience] = useState('Intermediate')

  // Step 3 state
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([])
  const [symbolErr, setSymbolErr] = useState('')

  // ── Navigation helpers ──────────────────────────────────────────────────────
  function goNext() {
    if (step === 1) {
      if (!displayName.trim() || displayName.trim().length < 2) {
        setNameErr('Display name must be at least 2 characters')
        return
      }
      setNameErr('')
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  function toggleSymbol(sym: string) {
    setSelectedSymbols((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym],
    )
    setSymbolErr('')
  }

  function handleComplete() {
    if (selectedSymbols.length < 5) {
      setSymbolErr('Select at least 5 symbols to personalise your dashboard')
      return
    }
    const selectedAvatar = AVATARS.find((a) => a.id === avatar)
    completeOnboarding({
      name: displayName.trim(),
      avatar,
      startingBalance: balance,
      currency,
      // Store emoji in name field isn't ideal — avatar id stored separately
    })
    // Pass selected symbols as a side-effect (would go to store in Phase 5)
    void selectedAvatar // suppress lint — avatar emoji used for display only
    navigate('/dashboard', { replace: true })
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">tradeox</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="border-b border-border bg-card/50 px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            {STEP_LABELS.map((label, i) => {
              const idx = i + 1
              const done = idx < step
              const active = idx === step
              return (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <div
                    className={cn(
                      'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all',
                      done
                        ? 'border-accent bg-accent text-white'
                        : active
                          ? 'border-primary bg-primary text-white'
                          : 'border-border bg-transparent text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : idx}
                  </div>
                  <span
                    className={cn(
                      'hidden text-xs font-medium sm:block',
                      active ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </span>
                  {i < STEP_LABELS.length - 1 && (
                    <div className={cn('ml-2 h-px flex-1', done ? 'bg-accent' : 'bg-border')} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <main className="flex flex-1 flex-col items-center px-6 py-10">
        <div className="w-full max-w-2xl">

          {/* ── STEP 1: Profile ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Set up your profile</h1>
                <p className="mt-1 text-muted-foreground">Choose how you appear on the leaderboard.</p>
              </div>

              {/* Display name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); setNameErr('') }}
                  placeholder="e.g. AlphaTrader99"
                  className={cn(
                    'w-full rounded-xl border bg-card px-4 py-2.5 text-sm text-foreground',
                    'placeholder:text-muted-foreground/40 outline-none transition-colors',
                    'focus:border-primary focus:ring-1 focus:ring-primary/30',
                    nameErr ? 'border-destructive' : 'border-border',
                  )}
                />
                {nameErr && <p className="text-xs text-destructive">{nameErr}</p>}
              </div>

              {/* Avatar picker */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Avatar</p>
                <div className="grid grid-cols-8 gap-3">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatar(av.id)}
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl transition-all',
                        av.bg,
                        avatar === av.id
                          ? 'scale-110 border-primary shadow-md shadow-primary/30'
                          : 'border-transparent hover:scale-105',
                      )}
                      aria-label={`Avatar ${av.emoji}`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Display Currency</label>
                <div className="flex flex-wrap gap-2">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={cn(
                        'rounded-lg border px-4 py-1.5 text-sm font-medium transition-all',
                        currency === c
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Portfolio Setup ──────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Configure your portfolio</h1>
                <p className="mt-1 text-muted-foreground">
                  Pick a starting balance and tell us about your style.
                </p>
              </div>

              {/* Starting balance */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Starting Balance</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {BALANCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBalance(opt.value)}
                      className={cn(
                        'rounded-xl border p-4 text-center font-semibold transition-all',
                        balance === opt.value
                          ? 'border-primary bg-primary/10 text-primary shadow-md shadow-primary/20'
                          : 'border-border bg-card text-foreground hover:border-primary/50',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trading style */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Trading Style</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {TRADING_STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTradingStyle(s.id)}
                      className={cn(
                        'flex flex-col items-start rounded-xl border p-4 text-left transition-all',
                        tradingStyle === s.id
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                          : 'border-border bg-card hover:border-primary/40',
                      )}
                    >
                      <span className={cn('font-semibold', tradingStyle === s.id ? 'text-primary' : 'text-foreground')}>
                        {s.label}
                      </span>
                      <span className="mt-0.5 text-xs text-muted-foreground">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Experience Level</p>
                <div className="flex gap-3">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperience(lvl)}
                      className={cn(
                        'flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all',
                        experience === lvl
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted-foreground hover:border-accent/40 hover:text-foreground',
                      )}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Watchlist Seed ───────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Seed your watchlist</h1>
                <p className="mt-1 text-muted-foreground">
                  Pick at least 5 symbols to track on your dashboard.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedSymbols.length} selected
                  {selectedSymbols.length < 5 && (
                    <span className="ml-1 text-warning">({5 - selectedSymbols.length} more needed)</span>
                  )}
                </span>
                {selectedSymbols.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSymbols([])}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {SEED_SYMBOLS.map((sym) => {
                  const active = selectedSymbols.includes(sym)
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymbol(sym)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-sm font-mono font-semibold transition-all',
                        active
                          ? 'border-accent bg-accent/15 text-accent shadow shadow-accent/20'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground',
                      )}
                    >
                      {active && <Check className="mr-1 inline h-3 w-3" />}
                      {sym}
                    </button>
                  )
                })}
              </div>

              {symbolErr && <p className="text-sm text-destructive">{symbolErr}</p>}
            </div>
          )}

          {/* ── Footer nav ─────────────────────────────────────────────── */}
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] hover:bg-[#4F46E5]"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={selectedSymbols.length < 5}
                className="flex items-center gap-1.5 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:scale-[1.01] hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
                Launch Dashboard
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
