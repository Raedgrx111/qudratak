import { NextRequest } from 'next/server'
import { createReadStream, existsSync } from 'fs'
import { Readable } from 'stream'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { fail } from '@/lib/api'
import { resolveClipFile } from '@/lib/upload-store'

// GET /api/clips/[id]/poster — الصورة المصغرة المولدة تلقائيًا للمقاطع المرفوعة
// صورة ساكنة منطقية الكشف (إطار من الفيديو) — تُعرض في البطاقات والمشغل كخلفية
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const clip = await db.clip.findUnique({ where: { id } })
    if (!clip || !clip.posterPath) return fail('لا توجد صورة مصغرة', 404)

    const session = await getSessionUser()
    const isStaff = session?.role === 'TEACHER' || session?.role === 'OWNER'
    // المخفي: صورته للإدارة فقط
    if (!clip.isActive && !isStaff) return fail('المقطع غير موجود', 404)

    const abs = resolveClipFile(clip.posterPath)
    if (!abs || !existsSync(abs)) return fail('لا توجد صورة مصغرة', 404)

    const stream = createReadStream(abs)
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'private, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return fail('تعذر عرض الصورة المصغرة', 500)
  }
}
