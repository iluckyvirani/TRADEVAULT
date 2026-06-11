/** Canonical plan seed data — mirrors src/lib/mock/mockAssessmentPlans.ts */

export const DEFAULT_OBJECTIVES = {
  profitTarget: '10%',
  maximumLossLimit: '10%',
  maximumDailyLossLimit: '5%',
  requiredTradingDays: '4 days',
  minimumProfitableTradingDays: '2 days',
  reward: 'Up to 90% profit split',
} as const

export const SEED_PLAN_TIERS = [
  { id: 'plan-2L', balance: 200_000, evaluationFee: 2_999, originalFee: 4_999, savings: 2_000, popular: false },
  { id: 'plan-5L', balance: 500_000, evaluationFee: 6_999, originalFee: 9_999, savings: 3_000, popular: false },
  { id: 'plan-10L', balance: 1_000_000, evaluationFee: 9_999, originalFee: 14_999, savings: 5_000, popular: true },
  { id: 'plan-25L', balance: 2_500_000, evaluationFee: 19_999, originalFee: 29_999, savings: 10_000, popular: false },
] as const
