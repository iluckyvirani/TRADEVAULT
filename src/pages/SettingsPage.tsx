import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { User, Shield, Bell, Palette } from 'lucide-react'

const AVATAR_OPTIONS = [
  { id: 'av1', emoji: '🦊' }, { id: 'av2', emoji: '🐬' },
  { id: 'av3', emoji: '🦁' }, { id: 'av4', emoji: '🐉' },
  { id: 'av5', emoji: '🦋' }, { id: 'av6', emoji: '🦅' },
  { id: 'av7', emoji: '🐺' }, { id: 'av8', emoji: '🦈' },
]

const SECTIONS = [
  { id: 'profile',   label: 'Profile',       icon: User },
  { id: 'security',  label: 'Security',      icon: Shield },
  { id: 'notifs',    label: 'Notifications', icon: Bell },
  { id: 'appearance',label: 'Appearance',    icon: Palette },
]

export default function SettingsPage() {
  const { user, completeOnboarding } = useAuthStore()
  const [active, setActive] = useState('profile')
  const [name, setName] = useState(user?.name ?? '')
  const [avatar, setAvatar] = useState(user?.avatar ?? 'av1')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    completeOnboarding({ name, avatar })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <nav className="flex-shrink-0 w-44">
          <ul className="space-y-0.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setActive(id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                    active === id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-card hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 rounded-2xl border border-border bg-card p-6">
          {active === 'profile' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-foreground">Profile Settings</h3>

              {/* Display name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={user?.email ?? ''}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground opacity-60 outline-none"
                />
              </div>

              {/* Avatar */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Avatar</label>
                <div className="flex gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatar(av.id)}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-all',
                        avatar === av.id
                          ? 'scale-110 border-primary shadow-md shadow-primary/30'
                          : 'border-border hover:scale-105',
                      )}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                className={cn(
                  'rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all',
                  saved
                    ? 'bg-accent shadow-lg shadow-accent/25'
                    : 'bg-primary shadow-lg shadow-primary/25 hover:bg-[#4F46E5]',
                )}
              >
                {saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {active !== 'profile' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {SECTIONS.find((s) => s.id === active)?.icon &&
                (() => { const Icon = SECTIONS.find((s) => s.id === active)!.icon; return <Icon className="mb-4 h-10 w-10 text-primary/40" /> })()
              }
              <p className="text-sm text-muted-foreground">
                {SECTIONS.find((s) => s.id === active)?.label} settings coming in a future phase.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
