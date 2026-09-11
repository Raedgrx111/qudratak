// اختبارات وحدة حارس البريد: التفسير + الأنماط العشوائية + التكامل الكامل
// تُشغّل مباشرة بـ bun (لا تستهلك ميزانية حد التسجيل لأنها بلا HTTP)
import {
  validateRealEmail,
  looksRandomEmail,
  isDisposableEmail,
} from '../src/lib/email-guard'
import { interpretRcpt } from '../src/lib/mailbox-probe'

let pass = 0
let fail = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    pass++
    console.log(`✅ ${name}`)
  } else {
    fail++
    console.log(`❌ ${name}${detail ? ' — ' + detail : ''}`)
  }
}

// ---------- 1) تفسير ردود خوادم البريد على RCPT TO ----------
check('250 = الصندوق موجود', interpretRcpt('250 2.1.5 OK m83si12863921wjc.99 - gsmtp') === 'exists')
check('251 = موجود (مستخدم غير محلي)', interpretRcpt('251 User not local; will forward to x@y.z') === 'exists')
check('550 5.1.1 Gmail = غير موجود', interpretRcpt('550 5.1.1 The email account that you tried to reach does not exist. m83si.99 - gsmtp') === 'not-found')
check('550 user unknown = غير موجود', interpretRcpt('550 user unknown') === 'not-found')
check('550 no such mailbox = غير موجود', interpretRcpt('550 No such mailbox') === 'not-found')
check('551 = غير موجود', interpretRcpt('551 user has moved with no forwarding address') === 'not-found')
check('550 relay denied = غموض (خطأنا نحن)', interpretRcpt('550 Relay access denied') === 'unknown')
check('550 HELO مرفوض = غموض', interpretRcpt('550 Bad HELO') === 'unknown')
check('550 قائمة سوداء = غموض', interpretRcpt('550 Your IP is blacklisted') === 'unknown')
check('450 greylist = غموض (نمرر)', interpretRcpt('450 4.2.1 The user you are trying to contact is receiving mail too quickly') === 'unknown')
check('451 مؤقت = غموض', interpretRcpt('451 4.7.500 Server busy') === 'unknown')
check('553 domain not allowed = غموض (سياسة)', interpretRcpt("553 sorry, that domain isn't in my list of allowed rcpthosts") === 'unknown')

// ---------- 2) كشف الأنماط العشوائية ----------
check('حروف بلا علة طويلة = عشوائي', looksRandomEmail('xkqwrtyplkjmnb@gmail.com') === true)
check('حرف مكرر 5 مرات = عشوائي', looksRandomEmail('aaaaa123@gmail.com') === true)
check('اسم عربي معقول = طبيعي', looksRandomEmail('abdullah.almutairi99@gmail.com') === false)
check('اسم صاحب المنصة = طبيعي', looksRandomEmail('owner@example.com') === false)
check('كلمة قصيرة بلا علة = طبيعي (كلمات إنجليزية قصيرة صحيحة)', looksRandomEmail('sky2024@gmail.com') === false)
check('أرقام فقط = طبيعي (عادة رقم جوال/هوية لحساب حقيقي)', looksRandomEmail('0551234567@gmail.com') === false)

// ---------- 3) التكامل الكامل validateRealEmail ----------
const r1 = await validateRealEmail('test99@mailinator.com')
check('نطاق مؤقت → رفض', r1 !== null && r1.includes('المؤقت'), r1 ?? '')

const r2 = await validateRealEmail('test@no-such-domain-qz-9931-xyz.com')
check('نطاق بلا MX → رفض', r2 !== null && r2.includes('نطاق'), r2 ?? '')

const r3 = await validateRealEmail('xkqwrtyplkjmnb@gmail.com')
check('نمط عشوائي → رفض (قبل وصول الفحص الشبكي)', r3 !== null && r3.includes('عشوائيًا'), r3 ?? '')

// بريد حقيقي الشكل: في هذه البيئة المنفذ 25 محجوب → fail-open (نمرره)
const t0 = Date.now()
const r4 = await validateRealEmail(`qudratak.live.test.${Date.now()}@gmail.com`)
const dt = Date.now() - t0
check('بريد gmail حقيقي الشكل → مقبول (fail-open عند حجب المنفذ)', r4 === null, `${r4 ?? ''} (${dt}ms)`)
check('قاطع الدائرة: الفحص الثاني فوري (بلا مهلة ثانية)', dt < 4500, `${dt}ms`)

const r5 = await validateRealEmail('owner@example.com')
check('بريد المالك الحقيقي → مقبول', r5 === null, r5 ?? '')

console.log(`\n${'='.repeat(46)}\nنتيجة اختبارات وحدة حارس البريد: ${pass}/${pass + fail}`)
process.exit(fail === 0 ? 0 : 1)
