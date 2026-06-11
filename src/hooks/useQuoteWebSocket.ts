import { useEffect, useRef } from 'react'
import { getAccessToken } from '@/lib/api/client'
import { usePortfolioStore } from '@/store/portfolioStore'
import { useAuthStore } from '@/store/authStore'

const WS_BASE = import.meta.env.VITE_WS_URL ?? ''

function wsUrl() {
  const token = getAccessToken()
  if (!token) return null

  if (WS_BASE) {
    const url = new URL(WS_BASE)
    url.searchParams.set('token', token)
    return url.toString()
  }

  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/api/ws/quotes?token=${encodeURIComponent(token)}`
}

const DEFAULT_SYMBOLS = [
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

/** Live quote stream from API WebSocket (simulated until vendor keys are set). */
export function useQuoteWebSocket(enabled = true) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const applyQuote = usePortfolioStore((s) => s.applyQuote)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!enabled || !isAuthenticated) return

    const url = wsUrl()
    if (!url) return

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', symbols: DEFAULT_SYMBOLS }))
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(String(event.data)) as {
          type?: string
          symbol?: string
          price?: number
          changePct?: number
          change?: number
          lastUpdated?: string
        }
        if (msg.type !== 'quote' || !msg.symbol || msg.price == null) return
        applyQuote(msg.symbol, {
          price: msg.price,
          changePct: msg.changePct ?? 0,
          change: msg.change ?? 0,
          lastUpdated: msg.lastUpdated ?? new Date().toISOString(),
        })
      } catch {
        // ignore
      }
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [enabled, isAuthenticated, applyQuote])
}
