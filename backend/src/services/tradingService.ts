import type { Instrument, OrderSide, OrderType } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { AppError, assertFound } from '../lib/errors.js'
import { serializeAccount } from '../utils/accountSerializer.js'
import {
  serializeOrder,
  serializePosition,
} from '../utils/tradingSerializer.js'

let orderSeq = 0

function nextOrderId() {
  orderSeq += 1
  return `evord-${Date.now()}-${orderSeq}`
}

function num(v: { toString(): string } | number | null | undefined): number {
  if (v == null) return 0
  return typeof v === 'number' ? v : Number(v)
}

function notional(price: number, lots: number, lotSize: number) {
  return parseFloat((price * lots * lotSize).toFixed(2))
}

async function assertAccountOwner(accountId: string, userId: string) {
  const account = await prisma.evaluationAccount.findFirst({
    where: { id: accountId, userId },
  })
  return assertFound(account, 'Account not found')
}

async function getQuoteForInstrument(instrumentId: string) {
  const instrument = await prisma.instrument.findUnique({ where: { id: instrumentId } })
  if (!instrument) {
    throw new AppError(404, 'Instrument not found', 'INSTRUMENT_NOT_FOUND')
  }

  const quote = await prisma.marketQuote.findUnique({ where: { symbol: instrument.symbol } })
  const lastPrice = quote ? num(quote.price) : num(instrument.lastPrice)
  const bid = num(instrument.bid) || lastPrice
  const ask = num(instrument.ask) || lastPrice

  return { instrument, bid, ask, lastPrice }
}

export async function syncAccountEquity(accountId: string) {
  const account = await prisma.evaluationAccount.findUnique({ where: { id: accountId } })
  if (!account) return null

  const positions = await prisma.evaluationPosition.findMany({
    where: { accountId, lots: { gt: 0 } },
  })

  const unrealizedPnL = positions.reduce((s, p) => s + num(p.unrealizedPnL), 0)
  const marginUsed = positions.reduce(
    (s, p) => s + num(p.avgEntry) * p.lots * 0.1,
    0,
  )
  const accountSize = num(account.accountSize)
  const equity = accountSize + unrealizedPnL
  const freeMargin = Math.max(0, accountSize - marginUsed)

  const updated = await prisma.evaluationAccount.update({
    where: { id: accountId },
    data: {
      equity: parseFloat(equity.toFixed(2)),
      unrealizedPnL: parseFloat(unrealizedPnL.toFixed(2)),
      todayPnL: parseFloat(unrealizedPnL.toFixed(2)),
      marginUsed: parseFloat(marginUsed.toFixed(2)),
      freeMargin: parseFloat(freeMargin.toFixed(2)),
      balance: accountSize,
    },
  })

  return serializeAccount(updated)
}

async function applyFill(
  accountId: string,
  instrument: Instrument,
  side: OrderSide,
  lots: number,
  fillPrice: number,
) {
  const key = { accountId, instrumentId: instrument.id }

  if (side === 'buy') {
    const existing = await prisma.evaluationPosition.findUnique({
      where: { accountId_instrumentId: key },
    })

    if (existing) {
      const newLots = existing.lots + lots
      const avgEntry =
        (num(existing.avgEntry) * existing.lots + fillPrice * lots) / newLots
      await prisma.evaluationPosition.update({
        where: { id: existing.id },
        data: {
          lots: newLots,
          avgEntry: parseFloat(avgEntry.toFixed(4)),
          ltp: fillPrice,
          unrealizedPnL: 0,
        },
      })
    } else {
      await prisma.evaluationPosition.create({
        data: {
          accountId,
          instrumentId: instrument.id,
          symbol: instrument.symbol,
          name: instrument.displayName,
          lots,
          avgEntry: fillPrice,
          ltp: fillPrice,
          unrealizedPnL: 0,
        },
      })
    }
    return
  }

  const existing = await prisma.evaluationPosition.findUnique({
    where: { accountId_instrumentId: key },
  })
  if (!existing) return

  const newLots = existing.lots - lots
  if (newLots <= 0) {
    await prisma.evaluationPosition.delete({ where: { id: existing.id } })
    return
  }

  const unrealized = (fillPrice - num(existing.avgEntry)) * newLots
  await prisma.evaluationPosition.update({
    where: { id: existing.id },
    data: {
      lots: newLots,
      ltp: fillPrice,
      unrealizedPnL: parseFloat(unrealized.toFixed(2)),
    },
  })
}

function shouldFillOrder(
  order: {
    type: OrderType
    side: OrderSide
    limitPrice: { toString(): string } | null
    stopPrice: { toString(): string } | null
  },
  price: number,
): { fill: boolean; fillPrice: number } {
  if (order.type === 'limit' && order.limitPrice != null) {
    const limit = num(order.limitPrice)
    if (order.side === 'buy' && price <= limit) {
      return { fill: true, fillPrice: limit }
    }
    if (order.side === 'sell' && price >= limit) {
      return { fill: true, fillPrice: limit }
    }
    return { fill: false, fillPrice: price }
  }

  if (order.type === 'stop' && order.stopPrice != null) {
    const stop = num(order.stopPrice)
    if (order.side === 'sell' && price <= stop) {
      return { fill: true, fillPrice: price }
    }
    if (order.side === 'buy' && price >= stop) {
      return { fill: true, fillPrice: price }
    }
  }

  return { fill: false, fillPrice: price }
}

async function createRejectedOrder(input: {
  accountId: string
  instrument: Instrument
  side: OrderSide
  type: OrderType
  lots: number
  totalValue: number
  limitPrice?: number | null
  stopPrice?: number | null
  triggerPrice?: number | null
  takeProfitPrice?: number | null
  stopLossPrice?: number | null
}) {
  const now = new Date()
  const order = await prisma.evaluationOrder.create({
    data: {
      id: nextOrderId(),
      accountId: input.accountId,
      instrumentId: input.instrument.id,
      symbol: input.instrument.symbol,
      name: input.instrument.displayName,
      side: input.side,
      type: input.type,
      status: 'rejected',
      lots: input.lots,
      limitPrice: input.limitPrice ?? null,
      stopPrice: input.stopPrice ?? null,
      triggerPrice: input.triggerPrice ?? null,
      takeProfitPrice: input.takeProfitPrice ?? null,
      stopLossPrice: input.stopLossPrice ?? null,
      totalValue: input.totalValue,
      createdAt: now,
      updatedAt: now,
    },
  })
  return serializeOrder(order)
}

export async function listOrders(userId: string, accountId: string) {
  await assertAccountOwner(accountId, userId)
  const orders = await prisma.evaluationOrder.findMany({
    where: { accountId },
    orderBy: { createdAt: 'desc' },
  })
  return orders.map(serializeOrder)
}

export async function listPositions(userId: string, accountId: string) {
  await assertAccountOwner(accountId, userId)
  const positions = await prisma.evaluationPosition.findMany({
    where: { accountId, lots: { gt: 0 } },
    orderBy: { openedAt: 'desc' },
  })
  return positions.map(serializePosition)
}

export async function getTradingState(userId: string, accountId: string) {
  await assertAccountOwner(accountId, userId)
  const [orders, positions] = await Promise.all([
    prisma.evaluationOrder.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.evaluationPosition.findMany({
      where: { accountId, lots: { gt: 0 } },
      orderBy: { openedAt: 'desc' },
    }),
  ])
  return {
    orders: orders.map(serializeOrder),
    positions: positions.map(serializePosition),
  }
}

export async function placeOrder(
  userId: string,
  accountId: string,
  input: {
    instrumentId: string
    side: OrderSide
    type: OrderType
    lots: number
    limitPrice?: number | null
    stopPrice?: number | null
    triggerPrice?: number | null
    takeProfitPrice?: number | null
    stopLossPrice?: number | null
  },
) {
  const account = await assertAccountOwner(accountId, userId)
  if (account.status !== 'active') {
    throw new AppError(400, 'Account is not active', 'ACCOUNT_INACTIVE')
  }

  const { instrument, bid, ask } = await getQuoteForInstrument(input.instrumentId)
  if (!instrument.isTradable || instrument.viewOnly) {
    throw new AppError(400, 'Instrument is not tradable', 'NOT_TRADABLE')
  }

  const price = input.side === 'buy' ? ask : bid
  const lotSize = instrument.lotSize || 1
  const total = notional(price, input.lots, lotSize)
  const now = new Date()

  const rejectBase = {
    accountId,
    instrument,
    side: input.side,
    type: input.type,
    lots: input.lots,
    totalValue: total,
    limitPrice: input.limitPrice,
    stopPrice: input.stopPrice,
    triggerPrice: input.triggerPrice,
    takeProfitPrice: input.takeProfitPrice,
    stopLossPrice: input.stopLossPrice,
  }

  if (input.side === 'buy' && total > num(account.freeMargin)) {
    const order = await createRejectedOrder(rejectBase)
    return { order, account: serializeAccount(account) }
  }

  if (input.side === 'sell') {
    const pos = await prisma.evaluationPosition.findUnique({
      where: {
        accountId_instrumentId: { accountId, instrumentId: instrument.id },
      },
    })
    if (!pos || pos.lots < input.lots) {
      const order = await createRejectedOrder(rejectBase)
      return { order, account: serializeAccount(account) }
    }
  }

  const isMarket = input.type === 'market'
  const order = await prisma.evaluationOrder.create({
    data: {
      id: nextOrderId(),
      accountId,
      instrumentId: instrument.id,
      symbol: instrument.symbol,
      name: instrument.displayName,
      side: input.side,
      type: input.type,
      status: isMarket ? 'filled' : 'open',
      lots: input.lots,
      limitPrice: input.limitPrice ?? null,
      stopPrice: input.stopPrice ?? null,
      triggerPrice: input.triggerPrice ?? null,
      takeProfitPrice: input.takeProfitPrice ?? null,
      stopLossPrice: input.stopLossPrice ?? null,
      filledPrice: isMarket ? price : null,
      totalValue: total,
      createdAt: now,
      updatedAt: now,
      filledAt: isMarket ? now : null,
    },
  })

  if (isMarket) {
    await applyFill(accountId, instrument, input.side, input.lots, price)
  }

  const updatedAccount = isMarket
    ? await syncAccountEquity(accountId)
    : serializeAccount(account)

  const positions = isMarket ? await listPositions(userId, accountId) : undefined

  return {
    order: serializeOrder(order),
    account: updatedAccount,
    positions,
  }
}

export async function cancelOrder(userId: string, accountId: string, orderId: string) {
  await assertAccountOwner(accountId, userId)

  const order = await prisma.evaluationOrder.findFirst({
    where: { id: orderId, accountId },
  })
  if (!order) {
    throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND')
  }
  if (order.status !== 'open' && order.status !== 'pending') {
    throw new AppError(400, 'Order cannot be cancelled', 'ORDER_NOT_CANCELLABLE')
  }

  const updated = await prisma.evaluationOrder.update({
    where: { id: orderId },
    data: { status: 'cancelled', updatedAt: new Date() },
  })

  return { order: serializeOrder(updated) }
}

export async function syncQuoteForAccount(
  userId: string,
  accountId: string,
  symbol: string,
  price: number,
) {
  await assertAccountOwner(accountId, userId)

  const openOrders = await prisma.evaluationOrder.findMany({
    where: {
      accountId,
      symbol,
      status: 'open',
    },
    include: { instrument: true },
  })

  for (const order of openOrders) {
    const { fill, fillPrice } = shouldFillOrder(order, price)
    if (!fill) continue

    const lotSize = order.instrument.lotSize || 1
    const now = new Date()

    await prisma.evaluationOrder.update({
      where: { id: order.id },
      data: {
        status: 'filled',
        filledPrice: fillPrice,
        totalValue: notional(fillPrice, order.lots, lotSize),
        updatedAt: now,
        filledAt: now,
      },
    })

    await applyFill(accountId, order.instrument, order.side, order.lots, fillPrice)
  }

  const positions = await prisma.evaluationPosition.findMany({
    where: { accountId, symbol, lots: { gt: 0 } },
  })

  for (const pos of positions) {
    const unrealized = (price - num(pos.avgEntry)) * pos.lots
    await prisma.evaluationPosition.update({
      where: { id: pos.id },
      data: {
        ltp: price,
        unrealizedPnL: parseFloat(unrealized.toFixed(2)),
      },
    })
  }

  const account = await syncAccountEquity(accountId)
  const [orders, updatedPositions] = await Promise.all([
    listOrders(userId, accountId),
    listPositions(userId, accountId),
  ])

  return { orders, positions: updatedPositions, account }
}

export async function placeBasketOrders(userId: string, accountId: string) {
  const { getBasketState, ensureDefaultBasket } = await import('./basketService.js')
  await assertAccountOwner(accountId, userId)
  await ensureDefaultBasket(accountId)

  const { baskets, activeBasketId } = await getBasketState(accountId)
  const active = baskets.find((b) => b.id === activeBasketId)
  if (!active || active.instrumentIds.length === 0) {
    return { placed: 0, orders: [] as ReturnType<typeof serializeOrder>[] }
  }

  const placedOrders: ReturnType<typeof serializeOrder>[] = []

  for (const instrumentId of active.instrumentIds) {
    const instrument = await prisma.instrument.findUnique({ where: { id: instrumentId } })
    if (!instrument || instrument.viewOnly || !instrument.isTradable) continue

    const result = await placeOrder(userId, accountId, {
      instrumentId,
      side: 'buy',
      type: 'market',
      lots: 1,
    })
    placedOrders.push(result.order)
  }

  const account = await syncAccountEquity(accountId)
  return { placed: placedOrders.length, orders: placedOrders, account }
}
