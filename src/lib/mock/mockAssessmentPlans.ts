import type { EvaluationStep } from './mockEvaluationAccounts'

export type ProgramType = EvaluationStep

export interface TradingProgram {
  id: ProgramType
  title: string
  subtitle: string
  stages: string[]
  rules: { label: string; value: string }[]
}

export interface EvaluationPlanTier {
  id: string
  balance: number
  evaluationFee: number
  originalFee: number
  savings: number
  popular?: boolean
}

export const mockTradingPrograms: TradingProgram[] = [
  {
    id: '2-Step',
    title: '2-Step',
    subtitle: 'Standard evaluation',
    stages: ['Qualifier', 'Validator', 'Rewards'],
    rules: [
      { label: 'Profit target', value: '10% / 5%' },
      { label: 'Max loss', value: '10%' },
      { label: 'Max daily loss', value: '5%' },
      { label: 'Min trading days', value: '4 days' },
      { label: 'Trading period', value: 'Unlimited' },
      { label: 'Profit split', value: 'Up to 90%' },
    ],
  },
  {
    id: '1-Step',
    title: '1-Step',
    subtitle: 'Single-stage evaluation',
    stages: ['Qualifier', 'Rewards'],
    rules: [
      { label: 'Profit target', value: '10%' },
      { label: 'Max loss (EOD trailing)', value: '10%' },
      { label: 'Max daily loss', value: '3%' },
      { label: 'Best day rule', value: '≤ 50%' },
      { label: 'Trading period', value: 'Unlimited' },
      { label: 'Profit split', value: '90%' },
    ],
  },
]

export const mockEvaluationPlanTiers: EvaluationPlanTier[] = [
  { id: 'plan-2L', balance: 200_000, evaluationFee: 2_999, originalFee: 4_999, savings: 2_000 },
  { id: 'plan-5L', balance: 500_000, evaluationFee: 6_999, originalFee: 9_999, savings: 3_000 },
  {
    id: 'plan-10L',
    balance: 1_000_000,
    evaluationFee: 9_999,
    originalFee: 14_999,
    savings: 5_000,
    popular: true,
  },
  { id: 'plan-25L', balance: 2_500_000, evaluationFee: 19_999, originalFee: 29_999, savings: 10_000 },
]

export function getPlanById(id: string): EvaluationPlanTier | undefined {
  return mockEvaluationPlanTiers.find((p) => p.id === id)
}
