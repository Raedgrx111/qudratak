import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, setSessionCookie } from '@/lib/auth'
import { validateRealEmail } from '@/lib/email-guard'
import { issueVerificationCode } from '@/lib/verify'
import { guard } from '@/lib/rate-limit'
import { handle, fail } from '@/lib/api'

export async function POST(req: NextRequest) {
  // حماية من التسجيل الجماعي الآلي — سقف يتحمل تسجيل مدرسة كاملة (1200 طالب) من نفس الشبكة
  const ipGuard = guard(req, 'register', 150, 3_600_000, 'تم إنشاء حسابات كثيرة من جهازك — حاول بعد ساعة أو تواصل مع إدارة المنصة')
  if (ipGuard) return ipGuard

  return handle(async () => {
    const body = await req.json().catch(() => null)
    const name = body?.name?.trim()
    const email = body?.email?.trim()?.toLowerCase()
    const password = body?.password
    const grade = body?.grade?.trim() || null
    const school = body?.school?.trim() || null
    const sectionNumber = body?.sectionNumber?.trim() || null

    if (!name || name.length < 2) return fail('الاسم مطلوب (حرفان على الأقل)', 422)
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('البريد الإلكتروني غير صحيح', 422)
    if (!password || password.length < 8) return fail('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 422)

    // شعبة طلاب مجمع الأمير محمد بن فهد: إلزامية بصيغة 3 أرقام (101 / 204 / 308)
    const COMPLEX = 'مجمع الأمير محمد بن فهد'
    if (school === COMPLEX) {
      if (!sectionNumber) return fail('رقم الشعبة مطلوب لطلاب المجمع — اكتب رقم شعبتك مثل 101 أو 204 أو 308', 422)
      if (!/^\d{3}$/.test(sectionNumber)) return fail('رقم الشعبة يجب أن يكون 3 أرقام — مثل 101 أو 204 أو 308', 422)
    } else if (sectionNumber && school !== COMPLEX) {
      return fail('رقم الشعبة مخصص لطلاب مجمع الأمير محمد بن فهد فقط', 422)
    }

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
        school: school === COMPLEX ? COMPLEX : null,
        sectionNumber: school === COMPLEX ? sectionNumber : null,
        emailVerified: false,
      },
      select: { id: true, name: true, email: true, role: true },
    })

    // إصدار رمز التأكيد وإرساله (الوضع اليدوي إن لم يُعد مزود بريد)
    let verificationSent = false
    try {
      verificationSent = await issueVerificationCode({ id: user.id, name: user.name, email: user.email })
    } catch (e) {
      console.error('[register] verification issue failed:', e)
    }

    const token = await setSessionCookie(user.id, user.role)
    return Response.json({ user, token, emailVerified: false, verificationSent })
  })
}
