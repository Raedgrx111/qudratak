// أدوات مشتركة للمقاطع التعليمية — تُستخدم في الخادم والعميل

export type ClipProvider = 'YOUTUBE' | 'FILE'

// استخراج معرف الفيديو من أي صيغة روابط يوتيوب (watch / youtu.be / shorts / embed / live)
export function extractYouTubeId(raw: string): string | null {
  const value = raw.trim()
  if (!value) return null
  // معرف مباشر (11 حرفًا)
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = url.searchParams.get('v')
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v
      const m = url.pathname.match(/^\/(?:embed|shorts|v|live)\/([a-zA-Z0-9_-]{11})/)
      if (m) return m[1]
    }
    return null
  } catch {
    return null
  }
}

// تحديد نوع المقطع من الرابط: يوتيوب أو ملف فيديو مباشر
export function detectClipProvider(raw: string): { provider: ClipProvider; videoId: string | null } {
  const videoId = extractYouTubeId(raw)
  if (videoId) return { provider: 'YOUTUBE', videoId }
  return { provider: 'FILE', videoId: null }
}

// رابط التضمين الآمن ليوتيوب
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
}

// صورة مصغرة للفيديو
export function youtubeThumbUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

export const CLIP_CATEGORY_LABEL: Record<string, string> = {
  QUANTITATIVE: 'كمي',
  VERBAL: 'لفظي',
  GENERAL: 'عام',
}

export const CLIP_CATEGORY_STYLE: Record<string, string> = {
  QUANTITATIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  VERBAL: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  GENERAL: 'bg-secondary text-secondary-foreground',
}

/** تنسيق حجم بالبايت لنص مقروء (يُستخدم في واجهات المالك والطلاب) */
export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/** تنسيق مدة بالثواني إلى صيغة mm:ss أو h:mm:ss */
export function formatDuration(sec: number | null | undefined): string {
  if (!sec || sec <= 0) return '—'
  const s = Math.round(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(r).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`
}
