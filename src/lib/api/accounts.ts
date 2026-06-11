import { apiFetch } from '@/lib/api/client'
import type { EvaluationAccount } from '@/lib/mock/mockEvaluationAccounts'
import type { EquityPoint } from '@/lib/mock/mockEquityCurve'

export async function fetchAccounts() {
  return apiFetch<{ accounts: EvaluationAccount[] }>('/accounts')
}

export async function fetchAccount(accountId: string) {
  return apiFetch<{ account: EvaluationAccount }>(`/accounts/${accountId}`)
}

export async function createFreeTrial(accountSize: number) {
  return apiFetch<{ account: EvaluationAccount }>('/accounts/free-trial', {
    method: 'POST',
    body: JSON.stringify({ accountSize }),
  })
}

export async function createPaidAccount(input: { planId?: string; accountSize?: number }) {
  return apiFetch<{ account: EvaluationAccount }>('/accounts/paid', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function setActiveAccount(accountId: string) {
  return apiFetch<{ ok: boolean; activeAccountId: string }>('/accounts/active', {
    method: 'PATCH',
    body: JSON.stringify({ accountId }),
  })
}

export interface AccountStatsResponse {
  account: EvaluationAccount
  summary: {
    profit: number
    profitTargetProgress: number
    dailyLossUsed: number
    dailyLossProgress: number
    maxLossUsed: number
    maxLossProgress: number
    tradingDaysCompleted: number
    profitableTradingDaysCompleted: number
  }
}

export async function fetchAccountStats(accountId: string) {
  return apiFetch<AccountStatsResponse>(`/accounts/${accountId}/stats`)
}

export async function fetchEquityCurve(accountId: string) {
  return apiFetch<{ accountId: string; points: EquityPoint[] }>(
    `/accounts/${accountId}/equity-curve`,
  )
}
