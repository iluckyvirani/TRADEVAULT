import { mockQuotes } from './mockQuotes'

export type InstrumentCategory = 'index' | 'future' | 'equity' | 'commodity'
export type InstrumentFilter =
  | 'all'
  | 'nifty'
  | 'banknifty'
  | 'finnifty'
  | 'midcapnifty'
  | 'sensex'
  | 'equity'
  | 'commodity'

export type InstrumentBadge = 'INDEX' | 'FUT' | 'EQ' | 'MCX'

export interface Instrument {
  id: string
  displayName: string
  symbol: string
  category: InstrumentCategory
  filterTags: InstrumentFilter[]
  badge: InstrumentBadge
  viewOnly: boolean
  exchange: 'NSE' | 'BSE' | 'MCX'
  expiry?: string
  lotSize: number
  lastPrice: number
  bid: number
  ask: number
}

function q(symbol: string, fallback: number) {
  return mockQuotes[symbol]?.price ?? fallback
}

function spread(price: number) {
  const tick = price > 10000 ? 0.05 : price > 1000 ? 0.05 : 0.05
  return { bid: price - tick, ask: price + tick }
}

function idx(
  id: string,
  displayName: string,
  symbol: string,
  filterTags: InstrumentFilter[],
  price: number,
): Instrument {
  const { bid, ask } = spread(price)
  return {
    id,
    displayName,
    symbol,
    category: 'index',
    filterTags,
    badge: 'INDEX',
    viewOnly: true,
    exchange: symbol === 'SENSEX' ? 'BSE' : 'NSE',
    lotSize: 1,
    lastPrice: price,
    bid,
    ask,
  }
}

function fut(
  id: string,
  displayName: string,
  symbol: string,
  filterTags: InstrumentFilter[],
  price: number,
  expiry: string,
): Instrument {
  const { bid, ask } = spread(price)
  return {
    id,
    displayName,
    symbol,
    category: 'future',
    filterTags,
    badge: 'FUT',
    viewOnly: false,
    exchange: filterTags.includes('commodity') ? 'MCX' : 'NSE',
    expiry,
    lotSize: 1,
    lastPrice: price,
    bid,
    ask,
  }
}

function eq(symbol: string): Instrument {
  const quote = mockQuotes[symbol]
  const price = quote?.price ?? 1000
  const { bid, ask } = spread(price)
  return {
    id: `eq-${symbol.toLowerCase()}`,
    displayName: quote?.name ?? symbol,
    symbol,
    category: 'equity',
    filterTags: ['equity'],
    badge: 'EQ',
    viewOnly: false,
    exchange: 'NSE',
    lotSize: 1,
    lastPrice: price,
    bid,
    ask,
  }
}

export const mockInstruments: Instrument[] = [
  idx('idx-sensex', 'BSE SENSEX', 'SENSEX', ['sensex'], 83240.5),
  idx('idx-midcp', 'NIFTY MID SELECT', 'MIDCPNIFTY', ['midcapnifty', 'nifty'], 12845.2),
  idx('idx-banknifty', 'Nifty Bank', 'BANKNIFTY', ['banknifty', 'nifty'], q('BANKNIFTY', 54352)),
  idx('idx-finnifty', 'Nifty Fin Service', 'FINNIFTY', ['finnifty', 'nifty'], 23890.75),
  idx('idx-nifty', 'Nifty 50', 'NIFTY', ['nifty'], q('NIFTY', 24685)),

  fut('fut-sensex', 'SENSEX FUT 25 JUN 26', 'SENSEX-FUT', ['sensex'], 83310.0, '2026-06-25'),
  fut('fut-banknifty', 'BANKNIFTY FUT 30 JUN 26', 'BANKNIFTY-FUT', ['banknifty', 'nifty'], 54420.0, '2026-06-30'),
  fut('fut-finnifty', 'FINNIFTY FUT 30 JUN 26', 'FINNIFTY-FUT', ['finnifty', 'nifty'], 23950.0, '2026-06-30'),
  fut('fut-nifty', 'NIFTY FUT 26 JUN 26', 'NIFTY-FUT', ['nifty'], 24720.0, '2026-06-26'),
  fut('fut-crude', 'CRUDEOIL FUT', 'CRUDEOIL-FUT', ['commodity'], 6425.0, '2026-06-20'),

  eq('RELIANCE'),
  eq('HDFCBANK'),
  eq('INFY'),
  eq('TCS'),
  eq('ICICIBANK'),
  eq('SBI'),
  eq('BHARTIARTL'),
  eq('AXISBANK'),

  (() => {
    const price = 72540
    const { bid, ask } = spread(price)
    return {
      id: 'cmd-gold',
      displayName: 'GOLD FUT',
      symbol: 'GOLD-FUT',
      category: 'commodity' as const,
      filterTags: ['commodity' as const],
      badge: 'MCX' as const,
      viewOnly: false,
      exchange: 'MCX' as const,
      expiry: '2026-08-05',
      lotSize: 1,
      lastPrice: price,
      bid,
      ask,
    }
  })(),
]

const CHART_SYMBOL_MAP: Record<string, string> = {
  'SENSEX-FUT': 'NIFTY',
  'BANKNIFTY-FUT': 'BANKNIFTY',
  'FINNIFTY-FUT': 'NIFTY',
  'NIFTY-FUT': 'NIFTY',
  'CRUDEOIL-FUT': 'RELIANCE',
  'GOLD-FUT': 'RELIANCE',
  SENSEX: 'NIFTY',
  MIDCPNIFTY: 'NIFTY',
  FINNIFTY: 'NIFTY',
}

export function getInstrumentById(id: string): Instrument | undefined {
  return mockInstruments.find((i) => i.id === id)
}

export function getInstrumentBySymbol(symbol: string): Instrument | undefined {
  return mockInstruments.find((i) => i.symbol === symbol)
}

export function getChartSymbol(instrument: Instrument): string {
  if (instrument.symbol in mockQuotes) return instrument.symbol
  return CHART_SYMBOL_MAP[instrument.symbol] ?? 'NIFTY'
}

export const FILTER_CHIPS: {
  id: InstrumentFilter
  label: string
  dot?: string
}[] = [
  { id: 'all', label: 'All' },
  { id: 'nifty', label: 'Nifty', dot: 'bg-emerald-500' },
  { id: 'banknifty', label: 'BankNifty', dot: 'bg-orange-500' },
  { id: 'finnifty', label: 'FinNifty', dot: 'bg-violet-500' },
  { id: 'midcapnifty', label: 'MidcapNifty', dot: 'bg-sky-500' },
  { id: 'sensex', label: 'Sensex', dot: 'bg-rose-500' },
  { id: 'equity', label: 'Equity' },
  { id: 'commodity', label: 'Commodity' },
]
