import type {
  EvaluationOrder,
  EvaluationPosition,
  TradingBasket,
  BasketSizeMode,
} from '@prisma/client'

function num(v: { toString(): string } | number | null | undefined): number {
  if (v == null) return 0
  return typeof v === 'number' ? v : Number(v)
}

export function serializeOrder(order: EvaluationOrder) {
  return {
    id: order.id,
    accountId: order.accountId,
    instrumentId: order.instrumentId,
    symbol: order.symbol,
    name: order.name,
    side: order.side,
    type: order.type,
    status: order.status,
    lots: order.lots,
    limitPrice: order.limitPrice != null ? num(order.limitPrice) : undefined,
    stopPrice: order.stopPrice != null ? num(order.stopPrice) : undefined,
    triggerPrice: order.triggerPrice != null ? num(order.triggerPrice) : undefined,
    takeProfitPrice: order.takeProfitPrice != null ? num(order.takeProfitPrice) : undefined,
    stopLossPrice: order.stopLossPrice != null ? num(order.stopLossPrice) : undefined,
    filledPrice: order.filledPrice != null ? num(order.filledPrice) : undefined,
    totalValue: num(order.totalValue),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    filledAt: order.filledAt?.toISOString(),
  }
}

export function serializePosition(position: EvaluationPosition) {
  return {
    id: position.id,
    accountId: position.accountId,
    instrumentId: position.instrumentId,
    symbol: position.symbol,
    name: position.name,
    lots: position.lots,
    avgEntry: num(position.avgEntry),
    ltp: num(position.ltp),
    unrealizedPnL: num(position.unrealizedPnL),
    openedAt: position.openedAt.toISOString(),
  }
}

export function serializeBasket(basket: TradingBasket) {
  return {
    id: basket.id,
    name: basket.name,
    instrumentIds: basket.instrumentIds,
  }
}

export function serializeBasketState(input: {
  baskets: TradingBasket[]
  activeBasketId: string | null
  basketSizeMode: BasketSizeMode
}) {
  return {
    baskets: input.baskets.map(serializeBasket),
    activeBasketId: input.activeBasketId,
    basketSizeMode: input.basketSizeMode,
  }
}
