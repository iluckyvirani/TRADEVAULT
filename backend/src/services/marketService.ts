import { prisma } from '../lib/prisma.js'
import { AppError } from '../lib/errors.js'
import { serializeInstrument, serializeQuote } from '../utils/marketSerializer.js'
import {
  OPTION_CHAIN_CONFIGS,
  buildOptionInstruments,
  type OptionChainConfig,
} from '../data/optionChains.js'

function num(v: { toString(): string } | number | null | undefined): number {
  if (v == null) return 0
  return typeof v === 'number' ? v : Number(v)
}

export async function listInstruments(filter?: string) {
  const where =
    filter && filter !== 'all'
      ? { filterTags: { has: filter } }
      : undefined

  const rows = await prisma.instrument.findMany({
    where,
    orderBy: [{ category: 'asc' }, { symbol: 'asc' }],
  })
  return rows.map(serializeInstrument)
}

export async function searchInstruments(query: string, filter?: string) {
  const q = query.trim()
  if (!q) return listInstruments(filter)

  const filterClause =
    filter && filter !== 'all'
      ? { filterTags: { has: filter } }
      : {}

  const rows = await prisma.instrument.findMany({
    where: {
      ...filterClause,
      OR: [
        { symbol: { contains: q, mode: 'insensitive' } },
        { displayName: { contains: q, mode: 'insensitive' } },
        { commodityTag: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 200,
    orderBy: { symbol: 'asc' },
  })
  return rows.map(serializeInstrument)
}

export async function listQuotes() {
  const rows = await prisma.marketQuote.findMany({ orderBy: { symbol: 'asc' } })
  const map: Record<string, ReturnType<typeof serializeQuote>> = {}
  for (const row of rows) {
    map[row.symbol] = serializeQuote(row)
  }
  return map
}

export async function getQuote(symbol: string) {
  const row = await prisma.marketQuote.findUnique({ where: { symbol } })
  if (!row) {
    throw new AppError(404, 'Quote not found', 'QUOTE_NOT_FOUND')
  }
  return serializeQuote(row)
}

export async function getCandles(
  symbol: string,
  input: { interval?: string; from?: string; to?: string; limit?: number },
) {
  const interval = input.interval ?? '1d'
  const where: {
    symbol: string
    interval: string
    time?: { gte?: Date; lte?: Date }
  } = { symbol, interval }

  if (input.from || input.to) {
    where.time = {}
    if (input.from) where.time.gte = new Date(input.from)
    if (input.to) where.time.lte = new Date(input.to)
  }

  const rows = await prisma.marketCandle.findMany({
    where,
    orderBy: { time: 'asc' },
    take: input.limit ?? 500,
  })

  if (rows.length === 0) {
    return { symbol, interval, candles: [] as Array<{
      time: number
      open: number
      high: number
      low: number
      close: number
      volume: number
    }> }
  }

  let candles = rows.map((c) => ({
    time: Math.floor(c.time.getTime() / 1000),
    open: num(c.open),
    high: num(c.high),
    low: num(c.low),
    close: num(c.close),
    volume: Number(c.volume),
  }))

  if (input.limit && candles.length > input.limit) {
    candles = candles.slice(-input.limit)
  }

  return { symbol, interval, candles }
}

function resolveOptionConfig(underlying: string, filter?: string): OptionChainConfig | undefined {
  const key = underlying.toUpperCase()
  if (filter) {
    return OPTION_CHAIN_CONFIGS.find(
      (c) => c.filter === filter || c.underlying === key,
    )
  }
  return OPTION_CHAIN_CONFIGS.find((c) => c.underlying === key)
}

export async function getOptionChain(underlying: string, filter?: string) {
  const config = resolveOptionConfig(underlying, filter)
  if (!config) {
    throw new AppError(404, 'Option chain not found', 'OPTIONS_NOT_FOUND')
  }

  const quote = await prisma.marketQuote.findUnique({
    where: { symbol: config.underlying },
  })
  const atm = quote ? num(quote.price) : config.atm

  return {
    underlying: config.underlying,
    filter: config.filter,
    atm,
    expiries: config.expiries,
    strikes: config.strikes,
    instruments: buildOptionInstruments({ ...config, atm }).map((i) => ({
      ...i,
      filterTags: i.filterTags,
    })),
  }
}

export async function jitterQuote(symbol: string) {
  const row = await prisma.marketQuote.findUnique({ where: { symbol } })
  if (!row) return null

  const price = num(row.price)
  const delta = (Math.random() - 0.498) * 0.004
  const newPrice = Math.max(0.01, parseFloat((price * (1 + delta)).toFixed(2)))
  const prev = num(row.previousClose)
  const change = parseFloat((newPrice - prev).toFixed(2))
  const changePct = parseFloat(((change / prev) * 100).toFixed(2))

  const updated = await prisma.marketQuote.update({
    where: { symbol },
    data: {
      price: newPrice,
      close: newPrice,
      high: Math.max(num(row.high), newPrice),
      low: Math.min(num(row.low), newPrice),
      change,
      changePct,
      lastUpdated: new Date(),
    },
  })

  await prisma.instrument.updateMany({
    where: { symbol },
    data: {
      lastPrice: newPrice,
      bid: newPrice - 0.05,
      ask: newPrice + 0.05,
    },
  })

  return serializeQuote(updated)
}
