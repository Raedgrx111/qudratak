import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireVerified } from '@/lib/auth'
import { handle } from '@/lib/api'

// GET /api/favorites — قائمة الأسئلة المفضلة
export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireVerified()
    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') || '12')))

    const [total, favorites] = await Promise.all([
      db.favorite.count({ where: { userId: user.id } }),
      db.favorite.findMany({
        where: { userId: user.id },
        include: { question: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    return Response.json({
      favorites: favorites.map((f) => ({ ...f.question, choices: JSON.parse(f.question.choices), savedAt: f.createdAt })),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  })
}
