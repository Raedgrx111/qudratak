import { NextRequest } from 'next/server'
import { requireOwner } from '@/lib/auth'
import { handle, fail } from '@/lib/api'
import { getCurrentInviteCode, isRegistrationOpen, setSetting, SETTING_KEYS } from '@/lib/platform-settings'

// GET /api/admin/settings — عرض إعدادات التسجيل (المالك فقط)
export async function GET() {
  return handle(async () => {
    await requireOwner()
    const inviteCode = await getCurrentInviteCode()
    const registrationOpen = await isRegistrationOpen()
    return Response.json({ inviteCode, registrationOpen })
  })
}

// PATCH /api/admin/settings — تغيير رمز الدعوة أو فتح/إغلاق التسجيل الجديد (المالك فقط)
export async function PATCH(req: NextRequest) {
  return handle(async () => {
    await requireOwner()
    const body = await req.json().catch(() => null)

    const data: { inviteCode?: string; registrationOpen?: boolean } = {}

    if (body?.inviteCode !== undefined) {
      const code = typeof body.inviteCode === 'string' ? body.inviteCode.trim() : ''
      if (!/^[\w-]{4,24}$/.test(code)) {
        return fail('رمز الدعوة يجب أن يكون من 4 إلى 24 حرفًا/رقمًا (يُسمح بالشرطة - وبدون مسافات)', 422)
      }
      data.inviteCode = code.toUpperCase()
    }

    if (body?.registrationOpen !== undefined) {
      if (typeof body.registrationOpen !== 'boolean') return fail('قيمة فتح التسجيل غير صحيحة', 422)
      data.registrationOpen = body.registrationOpen
    }

    if (Object.keys(data).length === 0) return fail('لا توجد تغييرات', 422)

    if (data.inviteCode !== undefined) await setSetting(SETTING_KEYS.INVITE_CODE, data.inviteCode)
    if (data.registrationOpen !== undefined)
      await setSetting(SETTING_KEYS.REGISTRATION_OPEN, data.registrationOpen ? 'true' : 'false')

    const inviteCode = await getCurrentInviteCode()
    const registrationOpen = await isRegistrationOpen()
    return Response.json({ ok: true, inviteCode, registrationOpen })
  })
}
