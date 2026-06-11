import type { ProgramObjectives } from '@/lib/plans/objectives'
import {
  DEFAULT_EVALUATION_OBJECTIVES,
  parseDays,
  parsePercentOf,
} from '@/lib/plans/objectives'
import { getPlanById } from './mockAssessmentPlans'

export type AccountPlan = 'free_trial' | 'paid'
export type AccountStatus = 'active' | 'failed' | 'passed' | 'paused'

/** @deprecated Internal DB compat — not shown in UI */
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
  minProfitableTradingDays: number
  profitableTradingDaysCompleted: number
  reward?: string
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

function limitsFromObjectives(size: number, objectives: ProgramObjectives) {
  return {
    maxLoss: parsePercentOf(objectives.maximumLossLimit, size),
    dailyMaxLoss: parsePercentOf(objectives.maximumDailyLossLimit, size),
    profitTarget: parsePercentOf(objectives.profitTarget, size),
    minTradingDays: parseDays(objectives.requiredTradingDays),
    minProfitableTradingDays: parseDays(objectives.minimumProfitableTradingDays),
    reward: objectives.reward,
  }
}

export interface FreeTrialOptions {
  accountSize?: number
  objectives?: ProgramObjectives
}

export function createFreeTrialAccount(
  userId: string,
  options: FreeTrialOptions = {},
): EvaluationAccount {
  const size = options.accountSize ?? 1_000_000
  const objectives = options.objectives ?? DEFAULT_EVALUATION_OBJECTIVES
  const limits = limitsFromObjectives(size, objectives)

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
    ...limits,
    tradingDaysCompleted: 0,
    profitableTradingDaysCompleted: 0,
    rolloverProfit: 0,
    createdAt: new Date().toISOString(),
    labels: ['ACTIVE', 'FREE TRIAL'],
  }
}

export interface PaidAccountOptions {
  accountSize: number
  planId?: string
  objectives?: ProgramObjectives
}

export function createPaidAccount(
  userId: string,
  options: PaidAccountOptions,
): EvaluationAccount {
  const { accountSize: size, planId } = options
  const plan = planId ? getPlanById(planId) : undefined
  const objectives =
    options.objectives ?? plan?.objectives ?? DEFAULT_EVALUATION_OBJECTIVES
  const limits = limitsFromObjectives(size, objectives)

  return {
    id: generateAccountId('EVL'),
    userId,
    plan: 'paid',
    status: 'active',
    stepType: '2-Step',
    accountSize: size,
    balance: size,
    equity: size,
    unrealizedPnL: 0,
    todayPnL: 0,
    freeMargin: size,
    marginUsed: 0,
    ...limits,
    tradingDaysCompleted: 0,
    profitableTradingDaysCompleted: 0,
    rolloverProfit: 0,
    createdAt: new Date().toISOString(),
    labels: ['ACTIVE'],
  }
}
