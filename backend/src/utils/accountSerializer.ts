import type { EvaluationAccount, EvaluationStepType } from '@prisma/client'

export type EvaluationAccountDto = {
  id: string
  userId: string
  plan: 'free_trial' | 'paid'
  status: 'active' | 'failed' | 'passed' | 'paused'
  stepType: '1-Step' | '2-Step'
  accountSize: number
  balance: number
  equity: number
  unrealizedPnL: number
  todayPnL: number
  freeMargin: number
  marginUsed: number
  maxLoss: number
  dailyMaxLoss: number
  profitTarget: number
  minTradingDays: number
  tradingDaysCompleted: number
  minProfitableTradingDays: number
  profitableTradingDaysCompleted: number
  reward?: string
  rolloverProfit: number
  createdAt: string
  labels: string[]
}

function stepToApi(step: EvaluationStepType): '1-Step' | '2-Step' {
  return step === 'STEP_1' ? '1-Step' : '2-Step'
}

function num(v: { toString(): string } | number | null | undefined): number {
  if (v == null) return 0
  return typeof v === 'number' ? v : Number(v)
}

export function serializeAccount(account: EvaluationAccount): EvaluationAccountDto {
  const labels =
    account.labels.length > 0
      ? account.labels
      : account.plan === 'free_trial'
        ? ['ACTIVE', 'FREE TRIAL']
        : ['ACTIVE']

  return {
    id: account.id,
    userId: account.userId,
    plan: account.plan,
    status: account.status,
    stepType: stepToApi(account.stepType),
    accountSize: num(account.accountSize),
    balance: num(account.balance),
    equity: num(account.equity),
    unrealizedPnL: num(account.unrealizedPnL),
    todayPnL: num(account.todayPnL),
    freeMargin: num(account.freeMargin),
    marginUsed: num(account.marginUsed),
    maxLoss: num(account.maxLoss),
    dailyMaxLoss: num(account.dailyMaxLoss),
    profitTarget: num(account.profitTarget),
    minTradingDays: account.minTradingDays,
    tradingDaysCompleted: account.tradingDaysCompleted,
    minProfitableTradingDays: account.minProfitableTradingDays,
    profitableTradingDaysCompleted: account.profitableTradingDaysCompleted,
    reward: account.reward ?? undefined,
    rolloverProfit: num(account.rolloverProfit),
    createdAt: account.createdAt.toISOString(),
    labels,
  }
}
