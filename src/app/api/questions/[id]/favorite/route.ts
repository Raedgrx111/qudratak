import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireVerified } from '@/lib/auth'
import { handle } from '@/lib/api'

// POST /api/questions/[id]/favorite — تبديل حالة المفضلة
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireVerified()
    const { id } = await ctx.params
    const question = await db.question.findUnique({ where: { id }, select: { id: true } })
    if (!question) return Response.json({ error: 'السؤال غير موجود' }, { status: 404 })

    const existing = await db.favorite.findUnique({
      where: { userId_questionId: { userId: user.id, questionId: id } },
    })
    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } })
      return Response.json({ favorite: false })
    }
    await db.favorite.create({ data: { userId: user.id, questionId: id } })
    return Response.json({ favorite: true })
  })
}
