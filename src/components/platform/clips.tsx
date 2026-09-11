'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { api, timeAgo, formatDate, navigate, copyToClipboard, useSession } from '@/lib/client'
import { CLIP_CATEGORY_LABEL, CLIP_CATEGORY_STYLE, youtubeEmbedUrl, youtubeThumbUrl, formatBytes, formatDuration } from '@/lib/clips'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Play,
  Eye,
  MonitorPlay,
  Film,
  CalendarDays,
  Link2,
  Check,
  ShieldCheck,
  ArrowRight,
  Lock,
} from 'lucide-react'

export type ClipItem = {
  id: string
  title: string
  description: string | null
  url: string | null
  provider: string
  videoId: string | null
  category: string
  topic: string | null
  views: number
  isActive: boolean
  createdAt: string
  creator?: { name: string } | null
  playUrl?: string | null
  uploaded?: boolean
  hasPoster?: boolean
  fileSize?: number | null
  durationSec?: number | null
}

const FILTERS = [
  { key: 'ALL', label: 'الكل' },
  { key: 'QUANTITATIVE', label: 'كمي' },
  { key: 'VERBAL', label: 'لفظي' },
  { key: 'GENERAL', label: 'عام' },
]

/** رابط مشاركة صفحة المقطع (مسار نظيف قابل للنسخ) */
function clipLink(id: string): string {
  return `${window.location.origin}/clips/${id}`
}

/** نسخ رابط المقطع إلى الحافظة مع تأكيد فوري */
export async function shareClipLink(id: string) {
  const ok = await copyToClipboard(clipLink(id))
  if (ok) toast.success('نُسخ رابط المقطع — شاركه مع زملائك')
  else toast.error('تعذر النسخ تلقائيًا — انسخ الرابط من شريط العنوان')
}

/**
 * علامة مائية باسم المشاهد فوق المشغل — رادع لتسجيل الشاشة وإعادة النشر،
 * ولا تعيق استخدام المشغل (pointer-events-none).
 */
function Watermark({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden" aria-hidden>
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 place-items-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="text-[11px] md:text-xs font-bold text-white/20 [text-shadow:0_1px_2px_rgba(0,0,0,0.7)] whitespace-nowrap -rotate-12"
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * مشغل محصّن:
 *  - يوتيوب: تضمين nocookie + علامة مائية + منع قائمة الزر الأيمن
 *  - ملف مباشر: يُبث عبر /api/clips/[id]/stream برابط موقّع مؤقت — المصدر غير معروض أصلًا،
 *    مع تعطيل زر التحميل و PiP والزر الأيمن والسحب.
 */
function ProtectedPlayer({ clip, viewerName }: { clip: ClipItem; viewerName: string | null }) {
  const watermarkText = `قدراتك • ${viewerName || 'منصة قدراتك'}`

  if (clip.provider === 'YOUTUBE' && clip.videoId) {
    return (
      <div
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
      >
        <iframe
          src={youtubeEmbedUrl(clip.videoId)}
          title={clip.title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <Watermark text={watermarkText} />
      </div>
    )
  }

  // ملف مباشر — يتطلب جلسة صالحة (playUrl يصدره الخادم للمسجلين فقط)
  if (!clip.playUrl) {
    return (
      <div className="w-full aspect-video rounded-xl border border-dashed bg-muted/40 flex flex-col items-center justify-center gap-3 text-center p-6">
        <span className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Lock className="h-6 w-6 text-primary" />
        </span>
        <p className="font-bold text-sm">مشاهدة المقاطع متاحة لأعضاء المنصة فقط</p>
        <p className="text-xs text-muted-foreground">سجّل الدخول بحسابك لتشاهد الدرس مجانًا.</p>
        <Button size="sm" onClick={() => navigate('/login')}>تسجيل الدخول</Button>
      </div>
    )
  }

  return (
    <div
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <video
        key={clip.playUrl}
        src={clip.playUrl}
        poster={clip.hasPoster ? `/api/clips/${clip.id}/poster` : undefined}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        className="absolute inset-0 w-full h-full"
      />
      <Watermark text={watermarkText} />
    </div>
  )
}

// ================= صفحة المكتبة /clips =================

export function ClipsPage() {
  const [clips, setClips] = useState<ClipItem[] | null>(null)
  const [filter, setFilter] = useState('ALL')

  const load = useCallback(() => {
    const q = filter === 'ALL' ? '' : `?category=${filter}`
    api<{ clips: ClipItem[] }>(`/api/clips${q}`)
      .then((d) => setClips(d.clips))
      .catch(() => setClips([]))
  }, [filter])

  useEffect(load, [load])

  const openClip = (id: string) => navigate(`/clips/${id}`)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 fade-up pb-20 md:pb-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2.5">
            <span className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <MonitorPlay className="h-6 w-6 text-primary" />
            </span>
            المقاطع التعليمية
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            دروس مرئية مختارة لشرح مهارات الاختبار — شاهد، افهم، ثم طبّق في التدريب.
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? 'default' : 'outline'}
              onClick={() => setFilter(f.key)}
              className="rounded-full"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {!clips ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : clips.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <Film className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <h3 className="font-bold text-lg">لا توجد مقاطع {filter !== 'ALL' ? 'في هذا القسم ' : ''}حاليًا</h3>
            <p className="text-sm text-muted-foreground">سيتم نشر الدروس المرئية قريبًا — تابعنا!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clips.map((clip) => (
            <div
              key={clip.id}
              role="link"
              tabIndex={0}
              onClick={() => openClip(clip.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openClip(clip.id)
                }
              }}
              className="text-right group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
              aria-label={`فتح المقطع: ${clip.title}`}
            >
              <Card className="overflow-hidden h-full transition-all group-hover:shadow-lg group-hover:-translate-y-0.5">
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {clip.provider === 'YOUTUBE' && clip.videoId ? (
                    <img
                      src={youtubeThumbUrl(clip.videoId)}
                      alt={clip.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : clip.hasPoster ? (
                    <img
                      src={`/api/clips/${clip.id}/poster`}
                      alt={clip.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
                      <Film className="h-10 w-10 text-primary/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                      <Play className="h-5 w-5 text-primary fill-primary -scale-x-100" />
                    </span>
                  </div>
                  <Badge className={cn('absolute top-2 right-2 text-[10px] border-0 shadow-sm', CLIP_CATEGORY_STYLE[clip.category] || CLIP_CATEGORY_STYLE.GENERAL)}>
                    {CLIP_CATEGORY_LABEL[clip.category] || clip.category}
                    {clip.topic ? ` · ${clip.topic}` : ''}
                  </Badge>
                  {clip.uploaded && !!clip.durationSec && (
                    <Badge className="absolute bottom-2 right-2 text-[10px] border-0 shadow-sm bg-black/70 text-white">
                      {formatDuration(clip.durationSec)}
                    </Badge>
                  )}
                  {/* زر نسخ الرابط — مستقل عن فتح المقطع */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      shareClipLink(clip.id)
                    }}
                    aria-label={`نسخ رابط المقطع: ${clip.title}`}
                    title="نسخ رابط المقطع"
                    className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-foreground/70 hover:text-primary shadow-sm flex items-center justify-center transition-colors"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-extrabold text-sm leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {clip.title}
                  </h3>
                  {clip.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2.5">{clip.description}</p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {clip.views} مشاهدة
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(clip.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        المقاطع محمية — البث عبر المنصة فقط ولا يمكن تحميلها، ويمكنك نسخ رابط أي مقطع ومشاركته مع زملائك.
      </div>
    </div>
  )
}

// ================= صفحة المشاهدة /clips/[id] =================

export function ClipWatchPage({ id }: { id: string }) {
  const { user } = useSession()
  const [clip, setClip] = useState<ClipItem | null | 'NOT_FOUND'>(null)
  const [related, setRelated] = useState<ClipItem[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    api<{ clip: ClipItem }>(`/api/clips/${id}?view=1`)
      .then((d) => {
        if (cancelled) return
        setClip(d.clip)
        // مقاطع ذات صلة من نفس القسم
        api<{ clips: ClipItem[] }>(`/api/clips?category=${d.clip.category}`)
          .then((r) => {
            if (!cancelled) setRelated(r.clips.filter((c) => c.id !== d.clip.id).slice(0, 3))
          })
          .catch(() => null)
      })
      .catch(() => {
        if (!cancelled) setClip('NOT_FOUND')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const copyCurrent = async () => {
    const ok = await copyToClipboard(clipLink(id))
    if (ok) {
      setCopied(true)
      toast.success('نُسخ رابط المقطع — شاركه مع زملائك')
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error('تعذر النسخ تلقائيًا — انسخ الرابط من شريط العنوان')
    }
  }

  if (clip === 'NOT_FOUND') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 fade-up">
        <Card>
          <CardContent className="py-14 text-center space-y-3">
            <Film className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <h3 className="font-bold text-lg">المقطع غير موجود أو تم إخفاؤه</h3>
            <p className="text-sm text-muted-foreground">ربما حُذف الرابط أو أن المقطع لم يُنشر بعد.</p>
            <Button variant="outline" className="gap-1.5" onClick={() => navigate('/clips')}>
              <ArrowRight className="h-4 w-4" /> العودة إلى المقاطع
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!clip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 fade-up space-y-4">
        <Skeleton className="aspect-video rounded-xl" />
        <Skeleton className="h-7 w-2/3 rounded-lg" />
        <Skeleton className="h-4 w-1/3 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 fade-up pb-20 md:pb-8">
      <Button variant="ghost" size="sm" className="gap-1.5 mb-4 -ms-2" onClick={() => navigate('/clips')}>
        <ArrowRight className="h-4 w-4" /> كل المقاطع
      </Button>

      <ProtectedPlayer clip={clip} viewerName={user?.name || null} />

      {/* شريط الحماية */}
      <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/60 rounded-lg px-3 py-2">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        {clip.provider === 'FILE'
          ? 'هذا المقطع محمي — يُبث عبر المنصة برابط مؤقت ولا يمكن تحميله أو معرفة مصدره.'
          : 'مقطع مضمّن من يوتيوب مع علامة مائية باسمك — التحميل عبر المنصة معطّل.'}
      </div>

      {/* العنوان والمعلومات + نسخ الرابط */}
      <div className="mt-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-extrabold leading-snug">{clip.title}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-xs text-muted-foreground">
            <Badge className={cn('border-0 text-[10px]', CLIP_CATEGORY_STYLE[clip.category] || CLIP_CATEGORY_STYLE.GENERAL)}>
              {CLIP_CATEGORY_LABEL[clip.category] || clip.category}
              {clip.topic ? ` · ${clip.topic}` : ''}
            </Badge>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {clip.views} مشاهدة
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> {timeAgo(clip.createdAt)}
            </span>
            {clip.uploaded && !!clip.durationSec && (
              <span className="inline-flex items-center gap-1">
                <Film className="h-3.5 w-3.5" /> {formatDuration(clip.durationSec)}
              </span>
            )}
            <span>نشره {clip.creator?.name || 'فريق قدراتك'}</span>
          </div>
          {clip.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-3 whitespace-pre-line">{clip.description}</p>
          )}
        </div>

        {/* زر نسخ الرابط */}
        <div className="shrink-0 w-full md:w-auto">
          <Button
            onClick={copyCurrent}
            className={cn('w-full md:w-auto gap-2', copied && 'bg-emerald-600 hover:bg-emerald-600')}
            variant={copied ? 'default' : 'outline'}
          >
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            {copied ? 'تم نسخ الرابط' : 'نسخ رابط المقطع'}
          </Button>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center md:text-left">
            الرابط يفتح المقطع لأعضاء المنصة فقط
          </p>
        </div>
      </div>

      {/* مقاطع ذات صلة */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="font-extrabold text-lg mb-3">مقاطع ذات صلة</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((c) => (
              <div
                key={c.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/clips/${c.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/clips/${c.id}`)
                  }
                }}
                className="text-right group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
              >
                <Card className="overflow-hidden h-full transition-all group-hover:shadow-md">
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {c.provider === 'YOUTUBE' && c.videoId ? (
                      <img src={youtubeThumbUrl(c.videoId)} alt={c.title} loading="lazy" className="w-full h-full object-cover" />
                    ) : c.hasPoster ? (
                      <img src={`/api/clips/${c.id}/poster`} alt={c.title} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
                        <Film className="h-8 w-8 text-primary/50" />
                      </div>
                    )}
                    <span className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-6 w-6 text-white fill-white -scale-x-100" />
                    </span>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-bold text-xs leading-snug line-clamp-2">{c.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-1.5 inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {c.views} مشاهدة
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
