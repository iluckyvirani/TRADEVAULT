import { Router } from 'express'
import { listFaq } from '../services/faqService.js'

export const faqRouter = Router()

faqRouter.get('/', async (_req, res, next) => {
  try {
    const data = await listFaq()
    res.json(data)
  } catch (e) {
    next(e)
  }
})
