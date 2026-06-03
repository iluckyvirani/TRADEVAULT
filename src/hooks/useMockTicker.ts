import { useEffect } from 'react'
import { usePortfolioStore } from '@/store/portfolioStore'

const SYMBOLS = [
  'RELIANCE',
  'HDFCBANK',
  'INFY',
  'TCS',
  'ICICIBANK',
  'SBI',
  'BHARTIARTL',
  'AXISBANK',
  'NIFTY',
  'BANKNIFTY',
]

/** Simulates live quote ticks for charts and the trading room. */
export function useMockTicker(intervalMs = 1500) {
  const updateQuote = usePortfolioStore((s) => s.updateQuote)

  useEffect(() => {
    const id = setInterval(() => {
      const { liveQuotes } = usePortfolioStore.getState()

      SYMBOLS.forEach((symbol) => {
        const q = liveQuotes[symbol]
        if (!q) return
        const delta = (Math.random() - 0.498) * 0.004
        const newPrice = Math.max(0.01, parseFloat((q.price * (1 + delta)).toFixed(2)))
        const newChangePct = parseFloat(
          (((newPrice - q.previousClose) / q.previousClose) * 100).toFixed(2),
        )
        updateQuote(symbol, newPrice, newChangePct)
      })
    }, intervalMs)

    return () => clearInterval(id)
  }, [updateQuote, intervalMs])
}
