import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * خط الدفاع الأول (Middleware) — يعمل قبل كل طلب:
 * 1. ترويسات أمان على كل الردود (CSP / nosniff / referrer / permissions / HSTS)
 * 2. حد عام للـ APIs: افتراضيًا 1200 طلب/دقيقة لكل IP (GLOBAL_API_RPM) — يصدّ طوفان الطلبات مبكرًا
 *    (يستثني بث المقاطع لأن مشغّل الفيديو يطلق طلبات Range متكررة طبيعية)
 * 3. رفض الأجسام الضخمة (> 10MB) قبل وصولها للمسارات — مع استثناء رفع المقاطع (سقف خاص أكبر)
 */

// الحد العام للـ APIs — قابل للضبط بمتغير البيئة GLOBAL_API_RPM
// الافتراضي 1200 طلب/دقيقة لكل IP: يتحمل مدرسة كاملة (1200 طالب) تتشارك نفس الشبكة،
// ويبقى يصدّ طوفان الهجمات الآلية (التي تضرب بالآلاف في الدقيقة)
const GLOBAL_API_LIMIT = Math.max(240, Number(process.env.GLOBAL_API_RPM || 1200))
const MAX_BODY_BYTES = 10 * 1024 * 1024 // 10MB (يتسع لاستيراد ملفات Excel)
// رفع مقاطع الفيديو من جهاز المالك — سقف خاص أكبر (متغير بيئة اختياري، افتراضي 500MB)
const UPLOAD_RE = /^\/api\/clips\/upload$/
const MAX_UPLOAD_BYTES = Math.min(Number(process.env.MAX_CLIP_UPLOAD_MB || 500), 2000) * 1024 * 1024
const STREAM_RE = /^\/api\/clips\/[^/]+\/stream$/

// سياسة محتوى متوازنة: تسمح بكل ما تحتاجه المنصة (يوتيوب nocookie، صور مصغرة، HMR في التطوير)
// وتمنع: تضمين المنصة في مواقع أخرى (Clickjacking)، الكائنات/الإطارات الخبيثة، النماذج الخارجية
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com",
  "connect-src 'self' ws: wss:",
  // نسمح للتضمين من نطاق المعاينة الخاص بالبيئة حتى يعمل زر المعاينة
  "frame-ancestors 'self' https://*.space-z.ai",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('Content-Security-Policy', CSP)
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
  )
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  return res
}

function floodResponse(retryAfter: number): NextResponse {
  const res = NextResponse.json(
    { error: 'عدد كبير من الطلبات — تمهّل قليلًا ثم حاول مجددًا', retryAfter },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
  return applySecurityHeaders(res)
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/api/')) {
    // 1) حجب الأجسام الضخمة مبكرًا — لرفع المقاطع سقف خاص أكبر، ولغيره 10MB
    const contentLength = Number(req.headers.get('content-length') || 0)
    const bodyCap = UPLOAD_RE.test(pathname) ? MAX_UPLOAD_BYTES : MAX_BODY_BYTES
    if (contentLength > bodyCap) {
      const res = NextResponse.json(
        {
          error: UPLOAD_RE.test(pathname)
            ? `حجم الفيديو يتجاوز الحد الأقصى (${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB)`
            : 'حجم الطلب كبير جدًا (الحد 10MB)',
        },
        { status: 413 }
      )
      return applySecurityHeaders(res)
    }

    // 2) الحد العام ضد الطوفان — مع استثناء بث الفيديو (طلبات Range كثيرة طبيعيًا)
    if (!STREAM_RE.test(pathname)) {
      const r = rateLimit(`api:${getClientIp(req)}`, GLOBAL_API_LIMIT, 60_000)
      if (!r.ok) return floodResponse(r.retryAfter)
    }
  }

  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  // كل المسارات ما عدا الأصول الثابتة — حتى تغطي الترويسات صفحات التطبيق والـ APIs معًا
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
