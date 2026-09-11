// منطق رموز تأكيد البريد — توليد/بصمة/إصدار
// الرمز 6 أرقام، يُخزن كبصمة SHA-256 فقط، صالح 10 دقائق، 5 محاولات كحد أقصى، تبريد إعادة إرسال 60 ثانية
import crypto from 'crypto'
import { db } from '@/lib/db'
import { sendMail, verificationEmailHtml, mailerConfigured } from './mailer'

export const CODE_TTL_MS = 10 * 60 * 1000
export const RESEND_COOLDOWN_MS = 60 * 1000
export const MAX_ATTEMPTS = 5

export function hashCode(code: string): string {
  const secret = process.env.JWT_SECRET || 'qudratak-dev-secret-change-in-production-2024'
  return crypto.createHash('sha256').update(`${code}:${secret}`).digest('hex')
}

/** يصدر رمزًا جديدًا للمستخدم ويحاول إرساله — يعيد هل أُرسل فعلًا */
export async function issueVerificationCode(user: { id: string; name: string; email: string }): Promise<boolean> {
  const code = String(crypto.randomInt(100000, 999999))
  await db.user.update({
    where: { id: user.id },
    data: {
      verificationCode: hashCode(code),
      verificationExpires: new Date(Date.now() + CODE_TTL_MS),
      verificationAttempts: 0,
      verificationLastSent: new Date(),
    },
  })

  const result = await sendMail({
    to: user.email,
    subject: `رمز تأكيد بريدك: ${code} — قدراتك`,
    html: verificationEmailHtml(user.name, code),
    text: `مرحبًا ${user.name}،\nرمز تأكيد بريدك في منصة قدراتك هو: ${code}\nصالح لمدة 10 دقائق.`,
  })

  if (!result.sent) {
    // الوضع اليدوي: نطبع الرمز في سجل الخادم فقط (يؤكد الحساب مالك المنصة من لوحته)
    console.log(`[verification] ${mailerConfigured() ? 'إرسال فشل' : 'لا يوجد مزود بريد'} — رمز ${user.email}: ${code}`)
  }
  return result.sent
}
