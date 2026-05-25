export type OrderSide = 'buy' | 'sell'
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit'
export type OrderStatus = 'pending' | 'open' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected'
export type OrderTimeInForce = 'day' | 'gtc' | 'ioc' | 'fok'

export interface Order {
  id: string
  userId: string
  symbol: string
  name: string
  side: OrderSide
  type: OrderType
  status: OrderStatus
  quantity: number
  filledQuantity: number
  limitPrice?: number
  stopPrice?: number
  stopTriggered?: boolean
  filledPrice?: number
  totalValue: number
  timeInForce: OrderTimeInForce
  createdAt: string
  updatedAt: string
  filledAt?: string
}

export const mockOrders: Order[] = [
  {
    id: 'ord-001',
    userId: 'user-001',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    side: 'buy',
    type: 'market',
    status: 'filled',
    quantity: 15,
    filledQuantity: 15,
    filledPrice: 178.50,
    totalValue: 2677.50,
    timeInForce: 'day',
    createdAt: '2024-06-10T09:35:00Z',
    updatedAt: '2024-06-10T09:35:02Z',
    filledAt: '2024-06-10T09:35:02Z',
  },
  {
    id: 'ord-002',
    userId: 'user-001',
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    side: 'buy',
    type: 'limit',
    status: 'filled',
    quantity: 5,
    filledQuantity: 5,
    limitPrice: 825.00,
    filledPrice: 820.00,
    totalValue: 4100.00,
    timeInForce: 'gtc',
    createdAt: '2024-06-12T11:00:00Z',
    updatedAt: '2024-06-12T11:42:15Z',
    filledAt: '2024-06-12T11:42:15Z',
  },
  {
    id: 'ord-003',
    userId: 'user-001',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    side: 'sell',
    type: 'limit',
    status: 'open',
    quantity: 4,
    filledQuantity: 0,
    limitPrice: 235.00,
    totalValue: 940.00,
    timeInForce: 'gtc',
    createdAt: '2024-07-01T14:20:00Z',
    updatedAt: '2024-07-01T14:20:00Z',
  },
  {
    id: 'ord-004',
    userId: 'user-001',
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    side: 'buy',
    type: 'stop_limit',
    status: 'open',
    quantity: 6,
    filledQuantity: 0,
    limitPrice: 495.00,
    stopPrice: 500.00,
    totalValue: 2970.00,
    timeInForce: 'day',
    createdAt: '2024-07-02T09:45:00Z',
    updatedAt: '2024-07-02T09:45:00Z',
  },
  {
    id: 'ord-005',
    userId: 'user-001',
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    side: 'buy',
    type: 'market',
    status: 'filled',
    quantity: 20,
    filledQuantity: 20,
    filledPrice: 182.00,
    totalValue: 3640.00,
    timeInForce: 'day',
    createdAt: '2024-06-18T10:15:00Z',
    updatedAt: '2024-06-18T10:15:03Z',
    filledAt: '2024-06-18T10:15:03Z',
  },
  {
    id: 'ord-006',
    userId: 'user-001',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    side: 'buy',
    type: 'limit',
    status: 'partially_filled',
    quantity: 20,
    filledQuantity: 12,
    limitPrice: 146.00,
    filledPrice: 145.00,
    totalValue: 1740.00,
    timeInForce: 'gtc',
    createdAt: '2024-06-22T13:30:00Z',
    updatedAt: '2024-06-25T10:00:00Z',
    filledAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'ord-007',
    userId: 'user-001',
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    side: 'buy',
    type: 'limit',
    status: 'cancelled',
    quantity: 5,
    filledQuantity: 0,
    limitPrice: 600.00,
    totalValue: 3000.00,
    timeInForce: 'day',
    createdAt: '2024-06-28T09:00:00Z',
    updatedAt: '2024-06-28T16:00:00Z',
  },
  {
    id: 'ord-008',
    userId: 'user-001',
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF',
    side: 'buy',
    type: 'market',
    status: 'filled',
    quantity: 10,
    filledQuantity: 10,
    filledPrice: 498.00,
    totalValue: 4980.00,
    timeInForce: 'day',
    createdAt: '2024-07-01T09:31:00Z',
    updatedAt: '2024-07-01T09:31:01Z',
    filledAt: '2024-07-01T09:31:01Z',
  },
]
