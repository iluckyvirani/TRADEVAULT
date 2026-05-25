export interface Quote {
  symbol: string
  name: string
  price: number
  open: number
  high: number
  low: number
  close: number
  previousClose: number
  change: number
  changePct: number
  volume: number
  avgVolume: number
  marketCap: string
  peRatio: number | null
  week52High: number
  week52Low: number
  dividendYield: number | null
  beta: number
  lastUpdated: string
}

export const mockQuotes: Record<string, Quote> = {
  AAPL: {
    symbol: 'AAPL', name: 'Apple Inc.',
    price: 192.35, open: 189.90, high: 193.80, low: 189.50,
    close: 192.35, previousClose: 189.90,
    change: 2.45, changePct: 1.29,
    volume: 54_200_000, avgVolume: 58_000_000,
    marketCap: '2.96T', peRatio: 32.4,
    week52High: 199.62, week52Low: 164.08,
    dividendYield: 0.52, beta: 1.19,
    lastUpdated: new Date().toISOString(),
  },
  MSFT: {
    symbol: 'MSFT', name: 'Microsoft Corp.',
    price: 415.20, open: 410.10, high: 416.90, low: 409.50,
    close: 415.20, previousClose: 410.10,
    change: 5.10, changePct: 1.24,
    volume: 22_800_000, avgVolume: 24_500_000,
    marketCap: '3.09T', peRatio: 37.8,
    week52High: 430.82, week52Low: 309.45,
    dividendYield: 0.68, beta: 0.91,
    lastUpdated: new Date().toISOString(),
  },
  TSLA: {
    symbol: 'TSLA', name: 'Tesla Inc.',
    price: 221.15, open: 226.45, high: 227.10, low: 218.30,
    close: 221.15, previousClose: 226.45,
    change: -5.30, changePct: -2.34,
    volume: 95_700_000, avgVolume: 102_000_000,
    marketCap: '705B', peRatio: 68.2,
    week52High: 299.29, week52Low: 138.80,
    dividendYield: null, beta: 2.34,
    lastUpdated: new Date().toISOString(),
  },
  NVDA: {
    symbol: 'NVDA', name: 'NVIDIA Corp.',
    price: 905.40, open: 882.90, high: 910.20, low: 879.50,
    close: 905.40, previousClose: 882.90,
    change: 22.50, changePct: 2.55,
    volume: 38_900_000, avgVolume: 42_000_000,
    marketCap: '2.23T', peRatio: 75.6,
    week52High: 974.00, week52Low: 402.23,
    dividendYield: 0.04, beta: 1.71,
    lastUpdated: new Date().toISOString(),
  },
  GOOGL: {
    symbol: 'GOOGL', name: 'Alphabet Inc.',
    price: 158.75, open: 159.95, high: 161.20, low: 157.40,
    close: 158.75, previousClose: 159.95,
    change: -1.20, changePct: -0.75,
    volume: 18_500_000, avgVolume: 22_000_000,
    marketCap: '1.99T', peRatio: 26.3,
    week52High: 176.33, week52Low: 115.35,
    dividendYield: null, beta: 1.06,
    lastUpdated: new Date().toISOString(),
  },
  AMZN: {
    symbol: 'AMZN', name: 'Amazon.com Inc.',
    price: 196.40, open: 193.25, high: 197.80, low: 192.80,
    close: 196.40, previousClose: 193.25,
    change: 3.15, changePct: 1.63,
    volume: 28_300_000, avgVolume: 31_000_000,
    marketCap: '2.09T', peRatio: 55.4,
    week52High: 201.20, week52Low: 101.15,
    dividendYield: null, beta: 1.15,
    lastUpdated: new Date().toISOString(),
  },
  META: {
    symbol: 'META', name: 'Meta Platforms Inc.',
    price: 525.30, open: 516.60, high: 527.50, low: 514.20,
    close: 525.30, previousClose: 516.60,
    change: 8.70, changePct: 1.68,
    volume: 12_100_000, avgVolume: 14_500_000,
    marketCap: '1.37T', peRatio: 29.8,
    week52High: 531.49, week52Low: 274.38,
    dividendYield: null, beta: 1.22,
    lastUpdated: new Date().toISOString(),
  },
  SPY: {
    symbol: 'SPY', name: 'SPDR S&P 500 ETF',
    price: 512.80, open: 508.60, high: 513.90, low: 507.80,
    close: 512.80, previousClose: 508.60,
    change: 4.20, changePct: 0.83,
    volume: 71_600_000, avgVolume: 82_000_000,
    marketCap: 'N/A', peRatio: null,
    week52High: 524.61, week52Low: 410.44,
    dividendYield: 1.26, beta: 1.00,
    lastUpdated: new Date().toISOString(),
  },
  QQQ: {
    symbol: 'QQQ', name: 'Invesco QQQ Trust',
    price: 445.60, open: 439.30, high: 446.80, low: 438.50,
    close: 445.60, previousClose: 439.30,
    change: 6.30, changePct: 1.43,
    volume: 42_800_000, avgVolume: 48_000_000,
    marketCap: 'N/A', peRatio: null,
    week52High: 457.62, week52Low: 340.59,
    dividendYield: 0.55, beta: 1.18,
    lastUpdated: new Date().toISOString(),
  },
}
