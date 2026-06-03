import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  AFFILIATE_COMMISSION_RATE,
  DEMO_PARTNER_CODE,
  DEMO_PARTNER_USER_ID,
  MIN_PAYOUT_AMOUNT as MIN_PAYOUT,
  buildAffiliateCode,
  calcCommission,
  createSeedPayout,
  createSeedReferrals,
  isDemoPartnerCode,
  normalizeAffiliateCode,
  type AffiliatePayout,
  type AffiliateReferral,
} from '@/lib/mock/mockAffiliate'

interface AffiliateProfile {
  code: string
  createdAt: string
  seeded?: boolean
}

interface AffiliateStore {
  profiles: Record<string, AffiliateProfile>
  referrals: AffiliateReferral[]
  payouts: AffiliatePayout[]

  getOrCreateCode: (userId: string, name: string) => string
  getReferrals: (userId: string) => AffiliateReferral[]
  getPayouts: (userId: string) => AffiliatePayout[]
  getStats: (userId: string) => {
    totalReferrals: number
    pendingCommission: number
    paidCommission: number
    approvedCommission: number
  }
  validateCode: (code: string, buyerUserId: string) => { valid: boolean; message: string }
  recordReferralFromCheckout: (input: {
    affiliateCode: string
    buyerUserId: string
    buyerName: string
    buyerEmail: string
    orderAmount: number
    program: string
  }) => boolean
  requestPayout: (userId: string) => { ok: boolean; message: string }
}

function findOwnerIdByCode(
  profiles: Record<string, AffiliateProfile>,
  code: string,
): string | null {
  const normalized = normalizeAffiliateCode(code)
  if (isDemoPartnerCode(normalized)) return DEMO_PARTNER_USER_ID

  const entry = Object.entries(profiles).find(
    ([, p]) => normalizeAffiliateCode(p.code) === normalized,
  )
  return entry?.[0] ?? null
}

function ensureDemoPartner(profiles: Record<string, AffiliateProfile>) {
  if (!profiles[DEMO_PARTNER_USER_ID]) {
    profiles[DEMO_PARTNER_USER_ID] = {
      code: DEMO_PARTNER_CODE,
      createdAt: new Date().toISOString(),
      seeded: true,
    }
  }
}

export const useAffiliateStore = create<AffiliateStore>()(
  persist(
    (set, get) => ({
      profiles: {},
      referrals: [],
      payouts: [],

      getOrCreateCode: (userId, name) => {
        const state = get()
        ensureDemoPartner(state.profiles)

        let profile = state.profiles[userId]
        if (!profile) {
          const code = buildAffiliateCode(userId, name)
          profile = { code, createdAt: new Date().toISOString() }
          const referrals = createSeedReferrals(userId)
          const payouts = [createSeedPayout(userId)]

          set({
            profiles: { ...state.profiles, [userId]: { ...profile, seeded: true } },
            referrals: [...state.referrals, ...referrals],
            payouts: [...state.payouts, ...payouts],
          })
          return code
        }

        if (!profile.seeded && userId !== DEMO_PARTNER_USER_ID) {
          const referrals = createSeedReferrals(userId)
          const payouts = [createSeedPayout(userId)]
          set({
            profiles: {
              ...get().profiles,
              [userId]: { ...profile, seeded: true },
            },
            referrals: [...get().referrals, ...referrals],
            payouts: [...get().payouts, ...payouts],
          })
        }

        return profile.code
      },

      getReferrals: (userId) =>
        get()
          .referrals.filter((r) => r.affiliateUserId === userId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

      getPayouts: (userId) =>
        get()
          .payouts.filter((p) => p.affiliateUserId === userId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

      getStats: (userId) => {
        const refs = get().referrals.filter((r) => r.affiliateUserId === userId)
        const pendingCommission = refs
          .filter((r) => r.status === 'pending')
          .reduce((s, r) => s + r.commissionAmount, 0)
        const approvedCommission = refs
          .filter((r) => r.status === 'approved')
          .reduce((s, r) => s + r.commissionAmount, 0)
        const paidCommission = get()
          .payouts.filter((p) => p.affiliateUserId === userId && p.status === 'completed')
          .reduce((s, p) => s + p.amount, 0)

        return {
          totalReferrals: refs.length,
          pendingCommission,
          paidCommission,
          approvedCommission,
        }
      },

      validateCode: (code, buyerUserId) => {
        const normalized = normalizeAffiliateCode(code)
        if (!normalized) {
          return { valid: false, message: 'Enter an affiliate code' }
        }

        const profiles = { ...get().profiles }
        ensureDemoPartner(profiles)

        const ownerId = findOwnerIdByCode(profiles, normalized)
        if (!ownerId) {
          return { valid: false, message: 'Invalid affiliate code' }
        }
        if (ownerId === buyerUserId) {
          return { valid: false, message: 'You cannot use your own code' }
        }
        return { valid: true, message: 'Code applied — affiliate credited on payment' }
      },

      recordReferralFromCheckout: (input) => {
        const normalized = normalizeAffiliateCode(input.affiliateCode)
        if (!normalized) return false

        const validation = get().validateCode(normalized, input.buyerUserId)
        if (!validation.valid) return false

        const profiles = { ...get().profiles }
        ensureDemoPartner(profiles)
        const ownerId = findOwnerIdByCode(profiles, normalized)
        if (!ownerId) return false

        const duplicate = get().referrals.some(
          (r) =>
            r.affiliateUserId === ownerId &&
            r.referredEmail === input.buyerEmail &&
            Math.abs(new Date(r.createdAt).getTime() - Date.now()) < 60000,
        )
        if (duplicate) return true

        const referral: AffiliateReferral = {
          id: `ref-${Date.now()}`,
          affiliateUserId: ownerId,
          referredName: input.buyerName,
          referredEmail: input.buyerEmail,
          program: input.program,
          orderAmount: input.orderAmount,
          commissionAmount: calcCommission(input.orderAmount),
          status: 'pending',
          createdAt: new Date().toISOString(),
        }

        set({ referrals: [referral, ...get().referrals] })
        return true
      },

      requestPayout: (userId) => {
        const stats = get().getStats(userId)
        const available = stats.approvedCommission
        if (available < MIN_PAYOUT) {
          return {
            ok: false,
            message: `Minimum payout is ₹${MIN_PAYOUT}. Approved balance: ₹${available}`,
          }
        }

        const payout: AffiliatePayout = {
          id: `pay-${Date.now()}`,
          affiliateUserId: userId,
          amount: available,
          status: 'completed',
          createdAt: new Date().toISOString(),
        }

        const referrals = get().referrals.map((r) =>
          r.affiliateUserId === userId && r.status === 'approved'
            ? { ...r, status: 'paid' as const }
            : r,
        )

        set({
          payouts: [payout, ...get().payouts],
          referrals,
        })

        return { ok: true, message: `Payout of ₹${available} processed (mock)` }
      },
    }),
    { name: 'tv-affiliate' },
  ),
)

export { AFFILIATE_COMMISSION_RATE }
