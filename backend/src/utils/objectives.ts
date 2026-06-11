export interface ProgramObjectives {
  profitTarget: string
  maximumLossLimit: string
  maximumDailyLossLimit: string
  requiredTradingDays: string
  minimumProfitableTradingDays: string
  reward: string
}

export const DEFAULT_OBJECTIVES: ProgramObjectives = {
  profitTarget: '10%',
  maximumLossLimit: '10%',
  maximumDailyLossLimit: '5%',
  requiredTradingDays: '4 days',
  minimumProfitableTradingDays: '2 days',
  reward: 'Up to 90% profit split',
}

export function parseDays(value: string): number {
  const n = parseInt(value, 10)
  return Number.isFinite(n) ? n : 4
}

export function parsePercentOf(value: string, accountSize: number): number {
  const match = /(\d+(?:\.\d+)?)\s*%/.exec(value)
  if (!match) return Math.round(accountSize * 0.1)
  return Math.round(accountSize * (parseFloat(match[1]) / 100))
}
