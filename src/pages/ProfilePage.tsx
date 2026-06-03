import { useMemo, useState } from 'react'
import {
  AtSign,
  CircleUserRound,
  Cog,
  Lock,
  Moon,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { cn } from '@/lib/utils'

type Tab = 'personal' | 'preferences' | 'verified'
type Channel = 'whatsapp' | 'sms' | 'call'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const isDark = useThemeStore((s) => s.mode === 'dark')
  const setTheme = useThemeStore((s) => s.setMode)

  const [tab, setTab] = useState<Tab>('personal')
  const [nickname, setNickname] = useState('SlyLeopard3793')
  const [displayNick, setDisplayNick] = useState('SlyLeopard3793')
  const [helpUpdates, setHelpUpdates] = useState(Boolean(user?.onboardingHelp))
  const [channel, setChannel] = useState<Channel>('whatsapp')

  const initials = useMemo(
    () =>
      (user?.name ?? 'U')
        .split(/\s+/)
        .map((p) => p[0])
        .join('')
        .slice(0, 1)
        .toUpperCase(),
    [user?.name],
  )

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6 lg:p-7">
      <p className="text-xs text-muted-foreground">
        Home / Profile / {tab === 'personal' ? 'Personal' : tab === 'preferences' ? 'Preferences' : 'Verified Trader'}
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-foreground">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your personal details and verification status.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <TabBtn
          active={tab === 'personal'}
          label="Personal Info"
          icon={CircleUserRound}
          onClick={() => setTab('personal')}
        />
        <TabBtn
          active={tab === 'preferences'}
          label="Preferences"
          icon={Cog}
          onClick={() => setTab('preferences')}
        />
        <TabBtn
          active={tab === 'verified'}
          label="Verified Trader"
          icon={ShieldCheck}
          onClick={() => setTab('verified')}
        />
      </div>

      <div className="mt-5 space-y-4">
        {tab === 'personal' && (
          <>
            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0a4f84]">
                Public Identity
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-foreground">Your trader nickname</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Shown on leaderboards and payout proof pages. Changes allowed once in 30 days.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="relative min-w-[320px] flex-1">
                  <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.replace(/\s+/g, ''))}
                    className="h-11 w-full rounded-xl border border-border bg-muted pl-9 pr-3 text-base font-medium outline-none focus:border-[#003d7a]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setDisplayNick(nickname)}
                  className="h-11 rounded-xl bg-[#6f8eab] px-8 text-base font-semibold text-white hover:bg-[#577a9d]"
                >
                  Save
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Letters, numbers and underscores only</span>
                <span>{nickname.length}/20</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground">
                <span className="h-2 w-2 rounded-full bg-[#0a4f84]" />
                Shown as <span className="font-semibold">@{displayNick}</span>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex items-start gap-3 border-b border-border px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef3fa] text-[#003d7a]">
                  {initials}
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-foreground">Personal details</h3>
                  <p className="text-sm text-muted-foreground">
                    Your name and contact info as registered with tradeox
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <Field label="Title" value={user?.title ?? 'Mr'} />
                <Field label="Email" value={user?.email ?? ''} locked helper="Cannot be changed" />
                <Field label="Full Name" value={user?.name ?? ''} />
                <Field label="Phone Number" value={user?.phone ?? '+91 00000-00000'} helper="Include your country code" />
              </div>
              <div className="flex items-center justify-between border-t border-border px-5 py-4">
                <button type="button" className="text-sm text-muted-foreground hover:text-foreground">
                  Reset changes
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#003d7a] px-7 py-2.5 text-sm font-semibold text-white hover:bg-[#002d5b]"
                >
                  Save changes
                </button>
              </div>
            </section>
          </>
        )}

        {tab === 'preferences' && (
          <>
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-3xl font-semibold text-foreground">Appearance</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose how the client area looks for you.</p>
              <div className="mt-3 inline-flex rounded-xl border border-border bg-muted p-1">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
                    !isDark ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                  )}
                >
                  <Sun className="h-4 w-4" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
                    isDark ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                  )}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-2xl font-semibold text-foreground">Communication preferences</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose how you&apos;d like to receive onboarding help and important account updates.
              </p>

              <div className="mt-3 rounded-xl border border-border bg-muted px-3 py-2">
                <p className="text-sm font-medium text-foreground">Contact number</p>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">We&apos;ll use this number for WhatsApp / SMS / calls.</span>
                  <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">
                    {user?.phone ?? '+91 0000000000'} <span className="text-xs text-muted-foreground">(from profile)</span>
                  </span>
                </div>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={helpUpdates}
                  onChange={(e) => setHelpUpdates(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">Get onboarding help & account updates</span>
                  <span className="text-xs text-muted-foreground">Used only for onboarding/support. You can opt out anytime.</span>
                </span>
              </label>

              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">Choose your preferred channel:</p>
                <div className="mt-2 flex gap-2">
                  {([
                    ['whatsapp', 'WhatsApp'],
                    ['sms', 'SMS'],
                    ['call', 'Call'],
                  ] as const).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setChannel(id)}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm font-medium',
                        channel === id ? 'bg-[#003d7a] text-white' : 'border border-border bg-card text-foreground',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  We&apos;ll reach out only if needed (trading room setup, evaluation clarifications, payment issues).
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">Something wrong or want a new feature? Contact support</p>
                <button
                  type="button"
                  className="rounded-full bg-[#003d7a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#002d5b]"
                >
                  Save preferences
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-border bg-[#fff6f6] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold text-foreground">Daily Kill Switch</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Activate a trading lock for the rest of the current trading day.
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    Inactive
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-card p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Trading protection status</p>
                    <p className="text-xs text-muted-foreground">You can activate the kill switch once for the current trading day.</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Activate Kill Switch
                  </button>
                </div>
              </div>
            </section>
          </>
        )}

        {tab === 'verified' && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#0a4f84]" />
              <h2 className="text-2xl font-semibold text-foreground">Verified Trader Status</h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-foreground">
              The <strong>tradeox Verified Trader</strong> section becomes available automatically when you are
              eligible to sign or update a trading contract. Eligibility is reached after meeting the required
              <strong> profit target</strong> in a validator while respecting <strong>maximum daily loss</strong> and
              <strong> maximum overall loss</strong> limits.
            </p>
            <div className="mt-4 rounded-xl border border-border bg-muted p-4 text-sm text-foreground">
              <ul className="list-disc space-y-2 pl-5">
                <li>Keep your profile information accurate and up to date.</li>
                <li>Once eligible, you will be notified to complete identity verification and contractual steps.</li>
                <li>You may continue participating in evaluations until then.</li>
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function TabBtn({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: typeof CircleUserRound
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
        active ? 'bg-black text-white' : 'bg-card text-foreground hover:bg-muted',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function Field({
  label,
  value,
  helper,
  locked,
}: {
  label: string
  value: string
  helper?: string
  locked?: boolean
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1 flex h-11 items-center justify-between rounded-xl border border-border bg-muted px-3">
        <span className="text-sm text-foreground">{value}</span>
        {locked && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Locked
          </span>
        )}
      </div>
      {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
    </div>
  )
}
