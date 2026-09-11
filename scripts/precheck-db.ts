/**
 * فحص سلامة قاعدة البيانات قبل النشر
 * - عدد الحسابات والأدوار
 * - عدد الأسئلة وسلامة النصوص (أحرف لاتينية داخل عربي، نصوص فارغة، خيارات ناقصة)
 * - الإجابات والمحاولات والأحداث والتعليقات
 */
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

const AR = /[\u0600-\u06FF]/
const BAD_PATTERNS = [/[\u0600-\u06FF]*[a-zA-Z]+[\u0600-\u06FF]*/, /يمars/, /اسئله(?! السلام)/, /إختبار/, /مجانيه/, /اكثر(?! من)/]

async function main() {
  const [students, teachers, owners, banned] = await Promise.all([
    db.user.count({ where: { role: 'STUDENT' } }),
    db.user.count({ where: { role: 'TEACHER' } }),
    db.user.count({ where: { role: 'OWNER' } }),
    db.user.count({ where: { isBanned: true } }),
  ])
  console.log(`👤 الحسابات: ${students + teachers + owners} (طلاب ${students} / معلمون ${teachers} / مالك ${owners}) — محظورون: ${banned}`)

  const ownerAccounts = await db.user.findMany({ where: { role: 'OWNER' }, select: { email: true, name: true } })
  for (const o of ownerAccounts) console.log(`   👑 مالك: ${o.name} — ${o.email}`)

  const questions = await db.question.findMany({ select: { id: true, text: true, choices: true, correctAnswer: true, category: true, topic: true } })
  console.log(`📚 الأسئلة: ${questions.length}`)

  let corrupt = 0
  const issues: string[] = []
  const CHOICE_KEYS = ['أ', 'ب', 'ج', 'د']
  for (const q of questions) {
    let choices: string[] = []
    let keys: string[] = []
    try {
      const parsed = JSON.parse(q.choices) as Array<{ key: string; text: string }>
      choices = parsed.map((c) => String(c?.text ?? ''))
      keys = parsed.map((c) => String(c?.key ?? ''))
    } catch {
      choices = []
    }
    let bad: string | null = null
    if (!q.text || q.text.trim().length < 5) bad = 'نص قصير/فارغ'
    else if (choices.length !== 4) bad = `خيارات ${choices.length}`
    else if (!keys.includes(q.correctAnswer)) bad = `الإجابة ${q.correctAnswer} ليست ضمن مفاتيح الخيارات`
    else if (choices.some((c) => !c || String(c).trim().length === 0)) bad = 'خيار فارغ'
    else if (BAD_PATTERNS.some((p) => p.test(q.text))) bad = `نمط مشبوه: ${q.text.slice(0, 40)}`
    if (bad) {
      corrupt++
      if (issues.length < 10) issues.push(`[${bad}] ${q.id}: ${q.text.slice(0, 50)}`)
    }
  }
  console.log(corrupt === 0 ? '✅ سلامة الأسئلة: 100% — لا نصوص تالفة أو إجابات خارج الخيارات' : `⚠️ أسئلة مشكوك بها: ${corrupt}`)
  issues.forEach((i) => console.log('   ' + i))

  // تدقيق إملائي لأمثلة شائعة على مستوى البنك (كلمات كاملة فقط)
  const typoRe = /\b(اسئله|إختبار|الكترونيه|مجانيه|اكثر|لاكن|الذين يقولون الشيطان)\b/g
  let typos = 0
  for (const q of questions) {
    const m = q.text.match(typoRe)
    if (m) {
      typos++
      if (typos < 8) console.log(`   ⚠️ إملاء مشتبه: ${m[0]} في: ${q.text.slice(0, 60)}`)
    }
  }
  console.log(typos === 0 ? '✅ الإملاء في بنك الأسئلة: نظيف' : `⚠️ مطابقات إملائية: ${typos}`)

  const [answers, attempts, events, comments, favorites] = await Promise.all([
    db.answerRecord.count(), db.examAttempt.count(), db.event.count({ where: { isActive: true } }), db.comment.count(), db.favorite.count(),
  ])
  console.log(`📊 النشاط: إجابات ${answers} · محاولات ${attempts} · أحداث نشطة ${events} · تعليقات ${comments} · مفضلة ${favorites}`)

  const eventsAll = await db.event.count()
  const importLogs = await db.importLog.count()
  const exams = await db.exam.count({ where: { isPublic: true } })
  console.log(`🗂️  أحداث (الكل): ${eventsAll} · سجلات استيراد: ${importLogs} · اختبارات عامة: ${exams}`)
  console.log('✅ فحص قاعدة البيانات اكتمل')
}

main().catch((e) => { console.error('❌', e); process.exit(1) }).finally(() => db.$disconnect())
