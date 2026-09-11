import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireStaff } from '@/lib/auth'
import { handle, fail } from '@/lib/api'

// GET /api/exams/[id] — عرض الاختبار للبدء (بدون الإجابات)
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params
    const exam = await db.exam.findUnique({
      where: { id },
      include: {
        questions: {
          include: { question: { select: { id: true, category: true, topic: true, difficulty: true, text: true, choices: true, image: true } } },
          orderBy: { order: 'asc' },
        },
        _count: { select: { questions: true } },
      },
    })
    if (!exam) return fail('الاختبار غير موجود', 404)

    return Response.json({
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        type: exam.type,
        category: exam.category,
        durationMinutes: exam.durationMinutes,
        questionCount: exam.questions.length,
      },
      questions: exam.questions.map((eq) => ({
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

// DELETE /api/exams/[id] — حذف اختبار (معلم)
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireStaff()
    const { id } = await ctx.params
    const exam = await db.exam.findUnique({ where: { id } })
    if (!exam) return fail('الاختبار غير موجود', 404)
    await db.exam.delete({ where: { id } })
    return Response.json({ ok: true })
  })
}
