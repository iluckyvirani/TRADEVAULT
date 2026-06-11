import { PrismaClient } from '@prisma/client'
import { SEED_FAQ } from './seed-data/faq.js'
import { SEED_INSTRUMENTS, SEED_QUOTES } from './seed-data/market.js'
import { buildSeedCandles } from './seed-data/candles.js'
import { DEFAULT_OBJECTIVES, SEED_PLAN_TIERS } from './seed-data/plans.js'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding plan tiers…')
  for (const tier of SEED_PLAN_TIERS) {
    await prisma.evaluationPlanTier.upsert({
      where: { id: tier.id },
      create: { ...tier, ...DEFAULT_OBJECTIVES, active: true },
      update: { ...tier, ...DEFAULT_OBJECTIVES, active: true },
    })
  }

  console.log('Seeding FAQ…')
  for (const category of SEED_FAQ) {
    await prisma.faqCategory.upsert({
      where: { id: category.id },
      create: {
        id: category.id,
        title: category.title,
        sortOrder: category.sortOrder,
        published: true,
      },
      update: {
        title: category.title,
        sortOrder: category.sortOrder,
        published: true,
      },
    })

    for (const item of category.items) {
      await prisma.faqItem.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          categoryId: category.id,
          categorySlug: category.id,
          question: item.question,
          answer: item.answer,
          sortOrder: item.sortOrder,
          published: true,
        },
        update: {
          categoryId: category.id,
          categorySlug: category.id,
          question: item.question,
          answer: item.answer,
          sortOrder: item.sortOrder,
          published: true,
        },
      })
    }
  }

  console.log('Seeding instruments…')
  for (const inst of SEED_INSTRUMENTS) {
    await prisma.instrument.upsert({
      where: { id: inst.id },
      create: inst,
      update: inst,
    })
  }

  console.log('Seeding demo affiliate partner…')
  const demoEmail = 'affiliate@tradeox.dev'
  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    create: {
      email: demoEmail,
      name: 'Demo Partner',
      emailVerifiedAt: new Date(),
      registrationStep: 'evaluation_started',
      preferences: { create: {} },
    },
    update: {
      name: 'Demo Partner',
      emailVerifiedAt: new Date(),
    },
  })
  await prisma.affiliateProfile.upsert({
    where: { userId: demoUser.id },
    create: { userId: demoUser.id, code: 'DEMO123', seeded: true },
    update: { code: 'DEMO123', seeded: true },
  })

  console.log('Seeding market quotes…')
  for (const q of SEED_QUOTES) {
    await prisma.marketQuote.upsert({
      where: { symbol: q.symbol },
      create: {
        ...q,
        volume: BigInt(q.volume),
        avgVolume: BigInt(q.avgVolume),
      },
      update: {
        ...q,
        volume: BigInt(q.volume),
        avgVolume: BigInt(q.avgVolume),
        lastUpdated: new Date(),
      },
    })
  }

  console.log('Seeding market candles…')
  const candles = buildSeedCandles()
  const BATCH = 250
  for (let i = 0; i < candles.length; i += BATCH) {
    const chunk = candles.slice(i, i + BATCH)
    await prisma.marketCandle.createMany({
      data: chunk.map((c) => ({
        symbol: c.symbol,
        interval: c.interval,
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: BigInt(c.volume),
      })),
      skipDuplicates: true,
    })
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
