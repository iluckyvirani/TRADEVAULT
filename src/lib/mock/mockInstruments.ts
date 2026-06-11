import { getOptionChartSymbol, resolveOptionById } from './mockOptionChains'
import { mockQuotes } from './mockQuotes'

export type InstrumentCategory = 'index' | 'future' | 'equity' | 'commodity' | 'option'
export type InstrumentFilter =
  | 'all'
  | 'nifty'
  | 'banknifty'
  | 'finnifty'
  | 'midcapnifty'
  | 'sensex'
  | 'equity'
  | 'commodity'

export type InstrumentBadge = 'INDEX' | 'FUT' | 'EQ' | 'MCX' | 'CE' | 'PE'

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
  optionSide?: 'CE' | 'PE'
  strike?: number
  underlying?: string
  commodityTag?: string
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
  commodityTag?: string,
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
    commodityTag,
  }
}

function eq(symbol: string, displayName?: string): Instrument {
  const quote = mockQuotes[symbol]
  const price = quote?.price ?? 1000
  const { bid, ask } = spread(price)
  return {
    id: `eq-${symbol.toLowerCase()}`,
    displayName: displayName ?? quote?.name ?? symbol,
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

  fut('fut-sensex', 'SENSEX FUT 25 JUN 26', 'SENSEX-FUT', ['sensex'], 83310.0, '25 JUN 26'),
  fut('fut-banknifty', 'BANKNIFTY FUT 30 JUN 26', 'BANKNIFTY-FUT', ['banknifty', 'nifty'], 54420.0, '30 JUN 26'),
  fut('fut-midcpnifty', 'MIDCPNIFTY FUT 30 JUN 26', 'MIDCPNIFTY-FUT', ['midcapnifty', 'nifty'], 12890.0, '30 JUN 26'),
  fut('fut-finnifty', 'FINNIFTY FUT 30 JUN 26', 'FINNIFTY-FUT', ['finnifty', 'nifty'], 23950.0, '30 JUN 26'),
  fut('fut-nifty', 'NIFTY FUT 26 JUN 26', 'NIFTY-FUT', ['nifty'], 24720.0, '26 JUN 26'),
  fut('fut-crude', 'CRUDEOILM FUT 18 JUN 26', 'CRUDEOILM-FUT', ['commodity'], 6425.0, '18 JUN 26', 'CRUDEOILM'),
  fut('fut-goldpetal', 'GOLDPETAL FUT 05 JUL 26', 'GOLDPETAL-FUT', ['commodity'], 7254.0, '05 JUL 26', 'GOLDPETAL'),
  fut('fut-natgas', 'NATGASMINI FUT 26 JUN 26', 'NATGASMINI-FUT', ['commodity'], 198.5, '26 JUN 26', 'NATGASMINI'),
  fut('fut-silver', 'SILVERMIC FUT 26 JUN 26', 'SILVERMIC-FUT', ['commodity'], 91240.0, '26 JUN 26', 'SILVERMIC'),

  eq('RELIANCE'),
  eq('HDFCBANK'),
  eq('INFY'),
  eq('TCS'),
  eq('ICICIBANK'),
  eq('SBI'),
  eq('BHARTIARTL'),
  eq('AXISBANK'),
  eq('20MICRONS', '20MICRONS'),
  eq('21STCENMGM', '21STCENMGM'),
  eq('360ONE', '360ONE'),
  eq('3BBLACKBIO', '3BBLACKBIO'),
  eq('3IINFOLTD', '3IINFOLTD'),
  eq('3MINDIA', '3MINDIA'),
  eq('3PLAND', '3PLAND'),
  eq('5PAISA', '5PAISA'),
  eq('ABB', 'ABB'),
  eq('ADANIENT', 'ADANIENT'),
  eq('ADANIPORTS', 'ADANIPORTS'),
  eq('APOLLOHOSP', 'APOLLOHOSP'),
  eq('ASIANPAINT', 'ASIANPAINT'),
  eq('BAJFINANCE', 'BAJFINANCE'),
  eq('BPCL', 'BPCL'),
  eq('BRITANNIA', 'BRITANNIA'),
  eq('CIPLA', 'CIPLA'),
  eq('COALINDIA', 'COALINDIA'),
  eq('DIVISLAB', 'DIVISLAB'),
  eq('DRREDDY', 'DRREDDY'),
  eq('EICHERMOT', 'EICHERMOT'),
  eq('GRASIM', 'GRASIM'),
  eq('HCLTECH', 'HCLTECH'),
  eq('HEROMOTOCO', 'HEROMOTOCO'),
  eq('HINDALCO', 'HINDALCO'),
  eq('HINDUNILVR', 'HINDUNILVR'),
  eq('INDUSINDBK', 'INDUSINDBK'),
  eq('ITC', 'ITC'),
  eq('JSWSTEEL', 'JSWSTEEL'),
  eq('KOTAKBANK', 'KOTAKBANK'),
  eq('LT', 'LT'),
  eq('M&M', 'M&M'),
  eq('MARUTI', 'MARUTI'),
  eq('NESTLEIND', 'NESTLEIND'),
  eq('NTPC', 'NTPC'),
  eq('ONGC', 'ONGC'),
  eq('POWERGRID', 'POWERGRID'),
  eq('SBIN', 'SBIN'),
  eq('SUNPHARMA', 'SUNPHARMA'),
  eq('TATAMOTORS', 'TATAMOTORS'),
  eq('TATASTEEL', 'TATASTEEL'),
  eq('TECHM', 'TECHM'),
  eq('TITAN', 'TITAN'),
  eq('ULTRACEMCO', 'ULTRACEMCO'),
  eq('WIPRO', 'WIPRO'),
]

const CHART_SYMBOL_MAP: Record<string, string> = {
  'SENSEX-FUT': 'NIFTY',
  'BANKNIFTY-FUT': 'BANKNIFTY',
  'FINNIFTY-FUT': 'NIFTY',
  'NIFTY-FUT': 'NIFTY',
  'CRUDEOILM-FUT': 'RELIANCE',
  'GOLDPETAL-FUT': 'RELIANCE',
  'NATGASMINI-FUT': 'RELIANCE',
  'SILVERMIC-FUT': 'RELIANCE',
  'MIDCPNIFTY-FUT': 'NIFTY',
  SENSEX: 'NIFTY',
  MIDCPNIFTY: 'NIFTY',
  FINNIFTY: 'NIFTY',
}

/** Default tradable symbol when opening Trading Room (matches evaluation screenshots) */
export const DEFAULT_TRADABLE_INSTRUMENT_ID = 'eq-hdfcbank'

export function getDefaultTradableInstrument(): Instrument {
  return (
    getInstrumentById(DEFAULT_TRADABLE_INSTRUMENT_ID) ??
    mockInstruments.find((i) => !i.viewOnly) ??
    mockInstruments[0]
  )
}

let apiInstrumentMap: Map<string, Instrument> | null = null
let apiInstrumentList: Instrument[] | null = null

export function setApiInstruments(list: Instrument[]) {
  apiInstrumentList = list
  apiInstrumentMap = new Map(list.map((i) => [i.id, i]))
}

export function getApiInstruments(): Instrument[] | null {
  return apiInstrumentList
}

export function getInstrumentById(id: string): Instrument | undefined {
  return (
    apiInstrumentMap?.get(id) ??
    mockInstruments.find((i) => i.id === id) ??
    resolveOptionById(id)
  )
}

export function getInstrumentBySymbol(symbol: string): Instrument | undefined {
  return (
    apiInstrumentList?.find((i) => i.symbol === symbol) ??
    mockInstruments.find((i) => i.symbol === symbol)
  )
}

export function getChartSymbol(instrument: Instrument): string {
  if (instrument.category === 'option' && instrument.underlying) {
    return getOptionChartSymbol(instrument.underlying)
  }
  if (instrument.symbol in mockQuotes) return instrument.symbol
  return CHART_SYMBOL_MAP[instrument.symbol] ?? 'NIFTY'
}

export const FILTER_CHIPS: {
  id: InstrumentFilter
  label: string
  dot?: string
}[] = [
  { id: 'all', label: 'All' },
  { id: 'nifty', label: 'Nifty', dot: 'bg-blue-500' },
  { id: 'banknifty', label: 'BankNifty', dot: 'bg-purple-500' },
  { id: 'finnifty', label: 'FinNifty', dot: 'bg-green-500' },
  { id: 'midcapnifty', label: 'MidcapNifty', dot: 'bg-yellow-500' },
  { id: 'sensex', label: 'Sensex', dot: 'bg-rose-500' },
  { id: 'equity', label: 'Equity' },
  { id: 'commodity', label: 'Commodity' },
]

export const COMMODITY_TAGS = [
  { id: 'CRUDEOILM', label: 'CRUDEOILM' },
  { id: 'GOLDPETAL', label: 'GOLDPETAL' },
  { id: 'NATGASMINI', label: 'NATGASMINI' },
  { id: 'SILVERMIC', label: 'SILVERMIC' },
] as const
