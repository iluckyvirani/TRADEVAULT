import { prisma } from '../lib/prisma.js'

export async function listFaq() {
  const categories = await prisma.faqCategory.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      items: {
        where: { published: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  return {
    categories: categories.map((cat) => ({
      id: cat.id,
      title: cat.title,
      items: cat.items.map((item) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
      })),
    })),
  }
}
