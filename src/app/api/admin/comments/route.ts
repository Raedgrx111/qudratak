import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireStaff } from '@/lib/auth'
import { handle } from '@/lib/api'

// GET /api/admin/comments — أحدث التعليقات للإشراف
export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireStaff()
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1'))
    const limit = 20

    const [total, comments] = await Promise.all([
      db.comment.count(),
      db.comment.findMany({
        include: {
          user: { select: { id: true, name: true, role: true } },
          question: { select: { id: true, text: true, topic: true } },
          _count: { select: { likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return Response.json({
      comments: comments.map((c) => ({
        id: c.id,
        text: c.text,
        isPinned: c.isPinned,
        createdAt: c.createdAt,
        user: c.user,
        question: c.question,
        likeCount: c._count.likes,
      })),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  })
}
