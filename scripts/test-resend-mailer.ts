// اختبار وحدة مسار Resend في mailer.ts — بمحاكاة fetch (بلا مفتاح حقيقي ولا شبكة)
// يثبت: الطلب للخادم الصحيح + Bearer بالمفتاح + بنية الحمولة + الرمز داخل القالب
//       + المفتاح لا يتسرب لمحتوى الرسالة + سلوك الفشل يعود للوضع اليدوي بأمان
process.env.RESEND_API_KEY = 're_test_FAKE_KEY_FOR_UNIT_TEST_123456789'
process.env.MAIL_FROM = 'قدراتك <noreply@qudratak.sa>'

let captured: { url: string; headers: Record<string, string>; body: any } | null = null
let failMode = false

;(globalThis as any).fetch = async (url: string, init: any) => {
  captured = { url, headers: init.headers, body: JSON.parse(init.body) }
  if (failMode) return { ok: false, status: 403, text: async () => '{"message":"unverified domain"}' }
  return { ok: true, status: 200, json: async () => ({ id: 'test-id' }) }
}

async function main() {
  const { sendMail, verificationEmailHtml, mailerConfigured } = await import('../src/lib/mailer')

  let ok = 0, bad = 0
  const check = (name: string, cond: boolean, detail = '') => {
    console.log(`[${cond ? 'PASS' : 'FAIL'}] ${name} ${detail}`)
    ok += cond ? 1 : 0; bad += cond ? 0 : 1
  }

  // ---------- الحالة السعيدة ----------
  check('mailerConfigured=true مع المفتاح', mailerConfigured() === true)
  const html = verificationEmailHtml('أحمد', '428615')
  const r1 = await sendMail({
    to: 'student@gmail.com',
    subject: 'رمز تأكيد بريدك: 428615 — قدراتك',
    html, text: 'رمزك: 428615',
  })

  check('sendMail ينجح عبر resend', r1.sent === true && r1.provider === 'resend', JSON.stringify(r1))
  check('الطلب إلى api.resend.com/emails', captured!.url === 'https://api.resend.com/emails', captured!.url)
  check('الترويسة Bearer بالمفتاح', captured!.headers.Authorization === `Bearer ${process.env.RESEND_API_KEY}`)
  check('from من MAIL_FROM الموثق', captured!.body.from.includes('noreply@qudratak.sa'), captured!.body.from)
  check('to مصفوفة ببريد الطالب', Array.isArray(captured!.body.to) && captured!.body.to[0] === 'student@gmail.com')
  check('الرمز 428615 داخل html القالب', captured!.body.html.includes('428615'))
  check('الرمز داخل النص البديل text', captured!.body.text.includes('428615'))
  check('مدة الصلاحية 10 دقائق مذكورة', captured!.body.html.includes('10 دقائق'))
  check('اسم الطالب داخل القالب', captured!.body.html.includes('أحمد'))
  check('المفتاح السري لا يتسرب في محتوى الرسالة', !captured!.body.html.includes('re_test_FAKE') && !captured!.body.text.includes('re_test_FAKE'))

  // ---------- حالة الفشل (نطاق غير موثق مثلاً) ----------
  failMode = true
  const r2 = await sendMail({ to: 'x@gmail.com', subject: 's', html: '<p>ه</p>', text: 'ه' })
  check('فشل Resend → يعود للوضع اليدوي بأمان (sent=false)', r2.sent === false && r2.provider === 'none', JSON.stringify(r2))

  // ---------- بلا مفتاح نهائيًا → الوضع اليدوي ----------
  delete process.env.RESEND_API_KEY
  check('mailerConfigured=false بلا مفتاح', mailerConfigured() === false)

  console.log(`\n===== ${ok} نجاح / ${bad} فشل =====`)
  process.exit(bad ? 1 : 0)
}
main().catch(e => { console.error('ERR:', e); process.exit(1) })
