import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireStaff } from '@/lib/auth'
import { handle, fail, CATEGORIES, DIFFICULTIES, CHOICE_KEYS, type ChoiceKey } from '@/lib/api'

// GET /api/questions/[id] — تفاصيل سؤال (بدون الإجابة للطالب قبل الحل في وضع الاختبار)
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params
    const user = await getSessionUser()
    const question = await db.question.findUnique({ where: { id } })
    if (!question) return fail('السؤال غير موجود', 404)

    let favorite = false
    let lastAnswer = null
    let stats: { total: number; correct: number } | null = null
    if (user) {
      const [fav, ans, agg] = await Promise.all([
        db.favorite.findUnique({ where: { userId_questionId: { userId: user.id, questionId: id } } }),
        db.answerRecord.findFirst({
          where: { userId: user.id, questionId: id },
          orderBy: { createdAt: 'desc' },
        }),
        db.question.findUnique({
          where: { id },
          select: {
            _count: { select: { answers: true } },
            answers: { where: { isCorrect: true }, select: { id: true } },
          },
        }),
      ])
      favorite = !!fav
      lastAnswer = ans
      if (agg) stats = { total: agg._count.answers, correct: agg.answers.length }
    }

    return Response.json({ question: { ...question, choices: JSON.parse(question.choices) }, favorite, lastAnswer, stats })
  })
}

// PUT /api/questions/[id] — تعديل سؤال (معلم)
export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireStaff()
    const { id } = await ctx.params
    const body = await req.json().catch(() => null)

    const category = body?.category
    const topic = body?.topic?.trim()
    const difficulty = body?.difficulty
    const text = body?.text?.trim()
    const choices = body?.choices as Array<{ key: string; text: string }> | undefined
    const correctAnswer = body?.correctAnswer
    const explanation = body?.explanation?.trim()
    const image = body?.image?.trim() || null

    if (!CATEGORIES.includes(category)) return fail('القسم غير صحيح', 422)
    if (!topic) return fail('الموضوع مطلوب', 422)
    if (!DIFFICULTIES.includes(difficulty)) return fail('مستوى الصعوبة غير صحيح', 422)
    if (!text || text.length < 5) return fail('نص السؤال مطلوب', 422)
    if (!Array.isArray(choices) || choices.length !== 4 || choices.some((c) => !c?.text?.trim()))
      return fail('يجب إدخال أربعة خيارات كاملة', 422)
    const keys = choices.map((c) => c.key)
    if (CHOICE_KEYS.some((k) => !keys.includes(k as ChoiceKey))) return fail('مفاتيح الخيارات غير صحيحة', 422)
    if (!CHOICE_KEYS.includes(correctAnswer)) return fail('الإجابة الصحيحة غير صحيحة', 422)
    if (!explanation) return fail('شرح الحل مطلوب', 422)

    const existing = await db.question.findUnique({ where: { id } })
    if (!existing) return fail('السؤال غير موجود', 404)

    const question = await db.question.update({
      where: { id },
      data: {
        category,
        topic,
        difficulty,
        text,
        choices: JSON.stringify(choices.map((c) => ({ key: c.key, text: c.text.trim() }))),
        correctAnswer,
        explanation,
        image,
      },
    })
    return Response.json({ question })
  })
}

// DELETE /api/questions/[id] — حذف سؤال (معلم)
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireStaff()
    const { id } = await ctx.params
    const existing = await db.question.findUnique({ where: { id } })
    if (!existing) return fail('السؤال غير موجود', 404)
    await db.question.delete({ where: { id } })
    return Response.json({ ok: true })
  })
}
