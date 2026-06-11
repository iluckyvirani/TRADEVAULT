import { create } from 'zustand'
import type { OrderSide, OrderStatus, OrderType } from '@/lib/mock/mockOrders'
import type { Instrument } from '@/lib/mock/mockInstruments'
import * as tradingApi from '@/lib/api/trading'
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
  triggerPrice?: number
  takeProfitPrice?: number
  stopLossPrice?: number
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
  triggerPrice?: number
  takeProfitPrice?: number
  stopLossPrice?: number
}

export interface TradingBasket {
  id: string
  name: string
  instrumentIds: string[]
}

export type BasketSizeMode = 'contracts' | 'lots'

interface EvaluationTradingStore {
  orders: EvaluationOrder[]
  positions: EvaluationPosition[]
  basketSets: Record<string, TradingBasket[]>
  activeBasketByAccount: Record<string, string | null>
  basketSizeMode: BasketSizeMode
  tradingReady: Record<string, boolean>
  hydrateTrading: (accountId: string) => Promise<void>
  placeOrder: (input: PlaceOrderInput) => Promise<EvaluationOrder>
  cancelOrder: (accountId: string, orderId: string) => Promise<void>
  tryFillPendingOrders: (accountId: string, symbol: string, price: number) => Promise<void>
  updatePositionLtp: (accountId: string, symbol: string, price: number) => Promise<void>
  getOrdersForAccount: (accountId: string) => EvaluationOrder[]
  getPositionsForAccount: (accountId: string) => EvaluationPosition[]
  getOpenOrdersForAccount: (accountId: string) => EvaluationOrder[]
  createBasket: (accountId: string) => Promise<string>
  setActiveBasket: (accountId: string, basketId: string) => Promise<void>
  getBasketsForAccount: (accountId: string) => TradingBasket[]
  getActiveBasket: (accountId: string) => TradingBasket | null
  addToBasket: (accountId: string, instrumentId: string) => Promise<void>
  removeFromBasket: (accountId: string, instrumentId: string) => Promise<void>
  getBasketForAccount: (accountId: string) => string[]
  setBasketSizeMode: (mode: BasketSizeMode) => Promise<void>
  placeBasketOrders: (accountId: string) => Promise<number>
}

function mergeAccountOrders(
  orders: EvaluationOrder[],
  accountId: string,
  next: EvaluationOrder[],
) {
  return [...next, ...orders.filter((o) => o.accountId !== accountId)]
}

function mergeAccountPositions(
  positions: EvaluationPosition[],
  accountId: string,
  next: EvaluationPosition[],
) {
  return [...next, ...positions.filter((p) => p.accountId !== accountId)]
}

function applyBasketState(
  state: EvaluationTradingStore,
  accountId: string,
  data: {
    baskets: TradingBasket[]
    activeBasketId: string | null
    basketSizeMode: BasketSizeMode
  },
) {
  return {
    basketSets: { ...state.basketSets, [accountId]: data.baskets },
    activeBasketByAccount: {
      ...state.activeBasketByAccount,
      [accountId]: data.activeBasketId,
    },
    basketSizeMode: data.basketSizeMode,
  }
}

async function persistBaskets(accountId: string) {
  const state = useEvaluationTradingStore.getState()
  const baskets = state.basketSets[accountId] ?? []
  const activeBasketId = state.activeBasketByAccount[accountId] ?? null
  const data = await tradingApi.saveBaskets(accountId, {
    baskets,
    activeBasketId,
    basketSizeMode: state.basketSizeMode,
  })
  useEvaluationTradingStore.setState((s) => applyBasketState(s, accountId, data))
}

export const useEvaluationTradingStore = create<EvaluationTradingStore>()((set, get) => ({
  orders: [],
  positions: [],
  basketSets: {},
  activeBasketByAccount: {},
  basketSizeMode: 'lots',
  tradingReady: {},

  hydrateTrading: async (accountId) => {
    try {
      const data = await tradingApi.fetchTradingState(accountId)
      set((state) => ({
        orders: mergeAccountOrders(state.orders, accountId, data.orders),
        positions: mergeAccountPositions(state.positions, accountId, data.positions),
        ...applyBasketState(state, accountId, data),
        tradingReady: { ...state.tradingReady, [accountId]: true },
      }))
    } catch {
      set((state) => ({
        tradingReady: { ...state.tradingReady, [accountId]: true },
      }))
    }
  },

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

  getBasketsForAccount: (accountId) => get().basketSets[accountId] ?? [],

  getActiveBasket: (accountId) => {
    const activeId = get().activeBasketByAccount[accountId]
    if (!activeId) return null
    return get().basketSets[accountId]?.find((b) => b.id === activeId) ?? null
  },

  getBasketForAccount: (accountId) => {
    const active = get().getActiveBasket(accountId)
    return active?.instrumentIds ?? []
  },

  createBasket: async (accountId) => {
    const data = await tradingApi.createBasket(accountId)
    set((state) => applyBasketState(state, accountId, data))
    return data.activeBasketId ?? data.baskets[data.baskets.length - 1]?.id ?? ''
  },

  setActiveBasket: async (accountId, basketId) => {
    const data = await tradingApi.setActiveBasketApi(accountId, basketId)
    set((state) => applyBasketState(state, accountId, data))
  },

  addToBasket: async (accountId, instrumentId) => {
    let activeId = get().activeBasketByAccount[accountId]
    if (!activeId) {
      activeId = await get().createBasket(accountId)
    }

    set((state) => {
      const sets = state.basketSets[accountId] ?? []
      const idx = sets.findIndex((b) => b.id === activeId)
      if (idx < 0) return state
      const basket = sets[idx]
      if (basket.instrumentIds.includes(instrumentId)) return state
      const updated = [...sets]
      updated[idx] = {
        ...basket,
        instrumentIds: [...basket.instrumentIds, instrumentId],
      }
      return { basketSets: { ...state.basketSets, [accountId]: updated } }
    })

    await persistBaskets(accountId)
  },

  removeFromBasket: async (accountId, instrumentId) => {
    const activeId = get().activeBasketByAccount[accountId]
    if (!activeId) return

    set((state) => {
      const sets = state.basketSets[accountId] ?? []
      const updated = sets.map((b) =>
        b.id === activeId
          ? {
              ...b,
              instrumentIds: b.instrumentIds.filter((x) => x !== instrumentId),
            }
          : b,
      )
      return { basketSets: { ...state.basketSets, [accountId]: updated } }
    })

    await persistBaskets(accountId)
  },

  setBasketSizeMode: async (mode) => {
    set({ basketSizeMode: mode })
    const accountId = useEvaluationAccountStore.getState().activeAccountId
    if (!accountId) return
    const data = await tradingApi.setBasketSizeModeApi(accountId, mode)
    set((state) => applyBasketState(state, accountId, data))
  },

  placeBasketOrders: async (accountId) => {
    const result = await tradingApi.placeBasketOrders(accountId)
    if (result.account) {
      useEvaluationAccountStore.getState().upsertAccount(result.account)
    }
    await get().hydrateTrading(accountId)
    return result.placed
  },

  placeOrder: async (input) => {
    const orderType =
      input.type === 'stop_limit' ? 'stop' : input.type

    const { order, account, positions } = await tradingApi.placeOrder(input.accountId, {
      instrumentId: input.instrument.id,
      side: input.side,
      type: orderType,
      lots: input.lots,
      limitPrice: input.limitPrice,
      stopPrice: input.stopPrice,
      triggerPrice: input.triggerPrice,
      takeProfitPrice: input.takeProfitPrice,
      stopLossPrice: input.stopLossPrice,
    })

    set((state) => ({
      orders: [order, ...state.orders.filter((o) => o.id !== order.id)],
      positions: positions
        ? mergeAccountPositions(state.positions, input.accountId, positions)
        : state.positions,
    }))

    if (account) {
      useEvaluationAccountStore.getState().upsertAccount(account)
    }

    return order
  },

  cancelOrder: async (accountId, orderId) => {
    const { order } = await tradingApi.cancelOrder(accountId, orderId)
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? order : o)),
    }))
  },

  tryFillPendingOrders: async (accountId, symbol, price) => {
    const result = await tradingApi.syncQuote(accountId, symbol, price)
    set((state) => ({
      orders: mergeAccountOrders(state.orders, accountId, result.orders),
      positions: mergeAccountPositions(state.positions, accountId, result.positions),
    }))
    if (result.account) {
      useEvaluationAccountStore.getState().upsertAccount(result.account)
    }
  },

  updatePositionLtp: async (accountId, symbol, price) => {
    await get().tryFillPendingOrders(accountId, symbol, price)
  },
}))
