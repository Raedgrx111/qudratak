import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireStaff, requireUser } from '@/lib/auth'
import { handle, fail } from '@/lib/api'

// GET /api/admin/students — قائمة الطلاب مع إحصائياتهم (معلم)
export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireStaff()
    const search = req.nextUrl.searchParams.get('search')?.trim()

    const students = await db.user.findMany({
      where: { role: 'STUDENT', ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] } : {}) },
      select: {
        id: true,
        name: true,
        email: true,
        grade: true,
        school: true,
        sectionNumber: true,
        createdAt: true,
        _count: { select: { answers: true, attempts: true, comments: true } },
        attempts: { where: { status: 'COMPLETED' }, select: { score: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({
      students: students.map((s) => {
        const scores = s.attempts.map((a) => a.score).filter((x): x is number => x !== null)
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          grade: s.grade,
          school: s.school,
          sectionNumber: s.sectionNumber,
          createdAt: s.createdAt,
          answeredCount: s._count.answers,
          examsCount: s._count.attempts,
          commentsCount: s._count.comments,
          avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
        }
      }),
    })
  })
}

void db
void requireUser
void fail
