import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { setSessionCookie } from '@/lib/auth'
import { hashCode, MAX_ATTEMPTS } from '@/lib/verify'
import { guard } from '@/lib/rate-limit'
import { handle, fail } from '@/lib/api'

// POST /api/auth/verify {email, code} — تأكيد البريد برمز 6 أرقام
export async function POST(req: NextRequest) {
  // حماية من تخمين الرمز آليًا (الحد الخاص بالمحاولات داخل الرمز نفسه = 5)
  const ipGuard = guard(req, 'verify', 60, 60_000) // سقف يتحمل تأكيد مدرسة كاملة من نفس الشبكة
  if (ipGuard) return ipGuard

  return handle(async () => {
    const body = await req.json().catch(() => null)
    const email = body?.email?.trim()?.toLowerCase()
    const code = String(body?.code ?? '').replace(/\D/g, '')

    if (!email || code.length !== 6) return fail('أدخل رمز التأكيد المكوّن من 6 أرقام', 422)

    const user = await db.user.findUnique({ where: { email } })
    if (!user) return fail('رمز التأكيد غير صحيح', 400)

    if (user.emailVerified) {
      // مؤكد مسبقًا — نعاود تسجيل الجلسة مباشرة
      const token = await setSessionCookie(user.id, user.role)
      return Response.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: true },
        token,
        alreadyVerified: true,
      })
    }

    if (!user.verificationCode || !user.verificationExpires || user.verificationExpires.getTime() < Date.now()) {
      return fail('انتهت صلاحية الرمز — اطلب رمزًا جديدًا', 410)
    }
    if (user.verificationAttempts >= MAX_ATTEMPTS) {
      return fail('محاولات كثيرة خاطئة — اطلب رمزًا جديدًا', 429)
    }

    if (hashCode(code) !== user.verificationCode) {
      await db.user.update({ where: { id: user.id }, data: { verificationAttempts: { increment: 1 } } })
      const left = MAX_ATTEMPTS - (user.verificationAttempts + 1)
      return fail(`الرمز غير صحيح — بقي لديك ${Math.max(left, 0)} محاولة`, 400)
    }

    const verified = await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationExpires: null,
        verificationAttempts: 0,
      },
      select: { id: true, name: true, email: true, role: true, emailVerified: true },
    })
    const token = await setSessionCookie(user.id, verified.role)
    return Response.json({ user: verified, token })
  })
}
