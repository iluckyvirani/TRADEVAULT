import { apiFetch } from '@/lib/api/client'
import type { EvaluationAccount } from '@/lib/mock/mockEvaluationAccounts'

export interface CheckoutOrderResponse {
  mock: boolean
  billingRecordId: string
  amount: number
  currency: string
  planId: string
  program: string
  accountSize: number
  keyId: string | null
  razorpayOrderId: string | null
}

export interface CheckoutFulfillResponse {
  account: EvaluationAccount
  billingRecordId: string
  alreadyFulfilled?: boolean
}

export async function createCheckoutOrder(input: {
  planId: string
  affiliateCode?: string
}) {
  return apiFetch<CheckoutOrderResponse>('/checkout/create', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function verifyCheckoutPayment(input: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}) {
  return apiFetch<CheckoutFulfillResponse>('/checkout/verify', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function mockCompleteCheckout(billingRecordId: string) {
  return apiFetch<CheckoutFulfillResponse>('/checkout/mock-pay', {
    method: 'POST',
    body: JSON.stringify({ billingRecordId }),
  })
}

export async function validateCheckoutAffiliate(code: string) {
  return apiFetch<{ valid: boolean; message: string }>('/checkout/validate-affiliate', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}
