import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireStaff } from '@/lib/auth'
import { handle, fail } from '@/lib/api'
import { detectClipProvider } from '@/lib/clips'

// GET /api/clips — المقاطع المنشورة للجميع (فلترة ?category=)، وكل المقاطع للإدارة مع ?all=1
export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await getSessionUser()
    const isStaff = session?.role === 'TEACHER' || session?.role === 'OWNER'
    const wantAll = req.nextUrl.searchParams.get('all') === '1' && isStaff
    const category = req.nextUrl.searchParams.get('category')

    const where: Record<string, unknown> = wantAll ? {} : { isActive: true }
    if (category && ['QUANTITATIVE', 'VERBAL', 'GENERAL'].includes(category)) where.category = category

    const clips = await db.clip.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { creator: { select: { name: true } } },
    })
    // حماية من التحميل: رابط مصدر الملفات المباشرة لا يُكشف لغير الإدارة
    const withFlags = clips.map((c) => ({
      ...c,
      uploaded: !!c.storagePath,
      hasPoster: !!c.posterPath,
      storagePath: null,
      posterPath: null,
    }))
    const safeClips = isStaff
      ? withFlags
      : withFlags.map((c) => (c.provider === 'FILE' ? { ...c, url: null } : c))
    return Response.json({ clips: safeClips })
  })
}

// POST /api/clips — إضافة مقطع (إدارة فقط: مالك/معلم)
export async function POST(req: NextRequest) {
  return handle(async () => {
    const staff = await requireStaff()
    const body = await req.json().catch(() => null)

    const title = body?.title?.trim()
    const rawUrl = body?.url?.trim()
    const description = body?.description?.trim() || null
    const category = ['QUANTITATIVE', 'VERBAL', 'GENERAL'].includes(body?.category) ? body.category : 'GENERAL'
    const topic = body?.topic?.trim() || null

    if (!title || title.length < 3) return fail('عنوان المقطع مطلوب (3 أحرف على الأقل)', 422)
    if (!rawUrl) return fail('رابط الفيديو مطلوب', 422)

    let parsed: URL
    try {
      parsed = new URL(rawUrl)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol')
    } catch {
      return fail('رابط الفيديو غير صحيح — استخدم رابط يوتيوب أو رابط ملف mp4 مباشر', 422)
    }

    const { provider, videoId } = detectClipProvider(rawUrl)

    const clip = await db.clip.create({
      data: {
        title,
        description,
        url: rawUrl,
        provider,
        videoId,
        category,
        topic,
        createdBy: staff.id,
      },
    })
    return Response.json({ clip }, { status: 201 })
  })
}
