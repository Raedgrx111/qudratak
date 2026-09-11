import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireVerified } from '@/lib/auth'
import { handle, fail } from '@/lib/api'

// PATCH /api/comments/[id] — تثبيت/إلغاء تثبيت (معلم)
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireVerified()
    const { id } = await ctx.params
    if (user.role !== 'TEACHER') return fail('التثبيت متاح للمعلمين فقط', 403)

    const comment = await db.comment.findUnique({ where: { id } })
    if (!comment) return fail('التعليق غير موجود', 404)

    const body = await req.json().catch(() => null)
    const isPinned = typeof body?.isPinned === 'boolean' ? body.isPinned : !comment.isPinned

    const updated = await db.comment.update({ where: { id }, data: { isPinned } })
    return Response.json({ comment: updated })
  })
}

// DELETE /api/comments/[id] — حذف (المالك أو معلم)
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireVerified()
    const { id } = await ctx.params
    const comment = await db.comment.findUnique({ where: { id } })
    if (!comment) return fail('التعليق غير موجود', 404)
    if (user.role !== 'TEACHER' && comment.userId !== user.id)
      return fail('لا يمكنك حذف تعليق غيرك', 403)

    await db.comment.delete({ where: { id } })
    return Response.json({ ok: true })
  })
}
