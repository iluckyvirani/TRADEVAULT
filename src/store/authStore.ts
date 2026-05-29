import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar: string
  startingBalance: number
  currency: string
}

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  onboardingComplete: boolean
  failedAttempts: number
  lockedUntil: number | null
  login: (email: string, name: string) => void
  logout: () => void
  completeOnboarding: (updates: Partial<AuthUser>) => void
  recordFailedAttempt: () => void
  clearLock: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      onboardingComplete: false,
      failedAttempts: 0,
      lockedUntil: null,

      login: (email, name) =>
        set({
          isAuthenticated: true,
          user: {
            id: `user-${Date.now()}`,
            email,
            name,
            avatar: 'av1',
            startingBalance: 1_000_000,
            currency: 'INR',
          },
          failedAttempts: 0,
          lockedUntil: null,
        }),

      logout: () =>
        set({ isAuthenticated: false, user: null, onboardingComplete: false }),

      completeOnboarding: (updates) =>
        set((state) => ({
          onboardingComplete: true,
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      recordFailedAttempt: () => {
        const next = get().failedAttempts + 1
        set({
          failedAttempts: next,
          lockedUntil: next >= 3 ? Date.now() + 30_000 : null,
        })
      },

      clearLock: () => set({ failedAttempts: 0, lockedUntil: null }),
    }),
    { name: 'tv-auth' },
  ),
)
