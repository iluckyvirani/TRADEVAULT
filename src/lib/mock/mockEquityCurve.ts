export interface EquityPoint {
  accountId: string
  timestamp: string
  equity: number
  balance: number
}

/** Flat equity curve at account size when no trades */
export function buildMockEquityCurve(
  accountId: string,
  accountSize: number,
  days = 30,
): EquityPoint[] {
  const points: EquityPoint[] = []
  const now = Date.now()
  for (let i = days; i >= 0; i--) {
    const d = new Date(now - i * 86400000)
    points.push({
      accountId,
      timestamp: d.toISOString(),
      equity: accountSize,
      balance: accountSize,
    })
  }
  return points
}
