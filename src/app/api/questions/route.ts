import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireStaff } from '@/lib/auth'
import { handle, fail, CATEGORIES, DIFFICULTIES, CHOICE_KEYS, type ChoiceKey } from '@/lib/api'

// GET /api/questions — بحث وفلترة مع صفحات
export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await getSessionUser()
    const isTeacher = user?.role === 'TEACHER' || user?.role === 'OWNER'
    const sp = req.nextUrl.searchParams
    const search = sp.get('search')?.trim()
    const category = sp.get('category')
    const topic = sp.get('topic')
    const difficulty = sp.get('difficulty')
    const page = Math.max(1, parseInt(sp.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') || '10')))
    const random = sp.get('random') === '1'

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { text: { contains: search } },
        { explanation: { contains: search } },
        { topic: { contains: search } },
      ]
    }
    if (category && CATEGORIES.includes(category as never)) where.category = category
    if (difficulty && DIFFICULTIES.includes(difficulty as never)) where.difficulty = difficulty
    if (topic) where.topic = topic

    const [total, questions] = await Promise.all([
      db.question.count({ where }),
      random
        ? db.$queryRawUnsafe<Array<Record<string, unknown>>>(
            `SELECT id, category, topic, difficulty, text, choices, correctAnswer, explanation, image, source, createdAt
             FROM Question ${buildWhereSql(where)}
             ORDER BY RANDOM() LIMIT ? OFFSET ?`,
            limit,
            (page - 1) * limit
          )
        : db.question.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
    ])

    // في الوضع العشوائي نحسب العدد الإجمالي بطريقة تقريبية (عدد نتائج الفلترة)
    const totalCount = random ? await db.question.count({ where }) : total

    const mapped = (questions as Array<Record<string, unknown>>).map((q) => ({
      ...q,
      choices: safeParse(q.choices as string),
      // إخفاء الإجابة عن الطلاب — تُكشف بعد الحل عبر /answer
      correctAnswer: isTeacher ? q.correctAnswer : undefined,
      explanation: isTeacher ? q.explanation : undefined,
    }))

    return Response.json({
      questions: mapped,
      total: totalCount,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(totalCount / limit)),
    })
  })
}

function buildWhereSql(where: Record<string, unknown>): string {
  const clauses: string[] = []
  if (where.category) clauses.push(`category = '${where.category}'`)
  if (where.difficulty) clauses.push(`difficulty = '${where.difficulty}'`)
  if (where.topic) clauses.push(`topic = '${String(where.topic).replace(/'/g, "''")}'`)
  if (where.OR) {
    const s = String((where.OR as Array<Record<string, unknown>>)[0]?.text?.contains || '')
    const safe = s.replace(/'/g, "''")
    clauses.push(`(text LIKE '%${safe}%' OR explanation LIKE '%${safe}%' OR topic LIKE '%${safe}%')`)
  }
  return clauses.length ? 'WHERE ' + clauses.join(' AND ') : ''
}

function safeParse(s: string) {
  try {
    return JSON.parse(s)
  } catch {
    return []
  }
}

// POST /api/questions — إنشاء سؤال (معلم)
export async function POST(req: NextRequest) {
  return handle(async () => {
    const teacher = await requireStaff()
    const body = await req.json().catch(() => null)

    const category = body?.category
    const topic = body?.topic?.trim()
    const difficulty = body?.difficulty
    const text = body?.text?.trim()
    const choices = body?.choices as Array<{ key: string; text: string }> | undefined
    const correctAnswer = body?.correctAnswer
    const explanation = body?.explanation?.trim()
    const image = body?.image?.trim() || null
    const source = body?.source?.trim() || 'إدخال يدوي'

    if (!CATEGORIES.includes(category)) return fail('القسم غير صحيح (كمي / لفظي)', 422)
    if (!topic) return fail('الموضوع مطلوب', 422)
    if (!DIFFICULTIES.includes(difficulty)) return fail('مستوى الصعوبة غير صحيح', 422)
    if (!text || text.length < 5) return fail('نص السؤال مطلوب (5 أحرف على الأقل)', 422)
    if (!Array.isArray(choices) || choices.length !== 4 || choices.some((c) => !c?.text?.trim()))
      return fail('يجب إدخال أربعة خيارات نصية كاملة', 422)
    const keys = choices.map((c) => c.key)
    if (CHOICE_KEYS.some((k) => !keys.includes(k as ChoiceKey)))
      return fail('مفاتيح الخيارات يجب أن تكون: أ، ب، ج، د', 422)
    if (!CHOICE_KEYS.includes(correctAnswer)) return fail('الإجابة الصحيحة يجب أن تكون أ، ب، ج أو د', 422)
    if (!explanation) return fail('شرح الحل مطلوب', 422)

    const question = await db.question.create({
      data: {
        category,
        topic,
        difficulty,
        text,
        choices: JSON.stringify(choices.map((c) => ({ key: c.key, text: c.text.trim() }))),
        correctAnswer,
        explanation,
        image,
        source,
        createdBy: teacher.id,
      },
    })
    return Response.json({ question }, { status: 201 })
  })
}
