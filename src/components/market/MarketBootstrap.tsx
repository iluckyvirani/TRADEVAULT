import { useEffect } from 'react'
import { fetchAllQuotes, fetchInstruments } from '@/lib/api/market'
import { setApiInstruments } from '@/lib/mock/mockInstruments'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useAuthStore } from '@/store/authStore'
import { useQuoteWebSocket } from '@/hooks/useQuoteWebSocket'

/** Loads instruments + quotes from API; starts WebSocket ticks when authenticated. */
export default function MarketBootstrap() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setQuotes = usePortfolioStore((s) => s.setQuotes)

  useQuoteWebSocket(isAuthenticated)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [instruments, quotes] = await Promise.all([
          fetchInstruments().catch(() => []),
          fetchAllQuotes().catch(() => null),
        ])
        if (cancelled) return
        if (instruments.length > 0) setApiInstruments(instruments)
        if (quotes && Object.keys(quotes).length > 0) setQuotes(quotes)
      } catch {
        // keep mock fallbacks
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [setQuotes])

  return null
}
