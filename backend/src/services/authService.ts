import crypto from 'crypto'
import type { RegistrationStep } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { AppError, assertFound } from '../lib/errors.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import {
  hashToken,
  refreshExpiresAt,
  signAccessToken,
  signRefreshToken,
} from '../lib/jwt.js'
import {
  isOnboardingComplete,
  serializeUser,
  titleFromApi,
  type AuthSessionDto,
} from '../utils/serializers.js'
import { config } from '../config.js'

const DEMO_PARTNER_CODE = 'DEMO123'
const LOCKOUT_ATTEMPTS = 3
const LOCKOUT_MS = 30_000

const userInclude = { preferences: true } as const

async function buildSession(userId: string): Promise<AuthSessionDto> {
  const user = assertFound(
    await prisma.user.findUnique({ where: { id: userId }, include: userInclude }),
    'User not found',
  )

  return {
    user: serializeUser(user),
    registrationStep: user.registrationStep,
    onboardingComplete: user.onboardingComplete || isOnboardingComplete(user.registrationStep),
    accessToken: signAccessToken(user.id),
  }
}

export async function createRefreshToken(userId: string): Promise<string> {
  const jti = crypto.randomUUID()
  const token = signRefreshToken(userId, jti)
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: refreshExpiresAt(),
    },
  })
  return token
}

async function validateAffiliateCode(code: string, buyerUserId: string) {
  const normalized = code.trim().toUpperCase()
  if (!normalized) {
    return { valid: false as const, message: 'Enter an affiliate code' }
  }

  if (normalized === DEMO_PARTNER_CODE) {
    return { valid: true as const, message: 'Code applied — affiliate credited on payment' }
  }

  const profile = await prisma.affiliateProfile.findUnique({
    where: { code: normalized },
  })

  if (!profile) {
    return { valid: false as const, message: 'Invalid affiliate code' }
  }
  if (profile.userId === buyerUserId) {
    return { valid: false as const, message: 'You cannot use your own code' }
  }

  return { valid: true as const, message: 'Code applied — affiliate credited on payment' }
}

function assertNotLocked(lockedUntil: Date | null, failedAttempts: number) {
  if (lockedUntil && lockedUntil.getTime() > Date.now()) {
    const seconds = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000)
    throw new AppError(429, `Account locked. Try again in ${seconds}s`, 'ACCOUNT_LOCKED')
  }
  if (failedAttempts >= LOCKOUT_ATTEMPTS && lockedUntil && lockedUntil.getTime() <= Date.now()) {
    // lock expired — caller should clear
  }
}

export async function registerUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    throw new AppError(409, 'An account with this email already exists', 'EMAIL_EXISTS')
  }

  const passwordHash = await hashPassword(password)
  const name = normalizedEmail.split('@')[0]

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name,
      registrationStep: 'registered',
      preferences: { create: {} },
    },
    include: userInclude,
  })

  await createEmailVerificationToken(user.id)

  const session = await buildSession(user.id)
  const refreshToken = await createRefreshToken(user.id)

  return { session, refreshToken }
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: userInclude,
  })

  if (!user?.passwordHash) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS')
  }

  assertNotLocked(user.lockedUntil, user.failedAttempts)

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    const nextAttempts = user.failedAttempts + 1
    const lockedUntil =
      nextAttempts >= LOCKOUT_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : null

    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: nextAttempts, lockedUntil },
    })

    if (lockedUntil) {
      throw new AppError(429, 'Too many failed attempts. Try again in 30 seconds', 'ACCOUNT_LOCKED')
    }
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS')
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lockedUntil: null },
  })

  const session = await buildSession(user.id)
  const refreshToken = await createRefreshToken(user.id)

  return { session, refreshToken }
}

export async function refreshSession(refreshToken: string) {
  const { verifyRefreshToken } = await import('../lib/jwt.js')
  let payload: ReturnType<typeof verifyRefreshToken>
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw new AppError(401, 'Invalid refresh token', 'INVALID_REFRESH')
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
  })

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token expired', 'INVALID_REFRESH')
  }

  const session = await buildSession(payload.sub)
  return session
}

export async function logoutUser(refreshToken: string | undefined) {
  if (!refreshToken) return
  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashToken(refreshToken) },
  })
}

export async function getMe(userId: string) {
  const user = assertFound(
    await prisma.user.findUnique({ where: { id: userId }, include: userInclude }),
    'User not found',
  )

  return {
    user: serializeUser(user),
    registrationStep: user.registrationStep,
    onboardingComplete: user.onboardingComplete || isOnboardingComplete(user.registrationStep),
  }
}

export async function completeProfile(
  userId: string,
  input: {
    title: string
    fullName: string
    phone: string
    onboardingHelp: boolean
    affiliateCode?: string
  },
) {
  const user = assertFound(
    await prisma.user.findUnique({ where: { id: userId } }),
    'User not found',
  )

  if (user.registrationStep !== 'registered') {
    throw new AppError(400, 'Profile already completed', 'INVALID_STEP')
  }

  let pendingAffiliateCode: string | null = null
  if (input.affiliateCode?.trim()) {
    const check = await validateAffiliateCode(input.affiliateCode, userId)
    if (!check.valid) {
      throw new AppError(400, check.message, 'INVALID_AFFILIATE_CODE')
    }
    pendingAffiliateCode = input.affiliateCode.trim().toUpperCase()
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.fullName.trim(),
      title: titleFromApi(input.title),
      phone: input.phone.trim(),
      pendingAffiliateCode,
      registrationStep: 'profile_completed',
      preferences: {
        upsert: {
          create: { onboardingHelp: input.onboardingHelp },
          update: { onboardingHelp: input.onboardingHelp },
        },
      },
    },
  })

  return buildSession(userId)
}

export async function createEmailVerificationToken(userId: string) {
  const token = crypto.randomBytes(32).toString('hex')
  await prisma.emailVerificationToken.deleteMany({ where: { userId } })
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 24 * 3600000),
    },
  })

  if (config.isDev) {
    console.log(`[dev] Email verification token for user ${userId}: ${token}`)
  }

  return token
}

export async function verifyEmail(userId: string, token?: string) {
  const user = assertFound(
    await prisma.user.findUnique({ where: { id: userId } }),
    'User not found',
  )

  if (user.registrationStep !== 'profile_completed') {
    throw new AppError(400, 'Email already verified or invalid step', 'INVALID_STEP')
  }

  if (token) {
    const record = await prisma.emailVerificationToken.findFirst({
      where: { userId, token, expiresAt: { gt: new Date() } },
    })
    if (!record) {
      throw new AppError(400, 'Invalid or expired verification token', 'INVALID_TOKEN')
    }
  } else if (!config.isDev) {
    throw new AppError(400, 'Verification token required', 'TOKEN_REQUIRED')
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      registrationStep: 'email_verified',
      onboardingComplete: true,
      emailVerifiedAt: new Date(),
    },
  })

  await prisma.emailVerificationToken.deleteMany({ where: { userId } })

  return buildSession(userId)
}

export async function resendVerification(userId: string) {
  const user = assertFound(
    await prisma.user.findUnique({ where: { id: userId } }),
    'User not found',
  )

  if (user.registrationStep !== 'profile_completed') {
    throw new AppError(400, 'Cannot resend verification at this step', 'INVALID_STEP')
  }

  await createEmailVerificationToken(userId)
  return { ok: true, message: 'Verification email sent' }
}

export async function markEvaluationStarted(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { registrationStep: 'evaluation_started' },
  })
  return buildSession(userId)
}

export { validateAffiliateCode }
