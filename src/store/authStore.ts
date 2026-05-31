import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RegistrationStep =
  | 'registered'
  | 'profile_completed'
  | 'email_verified'
  | 'evaluation_started'

export type ProfileTitle = 'Mr.' | 'Ms.' | 'Mrs.' | 'Dr.'

export interface AuthUser {
  id: string
  email: string
  name: string
  title?: ProfileTitle
  phone?: string
  onboardingHelp?: boolean
  avatar: string
  currency: 'INR'
  startingBalance?: number
}

export interface ProfileFormData {
  title: ProfileTitle
  fullName: string
  phone: string
  onboardingHelp: boolean
}

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  registrationStep: RegistrationStep | null
  onboardingComplete: boolean
  failedAttempts: number
  lockedUntil: number | null
  register: (email: string) => void
  signIn: (email: string, name?: string) => void
  completeProfile: (data: ProfileFormData) => void
  verifyEmail: () => void
  markEvaluationStarted: () => void
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
      registrationStep: null,
      onboardingComplete: false,
      failedAttempts: 0,
      lockedUntil: null,

      register: (email) =>
        set({
          isAuthenticated: true,
          registrationStep: 'registered',
          onboardingComplete: false,
          user: {
            id: `user-${Date.now()}`,
            email,
            name: email.split('@')[0],
            avatar: 'av1',
            currency: 'INR',
          },
          failedAttempts: 0,
          lockedUntil: null,
        }),

      signIn: (email, name) =>
        set({
          isAuthenticated: true,
          registrationStep: 'email_verified',
          onboardingComplete: true,
          user: {
            id: `user-${Date.now()}`,
            email,
            name: name ?? email.split('@')[0],
            avatar: 'av1',
            currency: 'INR',
          },
          failedAttempts: 0,
          lockedUntil: null,
        }),

      completeProfile: (data) =>
        set((state) => ({
          registrationStep: 'profile_completed',
          user: state.user
            ? {
                ...state.user,
                name: data.fullName,
                title: data.title,
                phone: data.phone,
                onboardingHelp: data.onboardingHelp,
              }
            : null,
        })),

      verifyEmail: () =>
        set({
          registrationStep: 'email_verified',
          onboardingComplete: true,
        }),

      markEvaluationStarted: () =>
        set({ registrationStep: 'evaluation_started' }),

      login: (email, name) => get().signIn(email, name),

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          registrationStep: null,
          onboardingComplete: false,
        }),

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
    {
      name: 'tv-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        registrationStep: state.registrationStep,
        onboardingComplete: state.onboardingComplete,
        failedAttempts: state.failedAttempts,
        lockedUntil: state.lockedUntil,
      }),
    },
  ),
)
