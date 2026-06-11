import type { ProfileTitle, RegistrationStep, User, UserPreferences } from '@prisma/client'

const TITLE_TO_API: Record<ProfileTitle, string> = {
  Mr: 'Mr.',
  Ms: 'Ms.',
  Mrs: 'Mrs.',
  Dr: 'Dr.',
}

export type AuthUserDto = {
  id: string
  email: string
  name: string
  title?: string
  phone?: string
  onboardingHelp?: boolean
  avatar: string
  currency: 'INR'
  startingBalance?: number
}

export type AuthSessionDto = {
  user: AuthUserDto
  registrationStep: RegistrationStep | null
  onboardingComplete: boolean
  accessToken: string
}

export function titleToApi(title: ProfileTitle | null | undefined): string | undefined {
  if (!title) return undefined
  return TITLE_TO_API[title]
}

export function titleFromApi(title: string): ProfileTitle {
  const map: Record<string, ProfileTitle> = {
    'Mr.': 'Mr',
    'Ms.': 'Ms',
    'Mrs.': 'Mrs',
    'Dr.': 'Dr',
  }
  const mapped = map[title]
  if (!mapped) throw new Error(`Invalid title: ${title}`)
  return mapped
}

export function serializeUser(
  user: User & { preferences?: UserPreferences | null },
): AuthUserDto {
  const startingBalance =
    user.startingBalance != null ? Number(user.startingBalance) : undefined

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    title: titleToApi(user.title),
    phone: user.phone ?? undefined,
    onboardingHelp: user.preferences?.onboardingHelp,
    avatar: user.avatar,
    currency: 'INR',
    startingBalance,
  }
}

export function isOnboardingComplete(step: RegistrationStep | null): boolean {
  return step === 'email_verified' || step === 'evaluation_started'
}
