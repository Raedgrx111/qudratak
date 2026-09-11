import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireVerified } from '@/lib/auth'
import { guardByUser } from '@/lib/rate-limit'
import { handle, fail } from '@/lib/api'

// GET /api/questions/[id]/comments — سلسلة النقاش (مثبت أولًا ثم الأحدث)
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params
    const user = await getSessionUser()
    if (!(await db.question.findUnique({ where: { id }, select: { id: true } })))
      return fail('السؤال غير موجود', 404)

    const comments = await db.comment.findMany({
      where: { questionId: id, parentId: null },
      include: {
        user: { select: { id: true, name: true, role: true } },
        likes: { select: { userId: true } },
        replies: {
          include: { user: { select: { id: true, name: true, role: true } }, likes: { select: { userId: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    })

    const shape = (c: (typeof comments)[number] & { replies?: unknown[] }) => ({
      id: c.id,
      text: c.text,
      isPinned: c.isPinned,
      createdAt: c.createdAt,
      user: c.user,
      likeCount: c.likes.length,
      likedByMe: user ? c.likes.some((l) => l.userId === user.id) : false,
      replies: (c.replies ?? []).map((r) =>
        shape({
          ...(r as (typeof comments)[number]),
          replies: [],
        })
      ),
    })

    return Response.json({ comments: comments.map(shape) })
  })
}

// POST /api/questions/[id]/comments — إضافة تعليق أو رد
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireVerified()
    // حماية من إغراق النقاشات بالتعليقات الآلية (Spam)
    const g = guardByUser(user.id, 'comments', 20, 60_000, 'تعليقات كثيرة بسرعة — انتظر قليلًا ثم شاركنا رأيك 🙏')
    if (g) return g
    const { id } = await ctx.params
    const body = await req.json().catch(() => null)
    const text = body?.text?.trim()
    const parentId = body?.parentId || null

    if (!text || text.length < 2) return fail('التعليق قصير جدًا', 422)
    if (text.length > 2000) return fail('التعليق طويل جدًا (2000 حرف كحد أقصى)', 422)
    if (!(await db.question.findUnique({ where: { id }, select: { id: true } })))
      return fail('السؤال غير موجود', 404)
    if (parentId) {
      const parent = await db.comment.findUnique({ where: { id: parentId } })
      if (!parent || parent.questionId !== id) return fail('التعليق الأصلي غير موجود', 404)
    }

    const comment = await db.comment.create({
      data: { questionId: id, userId: user.id, text, parentId },
      include: { user: { select: { id: true, name: true, role: true } }, likes: { select: { userId: true } } },
    })
    return Response.json(
      {
        comment: {
          id: comment.id,
          text: comment.text,
          isPinned: comment.isPinned,
          createdAt: comment.createdAt,
          user: comment.user,
          likeCount: 0,
          likedByMe: false,
          replies: [],
        },
      },
      { status: 201 }
    )
  })
}
