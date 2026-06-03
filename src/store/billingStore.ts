import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BillingRecord, BillingStatus } from '@/lib/mock/mockBilling'

export interface AddBillingPaymentInput {
  userId: string
  program: string
  accountSize: number
  amount: number
  currency?: string
  status?: BillingStatus
  paymentMethod?: string
}

interface BillingStore {
  records: BillingRecord[]
  addPayment: (input: AddBillingPaymentInput) => BillingRecord
  getRecordsForUser: (userId: string) => BillingRecord[]
}

export const useBillingStore = create<BillingStore>()(
  persist(
    (set, get) => ({
      records: [],

      addPayment: (input) => {
        const record: BillingRecord = {
          id: `bill-${Date.now()}`,
          userId: input.userId,
          date: new Date().toISOString(),
          program: input.program,
          accountSize: input.accountSize,
          amount: input.amount,
          currency: input.currency ?? 'INR',
          status: input.status ?? 'paid',
          paymentMethod: input.paymentMethod ?? 'UPI · Mock',
        }
        set({ records: [record, ...get().records] })
        return record
      },

      getRecordsForUser: (userId) =>
        get()
          .records.filter((r) => r.userId === userId)
          .sort((a, b) => b.date.localeCompare(a.date)),
    }),
    { name: 'tv-billing' },
  ),
)
