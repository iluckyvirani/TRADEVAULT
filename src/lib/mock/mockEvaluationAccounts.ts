export type AccountPlan = 'free_trial' | 'paid'
export type AccountStatus = 'active' | 'failed' | 'passed' | 'paused'
export type EvaluationStep = '1-Step' | '2-Step'

export interface EvaluationAccount {
  id: string
  userId: string
  plan: AccountPlan
  status: AccountStatus
  stepType: EvaluationStep
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
  rolloverProfit: number
  createdAt: string
  labels: string[]
}

function randomSegment(len: number) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('')
}

export function generateAccountId(prefix = 'FTL') {
  return `${prefix}-${randomSegment(4)}-${randomSegment(4)}-${randomSegment(4)}-${randomSegment(4)}-${randomSegment(1)}`
}

export interface FreeTrialOptions {
  stepType?: EvaluationStep
  accountSize?: number
}

export function createFreeTrialAccount(
  userId: string,
  options: FreeTrialOptions = {},
): EvaluationAccount {
  const stepType = options.stepType ?? '2-Step'
  const size = options.accountSize ?? 1_000_000
  const maxLoss = Math.round(size * 0.1)
  const dailyMaxLoss = Math.round(size * (stepType === '1-Step' ? 0.03 : 0.05))
  const profitTarget = Math.round(size * 0.05)
  return {
    id: generateAccountId('FTL'),
    userId,
    plan: 'free_trial',
    status: 'active',
    stepType,
    accountSize: size,
    balance: size,
    equity: size,
    unrealizedPnL: 0,
    todayPnL: 0,
    freeMargin: size,
    marginUsed: 0,
    maxLoss,
    dailyMaxLoss,
    profitTarget,
    minTradingDays: 2,
    tradingDaysCompleted: 0,
    rolloverProfit: 0,
    createdAt: new Date().toISOString(),
    labels: ['ACTIVE', 'FREE TRIAL', stepType],
  }
}

export interface PaidAccountOptions {
  stepType: EvaluationStep
  accountSize: number
}

export function createPaidAccount(
  userId: string,
  options: PaidAccountOptions,
): EvaluationAccount {
  const { stepType, accountSize: size } = options
  const maxLoss = Math.round(size * 0.1)
  const dailyMaxLoss = Math.round(size * (stepType === '1-Step' ? 0.03 : 0.05))
  const profitTarget = Math.round(size * 0.05)
  return {
    id: generateAccountId('EVL'),
    userId,
    plan: 'paid',
    status: 'active',
    stepType,
    accountSize: size,
    balance: size,
    equity: size,
    unrealizedPnL: 0,
    todayPnL: 0,
    freeMargin: size,
    marginUsed: 0,
    maxLoss,
    dailyMaxLoss,
    profitTarget,
    minTradingDays: stepType === '1-Step' ? 2 : 4,
    tradingDaysCompleted: 0,
    rolloverProfit: 0,
    createdAt: new Date().toISOString(),
    labels: ['ACTIVE', stepType],
  }
}
