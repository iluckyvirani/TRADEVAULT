import { create } from 'zustand'
import { mockQuotes } from '@/lib/mock'
import type { Quote } from '@/lib/mock'

interface QuotesState {
  liveQuotes: Record<string, Quote>
  setQuotes: (quotes: Record<string, Quote>) => void
  applyQuote: (
    symbol: string,
    patch: { price: number; changePct: number; change: number; lastUpdated: string },
  ) => void
  updateQuote: (symbol: string, price: number, changePct: number) => void
}

/** Live quotes for charts and trading room (API + WebSocket; mock fallback). */
export const usePortfolioStore = create<QuotesState>((set) => ({
  liveQuotes: { ...mockQuotes },

  setQuotes: (quotes) =>
    set((state) => ({
      liveQuotes: { ...state.liveQuotes, ...quotes },
    })),

  applyQuote: (symbol, patch) =>
    set((state) => {
      const prev = state.liveQuotes[symbol]
      if (!prev) return state
      return {
        liveQuotes: {
          ...state.liveQuotes,
          [symbol]: {
            ...prev,
            price: patch.price,
            changePct: patch.changePct,
            change: patch.change,
            lastUpdated: patch.lastUpdated,
          },
        },
      }
    }),

  updateQuote: (symbol, price, changePct) =>
    set((state) => {
      const prev = state.liveQuotes[symbol]
      if (!prev) return state

      return {
        liveQuotes: {
          ...state.liveQuotes,
          [symbol]: {
            ...prev,
            price,
            changePct,
            change: parseFloat((price - prev.previousClose).toFixed(2)),
            lastUpdated: new Date().toISOString(),
          },
        },
      }
    }),
}))
