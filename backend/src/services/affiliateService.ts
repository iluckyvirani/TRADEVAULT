import { prisma } from '../lib/prisma.js'

export const REFERRAL_COMMISSION = 500
export const DEMO_PARTNER_CODE = 'DEMO123'

export function normalizeAffiliateCode(code: string) {
  return code.trim().toUpperCase()
}

export async function validateAffiliateCode(code: string, buyerUserId: string) {
  const normalized = normalizeAffiliateCode(code)
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

export async function resolveAffiliateOwnerId(code: string): Promise<string | null> {
  const normalized = normalizeAffiliateCode(code)
  if (!normalized) return null

  if (normalized === DEMO_PARTNER_CODE) {
    const demo = await prisma.affiliateProfile.findUnique({
      where: { code: DEMO_PARTNER_CODE },
    })
    return demo?.userId ?? null
  }

  const profile = await prisma.affiliateProfile.findUnique({
    where: { code: normalized },
  })
  return profile?.userId ?? null
}

export async function createReferralForPayment(input: {
  affiliateCode: string
  buyerUserId: string
  buyerName: string
  buyerEmail: string
  program: string
  orderAmount: number
  billingRecordId: string
}) {
  const ownerId = await resolveAffiliateOwnerId(input.affiliateCode)
  if (!ownerId || ownerId === input.buyerUserId) return null

  const duplicate = await prisma.referral.findFirst({
    where: {
      billingRecordId: input.billingRecordId,
    },
  })
  if (duplicate) return duplicate

  return prisma.referral.create({
    data: {
      affiliateUserId: ownerId,
      buyerUserId: input.buyerUserId,
      referredName: input.buyerName,
      referredEmail: input.buyerEmail,
      program: input.program,
      orderAmount: input.orderAmount,
      commissionAmount: REFERRAL_COMMISSION,
      status: 'pending',
      billingRecordId: input.billingRecordId,
    },
  })
}
