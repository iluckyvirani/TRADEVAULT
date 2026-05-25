/**
 * Pure portfolio calculation utilities.
 * All functions are side-effect-free and deterministic.
 */

/** Convert a series of portfolio values into per-period return ratios */
export function dailyReturns(values: number[]): number[] {
  return values.slice(1).map((v, i) => (v - values[i]) / values[i])
}

/** Annualised Sharpe Ratio (√252 scaling, 252 trading-day year) */
export function calcSharpeRatio(dailyReturnArr: number[], riskFreeRate = 0.05): number {
  if (dailyReturnArr.length < 2) return 0
  const n = dailyReturnArr.length
  const mean = dailyReturnArr.reduce((s, r) => s + r, 0) / n
  const variance = dailyReturnArr.reduce((s, r) => s + (r - mean) ** 2, 0) / (n - 1)
  const stdDev = Math.sqrt(variance)
  if (stdDev === 0) return 0
  const dailyRfr = riskFreeRate / 252
  return parseFloat(((mean - dailyRfr) / stdDev * Math.sqrt(252)).toFixed(2))
}

/** Maximum drawdown as a percentage (0–100) from a series of portfolio values */
export function calcMaxDrawdown(values: number[]): number {
  if (values.length < 2) return 0
  let peak = values[0]
  let maxDrawdown = 0
  for (const v of values) {
    if (v > peak) peak = v
    const drawdown = peak > 0 ? (peak - v) / peak : 0
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  }
  return parseFloat((maxDrawdown * 100).toFixed(2))
}

/** Win rate as a percentage from an array of realised P&L values */
export function calcWinRate(pnls: number[]): number {
  if (pnls.length === 0) return 0
  const wins = pnls.filter((p) => p > 0).length
  return parseFloat(((wins / pnls.length) * 100).toFixed(1))
}

/** Average gain from winning trades */
export function calcAvgWin(pnls: number[]): number {
  const wins = pnls.filter((p) => p > 0)
  if (wins.length === 0) return 0
  return parseFloat((wins.reduce((s, p) => s + p, 0) / wins.length).toFixed(2))
}

/** Average loss from losing trades (returned as a positive number) */
export function calcAvgLoss(pnls: number[]): number {
  const losses = pnls.filter((p) => p < 0)
  if (losses.length === 0) return 0
  return parseFloat((Math.abs(losses.reduce((s, p) => s + p, 0)) / losses.length).toFixed(2))
}

/** Profit factor: total wins / total losses (absolute) */
export function calcProfitFactor(pnls: number[]): number {
  const totalWin = pnls.filter((p) => p > 0).reduce((s, p) => s + p, 0)
  const totalLoss = Math.abs(pnls.filter((p) => p < 0).reduce((s, p) => s + p, 0))
  if (totalLoss === 0) return totalWin > 0 ? 999 : 0
  return parseFloat((totalWin / totalLoss).toFixed(2))
}

/** Weighted average cost basis after a new fill is added to an existing position */
export function calcNewAvgCost(
  existingQty: number,
  existingAvgCost: number,
  fillQty: number,
  fillPrice: number,
): number {
  const totalQty = existingQty + fillQty
  if (totalQty === 0) return 0
  return parseFloat(
    ((existingQty * existingAvgCost + fillQty * fillPrice) / totalQty).toFixed(4),
  )
}

/** Unrealised P&L for an open position */
export function calcUnrealizedPnL(
  currentPrice: number,
  avgCost: number,
  quantity: number,
): number {
  return parseFloat(((currentPrice - avgCost) * quantity).toFixed(2))
}

/** Realised P&L for a completed sell trade */
export function calcRealizedPnL(
  sellPrice: number,
  avgCost: number,
  quantity: number,
): number {
  return parseFloat(((sellPrice - avgCost) * quantity).toFixed(2))
}

/** Position weight as a percentage of total portfolio value */
export function calcWeight(positionValue: number, totalPortfolioValue: number): number {
  if (totalPortfolioValue === 0) return 0
  return parseFloat(((positionValue / totalPortfolioValue) * 100).toFixed(1))
}

/** Simple OLS Beta from two equal-length arrays of periodic returns */
export function calcBeta(assetReturns: number[], marketReturns: number[]): number {
  const n = Math.min(assetReturns.length, marketReturns.length)
  if (n < 2) return 1
  const ar = assetReturns.slice(0, n)
  const mr = marketReturns.slice(0, n)
  const meanA = ar.reduce((s, r) => s + r, 0) / n
  const meanM = mr.reduce((s, r) => s + r, 0) / n
  let cov = 0
  let varM = 0
  for (let i = 0; i < n; i++) {
    cov += (ar[i] - meanA) * (mr[i] - meanM)
    varM += (mr[i] - meanM) ** 2
  }
  if (varM === 0) return 1
  return parseFloat((cov / varM).toFixed(2))
}
