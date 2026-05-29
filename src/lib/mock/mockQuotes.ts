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
  RELIANCE: {
    symbol: 'RELIANCE', name: 'Reliance Industries Ltd.',
    price: 2925.60, open: 2908.40, high: 2942.10, low: 2898.20,
    close: 2925.60, previousClose: 2912.30,
    change: 13.30, changePct: 0.46,
    volume: 10_420_000, avgVolume: 9_850_000,
    marketCap: '19.8L Cr', peRatio: 30.1,
    week52High: 3024.00, week52Low: 2410.40,
    dividendYield: 0.58, beta: 0.98,
    lastUpdated: new Date().toISOString(),
  },
  HDFCBANK: {
    symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.',
    price: 1708.40, open: 1694.80, high: 1721.20, low: 1689.70,
    close: 1708.40, previousClose: 1699.60,
    change: 8.80, changePct: 0.52,
    volume: 8_940_000, avgVolume: 8_300_000,
    marketCap: '12.1L Cr', peRatio: 20.2,
    week52High: 1754.00, week52Low: 1426.10,
    dividendYield: 1.18, beta: 0.88,
    lastUpdated: new Date().toISOString(),
  },
  INFY: {
    symbol: 'INFY', name: 'Infosys Ltd.',
    price: 1780.25, open: 1766.30, high: 1792.85, low: 1759.40,
    close: 1780.25, previousClose: 1769.10,
    change: 11.15, changePct: 0.63,
    volume: 6_820_000, avgVolume: 6_250_000,
    marketCap: '7.6L Cr', peRatio: 28.4,
    week52High: 1887.50, week52Low: 1468.90,
    dividendYield: 1.68, beta: 0.79,
    lastUpdated: new Date().toISOString(),
  },
  TCS: {
    symbol: 'TCS', name: 'Tata Consultancy Services Ltd.',
    price: 3905.90, open: 3852.20, high: 3921.40, low: 3846.30,
    close: 3905.90, previousClose: 3865.50,
    change: 40.40, changePct: 1.05,
    volume: 5_760_000, avgVolume: 5_180_000,
    marketCap: '14.9L Cr', peRatio: 33.7,
    week52High: 4016.50, week52Low: 3220.40,
    dividendYield: 1.22, beta: 0.91,
    lastUpdated: new Date().toISOString(),
  },
  ICICIBANK: {
    symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.',
    price: 1246.70, open: 1265.80, high: 1272.40, low: 1236.50,
    close: 1246.70, previousClose: 1261.80,
    change: -15.10, changePct: -1.20,
    volume: 7_120_000, avgVolume: 7_860_000,
    marketCap: '8.1L Cr', peRatio: 18.4,
    week52High: 1310.20, week52Low: 942.80,
    dividendYield: 0.82, beta: 1.03,
    lastUpdated: new Date().toISOString(),
  },
  SBI: {
    symbol: 'SBI', name: 'State Bank of India',
    price: 819.45, open: 808.20, high: 823.70, low: 803.10,
    close: 819.45, previousClose: 806.00,
    change: 13.45, changePct: 1.67,
    volume: 9_150_000, avgVolume: 8_640_000,
    marketCap: '7.0L Cr', peRatio: 9.8,
    week52High: 840.90, week52Low: 652.25,
    dividendYield: 1.84, beta: 1.02,
    lastUpdated: new Date().toISOString(),
  },
  BHARTIARTL: {
    symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.',
    price: 1324.30, open: 1310.60, high: 1332.40, low: 1302.20,
    close: 1324.30, previousClose: 1308.50,
    change: 15.80, changePct: 1.21,
    volume: 4_620_000, avgVolume: 4_140_000,
    marketCap: '8.3L Cr', peRatio: 26.7,
    week52High: 1456.80, week52Low: 1180.40,
    dividendYield: 0.48, beta: 0.94,
    lastUpdated: new Date().toISOString(),
  },
  AXISBANK: {
    symbol: 'AXISBANK', name: 'Axis Bank Ltd.',
    price: 1112.20, open: 1102.80, high: 1120.50, low: 1096.40,
    close: 1112.20, previousClose: 1096.70,
    change: 15.50, changePct: 1.41,
    volume: 5_780_000, avgVolume: 5_260_000,
    marketCap: '3.4L Cr', peRatio: 13.5,
    week52High: 1160.40, week52Low: 864.20,
    dividendYield: 0.73, beta: 1.08,
    lastUpdated: new Date().toISOString(),
  },
  NIFTY: {
    symbol: 'NIFTY', name: 'NIFTY 50 Index',
    price: 24685.30, open: 24592.40, high: 24712.80, low: 24548.60,
    close: 24685.30, previousClose: 24566.10,
    change: 119.20, changePct: 0.48,
    volume: 1_860_000, avgVolume: 1_640_000,
    marketCap: 'N/A', peRatio: null,
    week52High: 24914.20, week52Low: 21120.70,
    dividendYield: 1.14, beta: 1.00,
    lastUpdated: new Date().toISOString(),
  },
  BANKNIFTY: {
    symbol: 'BANKNIFTY', name: 'BANKNIFTY Index',
    price: 54352.40, open: 54160.20, high: 54510.90, low: 54045.30,
    close: 54352.40, previousClose: 54114.70,
    change: 237.70, changePct: 0.44,
    volume: 850_000, avgVolume: 720_000,
    marketCap: 'N/A', peRatio: null,
    week52High: 55120.70, week52Low: 46920.30,
    dividendYield: 0.84, beta: 0.99,
    lastUpdated: new Date().toISOString(),
  },
}
