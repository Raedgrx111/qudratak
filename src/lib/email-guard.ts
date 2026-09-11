// حارس البريد الإلكتروني — يمنع البريد الوهمي/المؤقت/العشوائي عند التسجيل
import dns from 'dns'
import { probeMailbox } from '@/lib/mailbox-probe'

/** نطاقات البريد المؤقت/الوهمي الشائعة (قائمة محدثة يدويًا) */
const DISPOSABLE_DOMAINS = new Set([
  // temp-mail و مشتقاته
  'tempmail.com', 'temp-mail.org', 'tempmailo.com', 'tempr.email', 'tempmail.net', 'tempmail.dev',
  'tmail.ws', 'tmails.net', 'tmpmail.org', 'tmpmail.net', 'tmpbox.net', 'tempinbox.com',
  '10minutemail.com', '10minutemail.net', '10minmail.com', '20minutemail.com', 'guerrillamail.com',
  'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz', 'guerrillamailblock.com',
  'sharklasers.com', 'grr.la', 'spam4.me', 'pokemail.net', 'dispostable.com', 'fakeinbox.com',
  'mailinator.com', 'mailinator.net', 'mailinator2.com', 'sogetthis.com', 'reallymymail.com',
  'yopmail.com', 'yopmail.net', 'yopmail.fr', 'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc',
  'trashmail.com', 'trashmail.net', 'trashmail.de', 'wegwerfmail.de', 'wegwerfmail.net',
  'getnada.com', 'nada.email', 'maildrop.cc', 'mailnesia.com', 'moakt.com', 'mohmal.com',
  'emailondeck.com', 'throwawaymail.com', 'mailcatch.com', 'spambog.com', 'mytemp.email',
  'burnermail.io', 'inboxkitten.com', 'dropmail.me', 'zetmail.com', 'einrot.com', 'gustr.com',
  'cuvox.de', 'dayrep.com', 'fleckens.hu', 'jourrapide.com', 'rhyta.com', 'armyspy.com',
  'vintomaper.com', 'superrito.com', 'teleworm.us', 'mailtemp.info', 'byom.de', 'clrmail.com',
  '1secmail.com', '1secmail.net', '1secmail.org', 'esiix.com', 'wwjmp.com', 'xcgdk.com',
  'meltmail.com', 'spambox.us', 'deadaddress.com', 'mailsac.com', 'inboxbear.com',
  'fakemail.net', 'fake-mail.net', 'nowmymail.com', 'mail-temp.com', 'emltmp.com',
])

/** هل البريد من نطاق مؤقت/وهمي معروف؟ */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) return true
  if (DISPOSABLE_DOMAINS.has(domain)) return true
  // نطاقات فرعية لمواقع البريد المؤقت (مثل xxx.mailinator.com)
  const parts = domain.split('.')
  for (let i = 1; i < parts.length - 1; i++) {
    if (DISPOSABLE_DOMAINS.has(parts.slice(i).join('.'))) return true
  }
  return false
}

/**
 * هل النطاق يستقبل البريد فعلًا؟ نفحص سجل MX.
 * - يوجد MX → صحيح
 * - النطاق غير موجود (ENOTFOUND/ENODATA) → وهمي
 * - خطأ DNS مؤقت آخر → نسمح (fail-open حتى لا نحجب بريدًا حقيقيًا بسبب عطل شبكتنا)
 */
export async function domainAcceptsMail(email: string): Promise<boolean> {
  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) return false
  try {
    const records = await dns.promises.resolveMx(domain)
    return records.length > 0
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'ENOTFOUND' || code === 'ENODATA') return false // النطاق غير موجود أو بلا سجلات بريد
    return true // أعطال أخرى (مهلة/خدمة) — نتجاهل حتى لا نرفض بريدًا حقيقيًا
  }
}

/**
 * أنماط عشوائية واضحة لا تصادف أسماء حقيقية عمليًا:
 * - حرف مكرر 5 مرات متتالية (aaaaa123)
 * - 12 حرفًا فأكثر بلا أي حرف علة (xkqwrtyplkjm)
 */
export function looksRandomEmail(email: string): boolean {
  const local = email.split('@')[0]?.toLowerCase() ?? ''
  if (!local) return true
  if (/(.)\1{4,}/.test(local)) return true
  if (local.length >= 12 && !/[aeiou]/.test(local)) return true
  return false
}

/** فحص شامل عند التسجيل — يعيد رسالة الخطأ أو null إن كان البريد مقبولًا */
export async function validateRealEmail(email: string): Promise<string | null> {
  if (isDisposableEmail(email)) {
    return 'البريد الإلكتروني المؤقت/الوهمي ممنوع — سجّل ببريدك الحقيقي لتصلك رموز التأكيد'
  }
  if (looksRandomEmail(email)) {
    return 'البريد الإلكتروني يبدو عشوائيًا — سجّل ببريدك الشخصي الحقيقي (مثل بريد Gmail الخاص بك)'
  }
  if (!(await domainAcceptsMail(email))) {
    return 'نطاق البريد الإلكتروني غير صحيح أو لا يقبل الرسائل — تأكد من كتابة بريدك بشكل صحيح'
  }
  // أقوى فحص: سؤال خادم البريد نفسه — هل هذا الصندوق موجود؟
  // (يرفض مثلاً asdf999@gmail.com العشوائي؛ يمرّ fail-open عند تعذر الفحص)
  if ((await probeMailbox(email)) === 'not-found') {
    return 'هذا البريد غير موجود فعليًا على خادم البريد — تأكد من كتابته بشكل صحيح أو استخدم بريدك الحقيقي'
  }
  return null
}
