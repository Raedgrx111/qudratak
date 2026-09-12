import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, setSessionCookie } from '@/lib/auth'
import { validateRealEmail } from '@/lib/email-guard'
import { guard } from '@/lib/rate-limit'
import { handle, fail } from '@/lib/api'
import { getCurrentInviteCode, inviteCodeMatches, isRegistrationOpen } from '@/lib/platform-settings'

export async function POST(req: NextRequest) {
  // حماية من التسجيل الجماعي الآلي — سقف يتحمل تسجيل مدرسة كاملة (1200 طالب) من نفس الشبكة
  const ipGuard = guard(req, 'register', 150, 3_600_000, 'تم إنشاء حسابات كثيرة من جهازك — حاول بعد ساعة أو تواصل مع إدارة المنصة')
  if (ipGuard) return ipGuard

  return handle(async () => {
    const body = await req.json().catch(() => null)
    const name = body?.name?.trim()
    const email = body?.email?.trim()?.toLowerCase()
    const confirmEmail = typeof body?.confirmEmail === 'string' ? body.confirmEmail.trim().toLowerCase() : null
    const password = body?.password
    const grade = body?.grade?.trim() || null
    const school = body?.school?.trim() || null // حقل قديم اختياري — الواجهة الجديدة لا ترسله
    const sectionNumber = body?.sectionNumber?.trim() || null
    const inviteCode = typeof body?.inviteCode === 'string' ? body.inviteCode : ''

    // 1) بوابة رمز الدعوة — تُقارن بجهة الخادم فقط
    if (!(await isRegistrationOpen())) {
      return fail('التسجيل مغلق حاليًا — تواصل مع إدارة المنصة', 403)
    }
    if (!inviteCode.trim()) return fail('رمز الدعوة مطلوب — أدخل رمز الدعوة الذي حصلت عليه من إدارة المنصة', 422)
    const storedCode = await getCurrentInviteCode()
    if (!inviteCodeMatches(inviteCode, storedCode)) {
      return fail('رمز الدعوة غير صحيح — تأكد منه مع إدارة المنصة', 403)
    }

    // 2) البيانات الأساسية
    if (!name || name.length < 2) return fail('الاسم مطلوب (حرفان على الأقل)', 422)
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('البريد الإلكتروني غير صحيح', 422)
    if (confirmEmail !== null && confirmEmail !== email) return fail('البريد الإلكتروني غير متطابق', 422)
    if (!password || password.length < 8) return fail('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 422)

    // 3) الشعبة إلزامية لكل طالب: 3 أرقام فقط (مثل 101 / 204 / 308)
    if (!sectionNumber) return fail('رقم الشعبة مطلوب — اكتب رقم شعبتك بـ 3 أرقام مثل 101 أو 204 أو 308', 422)
    if (!/^\d{3}$/.test(sectionNumber)) return fail('رقم الشعبة يجب أن يكون 3 أرقام فقط — مثل 101 أو 204 أو 308', 422)

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return fail('هذا البريد الإلكتروني مسجل مسبقًا', 409)

    // حماية من البريد الوهمي: نطاق مؤقت معروف أو نطاق لا يستقبل الرسائل
    const emailError = await validateRealEmail(email)
    if (emailError) return fail(emailError, 422)

    const passwordHash = await hashPassword(password)
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'STUDENT',
        grade,
        school,
        sectionNumber,
        // التسجيل بدعوة = بريد موثوق تلقائيًا — بدون رمز تأكيد، ودخول مباشر للمنصة
        emailVerified: true,
      },
      select: { id: true, name: true, email: true, role: true },
    })

    const token = await setSessionCookie(user.id, user.role)
    return Response.json({ user, token, emailVerified: true })
  })
}
