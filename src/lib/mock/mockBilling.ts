export type BillingStatus = 'paid' | 'pending' | 'failed' | 'refunded'

export interface BillingRecord {
  id: string
  userId: string
  date: string
  program: string
  accountSize: number
  amount: number
  currency: string
  status: BillingStatus
  paymentMethod?: string
}
