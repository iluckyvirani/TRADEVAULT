import { Router } from 'express'
import { z } from 'zod'
import {
  createCheckoutOrder,
  handleRazorpayWebhook,
  mockFulfillPayment,
  verifyAndFulfillPayment,
} from '../services/checkoutService.js'
import { validateAffiliateCode } from '../services/affiliateService.js'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'

const createSchema = z.object({
  planId: z.string().min(1),
  affiliateCode: z.string().optional(),
})

const verifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
})

const affiliateSchema = z.object({
  code: z.string().min(1),
})

export async function checkoutWebhookHandler(
  req: import('express').Request,
  res: import('express').Response,
  next: import('express').NextFunction,
) {
  try {
    const signature = req.headers['x-razorpay-signature'] as string | undefined
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' })
    }
    const rawBody =
      typeof req.body === 'string'
        ? req.body
        : Buffer.isBuffer(req.body)
          ? req.body.toString('utf8')
          : JSON.stringify(req.body)

    const result = await handleRazorpayWebhook(rawBody, signature)
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export const checkoutRouter = Router()

checkoutRouter.use(requireAuth)

checkoutRouter.post('/create', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const body = createSchema.parse(req.body)
    const order = await createCheckoutOrder(userId, body)
    res.json(order)
  } catch (e) {
    next(e)
  }
})

checkoutRouter.post('/verify', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const body = verifySchema.parse(req.body)
    const result = await verifyAndFulfillPayment(userId, body)
    res.json(result)
  } catch (e) {
    next(e)
  }
})

checkoutRouter.post('/mock-pay', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const billingRecordId = z.string().parse(req.body?.billingRecordId)
    const result = await mockFulfillPayment(userId, billingRecordId)
    res.json(result)
  } catch (e) {
    next(e)
  }
})

checkoutRouter.post('/validate-affiliate', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const body = affiliateSchema.parse(req.body)
    const result = await validateAffiliateCode(body.code, userId)
    res.json(result)
  } catch (e) {
    next(e)
  }
})
