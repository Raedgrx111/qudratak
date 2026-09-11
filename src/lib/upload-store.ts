import { createWriteStream, existsSync, mkdirSync, statSync, unlinkSync } from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { spawn } from 'child_process'
import { randomBytes } from 'crypto'

/**
 * تخزين المقاطع المرفوعة من جهاز المالك:
 *  - الملفات تُحفظ على القرص في uploads/clips (خارج public — لا تُخدم كملفات ثابتة أبدًا)
 *  - البث يتم حصرًا عبر /api/clips/[id]/stream برابط موقّع مؤقت
 *  - الحفظ «بالتدفق» (streaming) — الذاكرة ثابتة مهما كان حجم الملف
 *  - ffmpeg يولّد صورة مصغرة من إطار مبكر، وffprobe يستخرج المدة (اختياري — لا يفشل الرفع بدونهما)
 */

export const UPLOADS_ROOT = path.join(process.cwd(), 'uploads')
export const CLIPS_DIR = path.join(UPLOADS_ROOT, 'clips')

/** الحد الأقصى لحجم المقطع المرفوع — قابل للضبط بمتغير البيئة (افتراضي 500MB) */
export const MAX_CLIP_UPLOAD_MB = Math.min(Number(process.env.MAX_CLIP_UPLOAD_MB || 500), 2000)
export const MAX_CLIP_UPLOAD_BYTES = MAX_CLIP_UPLOAD_MB * 1024 * 1024

/** الامتدادات وأنواع MIME المسموحة للفيديو */
const ALLOWED: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
  mkv: 'video/x-matroska',
  ogv: 'video/ogg',
}

export function allowedExtensions(): string[] {
  return Object.keys(ALLOWED)
}

/** استخراج الامتداد الآمن من اسم الملف الأصلي (بلا نقاط/مسارات خبيثة) */
export function safeExtension(filename: string): string | null {
  const ext = path.extname(filename || '').toLowerCase().replace('.', '')
  if (!ext || !/^[a-z0-9]{2,5}$/.test(ext) || !ALLOWED[ext]) return null
  return ext
}

export function mimeTypeFor(ext: string): string {
  return ALLOWED[ext] || 'video/mp4'
}

export function ensureClipsDir(): void {
  if (!existsSync(CLIPS_DIR)) mkdirSync(CLIPS_DIR, { recursive: true })
}

/** اسم ملف عشوائي آمن داخل uploads/clips */
export function newClipFilename(ext: string): string {
  ensureClipsDir()
  return `${Date.now().toString(36)}-${randomBytes(8).toString('hex')}.${ext}`
}

/** المسار المطلق لملف داخل مجلد المقاطع مع حماية من الخروج عن المجلد */
export function resolveClipFile(storagePath: string): string | null {
  const abs = path.resolve(CLIPS_DIR, storagePath)
  if (!abs.startsWith(CLIPS_DIR + path.sep)) return null
  return abs
}

/**
 * حفظ تدفق الجسم (req.body) في ملف على القرص مع فرض سقف الحجم أثناء الكتابة.
 * يعيد الحجم الفعلي المكتوب بالبايت — يرمي خطأ SIZE_EXCEEDED إن تجاوز السقف.
 */
export async function saveClipStream(
  body: ReadableStream<Uint8Array>,
  filename: string,
): Promise<number> {
  ensureClipsDir()
  const abs = resolveClipFile(filename)
  if (!abs) throw new Error('INVALID_PATH')
  const out = createWriteStream(abs)
  let written = 0
  const nodeStream = Readable.fromWeb(body as Parameters<typeof Readable.fromWeb>[0])
  await new Promise<void>((resolve, reject) => {
    nodeStream.on('data', (chunk: Buffer) => {
      written += chunk.length
      if (written > MAX_CLIP_UPLOAD_BYTES) {
        nodeStream.destroy()
        out.destroy()
        try {
          unlinkSync(abs)
        } catch {
          /* الملف جزئي — نتجاهل فشل الحذف */
        }
        reject(new Error('SIZE_EXCEEDED'))
      }
    })
    nodeStream.pipe(out)
    nodeStream.on('error', (e) => {
      out.destroy()
      reject(e)
    })
    out.on('error', (e) => reject(e))
    out.on('finish', () => resolve())
  })
  return written
}

/**
 * تشغيل أمر بنظام مع مهلة قصوى.
 * يعيد { code, out }: code = رمز الخروج (0 نجاح) أو null عند فشل التشغيل/انتهاء المهلة.
 * ملاحظة: ffmpeg يكتب تقدمه على stderr ويترك stdout فارغًا — لذلك النجاح يُقاس بـ code لا بـ out.
 */
function runCmd(cmd: string, args: string[], timeoutMs = 20_000): Promise<{ code: number | null; out: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let out = ''
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      resolve({ code: null, out })
    }, timeoutMs)
    child.stdout.on('data', (d: Buffer) => (out += d.toString()))
    child.on('error', () => {
      clearTimeout(timer)
      resolve({ code: null, out })
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({ code, out })
    })
  })
}

/** استخراج مدة الفيديو بالثواني (يُقرّب لأقرب ثانية) — null إن تعذر */
export async function probeDurationSec(absPath: string): Promise<number | null> {
  const { code, out } = await runCmd('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    absPath,
  ])
  if (code !== 0 || !out) return null
  const dur = Number(out.trim().split('\n')[0])
  if (!Number.isFinite(dur) || dur <= 0) return null
  return Math.round(dur)
}

/** توليد صورة مصغرة JPEG من إطار مبكر (اسم الملف: نفس اسم الفيديو بامتداد poster.jpg) */
export async function generatePoster(storagePath: string): Promise<string | null> {
  const abs = resolveClipFile(storagePath)
  if (!abs || !existsSync(abs)) return null
  const posterName = storagePath.replace(/\.[a-z0-9]+$/i, '') + '.poster.jpg'
  const posterAbs = resolveClipFile(posterName)
  if (!posterAbs) return null
  // محاولة إطار من الثانية 1 (أفضل جودة)، وإن فشل (فيديو قصير جدًا) فمن أول الفيديو
  let r = await runCmd('ffmpeg', ['-y', '-ss', '1', '-i', abs, '-vframes', '1', '-vf', 'scale=640:-2', posterAbs], 25_000)
  if (r.code !== 0 || !existsSync(posterAbs)) {
    r = await runCmd('ffmpeg', ['-y', '-i', abs, '-vframes', '1', '-vf', 'scale=640:-2', posterAbs], 25_000)
  }
  if (r.code !== 0 || !existsSync(posterAbs)) return null
  try {
    if (statSync(posterAbs).size < 500) return null // صورة فاسدة/فارغة
  } catch {
    return null
  }
  return posterName
}

/** حذف ملفات مقطع مرفوع (الفيديو + الصورة المصغرة) بأمان تام داخل مجلد المقاطع */
export function deleteClipFiles(storagePath?: string | null, posterPath?: string | null): void {
  for (const rel of [storagePath, posterPath]) {
    if (!rel) continue
    const abs = resolveClipFile(rel)
    if (!abs) continue
    try {
      if (existsSync(abs)) unlinkSync(abs)
    } catch {
      /* نتجاهل فشل الحذف — لا يعطل حذف السجل */
    }
  }
}
