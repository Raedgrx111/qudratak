import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireVerified } from '@/lib/auth'
import { guardByUser } from '@/lib/rate-limit'
import { handle, fail } from '@/lib/api'

// POST /api/exams/[id]/start — بدء محاولة جديدة
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireVerified()
    // حماية من إغراق المحاولات وخلق بيانات وهمية بالجملة
    const g = guardByUser(user.id, 'exam-ops', 30, 60_000)
    if (g) return g
    const { id } = await ctx.params
    const exam = await db.exam.findUnique({
      where: { id },
      include: { _count: { select: { questions: true } } },
    })
    if (!exam) return fail('الاختبار غير موجود', 404)
    if (exam._count.questions === 0) return fail('لا يحتوي هذا الاختبار على أسئلة', 422)

    // إلغاء المحاولات غير المكتملة السابقة لنفس الاختبار
    await db.examAttempt.updateMany({
      where: { userId: user.id, examId: id, status: 'IN_PROGRESS' },
      data: { status: 'COMPLETED', completedAt: new Date() },
    })

    const attempt = await db.examAttempt.create({
      data: { userId: user.id, examId: id, answers: '{}', status: 'IN_PROGRESS' },
    })
    return Response.json({ attemptId: attempt.id }, { status: 201 })
  })
}
