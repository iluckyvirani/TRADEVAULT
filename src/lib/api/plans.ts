import { apiFetch } from '@/lib/api/client'
import type { EvaluationPlanTier } from '@/lib/mock/mockAssessmentPlans'

export interface PlansResponse {
  tiers: EvaluationPlanTier[]
}

export async function fetchPlans() {
  return apiFetch<PlansResponse>('/plans')
}
