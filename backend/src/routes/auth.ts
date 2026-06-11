import { Router } from 'express'
import { z } from 'zod'
import {
  completeProfile,
  getMe,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  resendVerification,
  verifyEmail,
} from '../services/authService.js'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'

const REFRESH_COOKIE = 'tv_refresh'

function setRefreshCookie(res: import('express').Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

function clearRefreshCookie(res: import('express').Response) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const loginSchema = registerSchema

const completeProfileSchema = z.object({
  title: z.enum(['Mr.', 'Ms.', 'Mrs.', 'Dr.']),
  fullName: z.string().min(2),
  phone: z.string().min(1),
  onboardingHelp: z.boolean(),
  affiliateCode: z.string().optional(),
})

const verifyEmailSchema = z.object({
  token: z.string().optional(),
})

export const authRouter = Router()

authRouter.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'auth' })
})

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body)
    const { session, refreshToken } = await registerUser(body.email, body.password)
    setRefreshCookie(res, refreshToken)
    res.status(201).json(session)
  } catch (e) {
    next(e)
  }
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)
    const { session, refreshToken } = await loginUser(body.email, body.password)
    setRefreshCookie(res, refreshToken)
    res.json(session)
  } catch (e) {
    next(e)
  }
})

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined
    if (!token) {
      return res.status(401).json({ error: 'No refresh token', code: 'NO_REFRESH' })
    }
    const session = await refreshSession(token)
    res.json(session)
  } catch (e) {
    next(e)
  }
})

authRouter.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined
    await logoutUser(token)
    clearRefreshCookie(res)
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const me = await getMe(userId)
    res.json(me)
  } catch (e) {
    next(e)
  }
})

authRouter.post('/complete-profile', requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const body = completeProfileSchema.parse(req.body)
    const session = await completeProfile(userId, body)
    res.json(session)
  } catch (e) {
    next(e)
  }
})

authRouter.post('/verify-email', requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const body = verifyEmailSchema.parse(req.body ?? {})
    const session = await verifyEmail(userId, body.token)
    res.json(session)
  } catch (e) {
    next(e)
  }
})

authRouter.post('/resend-verification', requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const result = await resendVerification(userId)
    res.json(result)
  } catch (e) {
    next(e)
  }
})
