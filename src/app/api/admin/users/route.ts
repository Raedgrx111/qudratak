import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireStaff } from '@/lib/auth'
import { handle } from '@/lib/api'

// GET /api/admin/users?search=&role= — تتبع جميع الحسابات مع إحصائيات حقيقية (إدارة)
export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireStaff()
    const search = req.nextUrl.searchParams.get('search')?.trim()
    const role = req.nextUrl.searchParams.get('role')

    const users = await db.user.findMany({
      where: {
        ...(role && ['STUDENT', 'TEACHER', 'OWNER'].includes(role) ? { role } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        grade: true,
        school: true,
        sectionNumber: true,
        isBanned: true,
        emailVerified: true,
        lastActiveAt: true,
        createdAt: true,
        _count: { select: { answers: true, attempts: true, comments: true, favorites: true, eventsCreated: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 300,
    })

    // إحصائيات الإجابات لكل مستخدم (صحيح/دقة) من السجل الفعلي
    const answerStats = await db.$queryRawUnsafe<Array<{ userId: string; total: number | bigint; correct: number | bigint }>>(
      `SELECT userId, COUNT(*) as total, SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) as correct
       FROM AnswerRecord GROUP BY userId`
    )
    const statsMap = new Map(answerStats.map((s) => [s.userId, { total: Number(s.total), correct: Number(s.correct) }]))

    // متوسط درجات الاختبارات المكتملة
    const examStats = await db.$queryRawUnsafe<Array<{ userId: string; exams: number | bigint; avgScore: number | bigint | null }>>(
      `SELECT userId, COUNT(*) as exams, AVG(score) as avgScore
       FROM ExamAttempt WHERE status = 'COMPLETED' GROUP BY userId`
    )
    const examMap = new Map(examStats.map((s) => [s.userId, { exams: Number(s.exams), avgScore: s.avgScore != null ? Math.round(Number(s.avgScore)) : null }]))

    // نشط خلال آخر 7 أيام؟
    const weekAgo = Date.now() - 7 * 86400_000

    return Response.json({
      users: users.map((u) => {
        const st = statsMap.get(u.id) || { total: 0, correct: 0 }
        const ex = examMap.get(u.id) || { exams: 0, avgScore: null }
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          grade: u.grade,
          school: u.school,
          sectionNumber: u.sectionNumber,
          isBanned: u.isBanned,
          emailVerified: u.emailVerified,
          lastActiveAt: u.lastActiveAt,
          createdAt: u.createdAt,
          activeThisWeek: new Date(u.lastActiveAt).getTime() >= weekAgo,
          answeredCount: st.total,
          correctCount: st.correct,
          accuracy: st.total > 0 ? Math.round((st.correct / st.total) * 100) : null,
          examsCount: u._count.attempts,
          completedExams: ex.exams,
          avgScore: ex.avgScore,
          commentsCount: u._count.comments,
          favoritesCount: u._count.favorites,
        }
      }),
    })
  })
}
