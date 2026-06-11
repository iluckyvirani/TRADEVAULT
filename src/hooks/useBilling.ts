import { useEffect, useState } from 'react'
import { fetchBillingHistory } from '@/lib/api/billing'
import type { BillingRecord } from '@/lib/mock/mockBilling'
import { useAuthStore } from '@/store/authStore'

export function useBilling() {
  const userId = useAuthStore((s) => s.user?.id)
  const [records, setRecords] = useState<BillingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setRecords([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchBillingHistory()
      .then((data) => {
        if (!cancelled) setRecords(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load billing')
          setRecords([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  return { records, loading, error }
}
