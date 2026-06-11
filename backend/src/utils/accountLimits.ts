import type { ProgramObjectives } from './objectives.js'
import { DEFAULT_OBJECTIVES, parseDays, parsePercentOf } from './objectives.js'

export function limitsFromObjectives(size: number, objectives: ProgramObjectives) {
  return {
    maxLoss: parsePercentOf(objectives.maximumLossLimit, size),
    dailyMaxLoss: parsePercentOf(objectives.maximumDailyLossLimit, size),
    profitTarget: parsePercentOf(objectives.profitTarget, size),
    minTradingDays: parseDays(objectives.requiredTradingDays),
    minProfitableTradingDays: parseDays(objectives.minimumProfitableTradingDays),
    reward: objectives.reward,
  }
}

export function objectivesFromPlanTier(tier: {
  profitTarget: string
  maximumLossLimit: string
  maximumDailyLossLimit: string
  requiredTradingDays: string
  minimumProfitableTradingDays: string
  reward: string
}): ProgramObjectives {
  return {
    profitTarget: tier.profitTarget,
    maximumLossLimit: tier.maximumLossLimit,
    maximumDailyLossLimit: tier.maximumDailyLossLimit,
    requiredTradingDays: tier.requiredTradingDays,
    minimumProfitableTradingDays: tier.minimumProfitableTradingDays,
    reward: tier.reward,
  }
}

export function defaultObjectives(): ProgramObjectives {
  return { ...DEFAULT_OBJECTIVES }
}
