import { createHmac, timingSafeEqual } from 'crypto'

// ---------- حماية بث المقاطع الملفية من التحميل ----------
// الفكرة: رابط المصدر لا يُكشف للطلاب أبدًا. بدلًا منه يصدر الخادم
// «رابط بث» موقّعًا بـ HMAC-SHA256 ومرتبطًا بالمستخدم والمقطع وينتهي تلقائيًا.
// أي شخص يشارك رابط البث سيجده منتهي الصلاحية خلال دقائق، والمصدر الأصلي مجهول.

const SECRET = process.env.JWT_SECRET || 'qudratak-dev-secret-change-in-production-2024'

/** مدة صلاحية رابط البث الافتراضية بالثواني (30 دقيقة — تكمل المشاهدة ثم يموت الرابط) */
export const STREAM_TOKEN_TTL = 60 * 30

/** توليد توكن بث موقّع لمقطع ملفي لمستخدم معيّن */
export function signClipStreamToken(clipId: string, uid: string, ttlSec = STREAM_TOKEN_TTL): string {
  const exp = Date.now() + ttlSec * 1000
  const sig = createHmac('sha256', SECRET).update(`${clipId}.${uid}.${exp}`).digest('base64url')
  return `${exp}.${sig}`
}

/** التحقق من توكن بث — صحيح فقط إذا كان غير منتهٍ والتوقيع يطابق المقطع والمستخدم */
export function verifyClipStreamToken(clipId: string, uid: string, token: string | null): boolean {
  if (!token) return false
  const dot = token.indexOf('.')
  if (dot <= 0) return false
  const exp = Number(token.slice(0, dot))
  const sig = token.slice(dot + 1)
  if (!Number.isFinite(exp) || !exp || Date.now() > exp || !sig) return false
  const expected = createHmac('sha256', SECRET).update(`${clipId}.${uid}.${exp}`).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** بناء رابط البث الكامل (نسبي) لمشغّل الفيديو */
export function buildClipStreamPath(clipId: string, uid: string): string {
  const tk = signClipStreamToken(clipId, uid)
  return `/api/clips/${clipId}/stream?uid=${encodeURIComponent(uid)}&tk=${tk}`
}
