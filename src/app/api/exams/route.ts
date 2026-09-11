import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireStaff, getSessionUser } from '@/lib/auth'
import { handle, fail, CATEGORIES, DIFFICULTIES } from '@/lib/api'

// GET /api/exams — قائمة الاختبارات المتاحة
export async function GET() {
  return handle(async () => {
    const user = await getSessionUser()
    const exams = await db.exam.findMany({
      where: { isPublic: true },
      include: { _count: { select: { questions: true, attempts: true } } },
      orderBy: { createdAt: 'desc' },
    })

    // محاولة المستخدم الأخيرة لكل اختبار
    let lastAttempts: Record<string, { score: number; completedAt: Date | null }> = {}
    if (user) {
      const attempts = await db.examAttempt.findMany({
        where: { userId: user.id, status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
      })
      for (const a of attempts) {
        if (!lastAttempts[a.examId]) lastAttempts[a.examId] = { score: a.score || 0, completedAt: a.completedAt }
      }
    }

    return Response.json({
      exams: exams.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        type: e.type,
        category: e.category,
        durationMinutes: e.durationMinutes,
        questionCount: e._count.questions,
        attemptsCount: e._count.attempts,
        lastScore: lastAttempts[e.id]?.score ?? null,
      })),
    })
  })
}

// POST /api/exams — إنشاء اختبار (معلم) — تلقائي حسب الإعدادات أو يدوي بقائمة معرفات
export async function POST(req: NextRequest) {
  return handle(async () => {
    const teacher = await requireStaff()
    const body = await req.json().catch(() => null)
    const title = body?.title?.trim()
    const description = body?.description?.trim() || null
    const durationMinutes = Math.min(240, Math.max(5, parseInt(body?.durationMinutes) || 45))
    const mode = body?.mode || 'auto' // auto | manual
    const count = Math.min(50, Math.max(1, parseInt(body?.count) || 20))
    const category = body?.category // 'QUANTITATIVE' | 'VERBAL' | null
    const topics: string[] = Array.isArray(body?.topics) ? body.topics : []
    const difficultyMix = body?.difficultyMix // {EASY:0.3, MEDIUM:0.5, HARD:0.2} اختياري
    const questionIds: string[] = Array.isArray(body?.questionIds) ? body.questionIds : []

    if (!title || title.length < 3) return fail('عنوان الاختبار مطلوب', 422)

    let selected: string[] = []
    if (mode === 'manual') {
      if (!questionIds.length) return fail('حدد أسئلة الاختبار على الأقل', 422)
      const found = await db.question.findMany({ where: { id: { in: questionIds } }, select: { id: true } })
      selected = found.map((f) => f.id)
    } else {
      const where: Record<string, unknown> = {}
      if (category && CATEGORIES.includes(category)) where.category = category
      if (topics.length) where.topic = { in: topics }
      if (difficultyMix) {
        const per: Record<string, number> = {}
        let taken = 0
        const diffs = DIFFICULTIES.filter((d) => difficultyMix[d] > 0)
        diffs.forEach((d, i) => {
          per[d] = i === diffs.length - 1 ? Math.max(1, count - taken) : Math.max(1, Math.round(count * difficultyMix[d]))
          taken += per[d]
        })
        const chunks = await Promise.all(
          DIFFICULTIES.filter((d) => per[d]).map((d) =>
            db.$queryRawUnsafe<Array<{ id: string }>>(
              `SELECT id FROM Question WHERE category ${category ? `= '${category}'` : 'IN (\'QUANTITATIVE\',\'VERBAL\')'}
               ${topics.length ? `AND topic IN (${topics.map((t) => `'${String(t).replace(/'/g, "''")}'`).join(',')})` : ''}
               AND difficulty = '${d}' ORDER BY RANDOM() LIMIT ${per[d]}`
            )
          )
        )
        selected = chunks.flat().map((c) => c.id)
      } else {
        const rows = await db.$queryRawUnsafe<Array<{ id: string }>>(
          `SELECT id FROM Question WHERE category ${category ? `= '${category}'` : 'IN (\'QUANTITATIVE\',\'VERBAL\')'}
           ${topics.length ? `AND topic IN (${topics.map((t) => `'${String(t).replace(/'/g, "''")}'`).join(',')})` : ''}
           ORDER BY RANDOM() LIMIT ${count}`
        )
        selected = rows.map((r) => r.id)
      }
      // إزالة التكرار وخلط
      selected = [...new Set(selected)]
      for (let i = selected.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[selected[i], selected[j]] = [selected[j], selected[i]]
      }
      if (selected.length < 3) return fail('لا توجد أسئلة كافية تطابق هذه الإعدادات — وسّع الفلترة', 422)
    }

    const exam = await db.exam.create({
      data: {
        title,
        description,
        type: mode === 'manual' ? 'CUSTOM' : 'TOPIC',
        category: category || null,
        durationMinutes: mode === 'manual' ? Math.max(5, Math.ceil(selected.length * 1.5)) : durationMinutes,
        isPublic: true,
        createdBy: teacher.id,
      },
    })
    await db.examQuestion.createMany({
      data: selected.map((id, idx) => ({ examId: exam.id, questionId: id, order: idx })),
    })

    return Response.json({ exam: { ...exam, questionCount: selected.length } }, { status: 201 })
  })
}
