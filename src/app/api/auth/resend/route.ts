import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { issueVerificationCode, RESEND_COOLDOWN_MS } from '@/lib/verify'
import { guard } from '@/lib/rate-limit'
import { handle, fail } from '@/lib/api'

// POST /api/auth/resend {email} — إعادة إرسال رمز التأكيد (تبريد 60 ثانية)
// لا نكشف إن كان البريد مسجلًا أصلًا (حماية من تعداد الحسابات)
export async function POST(req: NextRequest) {
  // حماية من تحويل الإعادة الإرسال إلى أداة إزعاج بريدي (Mail Bombing)
  const ipGuard = guard(req, 'resend', 30, 600_000, 'طلبات إعادة إرسال كثيرة — حاول بعد 10 دقائق') // التبريد لكل حساب 60 ثانية يبقى هو الحاجز
  if (ipGuard) return ipGuard

  return handle(async () => {
    const body = await req.json().catch(() => null)
    const email = body?.email?.trim()?.toLowerCase()
    if (!email) return fail('البريد الإلكتروني مطلوب', 422)

    const user = await db.user.findUnique({ where: { email } })
    if (user && !user.emailVerified) {
      const last = user.verificationLastSent?.getTime() ?? 0
      const elapsed = Date.now() - last
      if (elapsed < RESEND_COOLDOWN_MS) {
        const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
        return fail(`انتظر ${wait} ثانية قبل طلب رمز جديد`, 429)
      }
      await issueVerificationCode(user)
    }
    return Response.json({ ok: true })
  })
}
