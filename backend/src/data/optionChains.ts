/** Option chain configs — mirrors frontend mockOptionChains.ts */

export interface OptionChainConfig {
  underlying: string
  filter: string
  atm: number
  expiries: string[]
  strikes: number[]
}

export const OPTION_CHAIN_CONFIGS: OptionChainConfig[] = [
  {
    underlying: 'NIFTY',
    filter: 'nifty',
    atm: 24850,
    expiries: ['09 JUN 26', '11 JUN 26', '16 JUN 26', '30 JUN 26', '28 JUL 26'],
    strikes: [24600, 24700, 24800, 24850, 24900, 25000, 25100],
  },
  {
    underlying: 'BANKNIFTY',
    filter: 'banknifty',
    atm: 52100,
    expiries: ['30 JUN 26', '28 JUL 26'],
    strikes: [51800, 52000, 52100, 52200, 52400],
  },
  {
    underlying: 'FINNIFTY',
    filter: 'finnifty',
    atm: 23912,
    expiries: ['30 JUN 26'],
    strikes: [23700, 23800, 23900, 24000, 24100],
  },
  {
    underlying: 'MIDCPNIFTY',
    filter: 'midcapnifty',
    atm: 12845,
    expiries: ['30 JUN 26'],
    strikes: [12700, 12800, 12850, 12900, 13000],
  },
  {
    underlying: 'SENSEX',
    filter: 'sensex',
    atm: 83240,
    expiries: ['25 JUN 26', '30 JUN 26'],
    strikes: [82800, 83000, 83200, 83400, 83600],
  },
]

function estimatePremium(strike: number, atm: number, side: 'CE' | 'PE') {
  const dist = Math.abs(strike - atm)
  return Math.round(Math.max(12, 180 - dist * 0.35) * 100) / 100
}

export function buildOptionInstruments(config: OptionChainConfig) {
  const instruments = []
  for (const expiry of config.expiries.slice(0, 2)) {
    for (const strike of config.strikes) {
      for (const side of ['CE', 'PE'] as const) {
        const price = estimatePremium(strike, config.atm, side)
        const id = `opt-${config.underlying.toLowerCase()}-${side.toLowerCase()}-${strike}-${expiry.replace(/\s/g, '')}`
        instruments.push({
          id,
          symbol: `${config.underlying}-${strike}-${side}`,
          displayName: `${config.underlying} ${strike} ${side} ${expiry}`,
          category: 'option' as const,
          filterTags: [config.filter, 'all'],
          badge: side,
          exchange: 'NSE' as const,
          expiry,
          lotSize: config.underlying === 'NIFTY' ? 25 : 15,
          lastPrice: price,
          bid: price - 0.05,
          ask: price + 0.05,
          strike,
          optionSide: side,
          underlying: config.underlying,
          viewOnly: false,
          chartSymbol: config.underlying,
          isTradable: true,
        })
      }
    }
  }
  return instruments
}
