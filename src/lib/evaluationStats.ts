import type { EvaluationAccount } from '@/lib/mock/mockEvaluationAccounts'
import {
  calcAvgLoss,
  calcAvgWin,
  calcProfitFactor,
  calcSharpeRatio,
  calcWinRate,
  dailyReturns,
} from '@/lib/calculations'
import { buildMockEquityCurve } from '@/lib/mock/mockEquityCurve'

export interface TradingObjectiveRow {
  id: string
  label: string
  result: string
  passed: boolean
}

export interface PerformanceStat {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
}

export function buildObjectives(account: EvaluationAccount): TradingObjectiveRow[] {
  const dailyUsed = Math.max(0, Math.min(account.dailyMaxLoss, account.accountSize - account.equity))
  const maxUsed = Math.max(0, Math.min(account.maxLoss, account.accountSize - account.equity))
  const profit = Math.max(0, account.equity - account.accountSize)
  const profitPct = account.profitTarget > 0 ? (profit / account.profitTarget) * 100 : 0
  const dailyPct = account.dailyMaxLoss > 0 ? (dailyUsed / account.dailyMaxLoss) * 100 : 0
  const maxPct = account.maxLoss > 0 ? (maxUsed / account.maxLoss) * 100 : 0

  return [
    {
      id: 'days',
      label: `Minimum ${account.minTradingDays} Trading Days`,
      result: String(account.tradingDaysCompleted),
      passed: account.tradingDaysCompleted >= account.minTradingDays,
    },
    {
      id: 'daily',
      label: `Max Daily Loss -₹${account.dailyMaxLoss.toLocaleString('en-IN')}`,
      result: `₹${dailyUsed.toLocaleString('en-IN')} (${dailyPct.toFixed(0)}%)`,
      passed: dailyUsed < account.dailyMaxLoss,
    },
    {
      id: 'max',
      label: `Max Loss -₹${account.maxLoss.toLocaleString('en-IN')}`,
      result: `₹${maxUsed.toLocaleString('en-IN')} (${maxPct.toFixed(0)}%)`,
      passed: maxUsed < account.maxLoss,
    },
    {
      id: 'profit',
      label: `Profit Target ₹${account.profitTarget.toLocaleString('en-IN')}`,
      result: `₹${profit.toLocaleString('en-IN')} (${profitPct.toFixed(0)}%)`,
      passed: profit >= account.profitTarget,
    },
  ]
}

export function buildPerformanceStats(
  account: EvaluationAccount,
  closedPnls: number[] = [],
): PerformanceStat[] {
  const winRate = calcWinRate(closedPnls)
  const avgWin = calcAvgWin(closedPnls)
  const avgLoss = calcAvgLoss(closedPnls)
  const pf = calcProfitFactor(closedPnls)
  const curve = buildMockEquityCurve(account.id, account.accountSize)
  const returns = dailyReturns(curve.map((p) => p.equity))
  const sharpe = calcSharpeRatio(returns)
  const rrr = avgLoss > 0 ? avgWin / avgLoss : 0
  const expectancy =
    closedPnls.length > 0
      ? closedPnls.reduce((s, p) => s + p, 0) / closedPnls.length
      : 0

  return [
    { label: 'Win rate', value: `${winRate.toFixed(2)} %`, positive: true },
    { label: 'Average profit', value: `₹${avgWin.toFixed(2)}`, positive: true },
    { label: 'Average loss', value: `₹${avgLoss.toFixed(2)}`, negative: true },
    { label: 'Number of trades', value: String(closedPnls.length) },
    { label: 'Avg trade duration', value: '0h 0m 0s' },
    { label: 'Annualized Sharpe Ratio', value: sharpe.toFixed(2) },
    { label: 'Average RRR', value: rrr.toFixed(2) },
    { label: 'Profit factor', value: pf.toFixed(2) },
    {
      label: 'Expectancy',
      value: `₹${expectancy.toFixed(2)}`,
      positive: expectancy >= 0,
      negative: expectancy < 0,
    },
  ]
}

export function formatIstDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}
