import { apiFetch } from '@/lib/api/client'
import type { BillingRecord } from '@/lib/mock/mockBilling'

export async function fetchBillingHistory() {
  const { records } = await apiFetch<{ records: BillingRecord[] }>('/billing/history')
  return records
}
