import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireVerified } from '@/lib/auth'
import { handle, fail, CHOICE_KEYS } from '@/lib/api'

// POST /api/questions/[id]/answer — تسجيل إجابة التدريب الحر وإرجاع التصحيح
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireVerified()
    const { id } = await ctx.params
    const body = await req.json().catch(() => null)
    const selectedKey = body?.selectedKey

    if (!CHOICE_KEYS.includes(selectedKey)) return fail('الخيار المحدد غير صحيح', 422)

    const question = await db.question.findUnique({ where: { id } })
    if (!question) return fail('السؤال غير موجود', 404)

    const isCorrect = selectedKey === question.correctAnswer

    await db.answerRecord.create({
      data: { userId: user.id, questionId: id, selectedKey, isCorrect, mode: 'PRACTICE' },
    })

    return Response.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    })
  })
}
