import { useEffect } from 'react'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useOrdersStore } from '@/store/ordersStore'

const SYMBOLS = ['RELIANCE', 'HDFCBANK', 'INFY', 'TCS', 'ICICIBANK', 'SBI', 'BHARTIARTL', 'AXISBANK', 'NIFTY', 'BANKNIFTY']

/**
 * Simulates WebSocket price ticks. Mount once in the app shell or dashboard root.
 * Each tick randomly adjusts every symbol by ±0.4% and then checks for pending
 * limit/stop order fills at the new price.
 */
export function useMockTicker(intervalMs = 1500) {
  const updateQuote = usePortfolioStore((s) => s.updateQuote)

  useEffect(() => {
    const id = setInterval(() => {
      const { liveQuotes } = usePortfolioStore.getState()
      const { tryFillPendingOrders } = useOrdersStore.getState()

      SYMBOLS.forEach((symbol) => {
        const q = liveQuotes[symbol]
        if (!q) return
        const delta = (Math.random() - 0.498) * 0.004
        const newPrice = Math.max(0.01, parseFloat((q.price * (1 + delta)).toFixed(2)))
        const newChangePct = parseFloat(
          (((newPrice - q.previousClose) / q.previousClose) * 100).toFixed(2),
        )
        updateQuote(symbol, newPrice, newChangePct)
        tryFillPendingOrders(symbol, newPrice)
      })
    }, intervalMs)

    return () => clearInterval(id)
  }, [updateQuote, intervalMs])
}
