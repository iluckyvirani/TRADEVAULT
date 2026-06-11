import { apiFetch } from '@/lib/api/client'
import type { FaqCategory } from '@/lib/mock/mockFaq'

export interface FaqResponse {
  categories: FaqCategory[]
}

export async function fetchFaq() {
  return apiFetch<FaqResponse>('/faq')
}
