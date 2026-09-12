// اختبار إرسال حقيقي عبر Resend — يستخدم مُرسل المنصة نفسه والقالب نفسه
// يقرأ المفتاح من process.env (يُمرر من .env عبر bash) — لا يطبع المفتاح أبدًا
import { sendMail, verificationEmailHtml, mailerConfigured } from '../src/lib/mailer'

const TO = process.env.TEST_TO || 'owner@example.com'

async function main() {
  console.log('mailerConfigured:', mailerConfigured())
  console.log('الإرسال إلى:', TO)
  const result = await sendMail({
    to: TO,
    subject: 'رسالة تجربة — منصة قدراتك | قناة البريد جاهزة',
    html: verificationEmailHtml('رائد الحربي', '000000'), // رمز توضيحي 000000 — ليس رمزًا حقيقيًا
    text: 'هذه رسالة تجربة من منصة قدراتك — قناة إرسال رموز التأكيد تعمل الآن. (رمز توضيحي: 000000)',
  })
  console.log('النتيجة:', JSON.stringify(result))
  if (!result.sent) process.exit(2)
}
main().catch(e => { console.error('ERR:', e?.message || e); process.exit(1) })
