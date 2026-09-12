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
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[project]/src/lib/mailbox-probe.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "interpretRcpt",
    ()=>interpretRcpt,
    "probeMailbox",
    ()=>probeMailbox
]);
// فحص وجود صندوق البريد فعليًا على خادم البريد (SMTP Mailbox Probe)
// ------------------------------------------------------------------
// الفكرة: نتصل بخادم MX للنطاق ونحاكي إرسال رسالة حتى مرحلة RCPT TO —
// إن رد الخادم "550 user unknown" فهذا البريد غير موجود أصلًا (عشوائي).
// هذا أقوى فحص ممكن قبل الإرسال الفعلي، ويعمل مع Gmail وOutlook ومعظم
// الخوادم الحقيقية (خوادم Accept-All قليلة وستمر fail-open).
//
// ملاحظات تشغيلية:
// - يعتمد على المنفذ 25 الصادر — بعض بيئات الاستضافة تحجبه، لذا:
//   fail-open دائم عند الفشل (لا نحجب بريدًا حقيقيًا بسبب شبكتنا)
// - قاطع دائرة: 3 فشلات اتصال متتالية → تعطيل الفحص 10 دقائق (تجنب بطء التسجيل بلا فائدة)
// - كاش النتائج 24 ساعة (والغموض 5 دقائق) حتى لا نُثقل خوادم البريد
// - يمكن تعطيله كليًا بمتغير البيئة MAILBOX_PROBE=off
var __TURBOPACK__imported__module__$5b$externals$5d2f$dns__$5b$external$5d$__$28$dns$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/dns [external] (dns, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$net__$5b$external$5d$__$28$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/net [external] (net, cjs)");
;
;
const HELO_DOMAIN = process.env.MAIL_HELO_DOMAIN || 'qudratak.sa';
const MAIL_FROM = `no-reply@${HELO_DOMAIN}`;
const CONNECT_TIMEOUT_MS = 3_000 // لكل خادم MX
;
const OVERALL_BUDGET_MS = 7_000 // سقف الفحص كاملًا حتى لا يبطئ التسجيل
;
const MAX_MX_HOSTS = 2;
// ---- كاش النتائج (منع إثقال خوادم البريد وتسريع التكرارات) ----
const cache = new Map();
const CACHE_OK_TTL = 24 * 3_600_000 // نتيجة حاسمة تُعتبر صالحة 24 ساعة
;
const CACHE_UNKNOWN_TTL = 5 * 60_000 // الغموض يعاد فحصه بعد 5 دقائق
;
const MAX_CACHE = 20_000;
let lastCacheSweep = 0;
function cacheSet(key, result) {
    const now = Date.now();
    if (now - lastCacheSweep > 60_000) {
        lastCacheSweep = now;
        for (const [k, v] of cache){
            const ttl = v.result === 'unknown' ? CACHE_UNKNOWN_TTL : CACHE_OK_TTL;
            if (now - v.at > ttl) cache.delete(k);
        }
        if (cache.size > MAX_CACHE) for (const k of [
            ...cache.keys()
        ].slice(0, 5_000))cache.delete(k);
    }
    cache.set(key, {
        result,
        at: now
    });
}
// ---- قاطع الدائرة: بيئة تحجب المنفذ 25 → توقف المحاولات مؤقتًا ----
let consecutiveNetworkFails = 0;
let probeDisabledUntil = 0;
const BREAKER_THRESHOLD = 3;
const BREAKER_COOLDOWN_MS = 10 * 60_000;
function interpretRcpt(line) {
    const code = line.slice(0, 3);
    const low = line.toLowerCase();
    if (code === '250' || code === '251') return 'exists';
    if (code.startsWith('5')) {
        // استثناءات: الرفض بسبب سياستنا نحن (HELO/SPF/Relay) لا بسبب عدم وجود الصندوق
        if (low.includes('relay access denied') || low.includes('authentication required') || low.includes('helo') || low.includes('list of allowed') || low.includes('blacklist') || low.includes('spam')) {
            return 'unknown';
        }
        if ([
            '550',
            '551',
            '553'
        ].includes(code) || low.includes('5.1.1') || low.includes('5.1.6') || low.includes('5.1.10') || low.includes('user unknown') || low.includes('unknown user') || low.includes('does not exist') || low.includes('no such') || low.includes('invalid mailbox') || low.includes('recipient not found') || low.includes('recipient rejected')) {
            return 'not-found';
        }
    }
    return 'unknown';
}
/** محاولة واحدة مع خادم MX محدد — تعيد النتيجة أو unknown عند عجز الاتصال */ function tryHost(host, email, deadline) {
    return new Promise((resolve)=>{
        let stage = 'banner';
        let buf = '';
        let settled = false;
        const socket = __TURBOPACK__imported__module__$5b$externals$5d2f$net__$5b$external$5d$__$28$net$2c$__cjs$29$__["default"].createConnection({
            host,
            port: 25
        });
        const finish = (r)=>{
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            try {
                if (!socket.destroyed) socket.write('QUIT\r\n');
            } catch  {}
            socket.destroy();
            resolve(r);
        };
        const timer = setTimeout(()=>finish('unknown'), Math.max(500, deadline - Date.now()));
        socket.setTimeout(CONNECT_TIMEOUT_MS, ()=>finish('unknown'));
        socket.on('error', ()=>finish('unknown'));
        socket.on('data', (chunk)=>{
            if (settled) return;
            buf += chunk.toString();
            let idx;
            while((idx = buf.indexOf('\r\n')) !== -1 && !settled){
                const line = buf.slice(0, idx);
                buf = buf.slice(idx + 2);
                const code = line.slice(0, 3);
                const isFinalLine = line[3] === ' ' || line.length === 3;
                if (stage === 'banner') {
                    if (code === '220' && isFinalLine) {
                        stage = 'ehlo';
                        socket.write(`EHLO ${HELO_DOMAIN}\r\n`);
                    } else if (isFinalLine) return finish('unknown');
                } else if (stage === 'ehlo') {
                    if (isFinalLine && code === '250') {
                        stage = 'mailfrom';
                        socket.write(`MAIL FROM:<${MAIL_FROM}>\r\n`);
                    } else if (isFinalLine) return finish('unknown');
                } else if (stage === 'mailfrom') {
                    if (isFinalLine && code === '250') {
                        stage = 'rcpt';
                        socket.write(`RCPT TO:<${email}>\r\n`);
                    } else if (isFinalLine) return finish('unknown');
                } else if (stage === 'rcpt') {
                    return finish(interpretRcpt(line));
                }
            }
        });
    });
}
async function probeMailbox(email) {
    if (process.env.MAILBOX_PROBE === 'off') return 'unknown';
    const now = Date.now();
    if (now < probeDisabledUntil) return 'unknown' // قاطع الدائرة مفعل — المنفذ محجوب
    ;
    const hit = cache.get(email);
    if (hit) {
        const ttl = hit.result === 'unknown' ? CACHE_UNKNOWN_TTL : CACHE_OK_TTL;
        if (now - hit.at <= ttl) return hit.result;
        cache.delete(email);
    }
    // نطاقات المتصفحات الكبرى ترفض الصناديق المجهولة — أي فحص لغيرها أقل فائدة لكنه آمن
    let mxHosts = [];
    try {
        const records = await __TURBOPACK__imported__module__$5b$externals$5d2f$dns__$5b$external$5d$__$28$dns$2c$__cjs$29$__["default"].promises.resolveMx(email.split('@')[1] || '');
        mxHosts = records.sort((a, b)=>a.priority - b.priority).slice(0, MAX_MX_HOSTS).map((r)=>r.exchange);
    } catch  {
        return 'unknown' // لا MX — يُعالج في فحص النطاق قبلنا
        ;
    }
    if (mxHosts.length === 0) return 'unknown';
    const deadline = now + OVERALL_BUDGET_MS;
    let result = 'unknown';
    for (const host of mxHosts){
        result = await tryHost(host, email, deadline);
        if (result !== 'unknown') break;
    }
    if (result === 'unknown') {
        // فشل اتصال شبكي — نعدّه دليل حجب المنفذ وندفع قاطع الدائرة
        consecutiveNetworkFails++;
        if (consecutiveNetworkFails >= BREAKER_THRESHOLD) {
            probeDisabledUntil = Date.now() + BREAKER_COOLDOWN_MS;
            console.warn('[mailbox-probe] المنفذ 25 غير متاح — تعطيل مؤقت للفحص 10 دقائق (fail-open)');
        }
    } else {
        consecutiveNetworkFails = 0;
        cacheSet(email, result);
    }
    return result;
}
}),
"[project]/src/lib/email-guard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "domainAcceptsMail",
    ()=>domainAcceptsMail,
    "isDisposableEmail",
    ()=>isDisposableEmail,
    "looksRandomEmail",
    ()=>looksRandomEmail,
    "validateRealEmail",
    ()=>validateRealEmail
]);
// حارس البريد الإلكتروني — يمنع البريد الوهمي/المؤقت/العشوائي عند التسجيل
var __TURBOPACK__imported__module__$5b$externals$5d2f$dns__$5b$external$5d$__$28$dns$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/dns [external] (dns, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mailbox$2d$probe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mailbox-probe.ts [app-route] (ecmascript)");
;
;
/** نطاقات البريد المؤقت/الوهمي الشائعة (قائمة محدثة يدويًا) */ const DISPOSABLE_DOMAINS = new Set([
    // temp-mail و مشتقاته
    'tempmail.com',
    'temp-mail.org',
    'tempmailo.com',
    'tempr.email',
    'tempmail.net',
    'tempmail.dev',
    'tmail.ws',
    'tmails.net',
    'tmpmail.org',
    'tmpmail.net',
    'tmpbox.net',
    'tempinbox.com',
    '10minutemail.com',
    '10minutemail.net',
    '10minmail.com',
    '20minutemail.com',
    'guerrillamail.com',
    'guerrillamail.net',
    'guerrillamail.org',
    'guerrillamail.biz',
    'guerrillamailblock.com',
    'sharklasers.com',
    'grr.la',
    'spam4.me',
    'pokemail.net',
    'dispostable.com',
    'fakeinbox.com',
    'mailinator.com',
    'mailinator.net',
    'mailinator2.com',
    'sogetthis.com',
    'reallymymail.com',
    'yopmail.com',
    'yopmail.net',
    'yopmail.fr',
    'cool.fr.nf',
    'jetable.fr.nf',
    'nospam.ze.tc',
    'trashmail.com',
    'trashmail.net',
    'trashmail.de',
    'wegwerfmail.de',
    'wegwerfmail.net',
    'getnada.com',
    'nada.email',
    'maildrop.cc',
    'mailnesia.com',
    'moakt.com',
    'mohmal.com',
    'emailondeck.com',
    'throwawaymail.com',
    'mailcatch.com',
    'spambog.com',
    'mytemp.email',
    'burnermail.io',
    'inboxkitten.com',
    'dropmail.me',
    'zetmail.com',
    'einrot.com',
    'gustr.com',
    'cuvox.de',
    'dayrep.com',
    'fleckens.hu',
    'jourrapide.com',
    'rhyta.com',
    'armyspy.com',
    'vintomaper.com',
    'superrito.com',
    'teleworm.us',
    'mailtemp.info',
    'byom.de',
    'clrmail.com',
    '1secmail.com',
    '1secmail.net',
    '1secmail.org',
    'esiix.com',
    'wwjmp.com',
    'xcgdk.com',
    'meltmail.com',
    'spambox.us',
    'deadaddress.com',
    'mailsac.com',
    'inboxbear.com',
    'fakemail.net',
    'fake-mail.net',
    'nowmymail.com',
    'mail-temp.com',
    'emltmp.com'
]);
function isDisposableEmail(email) {
    const domain = email.split('@')[1]?.toLowerCase().trim();
    if (!domain) return true;
    if (DISPOSABLE_DOMAINS.has(domain)) return true;
    // نطاقات فرعية لمواقع البريد المؤقت (مثل xxx.mailinator.com)
    const parts = domain.split('.');
    for(let i = 1; i < parts.length - 1; i++){
        if (DISPOSABLE_DOMAINS.has(parts.slice(i).join('.'))) return true;
    }
    return false;
}
async function domainAcceptsMail(email) {
    const domain = email.split('@')[1]?.toLowerCase().trim();
    if (!domain) return false;
    try {
        const records = await __TURBOPACK__imported__module__$5b$externals$5d2f$dns__$5b$external$5d$__$28$dns$2c$__cjs$29$__["default"].promises.resolveMx(domain);
        return records.length > 0;
    } catch (err) {
        const code = err.code;
        if (code === 'ENOTFOUND' || code === 'ENODATA') return false // النطاق غير موجود أو بلا سجلات بريد
        ;
        return true // أعطال أخرى (مهلة/خدمة) — نتجاهل حتى لا نرفض بريدًا حقيقيًا
        ;
    }
}
function looksRandomEmail(email) {
    const local = email.split('@')[0]?.toLowerCase() ?? '';
    if (!local) return true;
    if (/(.)\1{4,}/.test(local)) return true;
    if (local.length >= 12 && !/[aeiou]/.test(local)) return true;
    return false;
}
async function validateRealEmail(email) {
    if (isDisposableEmail(email)) {
        return 'البريد الإلكتروني المؤقت/الوهمي ممنوع — سجّل ببريدك الحقيقي لتصلك رموز التأكيد';
    }
    if (looksRandomEmail(email)) {
        return 'البريد الإلكتروني يبدو عشوائيًا — سجّل ببريدك الشخصي الحقيقي (مثل بريد Gmail الخاص بك)';
    }
    if (!await domainAcceptsMail(email)) {
        return 'نطاق البريد الإلكتروني غير صحيح أو لا يقبل الرسائل — تأكد من كتابة بريدك بشكل صحيح';
    }
    // أقوى فحص: سؤال خادم البريد نفسه — هل هذا الصندوق موجود؟
    // (يرفض مثلاً asdf999@gmail.com العشوائي؛ يمرّ fail-open عند تعذر الفحص)
    if (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mailbox$2d$probe$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["probeMailbox"])(email) === 'not-found') {
        return 'هذا البريد غير موجود فعليًا على خادم البريد — تأكد من كتابته بشكل صحيح أو استخدم بريدك الحقيقي';
    }
    return null;
}
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
"[project]/src/lib/platform-settings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SETTING_KEYS",
    ()=>SETTING_KEYS,
    "getCurrentInviteCode",
    ()=>getCurrentInviteCode,
    "getSetting",
    ()=>getSetting,
    "inviteCodeMatches",
    ()=>inviteCodeMatches,
    "isRegistrationOpen",
    ()=>isRegistrationOpen,
    "setSetting",
    ()=>setSetting
]);
// إعدادات المنصة العامة — تُخزن في قاعدة البيانات ولا تُعرَّض للواجهة إلا للمالك عبر API محمي
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
const SETTING_KEYS = {
    INVITE_CODE: 'INVITE_CODE',
    REGISTRATION_OPEN: 'REGISTRATION_OPEN'
};
async function getSetting(key) {
    const row = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].platformSetting.findUnique({
        where: {
            key
        }
    });
    return row?.value ?? null;
}
async function setSetting(key, value) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].platformSetting.upsert({
        where: {
            key
        },
        create: {
            key,
            value
        },
        update: {
            value
        }
    });
}
async function isRegistrationOpen() {
    const v = await getSetting(SETTING_KEYS.REGISTRATION_OPEN);
    return v !== 'false';
}
async function getCurrentInviteCode() {
    const existing = await getSetting(SETTING_KEYS.INVITE_CODE);
    if (existing) return existing;
    const generated = 'QDR-' + Math.floor(100000 + Math.random() * 900000);
    await setSetting(SETTING_KEYS.INVITE_CODE, generated);
    return generated;
}
function inviteCodeMatches(input, stored) {
    return input.trim().toUpperCase() === stored.trim().toUpperCase();
}
}),
"[project]/src/app/api/auth/register/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$email$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/email-guard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rate-limit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$platform$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/platform-settings.ts [app-route] (ecmascript)");
;
;
;
;
;
;
async function POST(req) {
    // حماية من التسجيل الجماعي الآلي — سقف يتحمل تسجيل مدرسة كاملة (1200 طالب) من نفس الشبكة
    const ipGuard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["guard"])(req, 'register', 150, 3_600_000, 'تم إنشاء حسابات كثيرة من جهازك — حاول بعد ساعة أو تواصل مع إدارة المنصة');
    if (ipGuard) return ipGuard;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handle"])(async ()=>{
        const body = await req.json().catch(()=>null);
        const name = body?.name?.trim();
        const email = body?.email?.trim()?.toLowerCase();
        const confirmEmail = typeof body?.confirmEmail === 'string' ? body.confirmEmail.trim().toLowerCase() : null;
        const password = body?.password;
        const grade = body?.grade?.trim() || null;
        const school = body?.school?.trim() || null // حقل قديم اختياري — الواجهة الجديدة لا ترسله
        ;
        const sectionNumber = body?.sectionNumber?.trim() || null;
        const inviteCode = typeof body?.inviteCode === 'string' ? body.inviteCode : '';
        // 1) بوابة رمز الدعوة — تُقارن بجهة الخادم فقط
        if (!await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$platform$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isRegistrationOpen"])()) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('التسجيل مغلق حاليًا — تواصل مع إدارة المنصة', 403);
        }
        if (!inviteCode.trim()) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('رمز الدعوة مطلوب — أدخل رمز الدعوة الذي حصلت عليه من إدارة المنصة', 422);
        const storedCode = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$platform$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCurrentInviteCode"])();
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$platform$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inviteCodeMatches"])(inviteCode, storedCode)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('رمز الدعوة غير صحيح — تأكد منه مع إدارة المنصة', 403);
        }
        // 2) البيانات الأساسية
        if (!name || name.length < 2) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('الاسم مطلوب (حرفان على الأقل)', 422);
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('البريد الإلكتروني غير صحيح', 422);
        if (confirmEmail !== null && confirmEmail !== email) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('البريد الإلكتروني غير متطابق', 422);
        if (!password || password.length < 8) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 422);
        // 3) الشعبة إلزامية لكل طالب: 3 أرقام فقط (مثل 101 / 204 / 308)
        if (!sectionNumber) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('رقم الشعبة مطلوب — اكتب رقم شعبتك بـ 3 أرقام مثل 101 أو 204 أو 308', 422);
        if (!/^\d{3}$/.test(sectionNumber)) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('رقم الشعبة يجب أن يكون 3 أرقام فقط — مثل 101 أو 204 أو 308', 422);
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.findUnique({
            where: {
                email
            }
        });
        if (existing) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])('هذا البريد الإلكتروني مسجل مسبقًا', 409);
        // حماية من البريد الوهمي: نطاق مؤقت معروف أو نطاق لا يستقبل الرسائل
        const emailError = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$email$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateRealEmail"])(email);
        if (emailError) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fail"])(emailError, 422);
        const passwordHash = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hashPassword"])(password);
        const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.create({
            data: {
                name,
                email,
                passwordHash,
                role: 'STUDENT',
                grade,
                school,
                sectionNumber,
                // التسجيل بدعوة = بريد موثوق تلقائيًا — بدون رمز تأكيد، ودخول مباشر للمنصة
                emailVerified: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });
        const token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["setSessionCookie"])(user.id, user.role);
        return Response.json({
            user,
            token,
            emailVerified: true
        });
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2ff265da._.js.map