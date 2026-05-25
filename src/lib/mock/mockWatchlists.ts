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
    name: 'Tech Giants',
    userId: 'user-001',
    items: [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 192.35, change: 2.45, changePct: 1.29, volume: '54.2M' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.20, change: 5.10, changePct: 1.24, volume: '22.8M' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 158.75, change: -1.20, changePct: -0.75, volume: '18.5M' },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 525.30, change: 8.70, changePct: 1.68, volume: '12.1M' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 905.40, change: 22.50, changePct: 2.55, volume: '38.9M' },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 221.15, change: -5.30, changePct: -2.34, volume: '95.7M' },
    ],
  },
  {
    id: 'wl-002',
    name: 'My Portfolio',
    userId: 'user-001',
    items: [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 192.35, change: 2.45, changePct: 1.29, volume: '54.2M' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.20, change: 5.10, changePct: 1.24, volume: '22.8M' },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 221.15, change: -5.30, changePct: -2.34, volume: '95.7M' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 905.40, change: 22.50, changePct: 2.55, volume: '38.9M' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 158.75, change: -1.20, changePct: -0.75, volume: '18.5M' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 196.40, change: 3.15, changePct: 1.63, volume: '28.3M' },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 525.30, change: 8.70, changePct: 1.68, volume: '12.1M' },
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 512.80, change: 4.20, changePct: 0.83, volume: '71.6M' },
    ],
  },
  {
    id: 'wl-003',
    name: 'ETFs',
    userId: 'user-001',
    items: [
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 512.80, change: 4.20, changePct: 0.83, volume: '71.6M' },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 445.60, change: 6.30, changePct: 1.43, volume: '42.8M' },
      { symbol: 'IWM', name: 'iShares Russell 2000 ETF', price: 205.10, change: -0.85, changePct: -0.41, volume: '19.4M' },
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', price: 242.30, change: 1.90, changePct: 0.79, volume: '3.8M' },
      { symbol: 'GLD', name: 'SPDR Gold Shares', price: 228.50, change: -0.60, changePct: -0.26, volume: '7.2M' },
    ],
  },
]
