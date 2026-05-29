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
  const now = Math.floor(Date.now() / 1000)
  const startDay = now - days * 86400

  let price = basePrice * (1 - (days * volatility) / 3)

  for (let d = 0; d < days; d++) {
    const dayStart = startDay + d * 86400
    const date = new Date(dayStart * 1000)
    const dow = date.getUTCDay()
    if (dow === 0 || dow === 6) continue

    const open = price
    const change = (Math.sin(d * 0.3) + (Math.random() - 0.48)) * volatility * price
    const close = Math.max(open + change, open * 0.85)
    const high = Math.max(open, close) * (1 + Math.random() * volatility * 0.5)
    const low = Math.min(open, close) * (1 - Math.random() * volatility * 0.5)
    const volume = Math.floor(3_000_000 + Math.random() * 12_000_000)

    candles.push({
      time: dayStart + 9 * 3600 + 15 * 60,
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
  RELIANCE: generateCandles(2800, 180, 0.012),
  HDFCBANK: generateCandles(1650, 180, 0.010),
  INFY: generateCandles(1680, 180, 0.011),
  TCS: generateCandles(3750, 180, 0.009),
  ICICIBANK: generateCandles(1220, 180, 0.013),
  SBI: generateCandles(780, 180, 0.014),
  BHARTIARTL: generateCandles(1260, 180, 0.012),
  AXISBANK: generateCandles(1060, 180, 0.015),
  NIFTY: generateCandles(24250, 180, 0.007),
  BANKNIFTY: generateCandles(53100, 180, 0.008),
}
