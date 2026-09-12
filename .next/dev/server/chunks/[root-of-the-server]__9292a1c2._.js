module.exports = [
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/tags-manifest.external.js [external] (next/dist/server/lib/incremental-cache/tags-manifest.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/tags-manifest.external.js", () => require("next/dist/server/lib/incremental-cache/tags-manifest.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/rate-limit.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LOGIN_LOCK_MS",
    ()=>LOGIN_LOCK_MS,
    "MAX_LOGIN_FAILS",
    ()=>MAX_LOGIN_FAILS,
    "getClientIp",
    ()=>getClientIp,
    "guard",
    ()=>guard,
    "guardByUser",
    ()=>guardByUser,
    "lockRemainingMs",
    ()=>lockRemainingMs,
    "loginFail",
    ()=>loginFail,
    "loginFailsRemaining",
    ()=>loginFailsRemaining,
    "loginSuccess",
    ()=>loginSuccess,
    "rateLimit",
    ()=>rateLimit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [middleware] (ecmascript)");
;
const buckets = new Map();
const lockouts = new Map();
// سقف صارم لحجم الخرائط — منع تحويل الحماية نفسها إلى ثغرة ذاكرة
const MAX_BUCKETS = 50_000;
const MAX_LOCKOUTS = 10_000;
let lastSweep = 0;
function sweep(now) {
    if (now - lastSweep < 30_000) return;
    lastSweep = now;
    for (const [k, b] of buckets)if (b.resetAt <= now) buckets.delete(k);
    for (const [k, l] of lockouts)if (l.lockedUntil <= now && l.fails === 0) lockouts.delete(k);
    if (buckets.size > MAX_BUCKETS) {
        for (const k of [
            ...buckets.keys()
        ].slice(0, 10_000))buckets.delete(k);
    }
    if (lockouts.size > MAX_LOCKOUTS) {
        for (const k of [
            ...lockouts.keys()
        ].slice(0, 2_000))lockouts.delete(k);
    }
}
function getClientIp(req) {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) {
        const parts = xff.split(',').map((s)=>s.trim()).filter(Boolean);
        if (parts.length > 0) return parts[parts.length - 1];
    }
    return req.headers.get('x-real-ip') || 'unknown';
}
function rateLimit(key, max, windowMs) {
    const now = Date.now();
    sweep(now);
    const b = buckets.get(key);
    if (!b || b.resetAt <= now) {
        buckets.set(key, {
            count: 1,
            resetAt: now + windowMs
        });
        return {
            ok: true,
            retryAfter: 0
        };
    }
    b.count++;
    if (b.count > max) {
        return {
            ok: false,
            retryAfter: Math.max(1, Math.ceil((b.resetAt - now) / 1000))
        };
    }
    return {
        ok: true,
        retryAfter: 0
    };
}
const GENERIC_MSG = 'عدد كبير من الطلبات — تمهّل قليلًا ثم حاول مجددًا';
function guard(req, scope, max, windowMs, message = GENERIC_MSG) {
    const r = rateLimit(`${scope}:${getClientIp(req)}`, max, windowMs);
    if (r.ok) return null;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: message,
        retryAfter: r.retryAfter
    }, {
        status: 429,
        headers: {
            'Retry-After': String(r.retryAfter)
        }
    });
}
function guardByUser(userId, scope, max, windowMs, message = GENERIC_MSG) {
    const r = rateLimit(`u:${scope}:${userId}`, max, windowMs);
    if (r.ok) return null;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: message,
        retryAfter: r.retryAfter
    }, {
        status: 429,
        headers: {
            'Retry-After': String(r.retryAfter)
        }
    });
}
const MAX_LOGIN_FAILS = 5;
const LOGIN_LOCK_MS = 15 * 60_000;
function lockKey(email) {
    return `login:${email.trim().toLowerCase()}`;
}
function lockRemainingMs(email) {
    const l = lockouts.get(lockKey(email));
    if (!l) return 0;
    const now = Date.now();
    if (l.lockedUntil <= now) return 0;
    return l.lockedUntil - now;
}
function loginFailsRemaining(email) {
    const l = lockouts.get(lockKey(email));
    if (!l) return MAX_LOGIN_FAILS;
    return Math.max(0, MAX_LOGIN_FAILS - l.fails);
}
function loginFail(email) {
    const key = lockKey(email);
    const l = lockouts.get(key) ?? {
        fails: 0,
        lockedUntil: 0
    };
    l.fails++;
    if (l.fails >= MAX_LOGIN_FAILS) {
        l.lockedUntil = Date.now() + LOGIN_LOCK_MS;
        l.fails = 0;
    }
    lockouts.set(key, l);
    return Math.max(0, l.lockedUntil - Date.now());
}
function loginSuccess(email) {
    lockouts.delete(lockKey(email));
}
}),
"[project]/src/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "proxy",
    ()=>proxy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rate-limit.ts [middleware] (ecmascript)");
;
;
/**
 * خط الدفاع الأول (Middleware) — يعمل قبل كل طلب:
 * 1. ترويسات أمان على كل الردود (CSP / nosniff / referrer / permissions / HSTS)
 * 2. حد عام للـ APIs: افتراضيًا 1200 طلب/دقيقة لكل IP (GLOBAL_API_RPM) — يصدّ طوفان الطلبات مبكرًا
 *    (يستثني بث المقاطع لأن مشغّل الفيديو يطلق طلبات Range متكررة طبيعية)
 * 3. رفض الأجسام الضخمة (> 10MB) قبل وصولها للمسارات — مع استثناء رفع المقاطع (سقف خاص أكبر)
 */ // الحد العام للـ APIs — قابل للضبط بمتغير البيئة GLOBAL_API_RPM
// الافتراضي 1200 طلب/دقيقة لكل IP: يتحمل مدرسة كاملة (1200 طالب) تتشارك نفس الشبكة،
// ويبقى يصدّ طوفان الهجمات الآلية (التي تضرب بالآلاف في الدقيقة)
const GLOBAL_API_LIMIT = Math.max(240, Number(process.env.GLOBAL_API_RPM || 1200));
const MAX_BODY_BYTES = 10 * 1024 * 1024 // 10MB (يتسع لاستيراد ملفات Excel)
;
// رفع مقاطع الفيديو من جهاز المالك — سقف خاص أكبر (متغير بيئة اختياري، افتراضي 500MB)
const UPLOAD_RE = /^\/api\/clips\/upload$/;
const MAX_UPLOAD_BYTES = Math.min(Number(process.env.MAX_CLIP_UPLOAD_MB || 500), 2000) * 1024 * 1024;
const STREAM_RE = /^\/api\/clips\/[^/]+\/stream$/;
// سياسة محتوى متوازنة: تسمح بكل ما تحتاجه المنصة (يوتيوب nocookie، صور مصغرة، HMR في التطوير)
// وتمنع: تضمين المنصة في مواقع أخرى (Clickjacking)، الكائنات/الإطارات الخبيثة، النماذج الخارجية
const CSP = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${("TURBOPACK compile-time truthy", 1) ? " 'unsafe-eval'" : "TURBOPACK unreachable"}`,
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
    "object-src 'none'"
].join('; ');
function applySecurityHeaders(res) {
    res.headers.set('Content-Security-Policy', CSP);
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    return res;
}
function floodResponse(retryAfter) {
    const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: 'عدد كبير من الطلبات — تمهّل قليلًا ثم حاول مجددًا',
        retryAfter
    }, {
        status: 429,
        headers: {
            'Retry-After': String(retryAfter)
        }
    });
    return applySecurityHeaders(res);
}
function proxy(req) {
    const { pathname } = req.nextUrl;
    if (pathname.startsWith('/api/')) {
        // 1) حجب الأجسام الضخمة مبكرًا — لرفع المقاطع سقف خاص أكبر، ولغيره 10MB
        const contentLength = Number(req.headers.get('content-length') || 0);
        const bodyCap = UPLOAD_RE.test(pathname) ? MAX_UPLOAD_BYTES : MAX_BODY_BYTES;
        if (contentLength > bodyCap) {
            const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: UPLOAD_RE.test(pathname) ? `حجم الفيديو يتجاوز الحد الأقصى (${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB)` : 'حجم الطلب كبير جدًا (الحد 10MB)'
            }, {
                status: 413
            });
            return applySecurityHeaders(res);
        }
        // 2) الحد العام ضد الطوفان — مع استثناء بث الفيديو (طلبات Range كثيرة طبيعيًا)
        if (!STREAM_RE.test(pathname)) {
            const r = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["rateLimit"])(`api:${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getClientIp"])(req)}`, GLOBAL_API_LIMIT, 60_000);
            if (!r.ok) return floodResponse(r.retryAfter);
        }
    }
    return applySecurityHeaders(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next());
}
const config = {
    // كل المسارات ما عدا الأصول الثابتة — حتى تغطي الترويسات صفحات التطبيق والـ APIs معًا
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)'
    ]
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__9292a1c2._.js.map