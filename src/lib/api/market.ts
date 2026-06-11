import { apiFetch } from '@/lib/api/client'
import type { Candle } from '@/lib/mock/mockCandles'
import type { Instrument } from '@/lib/mock/mockInstruments'
import type { Quote } from '@/lib/mock/mockQuotes'

export async function fetchInstruments(query?: string, filter?: string) {
  const qs = new URLSearchParams()
  if (query) qs.set('q', query)
  if (filter && filter !== 'all') qs.set('filter', filter)
  const suffix = qs.toString() ? `?${qs}` : ''
  const path = query ? `/market/instruments/search${suffix}` : `/market/instruments${suffix}`
  const { instruments } = await apiFetch<{ instruments: Instrument[] }>(path)
  return instruments
}

export async function fetchAllQuotes() {
  const { quotes } = await apiFetch<{ quotes: Record<string, Quote> }>('/market/quotes')
  return quotes
}

export async function fetchQuote(symbol: string) {
  const { quote } = await apiFetch<{ quote: Quote }>(`/market/quotes/${encodeURIComponent(symbol)}`)
  return quote
}

export async function fetchCandles(
  symbol: string,
  params: { interval?: string; limit?: number; from?: string; to?: string } = {},
) {
  const qs = new URLSearchParams()
  if (params.interval) qs.set('interval', params.interval)
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.from) qs.set('from', params.from)
  if (params.to) qs.set('to', params.to)
  const suffix = qs.toString() ? `?${qs}` : ''
  return apiFetch<{ symbol: string; interval: string; candles: Candle[] }>(
    `/market/candles/${encodeURIComponent(symbol)}${suffix}`,
  )
}

export interface OptionChainResponse {
  underlying: string
  filter: string
  atm: number
  expiries: string[]
  strikes: number[]
  instruments: Instrument[]
}

export async function fetchOptionChain(underlying: string, filter?: string) {
  const qs = filter ? `?filter=${encodeURIComponent(filter)}` : ''
  return apiFetch<OptionChainResponse>(
    `/market/options/${encodeURIComponent(underlying)}${qs}`,
  )
}
