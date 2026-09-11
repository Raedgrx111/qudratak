import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword, requireUser, touchLastActive } from '@/lib/auth'
import { guardByUser } from '@/lib/rate-limit'
import { handle, fail } from '@/lib/api'

// PUT /api/auth/password — تغيير كلمة المرور الذاتي (يتطلب كلمة المرور الحالية)
export async function PUT(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser()
    // حماية من تكرار المحاولات على تبديل كلمة المرور
    const g = guardByUser(user.id, 'password', 5, 600_000, 'محاولات كثيرة لتغيير كلمة المرور — حاول بعد 10 دقائق')
    if (g) return g
    const body = await req.json().catch(() => null)
    const currentPassword = body?.currentPassword
    const newPassword = body?.newPassword

    if (!currentPassword) return fail('كلمة المرور الحالية مطلوبة', 422)
    if (!newPassword || String(newPassword).length < 8)
      return fail('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل', 422)
    if (currentPassword === newPassword) return fail('كلمة المرور الجديدة يجب أن تختلف عن الحالية', 422)

    const record = await db.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } })
    if (!record) return fail('الحساب غير موجود', 404)

    const valid = await verifyPassword(String(currentPassword), record.passwordHash)
    if (!valid) return fail('كلمة المرور الحالية غير صحيحة', 401)

    const passwordHash = await hashPassword(String(newPassword))
    await db.user.update({ where: { id: user.id }, data: { passwordHash } })
    await touchLastActive(user.id)

    return Response.json({ ok: true })
  })
}
