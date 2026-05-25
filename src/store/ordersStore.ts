import { create } from 'zustand'
import { mockOrders } from '@/lib/mock'
import type { Order, OrderSide, OrderType, OrderTimeInForce, OrderStatus } from '@/lib/mock'
import { usePortfolioStore } from '@/store/portfolioStore'

export interface OrderDraft {
  symbol: string
  name: string
  side: OrderSide
  type: OrderType
  quantity: number
  limitPrice?: number
  stopPrice?: number
  currentPrice: number
  timeInForce: OrderTimeInForce
}

interface FillRecord {
  side: OrderSide
  symbol: string
  name: string
  quantity: number
  fillPrice: number
}

interface OrdersState {
  orders: Order[]
  placeOrder: (draft: OrderDraft) => Order
  cancelOrder: (id: string) => void
  /**
   * Called by useMockTicker on every price tick.
   * Checks all open limit/stop/stop_limit orders for the given symbol
   * and fills those whose price conditions are now met.
   */
  tryFillPendingOrders: (symbol: string, price: number) => void
}

let _nextId = mockOrders.length + 1

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [...mockOrders],

  placeOrder: (draft) => {
    const id = `ord-${String(_nextId++).padStart(3, '0')}`
    const now = new Date().toISOString()
    const isMarket = draft.type === 'market'
    const reservePrice = draft.limitPrice ?? draft.stopPrice ?? draft.currentPrice
    const estTotal = parseFloat((reservePrice * draft.quantity).toFixed(2))

    // ── Validation ─────────────────────────────────────────────────────────
    const { portfolio } = usePortfolioStore.getState()

    if (draft.side === 'buy' && portfolio.cashBalance < estTotal) {
      const rejected: Order = {
        id,
        userId: 'user-001',
        symbol: draft.symbol,
        name: draft.name,
        side: draft.side,
        type: draft.type,
        status: 'rejected',
        quantity: draft.quantity,
        filledQuantity: 0,
        limitPrice: draft.limitPrice,
        stopPrice: draft.stopPrice,
        totalValue: estTotal,
        timeInForce: draft.timeInForce,
        createdAt: now,
        updatedAt: now,
      }
      set((state) => ({ orders: [rejected, ...state.orders] }))
      return rejected
    }

    if (draft.side === 'sell') {
      const pos = portfolio.positions.find((p) => p.symbol === draft.symbol)
      if (!pos || pos.quantity < draft.quantity) {
        const rejected: Order = {
          id,
          userId: 'user-001',
          symbol: draft.symbol,
          name: draft.name,
          side: draft.side,
          type: draft.type,
          status: 'rejected',
          quantity: draft.quantity,
          filledQuantity: 0,
          limitPrice: draft.limitPrice,
          stopPrice: draft.stopPrice,
          totalValue: parseFloat((draft.currentPrice * draft.quantity).toFixed(2)),
          timeInForce: draft.timeInForce,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ orders: [rejected, ...state.orders] }))
        return rejected
      }
    }

    // ── Build order ─────────────────────────────────────────────────────────
    const fillPrice = isMarket ? draft.currentPrice : undefined
    const order: Order = {
      id,
      userId: 'user-001',
      symbol: draft.symbol,
      name: draft.name,
      side: draft.side,
      type: draft.type,
      status: isMarket ? 'filled' : 'open',
      quantity: draft.quantity,
      filledQuantity: isMarket ? draft.quantity : 0,
      limitPrice: draft.limitPrice,
      stopPrice: draft.stopPrice,
      filledPrice: fillPrice,
      stopTriggered: false,
      totalValue: isMarket
        ? parseFloat((draft.currentPrice * draft.quantity).toFixed(2))
        : estTotal,
      timeInForce: draft.timeInForce,
      createdAt: now,
      updatedAt: now,
      filledAt: isMarket ? now : undefined,
    }

    set((state) => ({ orders: [order, ...state.orders] }))

    // For market orders, apply fill immediately to portfolio
    if (isMarket) {
      usePortfolioStore.getState().applyFill(
        draft.side,
        draft.symbol,
        draft.name,
        draft.quantity,
        draft.currentPrice,
      )
    }

    return order
  },

  cancelOrder: (id) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id && (o.status === 'open' || o.status === 'pending')
          ? { ...o, status: 'cancelled' as OrderStatus, updatedAt: new Date().toISOString() }
          : o,
      ),
    })),

  tryFillPendingOrders: (symbol, price) => {
    const state = get()
    const fills: FillRecord[] = []

    const updatedOrders = state.orders.map((order): Order => {
      // Only process open orders for the ticked symbol
      if (order.symbol !== symbol || order.status !== 'open') return order

      let shouldFill = false
      let fillPrice = price
      let stopTriggered = order.stopTriggered ?? false

      if (order.type === 'limit') {
        // Limit buy: fill when market price falls to or below limit
        // Limit sell: fill when market price rises to or above limit
        if (
          order.side === 'buy' &&
          order.limitPrice !== undefined &&
          price <= order.limitPrice
        ) {
          shouldFill = true
          fillPrice = order.limitPrice
        } else if (
          order.side === 'sell' &&
          order.limitPrice !== undefined &&
          price >= order.limitPrice
        ) {
          shouldFill = true
          fillPrice = order.limitPrice
        }
      } else if (order.type === 'stop') {
        // Stop sell (stop-loss): triggers when price drops to or below stop
        // Stop buy: triggers when price rises to or above stop (breakout entry)
        if (order.side === 'sell' && order.stopPrice !== undefined && price <= order.stopPrice) {
          shouldFill = true
          fillPrice = price // market fill at current price
        } else if (
          order.side === 'buy' &&
          order.stopPrice !== undefined &&
          price >= order.stopPrice
        ) {
          shouldFill = true
          fillPrice = price
        }
      } else if (order.type === 'stop_limit') {
        if (!stopTriggered) {
          // Phase 1 — check if stop is triggered
          const triggered =
            (order.side === 'sell' &&
              order.stopPrice !== undefined &&
              price <= order.stopPrice) ||
            (order.side === 'buy' &&
              order.stopPrice !== undefined &&
              price >= order.stopPrice)
          if (triggered) {
            stopTriggered = true
            // Immediately check if limit is also satisfied on same tick
            const limitOk =
              (order.side === 'sell' &&
                order.limitPrice !== undefined &&
                price >= order.limitPrice) ||
              (order.side === 'buy' &&
                order.limitPrice !== undefined &&
                price <= order.limitPrice)
            if (limitOk) {
              shouldFill = true
              fillPrice = order.limitPrice!
            }
          }
        } else {
          // Phase 2 — stop already triggered, wait for limit
          const limitOk =
            (order.side === 'sell' &&
              order.limitPrice !== undefined &&
              price >= order.limitPrice) ||
            (order.side === 'buy' &&
              order.limitPrice !== undefined &&
              price <= order.limitPrice)
          if (limitOk) {
            shouldFill = true
            fillPrice = order.limitPrice!
          }
        }
      }

      if (shouldFill) {
        const now = new Date().toISOString()
        fills.push({
          side: order.side,
          symbol: order.symbol,
          name: order.name,
          quantity: order.quantity,
          fillPrice,
        })
        return {
          ...order,
          status: 'filled' as OrderStatus,
          filledQuantity: order.quantity,
          filledPrice: fillPrice,
          totalValue: parseFloat((fillPrice * order.quantity).toFixed(2)),
          stopTriggered,
          updatedAt: now,
          filledAt: now,
        }
      }

      // Persist stop-triggered state even if limit not yet met
      if (stopTriggered !== (order.stopTriggered ?? false)) {
        return { ...order, stopTriggered }
      }

      return order
    })

    // Only call set if there are actual changes
    const changed = updatedOrders.some((o, i) => o !== state.orders[i])
    if (changed) {
      set({ orders: updatedOrders })
    }

    // Apply fills to portfolio outside set callback
    if (fills.length > 0) {
      const { applyFill } = usePortfolioStore.getState()
      fills.forEach(({ side, symbol: sym, name, quantity, fillPrice }) => {
        applyFill(side, sym, name, quantity, fillPrice)
      })
    }
  },
}))
