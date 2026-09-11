// مُرسل البريد — يدعم Resend (API) أو SMTP (Gmail/Outlook/…) أو الوضع اليدوي
// الإعداد عبر ملف .env :
//   RESEND_API_KEY=re_xxx                     ← الأسرع (بدومين موثّق لدى resend.com)
//   أو SMTP_HOST=smtp.gmail.com  SMTP_PORT=465  SMTP_USER=you@gmail.com  SMTP_PASS=app-password
// بدون أي منهما: الوضع اليدوي — مالك المنصة يؤكد الحسابات من لوحة «تتبع الحسابات»
import nodemailer from 'nodemailer'

export type MailResult = { sent: boolean; provider: 'resend' | 'smtp' | 'none' }

export function mailerConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS))
}

export async function sendMail(opts: { to: string; subject: string; html: string; text: string }): Promise<MailResult> {
  // ---------- 1) Resend API ----------
  if (process.env.RESEND_API_KEY) {
    // تنبيه مبكر: عنوان onboarding@resend.dev تجريبي — يوصل لبريد صاحب حساب Resend فقط
    // حتى توثيق النطاق في لوحة Resend لن يستلم الطلاب شيئًا (يظهر بخطأ هادئ في السجل)
    const from = process.env.MAIL_FROM || 'قدراتك <onboarding@resend.dev>'
    if (from.includes('onboarding@resend.dev')) {
      console.warn('[mailer] تنبيه: MAIL_FROM لا يزال onboarding@resend.dev — توثّق نطاقك في Resend وحدّث MAIL_FROM حتى تصل الرسائل للطلاب')
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [opts.to],
          subject: opts.subject,
          html: opts.html,
          text: opts.text,
        }),
      })
      if (res.ok) return { sent: true, provider: 'resend' }
      console.error('[mailer] resend failed:', res.status, await res.text().catch(() => ''))
    } catch (e) {
      console.error('[mailer] resend error:', e)
    }
  }

  // ---------- 2) SMTP (nodemailer) ----------
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const port = Number(process.env.SMTP_PORT || 465)
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
      await transport.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      })
      return { sent: true, provider: 'smtp' }
    } catch (e) {
      console.error('[mailer] smtp error:', e)
    }
  }

  // ---------- 3) الوضع اليدوي ----------
  return { sent: false, provider: 'none' }
}

/** قالب رسالة رمز التأكيد (RTL عربي) */
export function verificationEmailHtml(name: string, code: string): string {
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
  </div></body></html>`
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string)
}
