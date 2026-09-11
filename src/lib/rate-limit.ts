import { NextResponse } from 'next/server'

/**
 * محرك الحماية من الهجمات وضغط السيرفر (Rate Limiting + Account Lockout)
 * ---------------------------------------------------------------
 * - نافذة ثابتة بالذاكرة (مناسبة لخادم واحد) — للتوسع الأفقي مستقبلًا تُستبدل بـ Redis بنفس الواجهة
 * - تنظيف دوري للخرائط حتى لا تتحول نفسها إلى ثغرة استهلاك ذاكرة
 * - لا تعتمد على أي APIs خاصة بـ Node (تعمل في Middleware على Edge أيضًا)
 */

type Bucket = { count: number; resetAt: number }
type LockRecord = { fails: number; lockedUntil: number }

const buckets = new Map<string, Bucket>()
const lockouts = new Map<string, LockRecord>()

// سقف صارم لحجم الخرائط — منع تحويل الحماية نفسها إلى ثغرة ذاكرة
const MAX_BUCKETS = 50_000
const MAX_LOCKOUTS = 10_000
let lastSweep = 0

function sweep(now: number) {
  if (now - lastSweep < 30_000) return
  lastSweep = now
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k)
  for (const [k, l] of lockouts) if (l.lockedUntil <= now && l.fails === 0) lockouts.delete(k)
  if (buckets.size > MAX_BUCKETS) {
    for (const k of [...buckets.keys()].slice(0, 10_000)) buckets.delete(k)
  }
  if (lockouts.size > MAX_LOCKOUTS) {
    for (const k of [...lockouts.keys()].slice(0, 2_000)) lockouts.delete(k)
  }
}

/**
 * استخراج IP العميل الحقيقي خلف البروكسي (Caddy/Cloudflare)
 * نأخذ آخر عنصر من X-Forwarded-For (الذي أضافه بروكسيُنا الموثوق) —
 * أخذ أول عنصر يسمح بالانتحال وإدارة هجمات بعدّة هويات وهمية.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length > 0) return parts[parts.length - 1]
  }
  return req.headers.get('x-real-ip') || 'unknown'
}

export interface RateResult {
  ok: boolean
  retryAfter: number // ثوانٍ حتى رفع الحظر (0 = مسموح)
}

/** عدّاد نافذة ثابتة — يعيد ok:false عند تجاوز الحد خلال النافذة */
export function rateLimit(key: string, max: number, windowMs: number): RateResult {
  const now = Date.now()
  sweep(now)
  const b = buckets.get(key)
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }
  b.count++
  if (b.count > max) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) }
  }
  return { ok: true, retryAfter: 0 }
}

const GENERIC_MSG = 'عدد كبير من الطلبات — تمهّل قليلًا ثم حاول مجددًا'

/** بوابة حسب IP — تُستدعى أعلى المسار؛ تعيد استجابة 429 جاهزة أو null إذا مسموح */
export function guard(
  req: Request,
  scope: string,
  max: number,
  windowMs: number,
  message = GENERIC_MSG
): NextResponse | null {
  const r = rateLimit(`${scope}:${getClientIp(req)}`, max, windowMs)
  if (r.ok) return null
  return NextResponse.json(
    { error: message, retryAfter: r.retryAfter },
    { status: 429, headers: { 'Retry-After': String(r.retryAfter) } }
  )
}

/** بوابة حسب المستخدم (بعد المصادقة) — لعمليات مكلفة مثل الذكاء الاصطناعي */
export function guardByUser(
  userId: string,
  scope: string,
  max: number,
  windowMs: number,
  message = GENERIC_MSG
): NextResponse | null {
  const r = rateLimit(`u:${scope}:${userId}`, max, windowMs)
  if (r.ok) return null
  return NextResponse.json(
    { error: message, retryAfter: r.retryAfter },
    { status: 429, headers: { 'Retry-After': String(r.retryAfter) } }
  )
}

// ---------------------------------------------------------------------------
// قفل الحسابات ضد تخمين كلمات المرور (Brute Force)
// 5 محاولات خاطئة → قفل 15 دقيقة على الحساب نفسه (بغض النظر عن مصدر IP)
// ---------------------------------------------------------------------------

export const MAX_LOGIN_FAILS = 5
export const LOGIN_LOCK_MS = 15 * 60_000

function lockKey(email: string) {
  return `login:${email.trim().toLowerCase()}`
}

/** كم بقي على رفع القفل؟ (0 = ليس مقفولًا) */
export function lockRemainingMs(email: string): number {
  const l = lockouts.get(lockKey(email))
  if (!l) return 0
  const now = Date.now()
  if (l.lockedUntil <= now) return 0
  return l.lockedUntil - now
}

/** كم محاولة خاطئة متبقية قبل تفعيل القفل؟ */
export function loginFailsRemaining(email: string): number {
  const l = lockouts.get(lockKey(email))
  if (!l) return MAX_LOGIN_FAILS
  return Math.max(0, MAX_LOGIN_FAILS - l.fails)
}

/** تسجيل محاولة فاشلة — يعيد مدة القفل إن فعّل القفل الآن (0 إن لا) */
export function loginFail(email: string): number {
  const key = lockKey(email)
  const l = lockouts.get(key) ?? { fails: 0, lockedUntil: 0 }
  l.fails++
  if (l.fails >= MAX_LOGIN_FAILS) {
    l.lockedUntil = Date.now() + LOGIN_LOCK_MS
    l.fails = 0
  }
  lockouts.set(key, l)
  return Math.max(0, l.lockedUntil - Date.now())
}

/** دخول ناجح — تصفير عداد الفشل */
export function loginSuccess(email: string): void {
  lockouts.delete(lockKey(email))
}
