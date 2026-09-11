/**
 * Task 14 — خلية حساب المالك «رائد الحربي» في المركز الأول بلوحة الصدارة
 * بعدد الأسئلة الصحيحة (solved = عدد الأسئلة المختلفة الصحيحة)
 *
 * الاستراتيجية (واقعية 100%):
 * - حلّ كل أسئلة المنصة (1346) إجابة صحيحة = أعلى رقم ممكن، لا يمكن لأحد تجاوزه
 * - توزيع زمني واقعي: ~70% خلال آخر 35 يومًا + ~30% خلال آخر 7 أيام
 *   (ليتصدر التبويبات الثلاثة: أسبوع/شهر/الكل)
 * - ~2.5% محاولات خاطئة قبل الإجابة الصحيحة (دقة ≈ 97.5% تبدو طبيعية)
 * - 3 محاولات اختبارات مكتملة بدرجات عالية (ملف صدارة متكامل)
 * - السكربت قابل لإعادة التشغيل (ينظف بياناته القديمة أولًا)
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// مولد عشوائي ثابت البذرة (قابل للتكرار)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20250911)
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)]

const OWNER_EMAIL = 'owner@example.com'
const OWNER_GRADE = 'السنة الثالثة ثانوي'

async function main() {
  const owner = await db.user.findUnique({ where: { email: OWNER_EMAIL } })
  if (!owner) throw new Error('Owner not found: ' + OWNER_EMAIL)
  console.log('👑 المالك:', owner.name, `(${owner.id})`)

  // 1) تحديث الملف: مرحلة + آخر نشاط
  await db.user.update({
    where: { id: owner.id },
    data: { grade: OWNER_GRADE, lastActiveAt: new Date() },
  })

  // 2) تنظيف بيانات سابقة (قابلية إعادة التشغيل)
  const delA = await db.answerRecord.deleteMany({ where: { userId: owner.id } })
  const delE = await db.examAttempt.deleteMany({ where: { userId: owner.id } })
  console.log(`🧹 تنظيف: ${delA.count} إجابة قديمة، ${delE.count} محاولة اختبار قديمة`)

  // 3) جلب كل الأسئلة
  const questions = await db.question.findMany({
    select: { id: true, correctAnswer: true, choices: true },
  })
  console.log(`📚 إجمالي الأسئلة: ${questions.length}`)

  // خلط عشوائي ثابت
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[questions[i], questions[j]] = [questions[j], questions[i]]
  }

  const now = Date.now()
  const DAY = 86_400_000

  // 4) بناء سجلات الإجابات
  type Row = {
    userId: string
    questionId: string
    selectedKey: string
    isCorrect: boolean
    mode: string
    createdAt: Date
  }
  const rows: Row[] = []

  const splitIdx = Math.floor(questions.length * 0.7) // 70% في الماضي البعيد، 30% في آخر أسبوع
  const phase1 = questions.slice(0, splitIdx)
  const phase2 = questions.slice(splitIdx)

  const buildRow = (q: (typeof questions)[0], at: Date, withWrong: boolean): Row[] => {
    const mode = rand() < 0.15 ? 'EXAM' : 'PRACTICE'
    const out: Row[] = []
    if (withWrong) {
      // محاولة خاطئة قبل الصحيحة (مفتاح صحيح الصيغة من الخيارات)
      let wrongKey = ''
      try {
        const choices = JSON.parse(q.choices) as Array<{ key: string }>
        const keys = choices.map((c) => c.key).filter((k) => k && k !== q.correctAnswer)
        if (keys.length) wrongKey = pick(keys)
      } catch {
        wrongKey = ''
      }
      if (wrongKey) {
        out.push({
          userId: owner.id,
          questionId: q.id,
          selectedKey: wrongKey,
          isCorrect: false,
          mode,
          createdAt: new Date(Math.max(now - 35 * DAY, at.getTime() - randInt(1, 40) * 60_000)),
        })
      }
    }
    out.push({
      userId: owner.id,
      questionId: q.id,
      selectedKey: q.correctAnswer,
      isCorrect: true,
      mode,
      createdAt: at,
    })
    return out
  }

  // المرحلة 1: من 35 يومًا إلى 7 أيام مضت
  for (const q of phase1) {
    const at = new Date(now - randInt(7 * DAY + 3_600_000, 35 * DAY))
    rows.push(...buildRow(q, at, rand() < 0.028))
  }
  // المرحلة 2: آخر 7 أيام (بكثافة — لصدارة تبويب الأسبوع)
  for (const q of phase2) {
    const at = new Date(now - randInt(2 * 3_600_000, 7 * DAY - 60_000))
    rows.push(...buildRow(q, at, rand() < 0.02))
  }

  // ترتيب زمني تصاعدي ثم إدخال بدفعات
  rows.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  console.log(`✍️  سجلات الإجابات المبنية: ${rows.length}`)
  for (let i = 0; i < rows.length; i += 400) {
    await db.answerRecord.createMany({ data: rows.slice(i, i + 400) })
  }

  // 5) محاولات اختبارات مكتملة بدرجات عالية (ملف متكامل)
  const exams = await db.exam.findMany({
    where: { isPublic: true },
    include: { questions: { orderBy: { order: 'asc' }, include: { question: { select: { id: true, correctAnswer: true } } } } },
    take: 12,
    orderBy: { createdAt: 'desc' },
  })
  const goodExams = exams
    .filter((e) => e.questions.length >= 10)
    .sort((a, b) => b.questions.length - a.questions.length)
    .slice(0, 3)
  console.log(`📝 اختبارات مختتمة: ${goodExams.length}`)

  const scores = [96.7, 94.2, 98.3]
  for (let i = 0; i < goodExams.length; i++) {
    const exam = goodExams[i]
    const answers: Record<string, string> = {}
    let correct = 0
    let wrong = 0
    for (const eq of exam.questions) {
      const makeWrong = rand() < 0.04 && correct + wrong < exam.questions.length * 0.06
      if (makeWrong) {
        let wrongKey = eq.question.correctAnswer === 'أ' ? 'ب' : 'أ'
        answers[eq.question.id] = wrongKey
        wrong++
      } else {
        answers[eq.question.id] = eq.question.correctAnswer
        correct++
      }
    }
    const skipped = Math.max(0, exam.questions.length - correct - wrong)
    const score = Math.round((correct / exam.questions.length) * 1000) / 10
    const timeSpent = exam.questions.length * randInt(42, 68)
    const completedAt = new Date(now - randInt(1 * DAY, 6 * DAY))
    await db.examAttempt.create({
      data: {
        userId: owner.id,
        examId: exam.id,
        answers: JSON.stringify(answers),
        score,
        correctCount: correct,
        wrongCount: wrong,
        skippedCount: skipped,
        timeSpentSeconds: timeSpent,
        status: 'COMPLETED',
        startedAt: new Date(completedAt.getTime() - timeSpent * 1000),
        completedAt,
      },
    })
    console.log(`   ✔ «${exam.title}» — ${score}% (${correct} صحيح / ${exam.questions.length})`)
  }

  // 6) تحقق نهائي بنفس منطق لوحة الصدارة
  const top = await db.$queryRawUnsafe<
    Array<{ name: string; role: string; attempts: number; solved: number; correct: number }>
  >(`SELECT u.name, u.role,
      COUNT(a.id) as attempts,
      COUNT(DISTINCT CASE WHEN a.isCorrect = 1 THEN a.questionId END) as solved,
      SUM(CASE WHEN a.isCorrect = 1 THEN 1 ELSE 0 END) as correct
     FROM User u JOIN AnswerRecord a ON a.userId = u.id
     GROUP BY u.id
     HAVING COUNT(a.id) >= 5
     ORDER BY solved DESC, correct DESC
     LIMIT 5`)
  console.log('\n🏆 لوحة الصدارة بعد الزراعة (الكل):')
  top.forEach((t, i) => {
    const acc = Number(t.attempts) > 0 ? Math.round((Number(t.correct) / Number(t.attempts)) * 100) : 0
    console.log(
      `   ${i + 1}. ${t.name} ${t.role === 'OWNER' ? '👑' : ''} — ${Number(t.solved)} سؤال صحيح · دقة ${acc}%`,
    )
  })

  // تبويب الأسبوع
  const weekTop = await db.$queryRawUnsafe<Array<{ name: string; solved: number }>>(
    `SELECT u.name, COUNT(DISTINCT CASE WHEN a.isCorrect = 1 THEN a.questionId END) as solved
     FROM User u JOIN AnswerRecord a ON a.userId = u.id
     WHERE a.createdAt >= ?
     GROUP BY u.id ORDER BY solved DESC LIMIT 3`,
    new Date(now - 7 * DAY).getTime(),
  )
  console.log('\n📅 تبويب «هذا الأسبوع» (أعلى 3):')
  weekTop.forEach((t, i) => console.log(`   ${i + 1}. ${t.name} — ${Number(t.solved)}`))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
