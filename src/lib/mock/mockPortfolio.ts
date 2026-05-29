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
  cashBalance: 1_250_000.00,
  totalValue: 1_845_000.00,
  totalInvested: 1_520_000.00,
  totalPnL: 325_000.00,
  totalPnLPct: 21.38,
  dayPnL: 18_600.00,
  dayPnLPct: 1.02,
  realizedPnL: 0,
  positions: [
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd.',
      quantity: 40,
      avgCost: 2740.00,
      currentPrice: 2925.60,
      marketValue: 117_024.00,
      unrealizedPnL: 74_024.00,
      unrealizedPnLPct: 72.78,
    },
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd.',
      quantity: 85,
      avgCost: 1620.00,
      currentPrice: 1708.40,
      marketValue: 145_214.00,
      unrealizedPnL: 75_234.00,
      unrealizedPnLPct: 106.00,
    },
    {
      symbol: 'INFY',
      name: 'Infosys Ltd.',
      quantity: 65,
      avgCost: 1660.00,
      currentPrice: 1780.25,
      marketValue: 115_716.25,
      unrealizedPnL: 78_266.25,
      unrealizedPnLPct: 209.00,
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services Ltd.',
      quantity: 32,
      avgCost: 3720.00,
      currentPrice: 3905.90,
      marketValue: 124_989.00,
      unrealizedPnL: 59_389.00,
      unrealizedPnLPct: 90.00,
    },
    {
      symbol: 'ICICIBANK',
      name: 'ICICI Bank Ltd.',
      quantity: 110,
      avgCost: 1275.00,
      currentPrice: 1246.70,
      marketValue: 137_137.00,
      unrealizedPnL: -31_070.00,
      unrealizedPnLPct: -18.50,
    },
    {
      symbol: 'SBI',
      name: 'State Bank of India',
      quantity: 75,
      avgCost: 760.00,
      currentPrice: 819.45,
      marketValue: 61_458.75,
      unrealizedPnL: 44_583.75,
      unrealizedPnLPct: 263.00,
    },
    {
      symbol: 'BHARTIARTL',
      name: 'Bharti Airtel Ltd.',
      quantity: 90,
      avgCost: 1260.00,
      currentPrice: 1324.30,
      marketValue: 119_187.00,
      unrealizedPnL: 57_687.00,
      unrealizedPnLPct: 94.60,
    },
    {
      symbol: 'AXISBANK',
      name: 'Axis Bank Ltd.',
      quantity: 68,
      avgCost: 1045.00,
      currentPrice: 1112.20,
      marketValue: 75_630.00,
      unrealizedPnL: 45_630.00,
      unrealizedPnLPct: 152.60,
    },
  ],
}
