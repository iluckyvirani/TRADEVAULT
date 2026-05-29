export interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
  changePct: number
  volume: string
}

export interface Watchlist {
  id: string
  name: string
  userId: string
  items: WatchlistItem[]
}

export const mockWatchlists: Watchlist[] = [
  {
    id: 'wl-001',
    name: 'NSE Leaders',
    userId: 'user-001',
    items: [
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2925.60, change: 13.30, changePct: 0.46, volume: '10.4M' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1708.40, change: 8.80, changePct: 0.52, volume: '8.9M' },
      { symbol: 'INFY', name: 'Infosys Ltd.', price: 1780.25, change: 11.15, changePct: 0.63, volume: '6.8M' },
      { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', price: 3905.90, change: 40.40, changePct: 1.05, volume: '5.8M' },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1246.70, change: -15.10, changePct: -1.20, volume: '7.1M' },
      { symbol: 'SBI', name: 'State Bank of India', price: 819.45, change: 13.45, changePct: 1.67, volume: '9.2M' },
    ],
  },
  {
    id: 'wl-002',
    name: 'My Portfolio',
    userId: 'user-001',
    items: [
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2925.60, change: 13.30, changePct: 0.46, volume: '10.4M' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1708.40, change: 8.80, changePct: 0.52, volume: '8.9M' },
      { symbol: 'INFY', name: 'Infosys Ltd.', price: 1780.25, change: 11.15, changePct: 0.63, volume: '6.8M' },
      { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', price: 3905.90, change: 40.40, changePct: 1.05, volume: '5.8M' },
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', price: 1324.30, change: 15.80, changePct: 1.21, volume: '4.6M' },
      { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', price: 1112.20, change: 15.50, changePct: 1.41, volume: '5.8M' },
    ],
  },
  {
    id: 'wl-003',
    name: 'Indices',
    userId: 'user-001',
    items: [
      { symbol: 'NIFTY', name: 'NIFTY 50 Index', price: 24685.30, change: 119.20, changePct: 0.48, volume: '1.86M' },
      { symbol: 'BANKNIFTY', name: 'BANKNIFTY Index', price: 54352.40, change: 237.70, changePct: 0.44, volume: '0.85M' },
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2925.60, change: 13.30, changePct: 0.46, volume: '10.4M' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1708.40, change: 8.80, changePct: 0.52, volume: '8.9M' },
      { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', price: 3905.90, change: 40.40, changePct: 1.05, volume: '5.8M' },
    ],
  },
]
