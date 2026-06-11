import crypto from 'crypto'
import Razorpay from 'razorpay'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { config } from '../config.js'
import { createPaidAccount } from './accountService.js'
import {
  createReferralForPayment,
  normalizeAffiliateCode,
  validateAffiliateCode,
} from './affiliateService.js'
import { serializeAccount } from '../utils/accountSerializer.js'

function getRazorpay() {
  if (!config.razorpayKeyId || !config.razorpayKeySecret) return null
  return new Razorpay({
    key_id: config.razorpayKeyId,
    key_secret: config.razorpayKeySecret,
  })
}

function formatProgramLabel(accountSize: number) {
  return `₹${accountSize.toLocaleString('en-IN')} account`
}

export async function createCheckoutOrder(
  userId: string,
  input: { planId: string; affiliateCode?: string },
) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND')

  const tier = await prisma.evaluationPlanTier.findUnique({
    where: { id: input.planId },
  })
  if (!tier || !tier.active) {
    throw new AppError(400, 'Invalid plan', 'INVALID_PLAN')
  }

  let pendingAffiliateCode = user.pendingAffiliateCode
  if (input.affiliateCode?.trim()) {
    const check = await validateAffiliateCode(input.affiliateCode, userId)
    if (!check.valid) {
      throw new AppError(400, check.message, 'INVALID_AFFILIATE_CODE')
    }
    pendingAffiliateCode = normalizeAffiliateCode(input.affiliateCode)
    await prisma.user.update({
      where: { id: userId },
      data: { pendingAffiliateCode },
    })
  }

  const amount = Number(tier.evaluationFee)
  const accountSize = Number(tier.balance)
  const program = formatProgramLabel(accountSize)

  const billing = await prisma.billingRecord.create({
    data: {
      userId,
      planId: tier.id,
      program,
      accountSize,
      amount,
      currency: 'INR',
      status: 'pending',
    },
  })

  const razorpay = getRazorpay()

  if (!razorpay) {
    return {
      mock: true as const,
      billingRecordId: billing.id,
      amount,
      currency: 'INR',
      planId: tier.id,
      program,
      accountSize,
      keyId: null,
      razorpayOrderId: null,
      pendingAffiliateCode,
    }
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt: billing.id,
    notes: {
      userId,
      planId: tier.id,
      billingRecordId: billing.id,
    },
  })

  await prisma.billingRecord.update({
    where: { id: billing.id },
    data: { razorpayOrderId: order.id },
  })

  return {
    mock: false as const,
    billingRecordId: billing.id,
    amount,
    currency: 'INR',
    planId: tier.id,
    program,
    accountSize,
    keyId: config.razorpayKeyId,
    razorpayOrderId: order.id,
    pendingAffiliateCode,
  }
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  if (!config.razorpayKeySecret) return false
  const body = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac('sha256', config.razorpayKeySecret)
    .update(body)
    .digest('hex')
  return expected === signature
}

export function verifyWebhookSignature(body: string, signature: string) {
  if (!config.razorpayWebhookSecret) return false
  const expected = crypto
    .createHmac('sha256', config.razorpayWebhookSecret)
    .update(body)
    .digest('hex')
  return expected === signature
}

export async function fulfillBillingRecord(
  billingRecordId: string,
  paymentMeta: {
    razorpayPaymentId?: string
    razorpayOrderId?: string
    paymentMethod?: string
  },
) {
  const billing = await prisma.billingRecord.findUnique({
    where: { id: billingRecordId },
    include: { user: true, account: true },
  })

  if (!billing) {
    throw new AppError(404, 'Billing record not found', 'NOT_FOUND')
  }

  if (billing.status === 'paid' && billing.accountId) {
    const account = billing.account
      ? serializeAccount(billing.account)
      : await prisma.evaluationAccount
          .findUnique({ where: { id: billing.accountId } })
          .then((a) => (a ? serializeAccount(a) : null))
    return { account, billingRecordId: billing.id, alreadyFulfilled: true }
  }

  const accountDto = await createPaidAccount(billing.userId, {
    planId: billing.planId ?? undefined,
    accountSize: Number(billing.accountSize),
  })

  const accountRow = await prisma.evaluationAccount.findUnique({
    where: { id: accountDto.id },
  })

  const updatedBilling = await prisma.billingRecord.update({
    where: { id: billing.id },
    data: {
      status: 'paid',
      accountId: accountDto.id,
      razorpayPaymentId: paymentMeta.razorpayPaymentId,
      razorpayOrderId: paymentMeta.razorpayOrderId ?? billing.razorpayOrderId,
      paymentMethod: paymentMeta.paymentMethod ?? 'Razorpay',
      paidAt: new Date(),
    },
  })

  const affiliateCode = billing.user.pendingAffiliateCode
  if (affiliateCode) {
    await createReferralForPayment({
      affiliateCode,
      buyerUserId: billing.userId,
      buyerName: billing.user.name,
      buyerEmail: billing.user.email,
      program: billing.program,
      orderAmount: Number(billing.amount),
      billingRecordId: billing.id,
    })
    await prisma.user.update({
      where: { id: billing.userId },
      data: { pendingAffiliateCode: null },
    })
  }

  return {
    account: accountRow ? serializeAccount(accountRow) : accountDto,
    billingRecordId: updatedBilling.id,
    alreadyFulfilled: false,
  }
}

export async function verifyAndFulfillPayment(
  userId: string,
  input: {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
  },
) {
  const billing = await prisma.billingRecord.findFirst({
    where: {
      userId,
      razorpayOrderId: input.razorpayOrderId,
      status: 'pending',
    },
  })

  if (!billing) {
    throw new AppError(404, 'Pending order not found', 'ORDER_NOT_FOUND')
  }

  if (!verifyPaymentSignature(
    input.razorpayOrderId,
    input.razorpayPaymentId,
    input.razorpaySignature,
  )) {
    throw new AppError(400, 'Invalid payment signature', 'INVALID_SIGNATURE')
  }

  return fulfillBillingRecord(billing.id, {
    razorpayPaymentId: input.razorpayPaymentId,
    razorpayOrderId: input.razorpayOrderId,
    paymentMethod: 'Razorpay',
  })
}

export async function mockFulfillPayment(userId: string, billingRecordId: string) {
  if (!config.isDev && !config.allowMockPayments) {
    throw new AppError(403, 'Mock payments disabled', 'MOCK_DISABLED')
  }

  const billing = await prisma.billingRecord.findFirst({
    where: { id: billingRecordId, userId, status: 'pending' },
  })
  if (!billing) {
    throw new AppError(404, 'Pending order not found', 'ORDER_NOT_FOUND')
  }

  return fulfillBillingRecord(billing.id, {
    razorpayPaymentId: `mock_pay_${Date.now()}`,
    razorpayOrderId: `mock_order_${billing.id}`,
    paymentMethod: 'Mock · Dev',
  })
}

export async function handleRazorpayWebhook(rawBody: string, signature: string) {
  if (!verifyWebhookSignature(rawBody, signature)) {
    throw new AppError(400, 'Invalid webhook signature', 'INVALID_WEBHOOK')
  }

  const event = JSON.parse(rawBody) as {
    event: string
    payload?: {
      payment?: { entity?: { order_id?: string; id?: string; method?: string } }
      order?: { entity?: { id?: string } }
    }
  }

  if (event.event !== 'payment.captured') {
    return { ok: true, skipped: true }
  }

  const payment = event.payload?.payment?.entity
  const orderId = payment?.order_id
  const paymentId = payment?.id

  if (!orderId || !paymentId) {
    return { ok: true, skipped: true }
  }

  const billing = await prisma.billingRecord.findFirst({
    where: { razorpayOrderId: orderId },
  })

  if (!billing) {
    return { ok: true, skipped: true }
  }

  await fulfillBillingRecord(billing.id, {
    razorpayPaymentId: paymentId,
    razorpayOrderId: orderId,
    paymentMethod: payment?.method ? `Razorpay · ${payment.method}` : 'Razorpay',
  })

  return { ok: true, fulfilled: true }
}
