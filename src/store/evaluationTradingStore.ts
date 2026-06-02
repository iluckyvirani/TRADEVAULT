import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OrderSide, OrderStatus, OrderType } from '@/lib/mock/mockOrders'
import type { Instrument } from '@/lib/mock/mockInstruments'
import { getInstrumentById } from '@/lib/mock/mockInstruments'
import { useEvaluationAccountStore } from '@/store/evaluationAccountStore'

export interface EvaluationOrder {
  id: string
  accountId: string
  instrumentId: string
  symbol: string
  name: string
  side: OrderSide
  type: OrderType
  status: OrderStatus
  lots: number
  limitPrice?: number
  stopPrice?: number
  filledPrice?: number
  totalValue: number
  createdAt: string
  updatedAt: string
  filledAt?: string
}

export interface EvaluationPosition {
  id: string
  accountId: string
  instrumentId: string
  symbol: string
  name: string
  lots: number
  avgEntry: number
  ltp: number
  unrealizedPnL: number
  openedAt: string
}

interface PlaceOrderInput {
  accountId: string
  instrument: Instrument
  side: OrderSide
  type: OrderType
  lots: number
  limitPrice?: number
  stopPrice?: number
}

interface EvaluationTradingStore {
  orders: EvaluationOrder[]
  positions: EvaluationPosition[]
  baskets: Record<string, string[]>
  placeOrder: (input: PlaceOrderInput) => EvaluationOrder
  cancelOrder: (orderId: string) => void
  tryFillPendingOrders: (symbol: string, price: number) => void
  updatePositionLtp: (symbol: string, price: number) => void
  getOrdersForAccount: (accountId: string) => EvaluationOrder[]
  getPositionsForAccount: (accountId: string) => EvaluationPosition[]
  getOpenOrdersForAccount: (accountId: string) => EvaluationOrder[]
  addToBasket: (accountId: string, instrumentId: string) => void
  getBasketForAccount: (accountId: string) => string[]
}

let _nextId = 1

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${_nextId++}`
}

function notional(price: number, lots: number, lotSize: number) {
  return parseFloat((price * lots * lotSize).toFixed(2))
}

function syncAccountFromTrading(accountId: string) {
  const { positions, getOrdersForAccount } = useEvaluationTradingStore.getState()
  const accountPositions = positions.filter(
    (p) => p.accountId === accountId && p.lots > 0,
  )

  const unrealizedPnL = accountPositions.reduce((s, p) => s + p.unrealizedPnL, 0)
  const marginUsed = accountPositions.reduce(
    (s, p) => s + p.avgEntry * p.lots * 0.1,
    0,
  )

  const account = useEvaluationAccountStore
    .getState()
    .accounts.find((a) => a.id === accountId)
  if (!account) return

  const equity = account.accountSize + unrealizedPnL
  const freeMargin = Math.max(0, account.accountSize - marginUsed)

  const nextEquity = parseFloat(equity.toFixed(2))
  const nextUnrealized = parseFloat(unrealizedPnL.toFixed(2))
  const nextToday = parseFloat(unrealizedPnL.toFixed(2))
  const nextMarginUsed = parseFloat(marginUsed.toFixed(2))
  const nextFreeMargin = parseFloat(freeMargin.toFixed(2))

  const unchanged =
    account.equity === nextEquity &&
    account.unrealizedPnL === nextUnrealized &&
    account.todayPnL === nextToday &&
    account.marginUsed === nextMarginUsed &&
    account.freeMargin === nextFreeMargin

  if (unchanged) return

  useEvaluationAccountStore.setState((state) => ({
    accounts: state.accounts.map((a) =>
      a.id === accountId
        ? {
            ...a,
            equity: nextEquity,
            unrealizedPnL: nextUnrealized,
            todayPnL: nextToday,
            marginUsed: nextMarginUsed,
            freeMargin: nextFreeMargin,
            balance: a.accountSize,
          }
        : a,
    ),
  }))
}

function applyFillToState(
  state: { positions: EvaluationPosition[] },
  accountId: string,
  instrument: Instrument,
  side: OrderSide,
  lots: number,
  fillPrice: number,
): EvaluationPosition[] {
  const positions = [...state.positions]
  const idx = positions.findIndex(
    (p) => p.accountId === accountId && p.symbol === instrument.symbol,
  )

  if (side === 'buy') {
    if (idx >= 0) {
      const p = positions[idx]
      const newLots = p.lots + lots
      const avgEntry = (p.avgEntry * p.lots + fillPrice * lots) / newLots
      positions[idx] = {
        ...p,
        lots: newLots,
        avgEntry: parseFloat(avgEntry.toFixed(2)),
        ltp: fillPrice,
        unrealizedPnL: 0,
      }
    } else {
      positions.push({
        id: nextId('evpos'),
        accountId,
        instrumentId: instrument.id,
        symbol: instrument.symbol,
        name: instrument.displayName,
        lots,
        avgEntry: fillPrice,
        ltp: fillPrice,
        unrealizedPnL: 0,
        openedAt: new Date().toISOString(),
      })
    }
  } else if (idx >= 0) {
    const p = positions[idx]
    const newLots = p.lots - lots
    if (newLots <= 0) {
      positions.splice(idx, 1)
    } else {
      positions[idx] = {
        ...p,
        lots: newLots,
        ltp: fillPrice,
        unrealizedPnL: parseFloat(((fillPrice - p.avgEntry) * newLots).toFixed(2)),
      }
    }
  }

  return positions
}

export const useEvaluationTradingStore = create<EvaluationTradingStore>()(
  persist(
    (set, get) => ({
      orders: [],
      positions: [],
      baskets: {},

      getOrdersForAccount: (accountId) =>
        get().orders.filter((o) => o.accountId === accountId),

      getOpenOrdersForAccount: (accountId) =>
        get().orders.filter(
          (o) =>
            o.accountId === accountId &&
            (o.status === 'open' || o.status === 'pending'),
        ),

      getPositionsForAccount: (accountId) =>
        get().positions.filter((p) => p.accountId === accountId && p.lots > 0),

      getBasketForAccount: (accountId) => get().baskets[accountId] ?? [],

      addToBasket: (accountId, instrumentId) =>
        set((state) => {
          const current = state.baskets[accountId] ?? []
          if (current.includes(instrumentId)) return state
          return {
            baskets: {
              ...state.baskets,
              [accountId]: [...current, instrumentId],
            },
          }
        }),

      placeOrder: (input) => {
        const { accountId, instrument, side, type, lots } = input
        const price = side === 'buy' ? instrument.ask : instrument.bid
        const lotSize = instrument.lotSize || 1
        const total = notional(price, lots, lotSize)
        const now = new Date().toISOString()
        const id = nextId('evord')

        const account = useEvaluationAccountStore
          .getState()
          .accounts.find((a) => a.id === accountId)

        const rejected: EvaluationOrder = {
          id,
          accountId,
          instrumentId: instrument.id,
          symbol: instrument.symbol,
          name: instrument.displayName,
          side,
          type,
          status: 'rejected',
          lots,
          totalValue: total,
          createdAt: now,
          updatedAt: now,
        }

        if (!account) {
          set((s) => ({ orders: [rejected, ...s.orders] }))
          return rejected
        }

        if (side === 'buy' && total > account.freeMargin) {
          set((s) => ({ orders: [rejected, ...s.orders] }))
          return rejected
        }

        if (side === 'sell') {
          const pos = get().positions.find(
            (p) => p.accountId === accountId && p.symbol === instrument.symbol,
          )
          if (!pos || pos.lots < lots) {
            set((s) => ({ orders: [rejected, ...s.orders] }))
            return rejected
          }
        }

        const isMarket = type === 'market'
        const order: EvaluationOrder = {
          id,
          accountId,
          instrumentId: instrument.id,
          symbol: instrument.symbol,
          name: instrument.displayName,
          side,
          type,
          status: isMarket ? 'filled' : 'open',
          lots,
          limitPrice: input.limitPrice,
          stopPrice: input.stopPrice,
          filledPrice: isMarket ? price : undefined,
          totalValue: total,
          createdAt: now,
          updatedAt: now,
          filledAt: isMarket ? now : undefined,
        }

        set((s) => {
          let positions = s.positions
          if (isMarket) {
            positions = applyFillToState(
              { positions: s.positions },
              accountId,
              instrument,
              side,
              lots,
              price,
            )
          }
          return { orders: [order, ...s.orders], positions }
        })

        if (isMarket) syncAccountFromTrading(accountId)
        return order
      },

      cancelOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId && o.status === 'open'
              ? {
                  ...o,
                  status: 'cancelled' as OrderStatus,
                  updatedAt: new Date().toISOString(),
                }
              : o,
          ),
        })),

      tryFillPendingOrders: (symbol, price) => {
        const state = get()
        const fills: {
          accountId: string
          instrument: Instrument
          side: OrderSide
          lots: number
          fillPrice: number
        }[] = []

        const updatedOrders = state.orders.map((order): EvaluationOrder => {
          if (order.symbol !== symbol || order.status !== 'open') return order

          let shouldFill = false
          let fillPrice = price

          if (order.type === 'limit' && order.limitPrice !== undefined) {
            if (order.side === 'buy' && price <= order.limitPrice) {
              shouldFill = true
              fillPrice = order.limitPrice
            } else if (order.side === 'sell' && price >= order.limitPrice) {
              shouldFill = true
              fillPrice = order.limitPrice
            }
          } else if (order.type === 'stop' && order.stopPrice !== undefined) {
            if (order.side === 'sell' && price <= order.stopPrice) shouldFill = true
            if (order.side === 'buy' && price >= order.stopPrice) shouldFill = true
          }

          if (!shouldFill) return order

          const inst = getInstrumentById(order.instrumentId)
          if (inst) {
            fills.push({
              accountId: order.accountId,
              instrument: inst,
              side: order.side,
              lots: order.lots,
              fillPrice,
            })
          }

          const now = new Date().toISOString()
          return {
            ...order,
            status: 'filled',
            filledPrice: fillPrice,
            totalValue: parseFloat((fillPrice * order.lots).toFixed(2)),
            updatedAt: now,
            filledAt: now,
          }
        })

        if (fills.length === 0) return

        set((s) => {
          let positions = s.positions
          for (const f of fills) {
            positions = applyFillToState(
              { positions },
              f.accountId,
              f.instrument,
              f.side,
              f.lots,
              f.fillPrice,
            )
          }
          return { orders: updatedOrders, positions }
        })

        const accountIds = [...new Set(fills.map((f) => f.accountId))]
        accountIds.forEach(syncAccountFromTrading)
      },

      updatePositionLtp: (symbol, price) => {
        let changed = false
        set((state) => {
          const positions = state.positions.map((p) => {
            if (p.symbol !== symbol) return p
            const nextUnrealized = parseFloat(((price - p.avgEntry) * p.lots).toFixed(2))
            if (p.ltp === price && p.unrealizedPnL === nextUnrealized) return p
            changed = true
            return {
              ...p,
              ltp: price,
              unrealizedPnL: nextUnrealized,
            }
          })
          return changed ? { positions } : state
        })

        if (!changed) return

        const accountIds = new Set(
          get()
            .positions.filter((p) => p.symbol === symbol)
            .map((p) => p.accountId),
        )
        accountIds.forEach(syncAccountFromTrading)
      },
    }),
    { name: 'tv-evaluation-trading' },
  ),
)
