/** Generate OHLCV rows for seeding MarketCandle */

export interface SeedCandle {
  symbol: string
  interval: string
  time: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

function generateDailyCandles(symbol: string, basePrice: number, days = 260): SeedCandle[] {
  const rows: SeedCandle[] = []
  const now = Date.now()
  let price = basePrice * 0.92

  for (let d = days; d >= 0; d--) {
    const day = new Date(now - d * 86400000)
    day.setUTCHours(9, 15, 0, 0)
    if (day.getUTCDay() === 0 || day.getUTCDay() === 6) continue

    const open = price
    const change = (Math.sin(d * 0.25) + (Math.random() - 0.48)) * 0.012 * price
    const close = Math.max(open + change, open * 0.9)
    const high = Math.max(open, close) * (1 + Math.random() * 0.006)
    const low = Math.min(open, close) * (1 - Math.random() * 0.006)

    rows.push({
      symbol,
      interval: '1d',
      time: day,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(3_000_000 + Math.random() * 8_000_000),
    })
    price = close
  }
  return rows
}

function generateIntradayCandles(symbol: string, basePrice: number, bars = 375): SeedCandle[] {
  const rows: SeedCandle[] = []
  const session = new Date()
  session.setUTCHours(3, 45, 0, 0) // ~09:15 IST
  let price = basePrice

  for (let i = 0; i < bars; i++) {
    const t = new Date(session.getTime() + i * 60_000)
    const open = price
    const change = (Math.random() - 0.49) * 0.0015 * price
    const close = Math.max(open + change, open * 0.999)
    const high = Math.max(open, close) * (1 + Math.random() * 0.0008)
    const low = Math.min(open, close) * (1 - Math.random() * 0.0008)

    rows.push({
      symbol,
      interval: '1m',
      time: t,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(10_000 + Math.random() * 80_000),
    })
    price = close
  }
  return rows
}

export function buildSeedCandles(): SeedCandle[] {
  const symbols: [string, number][] = [
    ['NIFTY', 24850],
    ['BANKNIFTY', 52100],
    ['HDFCBANK', 1685],
    ['RELIANCE', 2925],
    ['NIFTY-FUT', 24920],
  ]

  const daily = symbols.flatMap(([sym, px]) => generateDailyCandles(sym, px))
  const intraday = symbols.flatMap(([sym, px]) => generateIntradayCandles(sym, px))
  return [...daily, ...intraday]
}
