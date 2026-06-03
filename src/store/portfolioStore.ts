import { create } from 'zustand'
import { mockQuotes } from '@/lib/mock'
import type { Quote } from '@/lib/mock'

interface QuotesState {
  liveQuotes: Record<string, Quote>
  updateQuote: (symbol: string, price: number, changePct: number) => void
}

/** Live mock quotes for charts and trading room (not evaluation positions). */
export const usePortfolioStore = create<QuotesState>((set) => ({
  liveQuotes: { ...mockQuotes },

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
