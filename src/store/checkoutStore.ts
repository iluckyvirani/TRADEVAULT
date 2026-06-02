import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  getPlanById,
  mockEvaluationPlanTiers,
  type ProgramType,
} from '@/lib/mock/mockAssessmentPlans'

interface CheckoutStore {
  selectedProgram: ProgramType
  selectedPlanId: string
  affiliateCode: string
  termsAccepted: boolean
  showObjectives: boolean
  paying: boolean
  setProgram: (p: ProgramType) => void
  setPlanId: (id: string) => void
  setAffiliateCode: (code: string) => void
  setTermsAccepted: (v: boolean) => void
  setShowObjectives: (v: boolean) => void
  setPaying: (v: boolean) => void
  getOrderSummary: () => {
    accountSize: number
    program: ProgramType
    evaluationFee: number
    originalFee: number
    savings: number
  }
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      selectedProgram: '2-Step',
      selectedPlanId: 'plan-10L',
      affiliateCode: '',
      termsAccepted: false,
      showObjectives: false,
      paying: false,

      setProgram: (p) => set({ selectedProgram: p }),
      setPlanId: (id) => set({ selectedPlanId: id }),
      setAffiliateCode: (code) => set({ affiliateCode: code }),
      setTermsAccepted: (v) => set({ termsAccepted: v }),
      setShowObjectives: (v) => set({ showObjectives: v }),
      setPaying: (v) => set({ paying: v }),

      getOrderSummary: () => {
        const plan =
          getPlanById(get().selectedPlanId) ?? mockEvaluationPlanTiers[2]
        return {
          accountSize: plan.balance,
          program: get().selectedProgram,
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
