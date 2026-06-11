import { Router } from 'express'
import { listPlans } from '../services/plansService.js'

export const plansRouter = Router()

plansRouter.get('/', async (_req, res, next) => {
  try {
    const data = await listPlans()
    res.json(data)
  } catch (e) {
    next(e)
  }
})
