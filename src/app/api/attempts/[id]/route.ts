import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireVerified } from '@/lib/auth'
import { handle, fail, CHOICE_KEYS } from '@/lib/api'

// GET /api/attempts/[id] — حالة المحاولة + الأسئلة (بدون إجابات صحيحة أثناء التقدم)
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireVerified()
    const { id } = await ctx.params
    const attempt = await db.examAttempt.findUnique({
      where: { id },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                question: {
                  select: { id: true, category: true, topic: true, difficulty: true, text: true, choices: true, image: true },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })
    if (!attempt) return fail('المحاولة غير موجودة', 404)
    if (attempt.userId !== user.id && user.role !== 'TEACHER') return fail('غير مصرح', 403)

    const startedAt = attempt.startedAt.getTime()
    const now = Date.now()
    const elapsed = Math.floor((now - startedAt) / 1000)
    const remaining = Math.max(0, attempt.exam.durationMinutes * 60 - elapsed)
    const timedOut = remaining <= 0

    return Response.json({
      attempt: {
        id: attempt.id,
        status: attempt.status,
        answers: JSON.parse(attempt.answers),
        remainingSeconds: remaining,
        timedOut,
      },
      exam: {
        id: attempt.exam.id,
        title: attempt.exam.title,
        durationMinutes: attempt.exam.durationMinutes,
        category: attempt.exam.category,
      },
      questions: attempt.exam.questions.map((eq) => ({
        id: eq.question.id,
        order: eq.order,
        category: eq.question.category,
        topic: eq.question.topic,
        difficulty: eq.question.difficulty,
        text: eq.question.text,
        choices: JSON.parse(eq.question.choices),
        image: eq.question.image,
      })),
    })
  })
}

// PATCH /api/attempts/[id] — حفظ إجابة أثناء المحاولة (بدون تصحيح)
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireVerified()
    const { id } = await ctx.params
    const attempt = await db.examAttempt.findUnique({ where: { id } })
    if (!attempt) return fail('المحاولة غير موجودة', 404)
    if (attempt.userId !== user.id) return fail('غير مصرح', 403)
    if (attempt.status !== 'IN_PROGRESS') return fail('انتهت هذه المحاولة بالفعل', 409)

    const body = await req.json().catch(() => null)
    const questionId = body?.questionId
    const selectedKey = body?.selectedKey
    if (!questionId || !CHOICE_KEYS.includes(selectedKey)) return fail('بيانات الإجابة غير صحيحة', 422)

    const answers = JSON.parse(attempt.answers)
    answers[questionId] = selectedKey
    await db.examAttempt.update({ where: { id }, data: { answers: JSON.stringify(answers) } })
    return Response.json({ ok: true })
  })
}

// DELETE /api/attempts/[id] — إلغاء المحاولة
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireVerified()
    const { id } = await ctx.params
    const attempt = await db.examAttempt.findUnique({ where: { id } })
    if (!attempt) return fail('المحاولة غير موجودة', 404)
    if (attempt.userId !== user.id) return fail('غير مصرح', 403)
    await db.examAttempt.delete({ where: { id } })
    return Response.json({ ok: true })
  })
}
