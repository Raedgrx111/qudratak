import { NextRequest } from 'next/server'
import { getCurrentInviteCode, inviteCodeMatches, isRegistrationOpen } from '@/lib/platform-settings'
import { guard } from '@/lib/rate-limit'
import { handle, fail } from '@/lib/api'

// POST /api/auth/invite-check — الخطوة الأولى في التسجيل: التحقق من رمز الدعوة قبل إظهار النموذج
// الرمز يُقارن بجهة الخادم فقط ولا يُرسل للواجهة أبدًا
export async function POST(req: NextRequest) {
  // منع تخمين الرمز: 10 محاولات كل 10 دقائق لكل عنوان IP
  const ipGuard = guard(req, 'invite-check', 10, 600_000, 'محاولات كثيرة لإدخال الرمز — انتظر 10 دقائق ثم أعد المحاولة')
  if (ipGuard) return ipGuard

  return handle(async () => {
    const body = await req.json().catch(() => null)
    const code = body?.code
    if (typeof code !== 'string' || !code.trim()) return fail('أدخل رمز الدعوة', 422)

    if (!(await isRegistrationOpen())) {
      return fail('التسجيل مغلق حاليًا — تواصل مع إدارة المنصة', 403)
    }

    const stored = await getCurrentInviteCode()
    if (!inviteCodeMatches(code, stored)) {
      return fail('رمز الدعوة غير صحيح — تأكد منه مع إدارة المنصة', 403)
    }

    return Response.json({ ok: true })
  })
}
