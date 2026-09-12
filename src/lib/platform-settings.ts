// إعدادات المنصة العامة — تُخزن في قاعدة البيانات ولا تُعرَّض للواجهة إلا للمالك عبر API محمي
import { db } from '@/lib/db'

export const SETTING_KEYS = {
  INVITE_CODE: 'INVITE_CODE',
  REGISTRATION_OPEN: 'REGISTRATION_OPEN',
} as const

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.platformSetting.findUnique({ where: { key } })
  return row?.value ?? null
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.platformSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  })
}

// هل التسجيل الجديد مفتوح؟ (الافتراضي: مفتوح)
export async function isRegistrationOpen(): Promise<boolean> {
  const v = await getSetting(SETTING_KEYS.REGISTRATION_OPEN)
  return v !== 'false'
}

// رمز الدعوة الحالي — يُولَّد تلقائيًا عند أول استخدام إن لم يضبطه المالك
export async function getCurrentInviteCode(): Promise<string> {
  const existing = await getSetting(SETTING_KEYS.INVITE_CODE)
  if (existing) return existing
  const generated = 'QDR-' + Math.floor(100000 + Math.random() * 900000)
  await setSetting(SETTING_KEYS.INVITE_CODE, generated)
  return generated
}

// مطابقة الرمز المدخل مع المخزن (تجاهل حالة الأحرف والمسافات لتسهيل الإدخال)
export function inviteCodeMatches(input: string, stored: string): boolean {
  return input.trim().toUpperCase() === stored.trim().toUpperCase()
}
