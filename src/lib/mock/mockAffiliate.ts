export const AFFILIATE_COMMISSION_RATE = 0.1
export const DEMO_PARTNER_CODE = 'DEMO123'
export const MIN_PAYOUT_AMOUNT = 500

export type ReferralStatus = 'pending' | 'approved' | 'paid'

export interface AffiliateReferral {
  id: string
  affiliateUserId: string
  referredName: string
  referredEmail: string
  program: string
  orderAmount: number
  commissionAmount: number
  status: ReferralStatus
  createdAt: string
}

export interface AffiliatePayout {
  id: string
  affiliateUserId: string
  amount: number
  status: 'processing' | 'completed'
  createdAt: string
}

export function buildAffiliateCode(userId: string, name: string): string {
  const slug = (name || 'TRADER').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6)
  const suffix = userId.replace(/-/g, '').slice(-4).toUpperCase()
  return `${slug}${suffix}`.slice(0, 12)
}

export function calcCommission(orderAmount: number): number {
  return Math.round(orderAmount * AFFILIATE_COMMISSION_RATE)
}

export function normalizeAffiliateCode(code: string): string {
  return code.trim().toUpperCase()
}

export function isDemoPartnerCode(code: string): boolean {
  return normalizeAffiliateCode(code) === DEMO_PARTNER_CODE
}

/** Demo partner user id for DEMO123 code */
export const DEMO_PARTNER_USER_ID = 'affiliate-demo-partner'

export function createSeedReferrals(userId: string): AffiliateReferral[] {
  const now = Date.now()
  return [
    {
      id: `ref-seed-1-${userId}`,
      affiliateUserId: userId,
      referredName: 'Aarav Mehta',
      referredEmail: 'aarav.m@example.com',
      program: '2-Step · ₹10L',
      orderAmount: 9999,
      commissionAmount: calcCommission(9999),
      status: 'approved',
      createdAt: new Date(now - 5 * 86400000).toISOString(),
    },
    {
      id: `ref-seed-2-${userId}`,
      affiliateUserId: userId,
      referredName: 'Priya Sharma',
      referredEmail: 'priya.s@example.com',
      program: '1-Step · ₹5L',
      orderAmount: 6999,
      commissionAmount: calcCommission(6999),
      status: 'pending',
      createdAt: new Date(now - 2 * 86400000).toISOString(),
    },
  ]
}

export function createSeedPayout(userId: string): AffiliatePayout {
  return {
    id: `pay-seed-${userId}`,
    affiliateUserId: userId,
    amount: 500,
    status: 'completed',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  }
}
