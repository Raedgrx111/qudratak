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
"[externals]/node:events [external] (node:events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}),
"[externals]/node:net [external] (node:net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:net", () => require("node:net"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:http [external] (node:http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http", () => require("node:http"));

module.exports = mod;
}),
"[externals]/node:https [external] (node:https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:https", () => require("node:https"));

module.exports = mod;
}),
"[externals]/node:zlib [external] (node:zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:zlib", () => require("node:zlib"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:dns [external] (node:dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:dns", () => require("node:dns"));

module.exports = mod;
}),
"[externals]/node:os [external] (node:os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:os", () => require("node:os"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:tls [external] (node:tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:tls", () => require("node:tls"));

module.exports = mod;
}),
"[externals]/node:child_process [external] (node:child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:child_process", () => require("node:child_process"));

module.exports = mod;
}),
"[project]/src/lib/mailer.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mailerConfigured",
    ()=>mailerConfigured,
    "sendMail",
    ()=>sendMail,
    "verificationEmailHtml",
    ()=>verificationEmailHtml
]);
// مُرسل البريد — يدعم Resend (API) أو SMTP (Gmail/Outlook/…) أو الوضع اليدوي
// الإعداد عبر ملف .env :
//   RESEND_API_KEY=re_xxx                     ← الأسرع (بدومين موثّق لدى resend.com)
//   أو SMTP_HOST=smtp.gmail.com  SMTP_PORT=465  SMTP_USER=you@gmail.com  SMTP_PASS=app-password
// بدون أي منهما: الوضع اليدوي — مالك المنصة يؤكد الحسابات من لوحة «تتبع الحسابات»
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$dist$2f$esm$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nodemailer/dist/esm/nodemailer.js [app-route] (ecmascript)");
;
function mailerConfigured() {
    return !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}
async function sendMail(opts) {
    // ---------- 1) Resend API ----------
    if (process.env.RESEND_API_KEY) {
        // تنبيه مبكر: عنوان onboarding@resend.dev تجريبي — يوصل لبريد صاحب حساب Resend فقط
        // حتى توثيق النطاق في لوحة Resend لن يستلم الطلاب شيئًا (يظهر بخطأ هادئ في السجل)
        const from = process.env.MAIL_FROM || 'قدراتك <onboarding@resend.dev>';
        if (from.includes('onboarding@resend.dev')) {
            console.warn('[mailer] تنبيه: MAIL_FROM لا يزال onboarding@resend.dev — توثّق نطاقك في Resend وحدّث MAIL_FROM حتى تصل الرسائل للطلاب');
        }
        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from,
                    to: [
                        opts.to
                    ],
                    subject: opts.subject,
                    html: opts.html,
                    text: opts.text
                })
            });
            if (res.ok) return {
                sent: true,
                provider: 'resend'
            };
            console.error('[mailer] resend failed:', res.status, await res.text().catch(()=>''));
        } catch (e) {
            console.error('[mailer] resend error:', e);
        }
    }
    // ---------- 2) SMTP (nodemailer) ----------
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            const port = Number(process.env.SMTP_PORT || 465);
            const transport = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nodemailer$2f$dist$2f$esm$2f$nodemailer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createTransport({
                host: process.env.SMTP_HOST,
                port,
                secure: port === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
            await transport.sendMail({
                from: process.env.MAIL_FROM || process.env.SMTP_USER,
                to: opts.to,
                subject: opts.subject,
                html: opts.html,
                text: opts.text
            });
            return {
                sent: true,
                provider: 'smtp'
            };
        } catch (e) {
            console.error('[mailer] smtp error:', e);
        }
    }
    // ---------- 3) الوضع اليدوي ----------
    return {
        sent: false,
        provider: 'none'
    };
}
function verificationEmailHtml(name, code) {
    return `<!doctype html><html dir="rtl" lang="ar"><body style="margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:16px;padding:36px 28px;text-align:center;border:1px solid #e5e7eb;">
      <div style="font-size:26px;font-weight:800;color:#111827;margin-bottom:6px;">قدراتك <span style="color:#6b7280;font-size:14px;">| Qudratak</span></div>
      <p style="color:#6b7280;font-size:14px;margin:0 0 22px;">منصة تدريب اختبار القدرات العامة</p>
      <h2 style="font-size:19px;color:#111827;margin:0 0 8px;">مرحبًا ${escapeHtml(name)} 👋</h2>
      <p style="color:#374151;font-size:14px;line-height:1.8;margin:0 0 20px;">رمز تأكيد بريدك الإلكتروني هو:</p>
      <div style="display:inline-block;background:#f0fdf4;border:2px dashed #16a34a;border-radius:12px;padding:14px 34px;font-size:34px;font-weight:800;letter-spacing:10px;color:#15803d;" dir="ltr">${code}</div>
      <p style="color:#6b7280;font-size:12.5px;line-height:1.8;margin:22px 0 0;">صالح لمدة 10 دقائق. إذا لم تطلب هذا الرمز فتجاهل الرسالة.<br/>لا تشارك الرمز مع أي شخص — حتى فريق المنصة.</p>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:14px;">رسالة آلية من منصة قدراتك — لا تردّ عليها</p>
  </div></body></html>`;
}
function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c)=>({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[c]);
}
}),
"[project]/src/app/api/auth/mail-status/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
// GET /api/auth/mail-status — هل الإرسال البريدي مفعّل؟ (عام، بلا معلومات حساسة)
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mailer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mailer.ts [app-route] (ecmascript)");
;
async function GET() {
    return Response.json({
        configured: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mailer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mailerConfigured"])()
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d8726acd._.js.map