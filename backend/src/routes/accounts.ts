import { Router } from 'express'
import { z } from 'zod'
import {
  createFreeTrialAccount,
  createPaidAccount,
  getAccount,
  getAccountStats,
  getEquityCurve,
  listAccounts,
  setActiveAccount,
} from '../services/accountService.js'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { accountTradingRouter } from './trading.js'

const freeTrialSchema = z.object({
  accountSize: z.number().positive(),
})

const paidSchema = z.object({
  planId: z.string().optional(),
  accountSize: z.number().positive().optional(),
})

const activeSchema = z.object({
  accountId: z.string().min(1),
})

export const accountsRouter = Router()

accountsRouter.use(requireAuth)

accountsRouter.get('/', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const accounts = await listAccounts(userId)
    res.json({ accounts })
  } catch (e) {
    next(e)
  }
})

accountsRouter.post('/free-trial', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const body = freeTrialSchema.parse(req.body)
    const account = await createFreeTrialAccount(userId, body.accountSize)
    res.status(201).json({ account })
  } catch (e) {
    next(e)
  }
})

accountsRouter.post('/paid', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const body = paidSchema.parse(req.body)
    const account = await createPaidAccount(userId, body)
    res.status(201).json({ account })
  } catch (e) {
    next(e)
  }
})

accountsRouter.patch('/active', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const body = activeSchema.parse(req.body)
    const result = await setActiveAccount(userId, body.accountId)
    res.json(result)
  } catch (e) {
    next(e)
  }
})

accountsRouter.use('/:id', accountTradingRouter)

accountsRouter.get('/:id', async (req, res, next) => {
  try {
    const { userId } = req as unknown as AuthedRequest
    const account = await getAccount(userId, req.params.id)
    res.json({ account })
  } catch (e) {
    next(e)
  }
})

accountsRouter.get('/:id/stats', async (req, res, next) => {
  try {
    const { userId } = req as unknown as AuthedRequest
    const stats = await getAccountStats(userId, req.params.id)
    res.json(stats)
  } catch (e) {
    next(e)
  }
})

accountsRouter.get('/:id/equity-curve', async (req, res, next) => {
  try {
    const { userId } = req as unknown as AuthedRequest
    const curve = await getEquityCurve(userId, req.params.id)
    res.json(curve)
  } catch (e) {
    next(e)
  }
})
