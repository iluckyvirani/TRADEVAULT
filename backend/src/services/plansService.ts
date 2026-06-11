import { prisma } from '../lib/prisma.js'

export async function listPlans() {
  const tiers = await prisma.evaluationPlanTier.findMany({
    where: { active: true },
    orderBy: { balance: 'asc' },
  })

  return {
    tiers: tiers.map((t) => ({
      id: t.id,
      balance: Number(t.balance),
      evaluationFee: Number(t.evaluationFee),
      originalFee: Number(t.originalFee),
      savings: Number(t.savings),
      popular: t.popular,
      objectives: {
        profitTarget: t.profitTarget,
        maximumLossLimit: t.maximumLossLimit,
        maximumDailyLossLimit: t.maximumDailyLossLimit,
        requiredTradingDays: t.requiredTradingDays,
        minimumProfitableTradingDays: t.minimumProfitableTradingDays,
        reward: t.reward,
      },
    })),
  }
}
