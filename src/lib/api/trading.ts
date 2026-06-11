import { apiFetch } from '@/lib/api/client'
import type { EvaluationAccount } from '@/lib/mock/mockEvaluationAccounts'
import type {
  EvaluationOrder,
  EvaluationPosition,
  TradingBasket,
  BasketSizeMode,
} from '@/store/evaluationTradingStore'

export interface TradingStateResponse {
  orders: EvaluationOrder[]
  positions: EvaluationPosition[]
  baskets: TradingBasket[]
  activeBasketId: string | null
  basketSizeMode: BasketSizeMode
}

export interface PlaceOrderInput {
  instrumentId: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop'
  lots: number
  limitPrice?: number | null
  stopPrice?: number | null
  triggerPrice?: number | null
  takeProfitPrice?: number | null
  stopLossPrice?: number | null
}

export async function fetchTradingState(accountId: string) {
  return apiFetch<TradingStateResponse>(`/accounts/${accountId}/trading`)
}

export async function placeOrder(accountId: string, input: PlaceOrderInput) {
  return apiFetch<{
    order: EvaluationOrder
    account?: EvaluationAccount
    positions?: EvaluationPosition[]
  }>(`/accounts/${accountId}/orders`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function cancelOrder(accountId: string, orderId: string) {
  return apiFetch<{ order: EvaluationOrder }>(
    `/accounts/${accountId}/orders/${orderId}`,
    { method: 'DELETE' },
  )
}

export async function syncQuote(accountId: string, symbol: string, price: number) {
  return apiFetch<{
    orders: EvaluationOrder[]
    positions: EvaluationPosition[]
    account: EvaluationAccount | null
  }>(`/accounts/${accountId}/trading/sync-quote`, {
    method: 'POST',
    body: JSON.stringify({ symbol, price }),
  })
}

export async function placeBasketOrders(accountId: string) {
  return apiFetch<{
    placed: number
    orders: EvaluationOrder[]
    account?: EvaluationAccount | null
  }>(`/accounts/${accountId}/orders/basket`, { method: 'POST' })
}

export async function saveBaskets(
  accountId: string,
  input: {
    baskets: TradingBasket[]
    activeBasketId: string | null
    basketSizeMode: BasketSizeMode
  },
) {
  return apiFetch<{
    baskets: TradingBasket[]
    activeBasketId: string | null
    basketSizeMode: BasketSizeMode
  }>(`/accounts/${accountId}/baskets`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export async function createBasket(accountId: string) {
  return apiFetch<{
    baskets: TradingBasket[]
    activeBasketId: string | null
    basketSizeMode: BasketSizeMode
  }>(`/accounts/${accountId}/baskets`, { method: 'POST' })
}

export async function setActiveBasketApi(accountId: string, basketId: string) {
  return apiFetch<{
    baskets: TradingBasket[]
    activeBasketId: string | null
    basketSizeMode: BasketSizeMode
  }>(`/accounts/${accountId}/baskets/active`, {
    method: 'PATCH',
    body: JSON.stringify({ basketId }),
  })
}

export async function setBasketSizeModeApi(accountId: string, mode: BasketSizeMode) {
  return apiFetch<{
    baskets: TradingBasket[]
    activeBasketId: string | null
    basketSizeMode: BasketSizeMode
  }>(`/accounts/${accountId}/baskets/size-mode`, {
    method: 'PATCH',
    body: JSON.stringify({ mode }),
  })
}
