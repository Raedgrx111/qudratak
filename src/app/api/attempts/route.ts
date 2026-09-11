import { db } from '@/lib/db'
import { requireVerified } from '@/lib/auth'
import { handle } from '@/lib/api'

// GET /api/attempts — سجل محاولات المستخدم
export async function GET() {
  return handle(async () => {
    const user = await requireVerified()
    const attempts = await db.examAttempt.findMany({
      where: { userId: user.id, status: 'COMPLETED' },
      include: { exam: { select: { id: true, title: true, type: true, category: true } } },
      orderBy: { completedAt: 'desc' },
      take: 50,
    })
    return Response.json({
      attempts: attempts.map((a) => ({
        id: a.id,
        examId: a.exam.id,
        examTitle: a.exam.title,
        examType: a.exam.type,
        examCategory: a.exam.category,
        score: a.score,
        correctCount: a.correctCount,
        wrongCount: a.wrongCount,
        skippedCount: a.skippedCount,
        timeSpentSeconds: a.timeSpentSeconds,
        completedAt: a.completedAt,
      })),
    })
  })
}
