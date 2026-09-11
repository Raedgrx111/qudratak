import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireStaff } from '@/lib/auth'
import { handle, fail } from '@/lib/api'
import { detectClipProvider } from '@/lib/clips'
import { buildClipStreamPath } from '@/lib/clip-guard'
import { deleteClipFiles } from '@/lib/upload-store'

// GET /api/clips/[id]?view=1 — تفاصيل مقطع، ومع view=1 يُسجَّل عدد المشاهدات
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await params
    const countView = req.nextUrl.searchParams.get('view') === '1'

    const clip = await db.clip.findUnique({
      where: { id },
      include: { creator: { select: { name: true } } },
    })
    if (!clip) return fail('المقطع غير موجود', 404)

    const session = await getSessionUser()
    const isStaff = session?.role === 'TEACHER' || session?.role === 'OWNER'
    // المشاهدون العاديون لا يرون المقاطع المخفية
    if (!clip.isActive && !isStaff) return fail('المقطع غير موجود', 404)

    // حماية من التحميل: مصدر الملفات المباشرة يُخفى،
    // ويُصدر بدلًا منه playUrl موقّع مؤقت للمسجلين فقط يمر عبر بث الخادم
    // (للإدارة أيضًا — المقاطع المرفوعة لا رابط خارجي لها، والبث هو نفسه الآمن)
    type SafeClip = Omit<typeof clip, 'storagePath' | 'posterPath' | 'url'> & {
      storagePath: string | null
      posterPath: string | null
      url: string | null
      playUrl?: string | null
      uploaded?: boolean
      hasPoster?: boolean
    }
    let safe: SafeClip = clip
    if (clip.provider === 'FILE') {
      safe = {
        ...clip,
        storagePath: null,
        posterPath: null,
        uploaded: !!clip.storagePath,
        hasPoster: !!clip.posterPath,
        url: isStaff ? clip.url : null,
        playUrl: session ? buildClipStreamPath(clip.id, session.id) : null,
      }
    }

    if (countView) {
      const updated = await db.clip.update({ where: { id }, data: { views: { increment: 1 } } })
      return Response.json({ clip: { ...safe, views: updated.views } })
    }
    return Response.json({ clip: safe })
  })
}

// PATCH /api/clips/[id] — تعديل مقطع أو نشر/إخفاء (إدارة فقط)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireStaff()
    const { id } = await params
    const body = await req.json().catch(() => null)

    const existing = await db.clip.findUnique({ where: { id } })
    if (!existing) return fail('المقطع غير موجود', 404)

    const data: {
      title?: string
      description?: string | null
      url?: string
      provider?: string
      videoId?: string | null
      category?: string
      topic?: string | null
      isActive?: boolean
    } = {}

    if (typeof body?.title === 'string' && body.title.trim().length >= 3) data.title = body.title.trim()
    if (body?.description !== undefined) data.description = body.description?.trim() || null
    if (typeof body?.topic === 'string') data.topic = body.topic.trim() || null
    if (['QUANTITATIVE', 'VERBAL', 'GENERAL'].includes(body?.category)) data.category = body.category
    if (typeof body?.isActive === 'boolean') data.isActive = body.isActive

    if (typeof body?.url === 'string' && body.url.trim()) {
      // المقاطع المرفوعة من الجهاز لا تُغيَّر روابطها (المصدر ملف على الخادم)
      if (existing.storagePath) {
        return fail('المقطع مرفوع من جهازك — لا يمكن تغيير رابطه. احذفه وارفع نسخة جديدة إن أردت', 422)
      }
      const rawUrl = body.url.trim()
      let valid = false
      try {
        const parsed = new URL(rawUrl)
        valid = ['http:', 'https:'].includes(parsed.protocol)
      } catch {
        valid = false
      }
      if (!valid) return fail('رابط الفيديو غير صحيح', 422)
      const { provider, videoId } = detectClipProvider(rawUrl)
      data.url = rawUrl
      data.provider = provider
      data.videoId = videoId
    }

    const clip = await db.clip.update({ where: { id }, data })
    return Response.json({ clip })
  })
}

// DELETE /api/clips/[id] — حذف مقطع (إدارة فقط) — مع حذف ملفاته من القرص إن كانت مرفوعة
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireStaff()
    const { id } = await params
    const existing = await db.clip.findUnique({ where: { id } })
    if (!existing) return fail('المقطع غير موجود', 404)
    await db.clip.delete({ where: { id } })
    if (existing.storagePath) deleteClipFiles(existing.storagePath, existing.posterPath)
    return Response.json({ ok: true })
  })
}
