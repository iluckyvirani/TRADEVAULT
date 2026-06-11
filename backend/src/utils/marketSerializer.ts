import type { Instrument, MarketQuote } from '@prisma/client'

function num(v: { toString(): string } | number | null | undefined): number {
  if (v == null) return 0
  return typeof v === 'number' ? v : Number(v)
}

export function serializeInstrument(row: Instrument) {
  const lastPrice = num(row.lastPrice)
  const bid = num(row.bid) || lastPrice
  const ask = num(row.ask) || lastPrice

  return {
    id: row.id,
    symbol: row.symbol,
    displayName: row.displayName,
    category: row.category,
    filterTags: row.filterTags,
    badge: row.badge,
    exchange: row.exchange,
    expiry: row.expiry ?? undefined,
    lotSize: row.lotSize,
    lastPrice,
    bid,
    ask,
    strike: row.strike != null ? num(row.strike) : undefined,
    optionSide: row.optionSide ?? undefined,
    underlying: row.underlying ?? undefined,
    commodityTag: row.commodityTag ?? undefined,
    viewOnly: row.viewOnly,
    chartSymbol: row.chartSymbol,
    isTradable: row.isTradable,
  }
}

export function serializeQuote(row: MarketQuote) {
  return {
    symbol: row.symbol,
    name: row.name,
    price: num(row.price),
    open: num(row.open),
    high: num(row.high),
    low: num(row.low),
    close: num(row.close),
    previousClose: num(row.previousClose),
    change: num(row.change),
    changePct: num(row.changePct),
    volume: Number(row.volume),
    avgVolume: Number(row.avgVolume),
    marketCap: row.marketCap ?? '',
    peRatio: row.peRatio != null ? num(row.peRatio) : null,
    week52High: num(row.week52High),
    week52Low: num(row.week52Low),
    dividendYield: row.dividendYield != null ? num(row.dividendYield) : null,
    beta: row.beta != null ? num(row.beta) : 1,
    bid: num(row.price) - 0.05,
    ask: num(row.price) + 0.05,
    lastUpdated: row.lastUpdated.toISOString(),
  }
}
