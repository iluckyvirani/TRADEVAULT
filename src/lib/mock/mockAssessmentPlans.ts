import type { ProgramObjectives } from '@/lib/plans/objectives'
import { DEFAULT_EVALUATION_OBJECTIVES } from '@/lib/plans/objectives'

export interface EvaluationPlanTier {
  id: string
  balance: number
  evaluationFee: number
  originalFee: number
  savings: number
  popular?: boolean
  objectives: ProgramObjectives
}

function tier(
  id: string,
  balance: number,
  evaluationFee: number,
  originalFee: number,
  savings: number,
  popular = false,
): EvaluationPlanTier {
  return {
    id,
    balance,
    evaluationFee,
    originalFee,
    savings,
    popular,
    objectives: { ...DEFAULT_EVALUATION_OBJECTIVES },
  }
}

export const mockEvaluationPlanTiers: EvaluationPlanTier[] = [
  tier('plan-2L', 200_000, 2_999, 4_999, 2_000),
  tier('plan-5L', 500_000, 6_999, 9_999, 3_000),
  tier('plan-10L', 1_000_000, 9_999, 14_999, 5_000, true),
  tier('plan-25L', 2_500_000, 19_999, 29_999, 10_000),
]

export function getPlanById(id: string): EvaluationPlanTier | undefined {
  return mockEvaluationPlanTiers.find((p) => p.id === id)
}
