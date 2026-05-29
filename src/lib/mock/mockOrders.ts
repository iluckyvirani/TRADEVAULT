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
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    side: 'buy',
    type: 'market',
    status: 'filled',
    quantity: 10,
    filledQuantity: 10,
    filledPrice: 2860.00,
    totalValue: 28600.00,
    timeInForce: 'day',
    createdAt: '2024-06-10T09:35:00Z',
    updatedAt: '2024-06-10T09:35:02Z',
    filledAt: '2024-06-10T09:35:02Z',
  },
  {
    id: 'ord-002',
    userId: 'user-001',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    side: 'buy',
    type: 'limit',
    status: 'filled',
    quantity: 5,
    filledQuantity: 5,
    limitPrice: 3850.00,
    filledPrice: 3825.00,
    totalValue: 19125.00,
    timeInForce: 'gtc',
    createdAt: '2024-06-12T11:00:00Z',
    updatedAt: '2024-06-12T11:42:15Z',
    filledAt: '2024-06-12T11:42:15Z',
  },
  {
    id: 'ord-003',
    userId: 'user-001',
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    side: 'sell',
    type: 'limit',
    status: 'open',
    quantity: 8,
    filledQuantity: 0,
    limitPrice: 1280.00,
    totalValue: 10240.00,
    timeInForce: 'gtc',
    createdAt: '2024-07-01T14:20:00Z',
    updatedAt: '2024-07-01T14:20:00Z',
  },
  {
    id: 'ord-004',
    userId: 'user-001',
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    side: 'buy',
    type: 'stop_limit',
    status: 'open',
    quantity: 12,
    filledQuantity: 0,
    limitPrice: 1310.00,
    stopPrice: 1325.00,
    totalValue: 15720.00,
    timeInForce: 'day',
    createdAt: '2024-07-02T09:45:00Z',
    updatedAt: '2024-07-02T09:45:00Z',
  },
  {
    id: 'ord-005',
    userId: 'user-001',
    symbol: 'SBI',
    name: 'State Bank of India',
    side: 'buy',
    type: 'market',
    status: 'filled',
    quantity: 18,
    filledQuantity: 18,
    filledPrice: 804.50,
    totalValue: 14481.00,
    timeInForce: 'day',
    createdAt: '2024-06-18T10:15:00Z',
    updatedAt: '2024-06-18T10:15:03Z',
    filledAt: '2024-06-18T10:15:03Z',
  },
  {
    id: 'ord-006',
    userId: 'user-001',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    side: 'buy',
    type: 'limit',
    status: 'partially_filled',
    quantity: 20,
    filledQuantity: 12,
    limitPrice: 1680.00,
    filledPrice: 1675.00,
    totalValue: 20100.00,
    timeInForce: 'gtc',
    createdAt: '2024-06-22T13:30:00Z',
    updatedAt: '2024-06-25T10:00:00Z',
    filledAt: '2024-06-25T10:00:00Z',
  },
  {
    id: 'ord-007',
    userId: 'user-001',
    symbol: 'AXISBANK',
    name: 'Axis Bank Ltd.',
    side: 'buy',
    type: 'limit',
    status: 'cancelled',
    quantity: 6,
    filledQuantity: 0,
    limitPrice: 1098.00,
    totalValue: 6588.00,
    timeInForce: 'day',
    createdAt: '2024-06-28T09:00:00Z',
    updatedAt: '2024-06-28T16:00:00Z',
  },
  {
    id: 'ord-008',
    userId: 'user-001',
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    side: 'buy',
    type: 'market',
    status: 'filled',
    quantity: 14,
    filledQuantity: 14,
    filledPrice: 1760.00,
    totalValue: 24640.00,
    timeInForce: 'day',
    createdAt: '2024-07-01T09:31:00Z',
    updatedAt: '2024-07-01T09:31:01Z',
    filledAt: '2024-07-01T09:31:01Z',
  },
]
