import { useEffect } from 'react'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useOrdersStore } from '@/store/ordersStore'

const SYMBOLS = ['AAPL', 'MSFT', 'TSLA', 'NVDA', 'GOOGL', 'AMZN', 'META', 'SPY', 'QQQ']

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
        // Slight random walk, biased very slightly positive
        const delta = (Math.random() - 0.498) * 0.004
        const newPrice = Math.max(0.01, parseFloat((q.price * (1 + delta)).toFixed(2)))
        const newChangePct = parseFloat(
          (((newPrice - q.previousClose) / q.previousClose) * 100).toFixed(2),
        )
        updateQuote(symbol, newPrice, newChangePct)
        // After updating price, try to fill any resting limit/stop orders
        tryFillPendingOrders(symbol, newPrice)
      })
    }, intervalMs)

    return () => clearInterval(id)
  }, [updateQuote, intervalMs])
}
