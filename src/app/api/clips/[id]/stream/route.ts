import { NextRequest } from 'next/server'
import { createReadStream, existsSync, statSync } from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { fail } from '@/lib/api'
import { verifyClipStreamToken } from '@/lib/clip-guard'
import { resolveClipFile } from '@/lib/upload-store'

// GET /api/clips/[id]/stream?uid=...&tk=...
// بث وسيط آمن لمقاطع الفيديو الملفية (mp4/webm...):
//  - لا يعمل إلا بتوكن موقّع قصير العمر يصدره الخادم لمستخدم مسجل (clip-guard)
//  - لا يكشف رابط المصدر أبدًا ولا يعيد توجيهًا إليه
//  - يدعم Range ليشتغل التقديم/التأخير في مشغل المنصة
//  - يمنع التخزين المؤقت العام ويجبر العرض inline (زر التحميل معطّل في المشغل أيضًا)
//  - مصدران: ملف مرفوع على الخادم (storagePath) أو رابط خارجي (url) — كلاهما يمر من هنا بالتوكن نفسه

/** بث ملف محلي مرفوع من القرص مع دعم Range الكامل (206/416) */
function serveLocalFile(req: NextRequest, storagePath: string, mimeType: string | null) {
  const abs = resolveClipFile(storagePath)
  if (!abs || !existsSync(abs)) return fail('ملف الفيديو غير موجود على الخادم', 404)

  const size = statSync(abs).size
  const type = mimeType || 'video/mp4'
  const baseHeaders: Record<string, string> = {
    'Content-Type': type,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, no-store',
    'Content-Disposition': 'inline',
    'X-Content-Type-Options': 'nosniff',
  }

  const range = req.headers.get('range')
  if (!range) {
    // الطلب الكامل — 200
    const stream = createReadStream(abs)
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 200,
      headers: { ...baseHeaders, 'Content-Length': String(size) },
    })
  }

  // تحليل ترويسة Range: bytes=start-end | bytes=start- | bytes=-suffix
  const m = range.match(/^bytes=(\d*)-(\d*)$/)
  if (!m || (m[1] === '' && m[2] === '')) {
    return new Response(null, {
      status: 416,
      headers: { ...baseHeaders, 'Content-Range': `bytes */${size}` },
    })
  }

  let start = 0
  let end = size - 1
  if (m[1] === '') {
    // لاحقة: آخر N بايت
    const suffix = Number(m[2])
    if (suffix === 0 || suffix > size) {
      return new Response(null, {
        status: 416,
        headers: { ...baseHeaders, 'Content-Range': `bytes */${size}` },
      })
    }
    start = size - suffix
  } else {
    start = Number(m[1])
    if (m[2] !== '') end = Math.min(Number(m[2]), size - 1)
  }

  if (start > end || start >= size) {
    return new Response(null, {
      status: 416,
      headers: { ...baseHeaders, 'Content-Range': `bytes */${size}` },
    })
  }

  const chunkLen = end - start + 1
  const stream = createReadStream(abs, { start, end })
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    status: 206,
    headers: {
      ...baseHeaders,
      'Content-Length': String(chunkLen),
      'Content-Range': `bytes ${start}-${end}/${size}`,
    },
  })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const uid = req.nextUrl.searchParams.get('uid')
    const tk = req.nextUrl.searchParams.get('tk')

    // 1) التوكن الموقّع إلزامي — لا توكن أو توكن فاسد/منتهي = رفض
    if (!uid || !verifyClipStreamToken(id, uid, tk)) {
      return fail('رابط البث غير صالح أو منتهي — حدّث الصفحة', 403)
    }

    // 2) إذا وُجدت جلسة (كوكي) فيجب أن تكون لنفس المستخدم صاحب التوكن
    const session = await getSessionUser()
    if (session && session.id !== uid) {
      return fail('رابط البث مرتبط بحساب آخر', 403)
    }

    // 3) المقطع يجب أن يكون ملفًا ومنشورًا (أو الطالب إدارة)
    const clip = await db.clip.findUnique({ where: { id } })
    if (!clip || clip.provider !== 'FILE') return fail('البث المباشر متاح لمقاطع الملفات فقط', 400)
    const isStaff = session?.role === 'TEACHER' || session?.role === 'OWNER'
    if (!clip.isActive && !isStaff) return fail('المقطع غير موجود', 404)

    // 4) مصدر محلي مرفوع من الجهاز — يُبث من القرص مباشرة (المسار الحقيقي لا يُكشف)
    if (clip.storagePath) {
      return serveLocalFile(req, clip.storagePath, clip.mimeType)
    }

    // 5) مصدر خارجي — جلب من الخادم (يبقى المصدر سرًا) مع تمرير نطاق Range
    const upstreamHeaders: Record<string, string> = {
      'User-Agent': 'Qudratak-Stream/1.0',
      Accept: 'video/*,*/*',
    }
    const range = req.headers.get('range')
    if (range) upstreamHeaders.Range = range

    let upstream: Response
    try {
      upstream = await fetch(clip.url, { headers: upstreamHeaders, cache: 'no-store', redirect: 'follow' })
    } catch {
      return fail('تعذر الوصول إلى مصدر الفيديو', 502)
    }
    if (!upstream.ok && upstream.status !== 206) {
      return fail('تعذر الوصول إلى مصدر الفيديو', 502)
    }

    // 6) تمرير البث للعميل بترويسات آمنة — بدون كشف المصدر
    const headers = new Headers()
    headers.set('Content-Type', upstream.headers.get('content-type') || 'video/mp4')
    const len = upstream.headers.get('content-length')
    if (len) headers.set('Content-Length', len)
    const contentRange = upstream.headers.get('content-range')
    if (contentRange) headers.set('Content-Range', contentRange)
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Cache-Control', 'private, no-store')
    headers.set('Content-Disposition', 'inline')
    headers.set('X-Content-Type-Options', 'nosniff')

    return new Response(upstream.body, { status: upstream.status, headers })
  } catch {
    return fail('حدث خطأ أثناء البث', 500)
  }
}
