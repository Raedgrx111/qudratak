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
"[project]/src/app/api/stats/admin/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-route] (ecmascript)");
;
;
;
async function GET() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["handle"])(async ()=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireStaff"])();
        const [students, teachers, questions, exams, attempts, comments, imports, categoryAgg, difficultyAgg, topicAgg, topStudents, activeWeek, eventsCount, answerAgg] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.count({
                where: {
                    role: 'STUDENT'
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].user.count({
                where: {
                    role: 'TEACHER'
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].question.count(),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].exam.count(),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].examAttempt.count({
                where: {
                    status: 'COMPLETED'
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].comment.count({
                where: {
                    isDeleted: false
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].importLog.findMany({
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].$queryRawUnsafe(`SELECT category, COUNT(*) as total FROM Question GROUP BY category`),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].$queryRawUnsafe(`SELECT difficulty, COUNT(*) as total FROM Question GROUP BY difficulty`),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].$queryRawUnsafe(`SELECT q.topic as topic, COUNT(*) as total,
             SUM(CASE WHEN a.isCorrect = 1 THEN 1 ELSE 0 END) as correct,
             COUNT(a.id) as attempts
           FROM Question q LEFT JOIN AnswerRecord a ON a.questionId = q.id
           GROUP BY q.topic ORDER BY total DESC`),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].$queryRawUnsafe(`SELECT u.id, u.name, COUNT(a.id) as exams, AVG(a.score) as avgScore
           FROM User u JOIN ExamAttempt a ON a.userId = u.id
           WHERE a.status = 'COMPLETED' AND u.role = 'STUDENT'
           GROUP BY u.id ORDER BY avgScore DESC LIMIT 5`),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM User WHERE lastActiveAt >= ?`, Date.now() - 7 * 86400_000),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].event.count({
                where: {
                    isActive: true
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].$queryRawUnsafe(`SELECT COUNT(*) as total, SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) as correct FROM AnswerRecord`)
        ]);
        const topicStats = topicAgg.map((t)=>({
                topic: t.topic,
                questions: Number(t.total),
                attempts: Number(t.attempts || 0),
                avgAccuracy: Number(t.attempts) > 0 ? Math.round(Number(t.correct || 0) / Number(t.attempts) * 100) : 0
            }));
        return Response.json({
            totals: {
                students,
                questions,
                exams,
                attempts,
                comments
            },
            staff: {
                teachers
            },
            activeWeek: Number(activeWeek[0]?.cnt || 0),
            eventsCount,
            answeredTotal: Number(answerAgg[0]?.total || 0),
            correctTotal: Number(answerAgg[0]?.correct || 0),
            questionsByCategory: categoryAgg.map((c)=>({
                    category: c.category,
                    total: Number(c.total)
                })),
            questionsByDifficulty: difficultyAgg.map((d)=>({
                    difficulty: d.difficulty,
                    total: Number(d.total)
                })),
            topicStats: topicStats.slice(0, 10),
            recentImports: imports,
            topStudents: topStudents.map((s)=>({
                    id: s.id,
                    name: s.name,
                    exams: Number(s.exams),
                    avgScore: Math.round(Number(s.avgScore || 0))
                }))
        });
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5021dac5._.js.map