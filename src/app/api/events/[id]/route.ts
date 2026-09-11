import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireStaff } from '@/lib/auth'
import { handle, fail } from '@/lib/api'

// PATCH /api/events/[id] — تعديل حدث أو تفعيل/تعطيل (إدارة فقط)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireStaff()
    const { id } = await params
    const body = await req.json().catch(() => null)

    const existing = await db.event.findUnique({ where: { id } })
    if (!existing) return fail('الحدث غير موجود', 404)

    const data: { title?: string; body?: string; type?: string; startsAt?: Date | null; isActive?: boolean } = {}
    if (typeof body?.title === 'string' && body.title.trim().length >= 3) data.title = body.title.trim()
    if (typeof body?.body === 'string' && body.body.trim().length >= 5) data.body = body.body.trim()
    if (['NEWS', 'EVENT', 'COMPETITION', 'TIP'].includes(body?.type)) data.type = body.type
    if (typeof body?.isActive === 'boolean') data.isActive = body.isActive
    if (body?.startsAt !== undefined) {
      const d = body.startsAt ? new Date(body.startsAt) : null
      if (d && isNaN(d.getTime())) return fail('تاريخ الحدث غير صحيح', 422)
      data.startsAt = d
    }

    const event = await db.event.update({ where: { id }, data })
    return Response.json({ event })
  })
}

// DELETE /api/events/[id] — حذف حدث (إدارة فقط)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireStaff()
    const { id } = await params
    const existing = await db.event.findUnique({ where: { id } })
    if (!existing) return fail('الحدث غير موجود', 404)
    await db.event.delete({ where: { id } })
    return Response.json({ ok: true })
  })
}
