import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireVerified } from '@/lib/auth'
import { handle, fail } from '@/lib/api'

// POST /api/comments/[id]/like — تبديل الإعجاب
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireVerified()
    const { id } = await ctx.params
    const comment = await db.comment.findUnique({ where: { id } })
    if (!comment) return fail('التعليق غير موجود', 404)

    const existing = await db.commentLike.findUnique({
      where: { commentId_userId: { commentId: id, userId: user.id } },
    })
    if (existing) {
      await db.commentLike.delete({ where: { id: existing.id } })
      const count = await db.commentLike.count({ where: { commentId: id } })
      return Response.json({ liked: false, likeCount: count })
    }
    await db.commentLike.create({ data: { commentId: id, userId: user.id } })
    const count = await db.commentLike.count({ where: { commentId: id } })
    return Response.json({ liked: true, likeCount: count })
  })
}
