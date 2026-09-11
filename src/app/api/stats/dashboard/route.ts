import { db } from '@/lib/db'
import { requireVerified } from '@/lib/auth'
import { handle } from '@/lib/api'

// GET /api/stats/dashboard — إحصائيات لوحة الطالب
export async function GET() {
  return handle(async () => {
    const user = await requireVerified()

    const [totalAnswered, totalCorrect, favorites, recentAttempts, topicAgg, recentAnswers] = await Promise.all([
      db.answerRecord.count({ where: { userId: user.id } }),
      db.answerRecord.count({ where: { userId: user.id, isCorrect: true } }),
      db.favorite.count({ where: { userId: user.id } }),
      db.examAttempt.findMany({
        where: { userId: user.id, status: 'COMPLETED' },
        include: { exam: { select: { id: true, title: true, type: true } } },
        orderBy: { completedAt: 'desc' },
        take: 5,
      }),
      db.$queryRawUnsafe<Array<{ topic: string; total: number; correct: number }>>(
        `SELECT q.topic as topic, COUNT(*) as total, SUM(CASE WHEN a.isCorrect = 1 THEN 1 ELSE 0 END) as correct
         FROM AnswerRecord a JOIN Question q ON q.id = a.questionId
         WHERE a.userId = ?
         GROUP BY q.topic
         ORDER BY total DESC`,
        user.id
      ),
      db.answerRecord.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true, isCorrect: true },
      }),
    ])

    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

    // تحليل المواضيع
    const topics = topicAgg.map((t) => ({
      topic: t.topic,
      total: Number(t.total),
      correct: Number(t.correct),
      accuracy: Number(t.total) > 0 ? Math.round((Number(t.correct) / Number(t.total)) * 100) : 0,
    }))
    const weakAreas = topics
      .filter((t) => t.total >= 4 && t.accuracy < 65)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)
    const strongAreas = topics
      .filter((t) => t.total >= 4 && t.accuracy >= 75)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5)

    // منحنى التقدم: دقة الأسبوعين الأخيرين مقسمة على أيام
    const dayBuckets: Record<string, { total: number; correct: number }> = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const key = d.toISOString().slice(0, 10)
      dayBuckets[key] = { total: 0, correct: 0 }
    }
    for (const a of recentAnswers) {
      const key = a.createdAt.toISOString().slice(0, 10)
      if (dayBuckets[key]) {
        dayBuckets[key].total++
        if (a.isCorrect) dayBuckets[key].correct++
      }
    }
    const progressSeries = Object.entries(dayBuckets).map(([date, s]) => ({
      date,
      label: `${parseInt(date.slice(8))}/${parseInt(date.slice(5, 7))}`,
      answered: s.total,
      accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    }))

    // توصيات تدريب
    const recommendations = weakAreas.slice(0, 3).map((w) => ({
      topic: w.topic,
      reason: `دقتك في «${w.topic}» هي ${w.accuracy}% — التدريب المكثف سيحسّن نتيجتك الكلية.`,
    }))

    return Response.json({
      totals: { totalAnswered, totalCorrect, accuracy, favorites, examsTaken: recentAttempts.length },
      recentAttempts: recentAttempts.map((a) => ({
        id: a.id,
        examId: a.exam.id,
        examTitle: a.exam.title,
        examType: a.exam.type,
        score: a.score,
        completedAt: a.completedAt,
      })),
      topics: topics.slice(0, 10),
      weakAreas,
      strongAreas,
      progressSeries,
      recommendations,
    })
  })
}
