/** Canonical evaluation objective labels (plan + account stats). */
export const OBJECTIVE_LABELS = {
  profitTarget: 'Profit Target',
  maximumLossLimit: 'Maximum Loss Limit',
  maximumDailyLossLimit: 'Maximum Daily Loss Limit',
  requiredTradingDays: 'Required Trading Days',
  minimumProfitableTradingDays: 'Minimum Profitable Trading Days',
  reward: 'Reward',
} as const

export interface ProgramObjectives {
  profitTarget: string
  maximumLossLimit: string
  maximumDailyLossLimit: string
  requiredTradingDays: string
  minimumProfitableTradingDays: string
  reward: string
}

/** Default objectives applied to every evaluation plan tier. */
export const DEFAULT_EVALUATION_OBJECTIVES: ProgramObjectives = {
  profitTarget: '10%',
  maximumLossLimit: '10%',
  maximumDailyLossLimit: '5%',
  requiredTradingDays: '4 days',
  minimumProfitableTradingDays: '2 days',
  reward: 'Up to 90% profit split',
}

export function objectivesToRows(objectives: ProgramObjectives) {
  return (Object.keys(OBJECTIVE_LABELS) as (keyof ProgramObjectives)[]).map((key) => ({
    label: OBJECTIVE_LABELS[key],
    value: objectives[key],
  }))
}

/** Parse "4 days" → 4, "10%" → 0.1 for account rule math. */
export function parseDays(value: string): number {
  const n = parseInt(value, 10)
  return Number.isFinite(n) ? n : 4
}

export function parsePercentOf(value: string, accountSize: number): number {
  const match = /(\d+(?:\.\d+)?)\s*%/.exec(value)
  if (!match) return Math.round(accountSize * 0.1)
  return Math.round(accountSize * (parseFloat(match[1]) / 100))
}
