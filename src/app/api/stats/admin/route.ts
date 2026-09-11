import { db } from '@/lib/db'
import { requireStaff } from '@/lib/auth'
import { handle } from '@/lib/api'

// GET /api/stats/admin — إحصائيات المنصة للمعلم
export async function GET() {
  return handle(async () => {
    await requireStaff()

    const [students, teachers, questions, exams, attempts, comments, imports, categoryAgg, difficultyAgg, topicAgg, topStudents, activeWeek, eventsCount, answerAgg] =
      await Promise.all([
        db.user.count({ where: { role: 'STUDENT' } }),
        db.user.count({ where: { role: 'TEACHER' } }),
        db.question.count(),
        db.exam.count(),
        db.examAttempt.count({ where: { status: 'COMPLETED' } }),
        db.comment.count({ where: { isDeleted: false } }),
        db.importLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
        db.$queryRawUnsafe<Array<{ category: string; total: number }>>(
          `SELECT category, COUNT(*) as total FROM Question GROUP BY category`
        ),
        db.$queryRawUnsafe<Array<{ difficulty: string; total: number }>>(
          `SELECT difficulty, COUNT(*) as total FROM Question GROUP BY difficulty`
        ),
        db.$queryRawUnsafe<Array<{ topic: string; total: number; correct: number; attempts: number }>>(
          `SELECT q.topic as topic, COUNT(*) as total,
             SUM(CASE WHEN a.isCorrect = 1 THEN 1 ELSE 0 END) as correct,
             COUNT(a.id) as attempts
           FROM Question q LEFT JOIN AnswerRecord a ON a.questionId = q.id
           GROUP BY q.topic ORDER BY total DESC`
        ),
        db.$queryRawUnsafe<Array<{ id: string; name: string; exams: number; avgScore: number }>>(
          `SELECT u.id, u.name, COUNT(a.id) as exams, AVG(a.score) as avgScore
           FROM User u JOIN ExamAttempt a ON a.userId = u.id
           WHERE a.status = 'COMPLETED' AND u.role = 'STUDENT'
           GROUP BY u.id ORDER BY avgScore DESC LIMIT 5`
        ),
        db.$queryRawUnsafe<Array<{ cnt: number | bigint }>>(
          `SELECT COUNT(*) as cnt FROM User WHERE lastActiveAt >= ?`,
          Date.now() - 7 * 86400_000
        ),
        db.event.count({ where: { isActive: true } }),
        db.$queryRawUnsafe<Array<{ total: number | bigint; correct: number | bigint }>>(
          `SELECT COUNT(*) as total, SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) as correct FROM AnswerRecord`
        ),
      ])

    const topicStats = topicAgg.map((t) => ({
      topic: t.topic,
      questions: Number(t.total),
      attempts: Number(t.attempts || 0),
      avgAccuracy: Number(t.attempts) > 0 ? Math.round((Number(t.correct || 0) / Number(t.attempts)) * 100) : 0,
    }))

    return Response.json({
      totals: { students, questions, exams, attempts, comments },
      staff: { teachers },
      activeWeek: Number(activeWeek[0]?.cnt || 0),
      eventsCount,
      answeredTotal: Number(answerAgg[0]?.total || 0),
      correctTotal: Number(answerAgg[0]?.correct || 0),
      questionsByCategory: categoryAgg.map((c) => ({ category: c.category, total: Number(c.total) })),
      questionsByDifficulty: difficultyAgg.map((d) => ({ difficulty: d.difficulty, total: Number(d.total) })),
      topicStats: topicStats.slice(0, 10),
      recentImports: imports,
      topStudents: topStudents.map((s) => ({
        id: s.id,
        name: s.name,
        exams: Number(s.exams),
        avgScore: Math.round(Number(s.avgScore || 0)),
      })),
    })
  })
}
