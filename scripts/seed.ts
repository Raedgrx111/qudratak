// ===== زرع البيانات الأولية للمنصة =====
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { join } from 'path'

const db = new PrismaClient()

type GenQuestion = {
  category: 'QUANTITATIVE' | 'VERBAL'
  topic: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  text: string
  choices: string[]
  correctIndex: number
  explanation: string
  image?: string
  source?: string
}

const KEYS = ['أ', 'ب', 'ج', 'د']

// مولد عشوائي مستقر
function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20240923)
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]

async function main() {
  console.log('🧹 تنظيف قاعدة البيانات...')
  await db.commentLike.deleteMany()
  await db.comment.deleteMany()
  await db.favorite.deleteMany()
  await db.answerRecord.deleteMany()
  await db.examAttempt.deleteMany()
  await db.examQuestion.deleteMany()
  await db.exam.deleteMany()
  await db.importLog.deleteMany()
  await db.question.deleteMany()
  await db.user.deleteMany()

  // ---------- المستخدمون ----------
  console.log('👥 إنشاء المستخدمين...')
  const teacherPass = await bcrypt.hash('Teacher@1234', 10)
  const studentPass = await bcrypt.hash('Student@1234', 10)

  const teacher = await db.user.create({
    data: { name: 'أ. خالد العمري', email: 'teacher@qudratak.sa', passwordHash: teacherPass, role: 'TEACHER' },
  })
  const teacher2 = await db.user.create({
    data: { name: 'أ. سارة الدوسري', email: 'sara@qudratak.sa', passwordHash: teacherPass, role: 'TEACHER' },
  })

  const studentsData = [
    { name: 'عبدالله المطيري', email: 'student@qudratak.sa', grade: 'السنة الثالثة ثانوي' },
    { name: 'نورة القحطاني', email: 'noura@qudratak.sa', grade: 'السنة الثالثة ثانوي' },
    { name: 'محمد الشهري', email: 'mohammed@qudratak.sa', grade: 'السنة الثانية ثانوي' },
    { name: 'ريم العتيبي', email: 'reem@qudratak.sa', grade: 'السنة الثالثة ثانوي' },
    { name: 'فيصل الغامدي', email: 'faisal@qudratak.sa', grade: 'خريج' },
    { name: 'لمى الحربي', email: 'lama@qudratak.sa', grade: 'السنة الأولى ثانوي' },
  ]
  const students = []
  for (const s of studentsData) {
    students.push(await db.user.create({ data: { ...s, passwordHash: studentPass, role: 'STUDENT' } }))
  }

  // ---------- الأسئلة ----------
  console.log('📚 زرع بنك الأسئلة...')
  const bank: GenQuestion[] = JSON.parse(
    readFileSync(join('/home/z/my-project/scripts/data/question-bank.json'), 'utf-8')
  )
  console.log(`   عدد الأسئلة: ${bank.length}`)

  const chunks: GenQuestion[][] = []
  const CH = 300
  for (let i = 0; i < bank.length; i += CH) chunks.push(bank.slice(i, i + CH))

  let qi = 0
  for (const chunk of chunks) {
    await db.question.createMany({
      data: chunk.map((q) => ({
        category: q.category,
        topic: q.topic,
        difficulty: q.difficulty,
        text: q.text,
        choices: JSON.stringify(q.choices.map((t, idx) => ({ key: KEYS[idx], text: t }))),
        correctAnswer: KEYS[q.correctIndex],
        explanation: q.explanation,
        image: q.image || null,
        source: q.source || 'بنك قدراتك التدريبي',
        createdBy: qi++ % 3 === 0 ? teacher.id : teacher2.id,
      })),
    })
  }
  const totalQuestions = await db.question.count()
  console.log(`   تم زرع ${totalQuestions} سؤال`)

  // ---------- الاختبارات ----------
  console.log('📝 إنشاء الاختبارات...')
  const quantIds = (
    await db.question.findMany({
      where: { category: 'QUANTITATIVE' },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    })
  ).map((q) => q.id)
  const verbalIds = (
    await db.question.findMany({ where: { category: 'VERBAL' }, select: { id: true }, orderBy: { createdAt: 'asc' } })
  ).map((q) => q.id)

  // خلط مستقر لقوائم المعرفات
  const shuffleIds = (ids: string[]) => {
    const a = [...ids]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const qShuffled = shuffleIds(quantIds)
  const vShuffled = shuffleIds(verbalIds)

  async function createExam(
    title: string,
    description: string,
    type: string,
    category: string | null,
    duration: number,
    ids: string[]
  ) {
    const exam = await db.exam.create({
      data: {
        title,
        description,
        type,
        category,
        durationMinutes: duration,
        isPublic: true,
        createdBy: teacher.id,
      },
    })
    await db.examQuestion.createMany({
      data: ids.map((id, idx) => ({ examId: exam.id, questionId: id, order: idx })),
    })
    return exam
  }

  const exam1 = await createExam(
    'اختبار محاكاة قدرات شامل (1)',
    'اختبار محاكاة كامل يغطي القسمين الكمي واللفظي بنسب مشابهة لاختبار القدرات العامة، لتقييم مستواك الشامل.',
    'MOCK',
    null,
    90,
    [...qShuffled.slice(0, 30), ...vShuffled.slice(0, 20)]
  )
  const exam2 = await createExam(
    'اختبار محاكاة قدرات شامل (2)',
    'جولة ثانية من الاختبار الشامل بأسئلة جديدة — مثالي لقياس تقدمك بعد التدريب.',
    'MOCK',
    null,
    90,
    [...qShuffled.slice(30, 60), ...vShuffled.slice(20, 40)]
  )
  const exam3 = await createExam(
    'اختبار القسم الكمي',
    'تدرك مركز على مهارات الحساب والجبر والهندسة والإحصاء في مستويات متدرجة.',
    'SECTION',
    'QUANTITATIVE',
    45,
    qShuffled.slice(60, 85)
  )
  const exam4 = await createExam(
    'اختبار القسم اللفظي',
    'تدرك مركز على التناظر وإكمال الجمل والخطأ السياقي والفهم المقروء.',
    'SECTION',
    'VERBAL',
    35,
    vShuffled.slice(40, 65)
  )
  const exam5 = await createExam(
    'تدريب مكثف: الجبر والمعادلات',
    'اختبار مهارة مركّز على موضوع الجبر والمعادلات لتحويل نقاط الضعف إلى قوة.',
    'TOPIC',
    'QUANTITATIVE',
    25,
    (await db.question.findMany({ where: { topic: 'الجبر والمعادلات' }, select: { id: true }, take: 15 })).map(
      (q) => q.id
    )
  )
  const exam6 = await createExam(
    'تدريب مكثف: التناظر اللفظي',
    'اختبار مهارة مركّز على التناظر اللفظي — أكثر أقسام القسم اللفظي شيوعًا.',
    'TOPIC',
    'VERBAL',
    20,
    (await db.question.findMany({ where: { topic: 'التناظر اللفظي' }, select: { id: true }, take: 12 })).map(
      (q) => q.id
    )
  )
  console.log(`   تم إنشاء 6 اختبارات`)

  // ---------- نشاط تجريبي للطلاب ----------
  console.log('📈 توليد نشاط تدريبي تجريبي...')
  const examList = [exam1, exam2, exam3, exam4, exam5, exam6]
  const examsWithQuestions = await Promise.all(
    examList.map(async (e) => ({
      exam: e,
      questions: await db.examQuestion.findMany({
        where: { examId: e.id },
        include: { question: true },
        orderBy: { order: 'asc' },
      }),
    }))
  )

  // مستويات أداء مختلفة لكل طالب لعرض نقاط ضعف حقيقية
  const accuracyByStudent = [0.86, 0.72, 0.64, 0.55, 0.47, 0.38]
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 3600 * 1000)

  for (let si = 0; si < students.length; si++) {
    const student = students[si]
    const baseAcc = accuracyByStudent[si]
    // محاولات اختبارات: كل طالب خاض 3-5 اختبارات عبر الأسابيع الماضية
    const attemptsCount = 3 + Math.floor(rng() * 3)
    for (let ai = 0; ai < attemptsCount; ai++) {
      const ew = pick(examsWithQuestions)
      // تحسن تدريجي عبر المحاولات
      const acc = Math.min(0.95, baseAcc + ai * 0.05 + (rng() - 0.5) * 0.1)
      const answers: Record<string, string> = {}
      let correct = 0
      let wrong = 0
      const startedAt = daysAgo(2 + ai * 6 + Math.floor(rng() * 3))
      const timeSpent = ew.exam.durationMinutes * 60 * (0.6 + rng() * 0.3)

      const answerRecords: {
        userId: string
        questionId: string
        selectedKey: string
        isCorrect: boolean
        mode: string
        createdAt: Date
      }[] = []

      for (const eq of ew.questions) {
        const isCorrect = rng() < acc
        const options = JSON.parse(eq.question.choices) as { key: string }[]
        let sel: string
        if (isCorrect) sel = eq.question.correctAnswer
        else {
          const wrongs = options.map((o) => o.key).filter((k) => k !== eq.question.correctAnswer)
          sel = pick(wrongs)
        }
        answers[eq.questionId] = sel
        if (isCorrect) correct++
        else wrong++
        answerRecords.push({
          userId: student.id,
          questionId: eq.questionId,
          selectedKey: sel,
          isCorrect,
          mode: 'EXAM',
          createdAt: startedAt,
        })
      }
      const total = ew.questions.length
      await db.examAttempt.create({
        data: {
          userId: student.id,
          examId: ew.exam.id,
          answers: JSON.stringify(answers),
          score: Math.round((correct / total) * 10000) / 100,
          correctCount: correct,
          wrongCount: wrong,
          skippedCount: 0,
          timeSpentSeconds: Math.round(timeSpent),
          status: 'COMPLETED',
          startedAt,
          completedAt: new Date(startedAt.getTime() + timeSpent * 1000),
        },
      })
      // نزرع سجلات الإجابات على دفعات
      for (let i = 0; i < answerRecords.length; i += 200) {
        await db.answerRecord.createMany({ data: answerRecords.slice(i, i + 200) })
      }
    }

    // تدريب حر (PRACTICE) على أسئلة متنوعة
    const practiceCount = 30 + Math.floor(rng() * 40)
    const poolQ = shuffleIds(qShuffled.slice(85, 400)).slice(0, practiceCount)
    const poolQFull = await db.question.findMany({
      where: { id: { in: poolQ } },
      select: { id: true, correctAnswer: true, choices: true },
    })
    const prAcc = baseAcc + 0.05
    const prRecords = poolQFull.map((q, idx) => {
      const isCorrect = rng() < prAcc
      const options = JSON.parse(q.choices) as { key: string }[]
      let sel: string
      if (isCorrect) sel = q.correctAnswer
      else {
        const wrongs = options.map((o) => o.key).filter((k) => k !== q.correctAnswer)
        sel = pick(wrongs)
      }
      return {
        userId: student.id,
        questionId: q.id,
        selectedKey: sel,
        isCorrect,
        mode: 'PRACTICE' as const,
        createdAt: daysAgo(Math.floor(idx / 6) + 1),
      }
    })
    for (let i = 0; i < prRecords.length; i += 200) {
      await db.answerRecord.createMany({ data: prRecords.slice(i, i + 200) })
    }

    // مفضلة لكل طالب
    const favIds = shuffleIds(qShuffled).slice(0, 4 + Math.floor(rng() * 6))
    for (const fid of favIds) {
      await db.favorite
        .create({ data: { userId: student.id, questionId: fid } })
        .catch(() => null)
    }
  }

  // ---------- التعليقات والإعجابات ----------
  console.log('💬 إنشاء النقاشات...')
  const sampleIds = shuffleIds(qShuffled).slice(0, 40)
  const commentTexts = [
    'الحل واضح جدًا شكرًا لكم، استفدت من طريقة الشرح خطوة بخطوة.',
    'هل يمكن حل السؤال بطريقة أخرى أسرع في وقت الاختبار؟',
    'راجعت الشرح أكثر من مرة وفهمت أخيرًا، الجزئية الثانية كانت مربكة بالنسبة لي.',
    'لمن يخطئ في هذا النوع: ركزوا على وحدات القياس قبل الحل، أغلب الأخطاء من هنا.',
    'أعتقد أن الخيار (ج) صحيح أيضًا، هل يمكن التوضيح؟',
    'أفضل طريقة لهذا النوع: اختصر المعادلة أولًا ثم عوض بالقيم، يوفر عليك دقيقة كاملة.',
    'هذا السؤال جاء مشابهًا له في اختبار تجريبي سابق، انتبهوا للصياغة.',
    'الشرح ممتاز، أقترح إضافة ملاحظة عن الخطأ الشائع في هذا النوع من الأسئلة.',
    'أحسنتوا! صار الموضوع أسهل بكثير بعد هذا التدريب.',
    'من وين أبدأ لو ضعيفي في الجبر؟ هل يوجد ترتيب مقترح للمواضيع؟',
  ]
  const teacherNotes = [
    'تنبيه مهم: هذا السؤال من الأسئلة الأساسية المتكررة، احفظوا القاعدة المستخدمة في الحل جيدًا.',
    'ملاحظة المعلم: لاحظت خطأً شائعًا في إجاباتكم — راجعوا الشرح وخصوصًا الخطوة الثانية.',
  ]

  let commentCount = 0
  for (const qid of sampleIds) {
    const nComments = 1 + Math.floor(rng() * 3)
    for (let c = 0; c < nComments; c++) {
      const isTeacher = rng() < 0.15
      const comment = await db.comment.create({
        data: {
          questionId: qid,
          userId: isTeacher ? teacher.id : pick(students).id,
          text: isTeacher ? pick(teacherNotes) : pick(commentTexts),
          isPinned: isTeacher,
          createdAt: daysAgo(Math.floor(rng() * 14)),
        },
      })
      commentCount++
      // إعجابات
      const likers = students.filter(() => rng() < 0.4)
      for (const l of likers) {
        await db.commentLike.create({ data: { commentId: comment.id, userId: l.id } }).catch(() => null)
      }
      // ردود
      if (rng() < 0.35) {
        await db.comment.create({
          data: {
            questionId: qid,
            userId: pick(students).id,
            parentId: comment.id,
            text: pick([
              'شكرًا على التوضيح، وصلت الفكرة الآن.',
              'واجهت نفس المشكلة وحُلّت بعد مراجعة الشرح.',
              'اتفقت، وهذي النقطة محيرة فعلًا.',
              'سؤال ممتاز، وأنا أيضًا أريد معرفة الطريقة الأسرع.',
            ]),
            createdAt: daysAgo(Math.floor(rng() * 7)),
          },
        })
        commentCount++
      }
    }
  }
  console.log(`   ${commentCount} تعليق`)

  // ---------- سجل استيراد تجريبي ----------
  await db.importLog.create({
    data: {
      fileName: 'تجميعات_قدرات_40_47.csv',
      totalCount: 540,
      successCount: 540,
      failedCount: 0,
      createdBy: teacher.id,
    },
  })

  console.log('✅ تم زرع جميع البيانات بنجاح')
  console.log(`   - معلمون: 2 (teacher@qudratak.sa / Teacher@1234)`)
  console.log(`   - طلاب: ${students.length} (student@qudratak.sa / Student@1234)`)
  console.log(`   - أسئلة: ${totalQuestions}`)
  console.log(`   - اختبارات: 6`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
