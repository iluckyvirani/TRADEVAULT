import type { Instrument, InstrumentFilter } from './mockInstruments'
import { mockQuotes } from './mockQuotes'

export interface OptionChainConfig {
  underlying: string
  filter: InstrumentFilter
  atm: number
  expiries: string[]
  strikes: number[]
}

export const OPTION_CHAIN_CONFIGS: OptionChainConfig[] = [
  {
    underlying: 'NIFTY',
    filter: 'nifty',
    atm: 23242.1,
    expiries: ['09 JUN 26', '11 JUN 26', '16 JUN 26', '18 JUN 26', '30 JUN 26', '28 JUL 26'],
    strikes: [
      21100, 21150, 21200, 21250, 21300, 21350, 21400, 21450, 21500,
      23050, 23100, 23150, 23200, 23250, 23300, 23350, 23400,
    ],
  },
  {
    underlying: 'BANKNIFTY',
    filter: 'banknifty',
    atm: 55194.5,
    expiries: ['30 JUN 26', '28 JUL 26', '25 AUG 26'],
    strikes: [54800, 54900, 55000, 55100, 55200, 55300, 55400, 55500],
  },
  {
    underlying: 'FINNIFTY',
    filter: 'finnifty',
    atm: 23912.4,
    expiries: ['30 JUN 26', '28 JUL 26'],
    strikes: [23700, 23800, 23900, 24000, 24100],
  },
  {
    underlying: 'MIDCPNIFTY',
    filter: 'midcapnifty',
    atm: 12845.2,
    expiries: ['30 JUN 26'],
    strikes: [12700, 12750, 12800, 12850, 12900],
  },
  {
    underlying: 'SENSEX',
    filter: 'sensex',
    atm: 83240.5,
    expiries: ['25 JUN 26', '30 JUN 26'],
    strikes: [82800, 83000, 83200, 83400, 83600],
  },
]

function spread(price: number) {
  const tick = 0.05
  return { bid: price - tick, ask: price + tick }
}

function estimateOptionPremium(strike: number, atm: number, side: 'CE' | 'PE'): number {
  const dist = Math.abs(strike - atm)
  const base = side === 'CE'
    ? Math.max(12, 180 - dist * 0.35)
    : Math.max(12, 180 - dist * 0.35)
  return Math.round(base * 100) / 100
}

export function getOptionChainForFilter(
  filter: InstrumentFilter,
): OptionChainConfig | undefined {
  if (filter === 'all' || filter === 'equity' || filter === 'commodity') return undefined
  return OPTION_CHAIN_CONFIGS.find((c) => c.filter === filter)
}

export function buildOptionInstrument(
  config: OptionChainConfig,
  side: 'CE' | 'PE',
  strike: number,
  expiryLabel: string,
): Instrument {
  const price = estimateOptionPremium(strike, config.atm, side)
  const { bid, ask } = spread(price)
  const expirySlug = expiryLabel.replace(/\s/g, '').toLowerCase()
  const id = `opt-${config.underlying.toLowerCase()}-${side.toLowerCase()}-${strike}-${expirySlug}`

  return {
    id,
    displayName: `${config.underlying} ${strike} ${side}`,
    symbol: `${config.underlying}-${strike}-${side}`,
    category: 'option',
    filterTags: [config.filter],
    badge: side,
    viewOnly: false,
    exchange: config.underlying === 'SENSEX' ? 'BSE' : 'NSE',
    expiry: expiryLabel,
    lotSize: config.underlying === 'BANKNIFTY' ? 15 : 25,
    lastPrice: price,
    bid,
    ask,
    optionSide: side,
    strike,
    underlying: config.underlying,
  }
}

export function formatStrike(n: number): string {
  return n.toLocaleString('en-IN')
}

export function resolveOptionById(id: string): Instrument | undefined {
  if (!id.startsWith('opt-')) return undefined
  const parts = id.split('-')
  if (parts.length < 5) return undefined

  const underlying = parts[1].toUpperCase()
  const side = parts[2].toUpperCase()
  if (side !== 'CE' && side !== 'PE') return undefined

  const strike = Number(parts[3])
  if (!Number.isFinite(strike)) return undefined

  const expirySlug = parts.slice(4).join('-')
  const config = OPTION_CHAIN_CONFIGS.find((c) => c.underlying === underlying)
  if (!config) return undefined

  const expiryLabel = config.expiries.find(
    (e) => e.replace(/\s/g, '').toLowerCase() === expirySlug,
  )
  if (!expiryLabel) return undefined

  return buildOptionInstrument(config, side, strike, expiryLabel)
}

export function getAtmStrikeIndex(strikes: number[], atm: number): number {
  let best = 0
  let bestDist = Infinity
  strikes.forEach((s, i) => {
    const d = Math.abs(s - atm)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  })
  return best
}

/** Map option underlying to chart symbol */
export function getOptionChartSymbol(underlying: string): string {
  if (underlying in mockQuotes) return underlying
  const map: Record<string, string> = {
    NIFTY: 'NIFTY',
    BANKNIFTY: 'BANKNIFTY',
    FINNIFTY: 'NIFTY',
    MIDCPNIFTY: 'NIFTY',
    SENSEX: 'NIFTY',
  }
  return map[underlying] ?? 'NIFTY'
}
