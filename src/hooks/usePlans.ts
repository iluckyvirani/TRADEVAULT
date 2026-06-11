import { useEffect, useState } from 'react'
import { fetchPlans } from '@/lib/api/plans'
import {
  mockEvaluationPlanTiers,
  type EvaluationPlanTier,
} from '@/lib/mock/mockAssessmentPlans'

export function usePlans() {
  const [tiers, setTiers] = useState<EvaluationPlanTier[]>(mockEvaluationPlanTiers)
  const [loading, setLoading] = useState(true)
  const [fromApi, setFromApi] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetchPlans()
      .then((data) => {
        if (cancelled) return
        if (data.tiers.length > 0) setTiers(data.tiers)
        setFromApi(true)
      })
      .catch(() => {
        // keep mock fallback
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { tiers, loading, fromApi }
}
