import { create } from 'zustand'
import { mockPortfolio, mockQuotes } from '@/lib/mock'
import type { Portfolio, Position, Quote } from '@/lib/mock'
import type { OrderSide } from '@/lib/mock'
import { calcNewAvgCost, calcRealizedPnL } from '@/lib/calculations'

interface PortfolioState {
  portfolio: Portfolio
  liveQuotes: Record<string, Quote>
  updateQuote: (symbol: string, price: number, changePct: number) => void
  /**
   * Apply a filled order to cash balance and positions.
   * Buy  → deducts cash, adds/averages into position.
   * Sell → adds cash, reduces/removes position, tracks realised P&L.
   */
  applyFill: (
    side: OrderSide,
    symbol: string,
    name: string,
    quantity: number,
    fillPrice: number,
  ) => void
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolio: { ...mockPortfolio, positions: mockPortfolio.positions.map((p) => ({ ...p })) },
  liveQuotes: { ...mockQuotes },

  updateQuote: (symbol, price, changePct) =>
    set((state) => {
      const prev = state.liveQuotes[symbol]
      if (!prev) return state

      const updatedQuotes: Record<string, Quote> = {
        ...state.liveQuotes,
        [symbol]: {
          ...prev,
          price,
          changePct,
          change: parseFloat((price - prev.previousClose).toFixed(2)),
          lastUpdated: new Date().toISOString(),
        },
      }

      const positions: Position[] = state.portfolio.positions.map((pos) => {
        if (pos.symbol !== symbol) return pos
        const marketValue = parseFloat((price * pos.quantity).toFixed(2))
        const unrealizedPnL = parseFloat(((price - pos.avgCost) * pos.quantity).toFixed(2))
        const unrealizedPnLPct = parseFloat(
          (((price - pos.avgCost) / pos.avgCost) * 100).toFixed(2),
        )
        return { ...pos, currentPrice: price, marketValue, unrealizedPnL, unrealizedPnLPct }
      })

      const invested = positions.reduce((s, p) => s + p.avgCost * p.quantity, 0)
      const positionValue = positions.reduce((s, p) => s + p.marketValue, 0)
      const totalValue = parseFloat((state.portfolio.cashBalance + positionValue).toFixed(2))
      const totalPnL = parseFloat((positionValue - invested).toFixed(2))
      const totalPnLPct =
        invested > 0 ? parseFloat(((totalPnL / invested) * 100).toFixed(2)) : 0

      return {
        liveQuotes: updatedQuotes,
        portfolio: { ...state.portfolio, positions, totalValue, totalPnL, totalPnLPct },
      }
    }),

  applyFill: (side, symbol, name, quantity, fillPrice) =>
    set((state) => {
      let cashBalance = state.portfolio.cashBalance
      let realizedPnL = state.portfolio.realizedPnL
      const positions: Position[] = state.portfolio.positions.map((p) => ({ ...p }))

      if (side === 'buy') {
        cashBalance = parseFloat((cashBalance - fillPrice * quantity).toFixed(2))
        const idx = positions.findIndex((p) => p.symbol === symbol)
        if (idx >= 0) {
          // Average into existing position
          const pos = positions[idx]
          const newQty = pos.quantity + quantity
          const newAvgCost = calcNewAvgCost(pos.quantity, pos.avgCost, quantity, fillPrice)
          const currentPrice = state.liveQuotes[symbol]?.price ?? fillPrice
          const marketValue = parseFloat((currentPrice * newQty).toFixed(2))
          positions[idx] = {
            ...pos,
            quantity: newQty,
            avgCost: newAvgCost,
            currentPrice,
            marketValue,
            unrealizedPnL: parseFloat(((currentPrice - newAvgCost) * newQty).toFixed(2)),
            unrealizedPnLPct: parseFloat(
              (((currentPrice - newAvgCost) / newAvgCost) * 100).toFixed(2),
            ),
          }
        } else {
          // Open new position
          const currentPrice = state.liveQuotes[symbol]?.price ?? fillPrice
          positions.push({
            symbol,
            name,
            quantity,
            avgCost: fillPrice,
            currentPrice,
            marketValue: parseFloat((currentPrice * quantity).toFixed(2)),
            unrealizedPnL: parseFloat(((currentPrice - fillPrice) * quantity).toFixed(2)),
            unrealizedPnLPct: parseFloat(
              (((currentPrice - fillPrice) / fillPrice) * 100).toFixed(2),
            ),
          })
        }
      } else {
        // sell
        const idx = positions.findIndex((p) => p.symbol === symbol)
        if (idx >= 0) {
          const pos = positions[idx]
          const pnl = calcRealizedPnL(fillPrice, pos.avgCost, quantity)
          realizedPnL = parseFloat((realizedPnL + pnl).toFixed(2))
          cashBalance = parseFloat((cashBalance + fillPrice * quantity).toFixed(2))
          const newQty = pos.quantity - quantity
          if (newQty <= 0) {
            positions.splice(idx, 1)
          } else {
            const currentPrice = state.liveQuotes[symbol]?.price ?? fillPrice
            positions[idx] = {
              ...pos,
              quantity: newQty,
              marketValue: parseFloat((currentPrice * newQty).toFixed(2)),
              unrealizedPnL: parseFloat(((currentPrice - pos.avgCost) * newQty).toFixed(2)),
              unrealizedPnLPct: parseFloat(
                (((currentPrice - pos.avgCost) / pos.avgCost) * 100).toFixed(2),
              ),
            }
          }
        }
      }

      const positionValue = positions.reduce((s, p) => s + p.marketValue, 0)
      const totalValue = parseFloat((cashBalance + positionValue).toFixed(2))
      const invested = positions.reduce((s, p) => s + p.avgCost * p.quantity, 0)
      const totalPnL = parseFloat((positionValue - invested).toFixed(2))
      const totalPnLPct = invested > 0 ? parseFloat(((totalPnL / invested) * 100).toFixed(2)) : 0

      return {
        portfolio: {
          ...state.portfolio,
          cashBalance,
          totalValue,
          positions,
          totalPnL,
          totalPnLPct,
          realizedPnL,
        },
      }
    }),
}))
