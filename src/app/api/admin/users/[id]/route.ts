import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireStaff, requireOwner, hashPassword } from '@/lib/auth'
import { handle, fail } from '@/lib/api'

// GET /api/admin/users/[id] — ملف تتبع تفصيلي لحساب واحد (إدارة)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireStaff()
    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, grade: true,
        school: true, sectionNumber: true,
        isBanned: true, emailVerified: true, lastActiveAt: true, createdAt: true,
        _count: { select: { answers: true, attempts: true, comments: true, favorites: true } },
      },
    })
    if (!user) return fail('الحساب غير موجود', 404)

    const [answerAgg, attempts, recentAnswers, topicAgg, commentAgg] = await Promise.all([
      db.$queryRawUnsafe<Array<{ total: number | bigint; correct: number | bigint }>>(
        `SELECT COUNT(*) as total, SUM(CASE WHEN isCorrect = 1 THEN 1 ELSE 0 END) as correct
         FROM AnswerRecord WHERE userId = ?`, id
      ),
      db.examAttempt.findMany({
        where: { userId: id },
        orderBy: { startedAt: 'desc' },
        take: 10,
        include: { exam: { select: { title: true, type: true } } },
      }),
      db.answerRecord.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: { question: { select: { text: true, topic: true, category: true } } },
      }),
      db.$queryRawUnsafe<Array<{ topic: string; category: string; total: number | bigint; correct: number | bigint }>>(
        `SELECT q.topic as topic, q.category as category,
           COUNT(*) as total, SUM(CASE WHEN a.isCorrect = 1 THEN 1 ELSE 0 END) as correct
         FROM AnswerRecord a JOIN Question q ON q.id = a.questionId
         WHERE a.userId = ? GROUP BY q.topic, q.category ORDER BY total DESC`, id
      ),
      db.comment.count({ where: { userId: id, isDeleted: false } }),
    ])

    const total = Number(answerAgg[0]?.total || 0)
    const correct = Number(answerAgg[0]?.correct || 0)

    return Response.json({
      user: { ...user, commentsCount: commentAgg },
      stats: {
        answered: total,
        correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : null,
      },
      topics: topicAgg.map((t) => ({
        topic: t.topic,
        category: t.category,
        total: Number(t.total),
        accuracy: Number(t.total) > 0 ? Math.round((Number(t.correct) / Number(t.total)) * 100) : 0,
      })),
      attempts: attempts.map((a) => ({
        id: a.id,
        examTitle: a.exam.title,
        examType: a.exam.type,
        score: a.score,
        status: a.status,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
      })),
      recentAnswers: recentAnswers.map((r) => ({
        id: r.id,
        isCorrect: r.isCorrect,
        selectedKey: r.selectedKey,
        mode: r.mode,
        createdAt: r.createdAt,
        questionText: r.question.text,
        topic: r.question.topic,
        category: r.question.category,
      })),
    })
  })
}

// PATCH /api/admin/users/[id] — تعديل الدور أو الحظر أو تعيين كلمة مرور جديدة (المالك فقط)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const owner = await requireOwner()
    const { id } = await params
    const body = await req.json().catch(() => null)

    const target = await db.user.findUnique({ where: { id } })
    if (!target) return fail('الحساب غير موجود', 404)

    const isSelf = target.id === owner.id
    const wantsPrivilegeChange = body?.role !== undefined || body?.isBanned !== undefined

    if (isSelf && wantsPrivilegeChange) return fail('لا يمكنك تعديل دورك أو حظرك من هنا', 422)
    if (!isSelf && target.role === 'OWNER') return fail('لا يمكن تعديل حساب مالك آخر', 403)

    const data: { role?: string; isBanned?: boolean; emailVerified?: boolean; passwordHash?: string } = {}
    if (body?.role !== undefined) {
      if (!['STUDENT', 'TEACHER'].includes(body.role)) return fail('الدور غير صحيح', 422)
      data.role = body.role
    }
    if (body?.isBanned !== undefined) {
      if (typeof body.isBanned !== 'boolean') return fail('قيمة الحظر غير صحيحة', 422)
      data.isBanned = body.isBanned
    }
    if (body?.emailVerified !== undefined) {
      if (typeof body.emailVerified !== 'boolean') return fail('قيمة التوثيق غير صحيحة', 422)
      data.emailVerified = body.emailVerified
      // عند التوثيق اليدوي نمسح أي رمز معلق
      if (body.emailVerified) {
        data.verificationCode = null
        data.verificationExpires = null
        data.verificationAttempts = 0
      }
    }
    if (body?.newPassword !== undefined) {
      if (typeof body.newPassword !== 'string' || body.newPassword.length < 8)
        return fail('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل', 422)
      data.passwordHash = await hashPassword(body.newPassword)
    }
    if (Object.keys(data).length === 0) return fail('لا توجد تغييرات', 422)

    const user = await db.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isBanned: true, emailVerified: true },
    })
    return Response.json({ user })
  })
}

// DELETE /api/admin/users/[id] — حذف حساب نهائيًا (المالك فقط)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const owner = await requireOwner()
    const { id } = await params

    const target = await db.user.findUnique({ where: { id } })
    if (!target) return fail('الحساب غير موجود', 404)
    if (target.id === owner.id) return fail('لا يمكنك حذف حسابك الشخصي', 422)
    if (target.role === 'OWNER') return fail('لا يمكن حذف حساب مالك المنصة', 403)

    await db.user.delete({ where: { id } })
    return Response.json({ ok: true })
  })
}
