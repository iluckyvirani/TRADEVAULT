import type { Server as HttpServer } from 'http'
import { WebSocketServer, type WebSocket } from 'ws'
import { verifyAccessToken } from '../lib/jwt.js'
import { jitterQuote } from '../services/marketService.js'
import { config } from '../config.js'

interface ClientState {
  ws: WebSocket
  symbols: Set<string>
}

const clients = new Set<ClientState>()
let tickTimer: ReturnType<typeof setInterval> | null = null

const TICK_SYMBOLS = ['NIFTY', 'BANKNIFTY', 'HDFCBANK', 'RELIANCE', 'INFY', 'TCS']

function broadcast(message: object) {
  const payload = JSON.stringify(message)
  for (const client of clients) {
    if (client.ws.readyState === client.ws.OPEN) {
      client.ws.send(payload)
    }
  }
}

async function runTickCycle() {
  const symbolsToUpdate = new Set<string>(TICK_SYMBOLS)
  for (const client of clients) {
    for (const s of client.symbols) symbolsToUpdate.add(s)
  }

  for (const symbol of symbolsToUpdate) {
    try {
      const quote = await jitterQuote(symbol)
      if (!quote) continue
      broadcast({
        type: 'quote',
        symbol: quote.symbol,
        price: quote.price,
        change: quote.change,
        changePct: quote.changePct,
        bid: quote.bid,
        ask: quote.ask,
        lastUpdated: quote.lastUpdated,
      })
    } catch {
      // ignore per-symbol failures
    }
  }
}

function ensureTickLoop() {
  if (tickTimer) return
  tickTimer = setInterval(() => {
    void runTickCycle()
  }, 1500)
}

export function attachQuoteWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server, path: '/api/ws/quotes' })

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url ?? '', `http://${req.headers.host}`)
    const token = url.searchParams.get('token')

    if (!token) {
      ws.close(4001, 'Missing token')
      return
    }

    try {
      verifyAccessToken(token)
    } catch {
      ws.close(4003, 'Invalid token')
      return
    }

    const state: ClientState = { ws, symbols: new Set(TICK_SYMBOLS) }
    clients.add(state)
    ensureTickLoop()

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(String(raw)) as {
          type?: string
          symbols?: string[]
        }
        if (msg.type === 'subscribe' && Array.isArray(msg.symbols)) {
          state.symbols = new Set(msg.symbols.map((s) => s.toUpperCase()))
        }
      } catch {
        // ignore malformed messages
      }
    })

    ws.on('close', () => {
      clients.delete(state)
      if (clients.size === 0 && tickTimer) {
        clearInterval(tickTimer)
        tickTimer = null
      }
    })

    ws.send(
      JSON.stringify({
        type: 'connected',
        mode: config.marketDataVendor === 'truedata' ? 'vendor' : 'simulated',
      }),
    )
  })
}
