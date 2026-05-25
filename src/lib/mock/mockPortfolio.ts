export interface Position {
  symbol: string
  name: string
  quantity: number
  avgCost: number
  currentPrice: number
  marketValue: number
  unrealizedPnL: number
  unrealizedPnLPct: number
}

export interface Portfolio {
  userId: string
  cashBalance: number
  totalValue: number
  totalInvested: number
  totalPnL: number
  totalPnLPct: number
  dayPnL: number
  dayPnLPct: number
  realizedPnL: number
  positions: Position[]
}

export const mockPortfolio: Portfolio = {
  userId: 'user-001',
  cashBalance: 72_340.55,
  totalValue: 100_215.80,
  totalInvested: 27_875.25,
  totalPnL: 2_215.80,
  totalPnLPct: 2.26,
  dayPnL: 345.20,
  dayPnLPct: 0.35,
  realizedPnL: 0,
  positions: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 15,
      avgCost: 178.50,
      currentPrice: 192.35,
      marketValue: 2885.25,
      unrealizedPnL: 207.75,
      unrealizedPnLPct: 7.75,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      quantity: 10,
      avgCost: 380.00,
      currentPrice: 415.20,
      marketValue: 4152.00,
      unrealizedPnL: 352.00,
      unrealizedPnLPct: 9.26,
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      quantity: 8,
      avgCost: 245.00,
      currentPrice: 221.15,
      marketValue: 1769.20,
      unrealizedPnL: -190.80,
      unrealizedPnLPct: -9.73,
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      quantity: 5,
      avgCost: 820.00,
      currentPrice: 905.40,
      marketValue: 4527.00,
      unrealizedPnL: 427.00,
      unrealizedPnLPct: 10.42,
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 12,
      avgCost: 145.00,
      currentPrice: 158.75,
      marketValue: 1905.00,
      unrealizedPnL: 165.00,
      unrealizedPnLPct: 9.48,
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      quantity: 20,
      avgCost: 182.00,
      currentPrice: 196.40,
      marketValue: 3928.00,
      unrealizedPnL: 288.00,
      unrealizedPnLPct: 7.91,
    },
    {
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      quantity: 6,
      avgCost: 490.00,
      currentPrice: 525.30,
      marketValue: 3151.80,
      unrealizedPnL: 211.80,
      unrealizedPnLPct: 7.20,
    },
    {
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF',
      quantity: 10,
      avgCost: 498.00,
      currentPrice: 512.80,
      marketValue: 5128.00,
      unrealizedPnL: 148.00,
      unrealizedPnLPct: 2.97,
    },
  ],
}
