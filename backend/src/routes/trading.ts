import { Router } from 'express'
import { z } from 'zod'
import {
  cancelOrder,
  getTradingState,
  listOrders,
  listPositions,
  placeBasketOrders,
  placeOrder,
  syncQuoteForAccount,
} from '../services/tradingService.js'
import {
  createBasket,
  getBaskets,
  saveBaskets,
  setActiveBasket,
  setBasketSizeMode,
} from '../services/basketService.js'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'

const placeOrderSchema = z.object({
  instrumentId: z.string().min(1),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit', 'stop']),
  lots: z.number().int().positive(),
  limitPrice: z.number().optional().nullable(),
  stopPrice: z.number().optional().nullable(),
  triggerPrice: z.number().optional().nullable(),
  takeProfitPrice: z.number().optional().nullable(),
  stopLossPrice: z.number().optional().nullable(),
})

const syncQuoteSchema = z.object({
  symbol: z.string().min(1),
  price: z.number().positive(),
})

const basketsSchema = z.object({
  baskets: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      instrumentIds: z.array(z.string()),
    }),
  ),
  activeBasketId: z.string().nullable().optional(),
  basketSizeMode: z.enum(['contracts', 'lots']).optional(),
})

export const accountTradingRouter = Router({ mergeParams: true })

accountTradingRouter.use(requireAuth)

function accountId(req: import('express').Request) {
  return String((req.params as { id: string }).id)
}

accountTradingRouter.get('/trading', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const id = accountId(req)
    const state = await getTradingState(userId, id)
    const baskets = await getBaskets(userId, id)
    res.json({ ...state, ...baskets })
  } catch (e) {
    next(e)
  }
})

accountTradingRouter.get('/orders', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const orders = await listOrders(userId, accountId(req))
    res.json({ orders })
  } catch (e) {
    next(e)
  }
})

accountTradingRouter.post('/orders', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const body = placeOrderSchema.parse(req.body)
    const result = await placeOrder(userId, accountId(req), body)
    res.status(201).json(result)
  } catch (e) {
    next(e)
  }
})

accountTradingRouter.post('/orders/basket', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const result = await placeBasketOrders(userId, accountId(req))
    res.status(201).json(result)
  } catch (e) {
    next(e)
  }
})

accountTradingRouter.delete('/orders/:orderId', async (req, res, next) => {
  try {
    const { userId } = req as unknown as AuthedRequest
    const result = await cancelOrder(
      userId,
      accountId(req),
      String((req.params as { orderId: string }).orderId),
    )
    res.json(result)
  } catch (e) {
    next(e)
  }
})

accountTradingRouter.get('/positions', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const positions = await listPositions(userId, accountId(req))
    res.json({ positions })
  } catch (e) {
    next(e)
  }
})

accountTradingRouter.post('/trading/sync-quote', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const body = syncQuoteSchema.parse(req.body)
    const result = await syncQuoteForAccount(
      userId,
      accountId(req),
      body.symbol,
      body.price,
    )
    res.json(result)
  } catch (e) {
    next(e)
  }
})

accountTradingRouter.get('/baskets', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const baskets = await getBaskets(userId, accountId(req))
    res.json(baskets)
  } catch (e) {
    next(e)
  }
})

accountTradingRouter.put('/baskets', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const body = basketsSchema.parse(req.body)
    const baskets = await saveBaskets(userId, accountId(req), body)
    res.json(baskets)
  } catch (e) {
    next(e)
  }
})

accountTradingRouter.post('/baskets', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const baskets = await createBasket(userId, accountId(req))
    res.status(201).json(baskets)
  } catch (e) {
    next(e)
  }
})

accountTradingRouter.patch('/baskets/active', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const basketId = z.string().parse(req.body?.basketId)
    const baskets = await setActiveBasket(userId, accountId(req), basketId)
    res.json(baskets)
  } catch (e) {
    next(e)
  }
})

accountTradingRouter.patch('/baskets/size-mode', async (req, res, next) => {
  try {
    const { userId } = req as AuthedRequest
    const mode = z.enum(['contracts', 'lots']).parse(req.body?.mode)
    const baskets = await setBasketSizeMode(userId, accountId(req), mode)
    res.json(baskets)
  } catch (e) {
    next(e)
  }
})
