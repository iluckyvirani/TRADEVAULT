/** Seed instruments + quotes — mirrors frontend mockInstruments / mockQuotes */

type Category = 'index' | 'future' | 'equity' | 'commodity'
type Badge = 'INDEX' | 'FUT' | 'EQ' | 'MCX'
type Exchange = 'NSE' | 'BSE' | 'MCX'

interface SeedInstrument {
  id: string
  symbol: string
  displayName: string
  category: Category
  filterTags: string[]
  badge: Badge
  exchange: Exchange
  expiry?: string
  lotSize: number
  lastPrice: number
  bid: number
  ask: number
  commodityTag?: string
  viewOnly: boolean
  chartSymbol: string
  isTradable: boolean
}

function spread(price: number) {
  return { bid: price - 0.05, ask: price + 0.05 }
}

function idx(
  id: string,
  displayName: string,
  symbol: string,
  filterTags: string[],
  price: number,
  exchange: Exchange = symbol === 'SENSEX' ? 'BSE' : 'NSE',
): SeedInstrument {
  const { bid, ask } = spread(price)
  return {
    id,
    symbol,
    displayName,
    category: 'index',
    filterTags,
    badge: 'INDEX',
    exchange,
    lotSize: 1,
    lastPrice: price,
    bid,
    ask,
    viewOnly: true,
    chartSymbol: symbol === 'SENSEX' ? 'NIFTY' : symbol,
    isTradable: false,
  }
}

function fut(
  id: string,
  displayName: string,
  symbol: string,
  filterTags: string[],
  price: number,
  expiry: string,
  chartSymbol: string,
  commodityTag?: string,
): SeedInstrument {
  const { bid, ask } = spread(price)
  return {
    id,
    symbol,
    displayName,
    category: 'future',
    filterTags,
    badge: 'FUT',
    exchange: filterTags.includes('commodity') ? 'MCX' : 'NSE',
    expiry,
    lotSize: 1,
    lastPrice: price,
    bid,
    ask,
    commodityTag,
    viewOnly: false,
    chartSymbol,
    isTradable: true,
  }
}

function eq(symbol: string, displayName: string, price: number): SeedInstrument {
  const { bid, ask } = spread(price)
  return {
    id: `eq-${symbol.toLowerCase()}`,
    symbol,
    displayName,
    category: 'equity',
    filterTags: ['equity', 'all'],
    badge: 'EQ',
    exchange: 'NSE',
    lotSize: 1,
    lastPrice: price,
    bid,
    ask,
    viewOnly: false,
    chartSymbol: symbol,
    isTradable: true,
  }
}

function quoteFromPrice(symbol: string, name: string, price: number, volume = 1_000_000) {
  const change = parseFloat((price * 0.005).toFixed(2))
  const prev = parseFloat((price - change).toFixed(2))
  return {
    symbol,
    name,
    price,
    open: prev,
    high: price + change * 0.5,
    low: prev - change * 0.3,
    close: price,
    previousClose: prev,
    change,
    changePct: parseFloat(((change / prev) * 100).toFixed(2)),
    volume,
    avgVolume: volume,
    marketCap: symbol === 'NIFTY' || symbol === 'BANKNIFTY' ? null : '—',
    peRatio: null,
    week52High: price * 1.15,
    week52Low: price * 0.85,
    dividendYield: null,
    beta: 1,
  }
}

export const SEED_INSTRUMENTS: SeedInstrument[] = [
  idx('idx-sensex', 'BSE SENSEX', 'SENSEX', ['sensex', 'all'], 83240.5),
  idx('idx-midcp', 'NIFTY MID SELECT', 'MIDCPNIFTY', ['midcapnifty', 'nifty', 'all'], 12845.2),
  idx('idx-banknifty', 'Nifty Bank', 'BANKNIFTY', ['banknifty', 'nifty', 'all'], 54352.4),
  idx('idx-finnifty', 'Nifty Fin Service', 'FINNIFTY', ['finnifty', 'nifty', 'all'], 23890.75),
  idx('idx-nifty', 'Nifty 50', 'NIFTY', ['nifty', 'all'], 24685.3),

  fut('fut-sensex', 'SENSEX FUT 25 JUN 26', 'SENSEX-FUT', ['sensex', 'all'], 83310.0, '25 JUN 26', 'NIFTY'),
  fut('fut-banknifty', 'BANKNIFTY FUT 30 JUN 26', 'BANKNIFTY-FUT', ['banknifty', 'nifty', 'all'], 54420.0, '30 JUN 26', 'BANKNIFTY'),
  fut('fut-midcpnifty', 'MIDCPNIFTY FUT 30 JUN 26', 'MIDCPNIFTY-FUT', ['midcapnifty', 'nifty', 'all'], 12890.0, '30 JUN 26', 'NIFTY'),
  fut('fut-finnifty', 'FINNIFTY FUT 30 JUN 26', 'FINNIFTY-FUT', ['finnifty', 'nifty', 'all'], 23950.0, '30 JUN 26', 'NIFTY'),
  fut('fut-nifty', 'NIFTY FUT 26 JUN 26', 'NIFTY-FUT', ['nifty', 'all'], 24720.0, '26 JUN 26', 'NIFTY'),
  fut('fut-crude', 'CRUDEOILM FUT 18 JUN 26', 'CRUDEOILM-FUT', ['commodity', 'all'], 6425.0, '18 JUN 26', 'RELIANCE', 'CRUDEOILM'),
  fut('fut-goldpetal', 'GOLDPETAL FUT 05 JUL 26', 'GOLDPETAL-FUT', ['commodity', 'all'], 7254.0, '05 JUL 26', 'RELIANCE', 'GOLDPETAL'),
  fut('fut-natgas', 'NATGASMINI FUT 26 JUN 26', 'NATGASMINI-FUT', ['commodity', 'all'], 198.5, '26 JUN 26', 'RELIANCE', 'NATGASMINI'),
  fut('fut-silver', 'SILVERMIC FUT 26 JUN 26', 'SILVERMIC-FUT', ['commodity', 'all'], 91240.0, '26 JUN 26', 'RELIANCE', 'SILVERMIC'),

  eq('RELIANCE', 'Reliance Industries Ltd.', 2925.6),
  eq('HDFCBANK', 'HDFC Bank Ltd.', 1708.4),
  eq('INFY', 'Infosys Ltd.', 1780.25),
  eq('TCS', 'Tata Consultancy Services Ltd.', 3905.9),
  eq('ICICIBANK', 'ICICI Bank Ltd.', 1246.7),
  eq('SBI', 'State Bank of India', 819.45),
  eq('BHARTIARTL', 'Bharti Airtel Ltd.', 1324.3),
  eq('AXISBANK', 'Axis Bank Ltd.', 1112.2),
  eq('20MICRONS', '20MICRONS', 180.5),
  eq('21STCENMGM', '21STCENMGM', 42.3),
  eq('360ONE', '360ONE', 980.0),
  eq('3BBLACKBIO', '3BBLACKBIO', 65.2),
  eq('3IINFOLTD', '3IINFOLTD', 28.4),
  eq('3MINDIA', '3MINDIA', 28500.0),
  eq('3PLAND', '3PLAND', 38.6),
  eq('5PAISA', '5PAISA', 420.0),
  eq('ABB', 'ABB India Ltd.', 6200.0),
  eq('ADANIENT', 'Adani Enterprises Ltd.', 2850.0),
  eq('ADANIPORTS', 'Adani Ports and SEZ Ltd.', 1420.0),
  eq('APOLLOHOSP', 'Apollo Hospitals Enterprise Ltd.', 6200.0),
  eq('ASIANPAINT', 'Asian Paints Ltd.', 2850.0),
  eq('BAJFINANCE', 'Bajaj Finance Ltd.', 7200.0),
  eq('BPCL', 'Bharat Petroleum Corporation Ltd.', 320.0),
  eq('BRITANNIA', 'Britannia Industries Ltd.', 5200.0),
  eq('CIPLA', 'Cipla Ltd.', 1480.0),
  eq('COALINDIA', 'Coal India Ltd.', 420.0),
  eq('DIVISLAB', "Divi's Laboratories Ltd.", 3800.0),
  eq('DRREDDY', "Dr. Reddy's Laboratories Ltd.", 6200.0),
  eq('EICHERMOT', 'Eicher Motors Ltd.', 4800.0),
  eq('GRASIM', 'Grasim Industries Ltd.', 2650.0),
  eq('HCLTECH', 'HCL Technologies Ltd.', 1680.0),
  eq('HEROMOTOCO', 'Hero MotoCorp Ltd.', 4800.0),
  eq('HINDALCO', 'Hindalco Industries Ltd.', 620.0),
  eq('HINDUNILVR', 'Hindustan Unilever Ltd.', 2480.0),
  eq('INDUSINDBK', 'IndusInd Bank Ltd.', 980.0),
  eq('ITC', 'ITC Ltd.', 420.0),
  eq('JSWSTEEL', 'JSW Steel Ltd.', 920.0),
  eq('KOTAKBANK', 'Kotak Mahindra Bank Ltd.', 1780.0),
  eq('LT', 'Larsen & Toubro Ltd.', 3480.0),
  eq('M&M', 'Mahindra & Mahindra Ltd.', 2850.0),
  eq('MARUTI', 'Maruti Suzuki India Ltd.', 11800.0),
  eq('NESTLEIND', 'Nestle India Ltd.', 2480.0),
  eq('NTPC', 'NTPC Ltd.', 320.0),
  eq('ONGC', 'Oil & Natural Gas Corporation Ltd.', 248.0),
  eq('POWERGRID', 'Power Grid Corporation of India Ltd.', 280.0),
  eq('SBIN', 'State Bank of India', 819.45),
  eq('SUNPHARMA', 'Sun Pharmaceutical Industries Ltd.', 1680.0),
  eq('TATAMOTORS', 'Tata Motors Ltd.', 720.0),
  eq('TATASTEEL', 'Tata Steel Ltd.', 148.0),
  eq('TECHM', 'Tech Mahindra Ltd.', 1680.0),
  eq('TITAN', 'Titan Company Ltd.', 3480.0),
  eq('ULTRACEMCO', 'UltraTech Cement Ltd.', 10800.0),
  eq('WIPRO', 'Wipro Ltd.', 480.0),
]

export const SEED_QUOTES = [
  quoteFromPrice('NIFTY', 'NIFTY 50 Index', 24685.3, 1_860_000),
  quoteFromPrice('BANKNIFTY', 'NIFTY Bank', 54352.4, 850_000),
  quoteFromPrice('FINNIFTY', 'Nifty Fin Service', 23890.75, 420_000),
  quoteFromPrice('MIDCPNIFTY', 'NIFTY MID SELECT', 12845.2, 380_000),
  quoteFromPrice('SENSEX', 'BSE SENSEX', 83240.5, 520_000),
  ...SEED_INSTRUMENTS.filter((i) => i.category === 'equity').map((i) =>
    quoteFromPrice(i.symbol, i.displayName, i.lastPrice),
  ),
]
