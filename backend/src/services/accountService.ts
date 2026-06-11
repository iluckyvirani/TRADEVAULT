import type { AccountPlan } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { AppError, assertFound } from '../lib/errors.js'
import { generateAccountId } from '../utils/accountId.js'
import {
  defaultObjectives,
  limitsFromObjectives,
  objectivesFromPlanTier,
} from '../utils/accountLimits.js'
import { serializeAccount } from '../utils/accountSerializer.js'

async function assertAccountOwner(accountId: string, userId: string) {
  const account = await prisma.evaluationAccount.findFirst({
    where: { id: accountId, userId },
  })
  return assertFound(account, 'Account not found')
}

async function seedEquityCurve(accountId: string, accountSize: number, days = 30) {
  const now = Date.now()
  const points = []
  for (let i = days; i >= 0; i--) {
    const ts = new Date(now - i * 86400000)
    points.push({
      accountId,
      ts,
      equity: accountSize,
      balance: accountSize,
    })
  }
  await prisma.equityCurvePoint.createMany({ data: points })
}

async function markEvaluationStarted(userId: string) {
  await prisma.user.updateMany({
    where: {
      id: userId,
      registrationStep: { in: ['email_verified', 'profile_completed'] },
    },
    data: { registrationStep: 'evaluation_started' },
  })
}

async function createAccount(
  userId: string,
  plan: AccountPlan,
  accountSize: number,
  objectives = defaultObjectives(),
) {
  const limits = limitsFromObjectives(accountSize, objectives)
  const prefix = plan === 'free_trial' ? 'FTL' : 'EVL'
  const id = generateAccountId(prefix)
  const labels = plan === 'free_trial' ? ['ACTIVE', 'FREE TRIAL'] : ['ACTIVE']

  const account = await prisma.evaluationAccount.create({
    data: {
      id,
      userId,
      plan,
      status: 'active',
      stepType: 'STEP_2',
      accountSize,
      balance: accountSize,
      equity: accountSize,
      freeMargin: accountSize,
      marginUsed: 0,
      unrealizedPnL: 0,
      todayPnL: 0,
      maxLoss: limits.maxLoss,
      dailyMaxLoss: limits.dailyMaxLoss,
      profitTarget: limits.profitTarget,
      minTradingDays: limits.minTradingDays,
      minProfitableTradingDays: limits.minProfitableTradingDays,
      reward: limits.reward,
      tradingDaysCompleted: 0,
      profitableTradingDaysCompleted: 0,
      rolloverProfit: 0,
      labels,
      tradingConfig: { create: { basketSizeMode: 'lots' } },
    },
  })

  await seedEquityCurve(account.id, accountSize)
  await markEvaluationStarted(userId)

  return serializeAccount(account)
}

export async function listAccounts(userId: string) {
  const accounts = await prisma.evaluationAccount.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return accounts.map(serializeAccount)
}

export async function getAccount(userId: string, accountId: string) {
  const account = await assertAccountOwner(accountId, userId)
  return serializeAccount(account)
}

export async function createFreeTrialAccount(userId: string, accountSize: number) {
  const existing = await prisma.evaluationAccount.findFirst({
    where: { userId, plan: 'free_trial', status: 'active' },
  })
  if (existing) {
    throw new AppError(409, 'You already have an active free trial account', 'FREE_TRIAL_EXISTS')
  }

  return createAccount(userId, 'free_trial', accountSize, defaultObjectives())
}

export async function createPaidAccount(
  userId: string,
  input: { planId?: string; accountSize?: number },
) {
  let accountSize = input.accountSize
  let objectives = defaultObjectives()

  if (input.planId) {
    const tier = await prisma.evaluationPlanTier.findUnique({
      where: { id: input.planId },
    })
    if (!tier) {
      throw new AppError(400, 'Invalid plan', 'INVALID_PLAN')
    }
    accountSize = Number(tier.balance)
    objectives = objectivesFromPlanTier(tier)
  }

  if (!accountSize || accountSize <= 0) {
    throw new AppError(400, 'Account size is required', 'INVALID_SIZE')
  }

  return createAccount(userId, 'paid', accountSize, objectives)
}

export async function getAccountStats(userId: string, accountId: string) {
  const account = await assertAccountOwner(accountId, userId)
  const dto = serializeAccount(account)

  const profit = Math.max(0, dto.equity - dto.accountSize)
  const dailyUsed = Math.max(0, Math.min(dto.dailyMaxLoss, dto.accountSize - dto.equity))
  const maxUsed = Math.max(0, Math.min(dto.maxLoss, dto.accountSize - dto.equity))

  return {
    account: dto,
    summary: {
      profit,
      profitTargetProgress:
        dto.profitTarget > 0 ? (profit / dto.profitTarget) * 100 : 0,
      dailyLossUsed: dailyUsed,
      dailyLossProgress:
        dto.dailyMaxLoss > 0 ? (dailyUsed / dto.dailyMaxLoss) * 100 : 0,
      maxLossUsed: maxUsed,
      maxLossProgress: dto.maxLoss > 0 ? (maxUsed / dto.maxLoss) * 100 : 0,
      tradingDaysCompleted: dto.tradingDaysCompleted,
      profitableTradingDaysCompleted: dto.profitableTradingDaysCompleted,
    },
  }
}

export async function getEquityCurve(userId: string, accountId: string) {
  await assertAccountOwner(accountId, userId)

  const points = await prisma.equityCurvePoint.findMany({
    where: { accountId },
    orderBy: { ts: 'asc' },
  })

  if (points.length === 0) {
    const account = await prisma.evaluationAccount.findUnique({
      where: { id: accountId },
    })
    if (account) {
      await seedEquityCurve(accountId, Number(account.accountSize))
      return getEquityCurve(userId, accountId)
    }
  }

  return {
    accountId,
    points: points.map((p) => ({
      accountId: p.accountId,
      timestamp: p.ts.toISOString(),
      equity: Number(p.equity),
      balance: Number(p.balance),
    })),
  }
}

export async function setActiveAccount(userId: string, accountId: string) {
  await assertAccountOwner(accountId, userId)

  await prisma.userPreferences.upsert({
    where: { userId },
    create: { userId, activeAccountId: accountId },
    update: { activeAccountId: accountId },
  })

  return { ok: true, activeAccountId: accountId }
}
