import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireUser, touchLastActive } from '@/lib/auth'
import { handle, fail } from '@/lib/api'

// GET /api/auth/me — بيانات الجلسة الحالية (مع تحديث آخر نشاط لتتبع الحسابات)
export async function GET() {
  return handle(async () => {
    const session = await getSessionUser()
    if (!session) return Response.json({ user: null })
    await touchLastActive(session.id)
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        grade: true,
        school: true,
        sectionNumber: true,
        emailVerified: true,
        createdAt: true,
        lastActiveAt: true,
        _count: { select: { answers: true, attempts: true, favorites: true } },
      },
    })
    return Response.json({ user })
  })
}

// PATCH /api/auth/me — تحديث الملف الشخصي
export async function PATCH(req: NextRequest) {
  return handle(async () => {
    const session = await requireUser()
    const body = await req.json().catch(() => null)
    const name = body?.name?.trim()
    const grade = body?.grade?.trim() || null
    const school = body?.school?.trim() || null
    const sectionNumber = body?.sectionNumber?.trim() || null

    if (!name || name.length < 2) return fail('الاسم مطلوب (حرفان على الأقل)', 422)

    // نفس قواعد التسجيل: الشعبة لطلاب مجمع الأمير محمد بن فهد فقط (3 أرقام)
    const COMPLEX = 'مجمع الأمير محمد بن فهد'
    if (school === COMPLEX) {
      if (!sectionNumber) return fail('رقم الشعبة مطلوب لطلاب المجمع — مثل 101 أو 204 أو 308', 422)
      if (!/^\d{3}$/.test(sectionNumber)) return fail('رقم الشعبة يجب أن يكون 3 أرقام — مثل 101 أو 204 أو 308', 422)
    }

    const user = await db.user.update({
      where: { id: session.id },
      data: {
        name,
        grade,
        school: school === COMPLEX ? COMPLEX : null,
        sectionNumber: school === COMPLEX ? sectionNumber : null,
      },
      select: { id: true, name: true, email: true, role: true, grade: true, school: true, sectionNumber: true },
    })
    return Response.json({ user })
  })
}
