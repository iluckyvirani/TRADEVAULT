import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  getPlanById,
  mockEvaluationPlanTiers,
} from '@/lib/mock/mockAssessmentPlans'

interface CheckoutStore {
  selectedPlanId: string
  affiliateCode: string
  termsAccepted: boolean
  paying: boolean
  setPlanId: (id: string) => void
  setAffiliateCode: (code: string) => void
  setTermsAccepted: (v: boolean) => void
  setPaying: (v: boolean) => void
  getOrderSummary: () => {
    accountSize: number
    evaluationFee: number
    originalFee: number
    savings: number
  }
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      selectedPlanId: 'plan-10L',
      affiliateCode: '',
      termsAccepted: false,
      paying: false,

      setPlanId: (id) => set({ selectedPlanId: id }),
      setAffiliateCode: (code) => set({ affiliateCode: code }),
      setTermsAccepted: (v) => set({ termsAccepted: v }),
      setPaying: (v) => set({ paying: v }),

      getOrderSummary: () => {
        const plan =
          getPlanById(get().selectedPlanId) ?? mockEvaluationPlanTiers[2]
        return {
          accountSize: plan.balance,
          evaluationFee: plan.evaluationFee,
          originalFee: plan.originalFee,
          savings: plan.savings,
        }
      },
    }),
    {
      name: 'tv-checkout',
      partialize: (s) => ({ affiliateCode: s.affiliateCode }),
    },
  ),
)
