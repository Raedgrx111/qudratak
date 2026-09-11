import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { handle } from '@/lib/api'

type Row = {
  userId: string
  name: string
  grade: string | null
  solved: number | bigint
  attempts: number | bigint
  correct: number | bigint
  exams: number | bigint
  avgScore: number | bigint | null
}

// GET /api/leaderboard?period=all|month|week — قائمة الصدارة الحقيقية
// الترتيب حسب عدد الأسئلة المختلفة التي أجاب عنها الطالب إجابة صحيحة (تدريبًا واختبارًا)
export async function GET(req: NextRequest) {
  return handle(async () => {
    const period = req.nextUrl.searchParams.get('period') || 'all'
    const since =
      period === 'week'
        ? new Date(Date.now() - 7 * 86400_000)
        : period === 'month'
          ? new Date(Date.now() - 30 * 86400_000)
          : null

    const sinceSql = since ? 'WHERE a.createdAt >= ?' : ''

    const rows = await db.$queryRawUnsafe<Row[]>(
      `SELECT u.id as userId, u.name, u.grade,
        COUNT(DISTINCT CASE WHEN a.isCorrect = 1 THEN a.questionId END) as solved,
        COUNT(a.id) as attempts,
        SUM(CASE WHEN a.isCorrect = 1 THEN 1 ELSE 0 END) as correct,
        (SELECT COUNT(*) FROM ExamAttempt ea WHERE ea.userId = u.id AND ea.status = 'COMPLETED'
           ${since ? `AND ea.completedAt >= ?` : ''}) as exams,
        (SELECT AVG(ea.score) FROM ExamAttempt ea WHERE ea.userId = u.id AND ea.status = 'COMPLETED'
           ${since ? `AND ea.completedAt >= ?` : ''}) as avgScore
       FROM User u
       JOIN AnswerRecord a ON a.userId = u.id
       ${sinceSql}
       GROUP BY u.id
       HAVING attempts >= 5
       ORDER BY solved DESC, correct DESC, avgScore DESC
       LIMIT 100`,
      ...(since ? [since.getTime(), since.getTime(), since.getTime()] : [])
    )

    const session = await getSessionUser()
    const board = rows.map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      name: r.name,
      grade: r.grade,
      solved: Number(r.solved),
      attempts: Number(r.attempts),
      accuracy: Number(r.attempts) > 0 ? Math.round((Number(r.correct) / Number(r.attempts)) * 100) : 0,
      exams: Number(r.exams),
      avgScore: r.avgScore != null ? Math.round(Number(r.avgScore)) : null,
      isMe: session?.id === r.userId,
    }))

    // ترتيب المستخدم الحالي حتى لو لم يدخل أفضل 100
    let meIndex = board.findIndex((b) => b.isMe)
    let me: (typeof board)[number] | null = meIndex >= 0 ? board[meIndex] : null
    if (session && meIndex < 0) {
      const mine = await db.$queryRawUnsafe<Row[]>(
        `SELECT u.id as userId, u.name, u.grade,
          COUNT(DISTINCT CASE WHEN a.isCorrect = 1 THEN a.questionId END) as solved,
          COUNT(a.id) as attempts,
          SUM(CASE WHEN a.isCorrect = 1 THEN 1 ELSE 0 END) as correct,
          0 as exams, NULL as avgScore
         FROM User u JOIN AnswerRecord a ON a.userId = u.id
         ${sinceSql} AND u.id = ?
         GROUP BY u.id`,
        ...(since ? [since.getTime(), session.id] : [session.id])
      )
      if (mine.length && Number(mine[0].attempts) >= 5) {
        // كم مستخدمًا يعلوه؟
        const ahead = await db.$queryRawUnsafe<Array<{ cnt: number | bigint }>>(
          `SELECT COUNT(*) as cnt FROM (
             SELECT a.userId, COUNT(DISTINCT CASE WHEN a.isCorrect = 1 THEN a.questionId END) as solved
             FROM AnswerRecord a ${sinceSql}
             GROUP BY a.userId
             HAVING solved > ?
           )`,
          ...(since ? [since.getTime(), Number(mine[0].solved)] : [Number(mine[0].solved)])
        )
        const rank = Number(ahead[0]?.cnt || 0) + 1
        me = {
          rank,
          userId: session.id,
          name: mine[0].name,
          grade: mine[0].grade,
          solved: Number(mine[0].solved),
          attempts: Number(mine[0].attempts),
          accuracy: Math.round((Number(mine[0].correct) / Number(mine[0].attempts)) * 100),
          exams: 0,
          avgScore: null,
          isMe: true,
        }
      }
    }

    return Response.json({ board, me, total: board.length })
  })
}
