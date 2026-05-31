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

export function createFreeTrialAccount(userId: string): EvaluationAccount {
  const size = 1_000_000
  return {
    id: generateAccountId('FTL'),
    userId,
    plan: 'free_trial',
    status: 'active',
    stepType: '2-Step',
    accountSize: size,
    balance: size,
    equity: size,
    unrealizedPnL: 0,
    todayPnL: 0,
    freeMargin: size,
    marginUsed: 0,
    maxLoss: 100_000,
    dailyMaxLoss: 50_000,
    profitTarget: 50_000,
    minTradingDays: 2,
    tradingDaysCompleted: 0,
    rolloverProfit: 0,
    createdAt: new Date().toISOString(),
    labels: ['ACTIVE', 'FREE TRIAL', '2-Step'],
  }
}
