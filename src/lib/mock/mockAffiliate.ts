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

export const REFERRAL_REWARD_AMOUNT = 500
export const AFFILIATE_COMMISSION_RATE = 0.1
export const DEMO_PARTNER_CODE = 'DEMO123'
export const DEMO_PARTNER_USER_ID = 'affiliate-demo-partner'
export const MIN_PAYOUT_AMOUNT = 500

export function normalizeAffiliateCode(code: string): string {
  return code.trim().toUpperCase()
}

export function isDemoPartnerCode(code: string): boolean {
  return normalizeAffiliateCode(code) === DEMO_PARTNER_CODE
}

export function buildAffiliateCode(userId: string, name: string): string {
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
  const suffix = userId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()
  return `${slug || 'TRADER'}${suffix}`.slice(0, 12)
}

export function calcCommission(_orderAmount: number): number {
  return REFERRAL_REWARD_AMOUNT
}

export function createSeedReferrals(affiliateUserId: string): AffiliateReferral[] {
  const now = Date.now()
  return [
    {
      id: `ref-seed-${affiliateUserId}-1`,
      affiliateUserId,
      referredName: 'Priya Sharma',
      referredEmail: 'priya@example.com',
      program: '2-Step',
      orderAmount: 9999,
      commissionAmount: REFERRAL_REWARD_AMOUNT,
      status: 'approved',
      createdAt: new Date(now - 5 * 86400000).toISOString(),
    },
    {
      id: `ref-seed-${affiliateUserId}-2`,
      affiliateUserId,
      referredName: 'Rahul Mehta',
      referredEmail: 'rahul@example.com',
      program: '1-Step',
      orderAmount: 6999,
      commissionAmount: REFERRAL_REWARD_AMOUNT,
      status: 'pending',
      createdAt: new Date(now - 2 * 86400000).toISOString(),
    },
  ]
}

export function createSeedPayout(affiliateUserId: string): AffiliatePayout {
  return {
    id: `pay-seed-${affiliateUserId}`,
    affiliateUserId,
    amount: REFERRAL_REWARD_AMOUNT,
    status: 'completed',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  }
}
