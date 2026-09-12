module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        'query'
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = db;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthError",
    ()=>AuthError,
    "clearSessionCookie",
    ()=>clearSessionCookie,
    "createToken",
    ()=>createToken,
    "getSessionUser",
    ()=>getSessionUser,
    "hashPassword",
    ()=>hashPassword,
    "requireOwner",
    ()=>requireOwner,
    "requireStaff",
    ()=>requireStaff,
    "requireUser",
    ()=>requireUser,
    "requireVerified",
    ()=>requireVerified,
    "setSessionCookie",
    ()=>setSessionCookie,
    "touchLastActive",
    ()=>touchLastActive,
    "verifyPassword",
    ()=>verifyPassword,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/sign.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
;
;
;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'qudratak-dev-secret-change-in-production-2024');
const COOKIE_NAME = 'qudratak_session';
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days
;
async function hashPassword(password) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(password, 10);
}
async function verifyPassword(password, hash) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, hash);
}
async function createToken(userId, role) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"]({
        sub: userId,
        role
    }).setProtectedHeader({
        alg: 'HS256'
    }).setIssuedAt().setExpirationTime('7d').sign(JWT_SECRET);
}
async function verifyToken(token) {
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, JWT_SECRET);
        return {
            sub: payload.sub,
            role: payload.role
        };
    } catch  {
        return null;
    }
}
// ---------- Session cookie + Bearer fallback ----------
// هل الطلب قادم عبر HTTPS؟ (خلف بروكسي Caddy نعتمد x-forwarded-proto)
async function isHttpsRequest() {
    try {
        const h = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["headers"])();
        const proto = (h.get('x-forwarded-proto') ?? 'http').split(',')[0].trim();
        return proto === 'https';
    } catch  {
        return false;
    }
}
async function setSessionCookie(userId, role) {
    const token = await createToken(userId, role);
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const https = await isHttpsRequest();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: https ? 'none' : 'lax',
        secure: https,
        partitioned: https,
        maxAge: MAX_AGE,
        path: '/'
    });
    return token;
}
async function clearSessionCookie() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const https = await isHttpsRequest();
    cookieStore.set(COOKIE_NAME, '', {
        httpOnly: true,
        sameSite: https ? 'none' : 'lax',
        secure: https,
        partitioned: https,
        maxAge: 0,
        path: '/'
    });
}
/** استخراج التوكن: من ترويسة Authorization (لتجاوز حجب الكوكيز في iframes) ثم من الكوكي */ async function extractToken() {
    try {
        const h = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["headers"])();
        const auth = h.get('authorization');
        if (auth?.startsWith('Bearer ')) return auth.slice(7).trim() || null;
    } catch  {
    // تجاهل — خارج سياق طلب
    }
    try {
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        return cookieStore.get(COOKIE_NAME)?.value ?? null;
    } catch  {
        return null;
    }
}
async function getSessionUser() {
    try {
        const token = await extractToken();
        if (!token) return null;
        const payload = await verifyToken(token);
        if (!payload) return null;
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findUnique({
            where: {
                id: payload.sub
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isBanned: true,
                emailVerified: true
            }
        });
        if (!user || user.isBanned) return null;
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified
        };
    } catch  {
        return null;
    }
}
async function requireUser() {
    const user = await getSessionUser();
    if (!user) throw new AuthError('يجب تسجيل الدخول للمتابعة', 401);
    return user;
}
async function requireStaff() {
    const user = await requireUser();
    if (user.role !== 'TEACHER' && user.role !== 'OWNER') {
        throw new AuthError('هذه العملية متاحة لفريق الإدارة فقط', 403);
    }
    return user;
}
async function requireVerified() {
    const user = await requireUser();
    if (user.role === 'STUDENT' && !user.emailVerified) {
        throw new AuthError('أكمل تأكيد بريدك الإلكتروني أولًا لتبدأ التدريب', 403);
    }
    return user;
}
async function requireOwner() {
    const user = await requireUser();
    if (user.role !== 'OWNER') {
        throw new AuthError('هذه العملية متاحة لمالك المنصة فقط', 403);
    }
    return user;
}
async function touchLastActive(userId) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.update({
            where: {
                id: userId
            },
            data: {
                lastActiveAt: new Date()
            }
        });
    } catch  {
    // لا نفشل الطلب بسبب تتبع النشاط
    }
}
class AuthError extends Error {
    status;
    constructor(message, status = 401){
        super(message);
        this.status = status;
    }
}
}),
"[project]/src/lib/api.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CATEGORIES",
    ()=>CATEGORIES,
    "CATEGORY_LABEL",
    ()=>CATEGORY_LABEL,
    "CHOICE_KEYS",
    ()=>CHOICE_KEYS,
    "DIFFICULTIES",
    ()=>DIFFICULTIES,
    "DIFFICULTY_LABEL",
    ()=>DIFFICULTY_LABEL,
    "TOPICS",
    ()=>TOPICS,
    "fail",
    ()=>fail,
    "handle",
    ()=>handle,
    "ok",
    ()=>ok
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
;
;
function ok(data, init) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data, {
        status: init ?? 200
    });
}
function fail(message, status = 400, extra) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: message,
        ...extra
    }, {
        status
    });
}
async function handle(fn) {
    try {
        return await fn();
    } catch (err) {
        if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["AuthError"]) {
            return fail(err.message, err.status);
        }
        const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
        console.error('[API Error]', err);
        return fail(message, 500);
    }
}
const CATEGORIES = [
    'QUANTITATIVE',
    'VERBAL'
];
const DIFFICULTIES = [
    'EASY',
    'MEDIUM',
    'HARD'
];
const CHOICE_KEYS = [
    'أ',
    'ب',
    'ج',
    'د'
];
const CATEGORY_LABEL = {
    QUANTITATIVE: 'كمي',
    VERBAL: 'لفظي'
};
const DIFFICULTY_LABEL = {
    EASY: 'سهل',
    MEDIUM: 'متوسط',
    HARD: 'صعب'
};
const TOPICS = {
    QUANTITATIVE: [
        'الحساب والنسبة المئوية',
        'الأعداد والعمليات',
        'الكسور والأعداد العشرية',
        'الجبر والمعادلات',
        'المتتاليات والأنماط',
        'الهندسة والمساحات',
        'النسبة والتناسب',
        'الإحصاء وتحليل البيانات',
        'المقارنات الكمية',
        'المسائل اللفظية'
    ],
    VERBAL: [
        'التناظر اللفظي',
        'إكمال الجمل',
        'الخطأ السياقي',
        'الفهم المقروء',
        'الروابط اللغوية',
        'الاستنتاج والتحليل'
    ]
};
}),
"[project]/src/lib/rate-limit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
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
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
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
"[project]/src/app/api/auth/login/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rate-limit.ts [app-route] (ecmascript)");
;
;
;
;
async function POST(req) {
    // حماية من هجمات تخمين كلمات المرور — سقف المصدر يتحمل دخول مدرسة كاملة من نفس الشبكة،
    // والحماية الحقيقية ضد التخمين تبقى قفل الحساب نفسه (5 محاولات → 15 دقيقة)
    const ipGuard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["guard"])(req, 'login', 120, 60_000, 'محاولات دخول كثيرة من جهازك — انتظر دقيقة ثم حاول');
    if (ipGuard) return ipGuard;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handle"])(async ()=>{
        const body = await req.json().catch(()=>null);
        const email = body?.email?.trim()?.toLowerCase();
        const password = body?.password;
        if (!email || !password) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('البريد الإلكتروني وكلمة المرور مطلوبان', 422);
        // قفل الحساب بعد محاولات خاطئة متكررة (Brute Force Lockout)
        const lockMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lockRemainingMs"])(email);
        if (lockMs > 0) {
            const minutes = Math.ceil(lockMs / 60_000);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])(`تم تعطيل الدخول لهذا الحساب مؤقتًا بسبب محاولات خاطئة متكررة — حاول بعد ${minutes} دقيقة`, 423, {
                retryAfter: Math.ceil(lockMs / 1000)
            });
        }
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findUnique({
            where: {
                email
            }
        });
        if (!user) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('بيانات الدخول غير صحيحة', 401);
        if (user.isBanned) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('تم تعليق هذا الحساب من قبل إدارة المنصة', 403);
        const valid = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyPassword"])(password, user.passwordHash);
        if (!valid) {
            const justLockedMs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loginFail"])(email);
            if (justLockedMs > 0) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('محاولات خاطئة كثيرة — تم تعطيل الدخول 15 دقيقة لحماية حسابك', 423);
            }
            const left = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loginFailsRemaining"])(email);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])(left <= 2 ? `بيانات الدخول غير صحيحة — تنبيه: بقي لديك ${left} ${left === 1 ? 'محاولة' : 'محاولتين'} قبل تعطيل الدخول مؤقتًا` : 'بيانات الدخول غير صحيحة', 401);
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loginSuccess"])(email);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.update({
            where: {
                id: user.id
            },
            data: {
                lastActiveAt: new Date()
            }
        });
        const token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setSessionCookie"])(user.id, user.role);
        return Response.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                grade: user.grade,
                emailVerified: user.emailVerified
            },
            token
        });
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5cd6d1ce._.js.map