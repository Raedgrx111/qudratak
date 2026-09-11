/**
 * فحص حالة الصدارة الحالية: حساب المالك، عدد الأسئلة، أعلى منافس
 * Task 14 — خلية حساب المالك في المركز الأول
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  // 1) المالك
  const owner = await db.user.findUnique({
    where: { email: 'owner@example.com' },
    select: { id: true, name: true, role: true, grade: true, emailVerified: true, isBanned: true },
  })
  console.log('OWNER:', JSON.stringify(owner))

  // 2) عدد الأسئلة الكلي
  const totalQuestions = await db.question.count()
  console.log('TOTAL QUESTIONS:', totalQuestions)

  // 3) أعلى منافسين حسب solved (نفس منطق لوحة الصدارة)
  const top = await db.$queryRawUnsafe<
    Array<{ userId: string; name: string; role: string; attempts: number; solved: number }>
  >(`SELECT u.id as userId, u.name, u.role,
      COUNT(a.id) as attempts,
      COUNT(DISTINCT CASE WHEN a.isCorrect = 1 THEN a.questionId END) as solved
     FROM User u JOIN AnswerRecord a ON a.userId = u.id
     GROUP BY u.id
     HAVING COUNT(a.id) >= 5
     ORDER BY solved DESC
     LIMIT 8`)
  console.log('TOP PLAYERS:')
  for (const t of top) console.log('  -', t.name, `(${t.role})`, 'solved:', Number(t.solved), 'attempts:', Number(t.attempts))

  // 4) إجابات المالك الحالية
  if (owner) {
    const ownerAnswers = await db.answerRecord.count({ where: { userId: owner.id } })
    const ownerCorrectDistinct = await db.$queryRawUnsafe<Array<{ cnt: number }>>(
      `SELECT COUNT(DISTINCT questionId) as cnt FROM AnswerRecord WHERE userId = ? AND isCorrect = 1`,
      owner.id,
    )
    console.log('OWNER ANSWERS:', ownerAnswers, 'CORRECT DISTINCT:', Number(ownerCorrectDistinct[0]?.cnt || 0))
  }

  // 5) توزيع الأسئلة (للتنويع)
  const byCat = await db.question.groupBy({ by: ['category'], _count: true })
  console.log('QUESTIONS BY CATEGORY:', byCat.map((c) => `${c.category}:${c._count}`).join(', '))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
