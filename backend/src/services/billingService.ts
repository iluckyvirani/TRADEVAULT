import { prisma } from '../lib/prisma.js'

export function serializeBillingRecord(record: {
  id: string
  userId: string
  program: string
  accountSize: { toString(): string }
  amount: { toString(): string }
  currency: string
  status: string
  paymentMethod: string | null
  paidAt: Date
}) {
  return {
    id: record.id,
    userId: record.userId,
    date: record.paidAt.toISOString(),
    program: record.program,
    accountSize: Number(record.accountSize),
    amount: Number(record.amount),
    currency: record.currency,
    status: record.status as 'paid' | 'pending' | 'failed' | 'refunded',
    paymentMethod: record.paymentMethod ?? undefined,
  }
}

export async function listBillingHistory(userId: string) {
  const records = await prisma.billingRecord.findMany({
    where: { userId, status: 'paid' },
    orderBy: { paidAt: 'desc' },
  })
  return records.map(serializeBillingRecord)
}
