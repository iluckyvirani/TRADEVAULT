import { useEffect, useState } from 'react'
import { fetchFaq } from '@/lib/api/faq'
import { FAQ_CATEGORIES, type FaqCategory } from '@/lib/mock/mockFaq'

export function useFaq() {
  const [categories, setCategories] = useState<FaqCategory[]>(FAQ_CATEGORIES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetchFaq()
      .then((data) => {
        if (cancelled) return
        if (data.categories.length > 0) setCategories(data.categories)
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

  return { categories, loading }
}
