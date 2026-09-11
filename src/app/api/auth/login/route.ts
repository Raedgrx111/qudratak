import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, setSessionCookie } from '@/lib/auth'
import { handle, fail } from '@/lib/api'
import { guard, lockRemainingMs, loginFail, loginSuccess, loginFailsRemaining } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  // حماية من هجمات تخمين كلمات المرور — سقف المصدر يتحمل دخول مدرسة كاملة من نفس الشبكة،
  // والحماية الحقيقية ضد التخمين تبقى قفل الحساب نفسه (5 محاولات → 15 دقيقة)
  const ipGuard = guard(req, 'login', 120, 60_000, 'محاولات دخول كثيرة من جهازك — انتظر دقيقة ثم حاول')
  if (ipGuard) return ipGuard

  return handle(async () => {
    const body = await req.json().catch(() => null)
    const email = body?.email?.trim()?.toLowerCase()
    const password = body?.password
    if (!email || !password) return fail('البريد الإلكتروني وكلمة المرور مطلوبان', 422)

    // قفل الحساب بعد محاولات خاطئة متكررة (Brute Force Lockout)
    const lockMs = lockRemainingMs(email)
    if (lockMs > 0) {
      const minutes = Math.ceil(lockMs / 60_000)
      return fail(`تم تعطيل الدخول لهذا الحساب مؤقتًا بسبب محاولات خاطئة متكررة — حاول بعد ${minutes} دقيقة`, 423, {
        retryAfter: Math.ceil(lockMs / 1000),
      })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) return fail('بيانات الدخول غير صحيحة', 401)
    if (user.isBanned) return fail('تم تعليق هذا الحساب من قبل إدارة المنصة', 403)

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      const justLockedMs = loginFail(email)
      if (justLockedMs > 0) {
        return fail('محاولات خاطئة كثيرة — تم تعطيل الدخول 15 دقيقة لحماية حسابك', 423)
      }
      const left = loginFailsRemaining(email)
      return fail(
        left <= 2
          ? `بيانات الدخول غير صحيحة — تنبيه: بقي لديك ${left} ${left === 1 ? 'محاولة' : 'محاولتين'} قبل تعطيل الدخول مؤقتًا`
          : 'بيانات الدخول غير صحيحة',
        401
      )
    }

    loginSuccess(email)
    await db.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } })
    const token = await setSessionCookie(user.id, user.role)
    return Response.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, grade: user.grade, emailVerified: user.emailVerified },
      token,
    })
  })
}
