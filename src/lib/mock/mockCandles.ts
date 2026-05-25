export interface Candle {
  time: number   // Unix timestamp (seconds)
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/** Generate deterministic mock OHLCV candles for a symbol */
function generateCandles(
  basePrice: number,
  days = 180,
  volatility = 0.015,
): Candle[] {
  const candles: Candle[] = []
  // Start days ago, market open at 09:30 EST (14:30 UTC)
  const now = Math.floor(Date.now() / 1000)
  const startDay = now - days * 86400

  let price = basePrice * (1 - (days * volatility) / 3)

  for (let d = 0; d < days; d++) {
    const dayStart = startDay + d * 86400
    // Skip weekends (simple approach)
    const date = new Date(dayStart * 1000)
    const dow = date.getUTCDay()
    if (dow === 0 || dow === 6) continue

    const open = price
    const change = (Math.sin(d * 0.3) + (Math.random() - 0.48)) * volatility * price
    const close = Math.max(open + change, open * 0.85)
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5)
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5)
    const volume = Math.floor(10_000_000 + Math.random() * 40_000_000)

    candles.push({
      time: dayStart + 14 * 3600 + 30 * 60, // 14:30 UTC
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    })

    price = close
  }

  return candles
}

export const mockCandles: Record<string, Candle[]> = {
  AAPL: generateCandles(165, 180, 0.012),
  MSFT: generateCandles(370, 180, 0.010),
  TSLA: generateCandles(200, 180, 0.030),
  NVDA: generateCandles(750, 180, 0.022),
  GOOGL: generateCandles(140, 180, 0.013),
  AMZN: generateCandles(175, 180, 0.014),
  META: generateCandles(460, 180, 0.016),
  SPY: generateCandles(490, 180, 0.007),
  QQQ: generateCandles(420, 180, 0.009),
}
