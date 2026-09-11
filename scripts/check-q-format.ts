import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  const qs = await p.question.findMany({ where: { category: 'QUANTITATIVE' }, take: 3, orderBy: { createdAt: 'asc' } })
  const withImg = await p.question.count({ where: { image: { not: null } } })
  console.log('total:', await p.question.count(), '| with image:', withImg)
  for (const q of qs) console.log(JSON.stringify({ topic: q.topic, diff: q.difficulty, text: q.text.slice(0,200), choices: q.choices.slice(0,150), ans: q.correctAnswer, expl: q.explanation?.slice(0,120), src: q.source }, null, 1))
  const topics = await p.question.groupBy({ by: ['topic'], _count: true, where: { category: 'QUANTITATIVE' } })
  console.log('QUANT topics:', topics.map(t => `${t.topic}:${t._count}`).join(' · '))
}
main().then(() => p.$disconnect())
