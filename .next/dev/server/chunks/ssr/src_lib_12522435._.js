module.exports = [
"[project]/src/lib/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CATEGORY_LABEL",
    ()=>CATEGORY_LABEL,
    "DIFFICULTY_LABEL",
    ()=>DIFFICULTY_LABEL,
    "DIFFICULTY_STYLE",
    ()=>DIFFICULTY_STYLE,
    "EVENT_TYPE_LABEL",
    ()=>EVENT_TYPE_LABEL,
    "EVENT_TYPE_STYLE",
    ()=>EVENT_TYPE_STYLE,
    "EXAM_TYPE_LABEL",
    ()=>EXAM_TYPE_LABEL,
    "ROLE_LABEL",
    ()=>ROLE_LABEL,
    "ROLE_STYLE",
    ()=>ROLE_STYLE,
    "TOPICS",
    ()=>TOPICS,
    "api",
    ()=>api,
    "clearToken",
    ()=>clearToken,
    "copyToClipboard",
    ()=>copyToClipboard,
    "formatDate",
    ()=>formatDate,
    "formatDuration",
    ()=>formatDuration,
    "getToken",
    ()=>getToken,
    "navigate",
    ()=>navigate,
    "parseRoute",
    ()=>parseRoute,
    "scoreColor",
    ()=>scoreColor,
    "setToken",
    ()=>setToken,
    "timeAgo",
    ()=>timeAgo,
    "useSession",
    ()=>useSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
'use client';
;
// ---------- توكن الجلسة (بديل عند حجب الكوكيز داخل iframes المعاينة) ----------
const TOKEN_KEY = 'qudratak_token';
function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch  {
        return null;
    }
}
function setToken(token) {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch  {
    // وضع التصفح الخاص — نعتمد الكوكي فقط
    }
}
function clearToken() {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch  {
    // تجاهل
    }
}
// إرفاق ترويسة Authorization تلقائيًا بكل استدعاءات /api عندما يوجد توكن،
// ليعمل الدخول حتى لو حجب المتصفح كوكيز الطرف الثالث داخل iframe
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const useSession = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set)=>({
        user: null,
        loading: true,
        refresh: async ()=>{
            set({
                loading: true
            });
            try {
                const res = await fetch('/api/auth/me', {
                    cache: 'no-store'
                });
                const data = await res.json();
                if (data.user) {
                    set({
                        user: data.user,
                        loading: false
                    });
                } else {
                    // الجلسة غير صالحة — نمسح التوكن القديم (تنظيف ذاتي)
                    clearToken();
                    set({
                        user: null,
                        loading: false
                    });
                }
            } catch  {
                set({
                    user: null,
                    loading: false
                });
            }
        },
        logout: async ()=>{
            clearToken();
            await fetch('/api/auth/logout', {
                method: 'POST'
            }).catch(()=>null);
            set({
                user: null
            });
        }
    }));
async function api(path, options) {
    const res = await fetch(path, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers || {}
        },
        ...options
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ في الاتصال');
    }
    return data;
}
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch  {
    // نكمل إلى البديل اليدوي
    }
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
    } catch  {
        return false;
    }
}
function parseRoute() {
    // توافق مع الروابط القديمة بنمط /#/... — نحوّلها فورًا إلى مسار نظيف في شريط العنوان
    try {
        if (window.location.hash) {
            const legacy = window.location.hash.replace(/^#/, '');
            const clean = legacy && legacy !== '/' ? legacy.startsWith('/') ? legacy : `/${legacy}` : '/';
            window.history.replaceState({}, '', clean);
        }
    } catch  {
    // تجاهل — بعض البيئات المقيدة تمنع تعديل السجل
    }
    const full = window.location.pathname + window.location.search;
    const [pathPart, queryPart] = full.split('?');
    const segments = pathPart.split('/').filter(Boolean);
    return {
        path: pathPart,
        segments,
        query: new URLSearchParams(queryPart || '')
    };
}
function navigate(to) {
    const current = window.location.pathname + window.location.search;
    if (current === to && !window.location.hash) {
        // نفس المسار — نطلق الحدث لإعادة التحميل القسري (مثل تحديث قائمة)
        window.dispatchEvent(new PopStateEvent('popstate'));
        return;
    }
    if (window.location.hash) {
        // انتقال من رابط هاش قديم — نستبدل المدخل بدل تكديس السجل
        window.history.replaceState({}, '', to);
    } else {
        window.history.pushState({}, '', to);
    }
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({
        top: 0
    });
}
const CATEGORY_LABEL = {
    QUANTITATIVE: 'كمي',
    VERBAL: 'لفظي'
};
const DIFFICULTY_LABEL = {
    EASY: 'سهل',
    MEDIUM: 'متوسط',
    HARD: 'صعب'
};
const DIFFICULTY_STYLE = {
    EASY: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    HARD: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
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
const EXAM_TYPE_LABEL = {
    MOCK: 'محاكاة شاملة',
    SECTION: 'قسم كامل',
    TOPIC: 'تدريب مهارة',
    CUSTOM: 'اختبار مخصص'
};
const ROLE_LABEL = {
    OWNER: 'مالك المنصة',
    TEACHER: 'معلم',
    STUDENT: 'طالب'
};
const ROLE_STYLE = {
    OWNER: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    TEACHER: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    STUDENT: 'bg-secondary text-secondary-foreground'
};
const EVENT_TYPE_LABEL = {
    NEWS: 'إعلان',
    EVENT: 'حدث',
    COMPETITION: 'مسابقة',
    TIP: 'نصيحة'
};
const EVENT_TYPE_STYLE = {
    NEWS: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    EVENT: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    COMPETITION: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    TIP: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300'
};
function formatDate(date) {
    return new Date(date).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
function timeAgo(date) {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
    return d.toLocaleDateString('ar-SA');
}
function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s} ثانية`;
    return `${m} دقيقة و${s} ثانية`;
}
function scoreColor(score) {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-teal-600 dark:text-teal-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
}
}),
"[project]/src/lib/clips.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// أدوات مشتركة للمقاطع التعليمية — تُستخدم في الخادم والعميل
__turbopack_context__.s([
    "CLIP_CATEGORY_LABEL",
    ()=>CLIP_CATEGORY_LABEL,
    "CLIP_CATEGORY_STYLE",
    ()=>CLIP_CATEGORY_STYLE,
    "detectClipProvider",
    ()=>detectClipProvider,
    "extractYouTubeId",
    ()=>extractYouTubeId,
    "formatBytes",
    ()=>formatBytes,
    "formatDuration",
    ()=>formatDuration,
    "youtubeEmbedUrl",
    ()=>youtubeEmbedUrl,
    "youtubeThumbUrl",
    ()=>youtubeThumbUrl
]);
function extractYouTubeId(raw) {
    const value = raw.trim();
    if (!value) return null;
    // معرف مباشر (11 حرفًا)
    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
    try {
        const url = new URL(value);
        const host = url.hostname.replace(/^www\./, '');
        if (host === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null;
        if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
            const v = url.searchParams.get('v');
            if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
            const m = url.pathname.match(/^\/(?:embed|shorts|v|live)\/([a-zA-Z0-9_-]{11})/);
            if (m) return m[1];
        }
        return null;
    } catch  {
        return null;
    }
}
function detectClipProvider(raw) {
    const videoId = extractYouTubeId(raw);
    if (videoId) return {
        provider: 'YOUTUBE',
        videoId
    };
    return {
        provider: 'FILE',
        videoId: null
    };
}
function youtubeEmbedUrl(videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}
function youtubeThumbUrl(videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
const CLIP_CATEGORY_LABEL = {
    QUANTITATIVE: 'كمي',
    VERBAL: 'لفظي',
    GENERAL: 'عام'
};
const CLIP_CATEGORY_STYLE = {
    QUANTITATIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    VERBAL: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    GENERAL: 'bg-secondary text-secondary-foreground'
};
function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
function formatDuration(sec) {
    if (!sec || sec <= 0) return '—';
    const s = Math.round(sec);
    const h = Math.floor(s / 3600);
    const m = Math.floor(s % 3600 / 60);
    const r = s % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(r).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}
}),
];

//# sourceMappingURL=src_lib_12522435._.js.map