import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireStaff } from '@/lib/auth'
import { handle, fail } from '@/lib/api'

// GET /api/events — الأحداث النشطة للجميع، وكل الأحداث للإدارة مع ?all=1
export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await getSessionUser()
    const isStaff = session?.role === 'TEACHER' || session?.role === 'OWNER'
    const wantAll = req.nextUrl.searchParams.get('all') === '1' && isStaff

    const events = await db.event.findMany({
      where: wantAll ? {} : { isActive: true },
      orderBy: [{ isActive: 'desc' }, { startsAt: 'desc' }, { createdAt: 'desc' }],
      take: 50,
      include: { creator: { select: { name: true } } },
    })
    return Response.json({ events })
  })
}

// POST /api/events — إنشاء حدث (إدارة فقط)
export async function POST(req: NextRequest) {
  return handle(async () => {
    const staff = await requireStaff()
    const body = await req.json().catch(() => null)
    const title = body?.title?.trim()
    const text = body?.body?.trim()
    const type = ['NEWS', 'EVENT', 'COMPETITION', 'TIP'].includes(body?.type) ? body.type : 'NEWS'
    const startsAt = body?.startsAt ? new Date(body.startsAt) : null

    if (!title || title.length < 3) return fail('عنوان الحدث مطلوب (3 أحرف على الأقل)', 422)
    if (!text || text.length < 5) return fail('تفاصيل الحدث مطلوبة (5 أحرف على الأقل)', 422)
    if (startsAt && isNaN(startsAt.getTime())) return fail('تاريخ الحدث غير صحيح', 422)

    const event = await db.event.create({
      data: { title, body: text, type, startsAt, createdBy: staff.id },
    })
    return Response.json({ event }, { status: 201 })
  })
}
