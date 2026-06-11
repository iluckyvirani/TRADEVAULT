import type { BasketSizeMode } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { AppError, assertFound } from '../lib/errors.js'
import { serializeBasket, serializeBasketState } from '../utils/tradingSerializer.js'

let basketSeq = 0

function nextBasketId() {
  basketSeq += 1
  return `basket-${Date.now()}-${basketSeq}`
}

async function assertAccountOwner(accountId: string, userId: string) {
  const account = await prisma.evaluationAccount.findFirst({
    where: { id: accountId, userId },
  })
  return assertFound(account, 'Account not found')
}

async function getOrCreateConfig(accountId: string) {
  let config = await prisma.accountTradingConfig.findUnique({ where: { accountId } })
  if (!config) {
    config = await prisma.accountTradingConfig.create({
      data: { accountId, basketSizeMode: 'lots' },
    })
  }
  return config
}

export async function ensureDefaultBasket(accountId: string) {
  const existing = await prisma.tradingBasket.findFirst({
    where: { accountId },
    orderBy: { sortOrder: 'asc' },
  })
  if (existing) return existing

  const basket = await prisma.tradingBasket.create({
    data: {
      id: nextBasketId(),
      accountId,
      name: 'Basket 1',
      sortOrder: 0,
      instrumentIds: [],
    },
  })

  await prisma.accountTradingConfig.upsert({
    where: { accountId },
    create: { accountId, activeBasketId: basket.id, basketSizeMode: 'lots' },
    update: { activeBasketId: basket.id },
  })

  return basket
}

export async function getBasketState(accountId: string) {
  const config = await getOrCreateConfig(accountId)
  const baskets = await prisma.tradingBasket.findMany({
    where: { accountId },
    orderBy: { sortOrder: 'asc' },
  })
  return {
    baskets,
    activeBasketId: config.activeBasketId,
    basketSizeMode: config.basketSizeMode,
  }
}

export async function getBaskets(userId: string, accountId: string) {
  await assertAccountOwner(accountId, userId)
  await ensureDefaultBasket(accountId)
  const state = await getBasketState(accountId)
  return serializeBasketState(state)
}

export async function saveBaskets(
  userId: string,
  accountId: string,
  input: {
    baskets: { id?: string; name: string; instrumentIds: string[] }[]
    activeBasketId?: string | null
    basketSizeMode?: BasketSizeMode
  },
) {
  await assertAccountOwner(accountId, userId)
  await getOrCreateConfig(accountId)

  await prisma.tradingBasket.deleteMany({ where: { accountId } })

  const created = []
  for (let i = 0; i < input.baskets.length; i++) {
    const b = input.baskets[i]
    const row = await prisma.tradingBasket.create({
      data: {
        id: b.id ?? nextBasketId(),
        accountId,
        name: b.name,
        sortOrder: i,
        instrumentIds: b.instrumentIds,
      },
    })
    created.push(row)
  }

  let activeBasketId = input.activeBasketId ?? null
  if (activeBasketId && !created.some((b) => b.id === activeBasketId)) {
    activeBasketId = created[0]?.id ?? null
  }
  if (!activeBasketId && created.length > 0) {
    activeBasketId = created[0].id
  }

  const config = await prisma.accountTradingConfig.update({
    where: { accountId },
    data: {
      activeBasketId,
      ...(input.basketSizeMode ? { basketSizeMode: input.basketSizeMode } : {}),
    },
  })

  return serializeBasketState({
    baskets: created,
    activeBasketId: config.activeBasketId,
    basketSizeMode: config.basketSizeMode,
  })
}

export async function createBasket(userId: string, accountId: string) {
  await assertAccountOwner(accountId, userId)
  const count = await prisma.tradingBasket.count({ where: { accountId } })
  const basket = await prisma.tradingBasket.create({
    data: {
      id: nextBasketId(),
      accountId,
      name: `Basket ${count + 1}`,
      sortOrder: count,
      instrumentIds: [],
    },
  })

  await prisma.accountTradingConfig.upsert({
    where: { accountId },
    create: { accountId, activeBasketId: basket.id, basketSizeMode: 'lots' },
    update: { activeBasketId: basket.id },
  })

  return getBaskets(userId, accountId)
}

export async function setActiveBasket(
  userId: string,
  accountId: string,
  basketId: string,
) {
  await assertAccountOwner(accountId, userId)
  const basket = await prisma.tradingBasket.findFirst({
    where: { id: basketId, accountId },
  })
  if (!basket) {
    throw new AppError(404, 'Basket not found', 'BASKET_NOT_FOUND')
  }

  await prisma.accountTradingConfig.upsert({
    where: { accountId },
    create: { accountId, activeBasketId: basketId, basketSizeMode: 'lots' },
    update: { activeBasketId: basketId },
  })

  return getBaskets(userId, accountId)
}

export async function setBasketSizeMode(
  userId: string,
  accountId: string,
  mode: BasketSizeMode,
) {
  await assertAccountOwner(accountId, userId)
  await prisma.accountTradingConfig.upsert({
    where: { accountId },
    create: { accountId, basketSizeMode: mode },
    update: { basketSizeMode: mode },
  })
  return getBaskets(userId, accountId)
}
