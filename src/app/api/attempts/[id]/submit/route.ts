import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireVerified } from '@/lib/auth'
import { guardByUser } from '@/lib/rate-limit'
import { handle, fail } from '@/lib/api'

// POST /api/attempts/[id]/submit — التسليم والتصحيح الآلي مع التحليل
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const user = await requireVerified()
    // حماية من إغراق التسليم (عمليات تصحيح وتحليل مكلفة)
    const g = guardByUser(user.id, 'exam-ops', 30, 60_000)
    if (g) return g
    const { id } = await ctx.params
    const attempt = await db.examAttempt.findUnique({
      where: { id },
      include: {
        exam: {
          include: {
            questions: { include: { question: true }, orderBy: { order: 'asc' } },
          },
        },
      },
    })
    if (!attempt) return fail('المحاولة غير موجودة', 404)
    if (attempt.userId !== user.id) return fail('غير مصرح', 403)

    const answers = JSON.parse(attempt.answers) as Record<string, string>
    let correct = 0
    let wrong = 0
    let skipped = 0
    const topicStats: Record<string, { total: number; correct: number }> = {}
    const categoryStats: Record<string, { total: number; correct: number }> = {}

    const answerRecords: {
      userId: string
      questionId: string
      selectedKey: string
      isCorrect: boolean
      mode: string
      createdAt: Date
    }[] = []

    for (const eq of attempt.exam.questions) {
      const q = eq.question
      const sel = answers[q.id]
      topicStats[q.topic] = topicStats[q.topic] || { total: 0, correct: 0 }
      categoryStats[q.category] = categoryStats[q.category] || { total: 0, correct: 0 }
      topicStats[q.topic].total++
      categoryStats[q.category].total++
      if (!sel) {
        skipped++
        continue
      }
      const isCorrect = sel === q.correctAnswer
      if (isCorrect) {
        correct++
        topicStats[q.topic].correct++
        categoryStats[q.category].correct++
      } else {
        wrong++
      }
      // نحفظ سجل الإجابات فقط في المرة الأولى
      if (attempt.status !== 'COMPLETED') {
        answerRecords.push({
          userId: user.id,
          questionId: q.id,
          selectedKey: sel,
          isCorrect,
          mode: 'EXAM',
          createdAt: new Date(),
        })
      }
    }

    const total = attempt.exam.questions.length
    const score = total > 0 ? Math.round((correct / total) * 10000) / 100 : 0
    const timeSpent =
      attempt.timeSpentSeconds ?? Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000)

    if (attempt.status !== 'COMPLETED') {
      await db.examAttempt.update({
        where: { id },
        data: {
          answers: JSON.stringify(answers),
          score,
          correctCount: correct,
          wrongCount: wrong,
          skippedCount: skipped,
          timeSpentSeconds: timeSpent,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })

      for (let i = 0; i < answerRecords.length; i += 200) {
        await db.answerRecord.createMany({ data: answerRecords.slice(i, i + 200) })
      }
    }

    // تحليل: أفضل/أسوأ المواضيع
    const topicsAnalysis = Object.entries(topicStats)
      .map(([topic, s]) => ({ topic, ...s, accuracy: Math.round((s.correct / s.total) * 100) }))
      .sort((a, b) => b.accuracy - a.accuracy)

    return Response.json({
      attemptId: id,
      score,
      correct,
      wrong,
      skipped,
      total,
      timeSpentSeconds: timeSpent,
      topicsAnalysis,
      categoryAnalysis: Object.entries(categoryStats).map(([c, s]) => ({
        category: c,
        ...s,
        accuracy: Math.round((s.correct / s.total) * 100),
      })),
    })
  })
}
