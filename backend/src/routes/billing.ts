import { Router } from 'express'
import { listBillingHistory } from '../services/billingService.js'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'

export const billingRouter = Router()

billingRouter.use(requireAuth)

billingRouter.get('/history', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const records = await listBillingHistory(userId)
    res.json({ records })
  } catch (e) {
    next(e)
  }
})
