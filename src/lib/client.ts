'use client'

import { create } from 'zustand'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TEACHER' | 'OWNER'
  grade?: string | null
  school?: string | null
  sectionNumber?: string | null
  emailVerified?: boolean
  createdAt?: string
}

// ---------- توكن الجلسة (بديل عند حجب الكوكيز داخل iframes المعاينة) ----------
const TOKEN_KEY = 'qudratak_token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // وضع التصفح الخاص — نعتمد الكوكي فقط
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // تجاهل
  }
}

// إرفاق ترويسة Authorization تلقائيًا بكل استدعاءات /api عندما يوجد توكن،
// ليعمل الدخول حتى لو حجب المتصفح كوكيز الطرف الثالث داخل iframe
if (typeof window !== 'undefined' && !(window as { __qudratakFetchPatched?: boolean }).__qudratakFetchPatched) {
  ;(window as { __qudratakFetchPatched?: boolean }).__qudratakFetchPatched = true
  const originalFetch = window.fetch.bind(window)
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const raw = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      // نحوّل أي رابط لمسار نسبي ونستبعد الطلبات الخارجية تمامًا
      let path = raw
      if (!raw.startsWith('/')) {
        const u = new URL(raw, window.location.origin)
        if (u.origin !== window.location.origin) return originalFetch(input, init)
        path = u.pathname
      }
      if (!path.startsWith('/api/')) return originalFetch(input, init)
      const token = getToken()
      if (token) {
        const headers = new Headers(init?.headers)
        if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)
        return originalFetch(input, { ...init, headers })
      }
    } catch {
      // أي خطأ غير متوقع نرجع السلوك الأصلي
    }
    return originalFetch(input, init)
  }
}

type SessionState = {
  user: SessionUser | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

export const useSession = create<SessionState>((set) => ({
  user: null,
  loading: true,
  refresh: async () => {
    set({ loading: true })
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      const data = await res.json()
      if (data.user) {
        set({ user: data.user, loading: false })
      } else {
        // الجلسة غير صالحة — نمسح التوكن القديم (تنظيف ذاتي)
        clearToken()
        set({ user: null, loading: false })
      }
    } catch {
      set({ user: null, loading: false })
    }
  },
  logout: async () => {
    clearToken()
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
    set({ user: null })
  },
}))

// ---------- أدوات الاستدعاء ----------
export async function api<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'حدث خطأ في الاتصال')
  }
  return data as T
}

/** نسخ نص إلى الحافظة مع بديل يدوي للمتصفحات المقيدة — يعيد true عند النجاح */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // نكمل إلى البديل اليدوي
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

// ---------- راوتر المسارات النظيفة (بدون #) ----------
export type Route = {
  path: string
  segments: string[]
  query: URLSearchParams
}

export function parseRoute(): Route {
  // توافق مع الروابط القديمة بنمط /#/... — نحوّلها فورًا إلى مسار نظيف في شريط العنوان
  try {
    if (window.location.hash) {
      const legacy = window.location.hash.replace(/^#/, '')
      const clean = legacy && legacy !== '/' ? (legacy.startsWith('/') ? legacy : `/${legacy}`) : '/'
      window.history.replaceState({}, '', clean)
    }
  } catch {
    // تجاهل — بعض البيئات المقيدة تمنع تعديل السجل
  }
  const full = window.location.pathname + window.location.search
  const [pathPart, queryPart] = full.split('?')
  const segments = pathPart.split('/').filter(Boolean)
  return { path: pathPart, segments, query: new URLSearchParams(queryPart || '') }
}

export function navigate(to: string) {
  const current = window.location.pathname + window.location.search
  if (current === to && !window.location.hash) {
    // نفس المسار — نطلق الحدث لإعادة التحميل القسري (مثل تحديث قائمة)
    window.dispatchEvent(new PopStateEvent('popstate'))
    return
  }
  if (window.location.hash) {
    // انتقال من رابط هاش قديم — نستبدل المدخل بدل تكديس السجل
    window.history.replaceState({}, '', to)
  } else {
    window.history.pushState({}, '', to)
  }
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0 })
}

// ---------- تسميات مشتركة ----------
export const CATEGORY_LABEL: Record<string, string> = {
  QUANTITATIVE: 'كمي',
  VERBAL: 'لفظي',
}

export const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: 'سهل',
  MEDIUM: 'متوسط',
  HARD: 'صعب',
}

export const DIFFICULTY_STYLE: Record<string, string> = {
  EASY: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  HARD: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
}

export const TOPICS: Record<string, string[]> = {
  QUANTITATIVE: [
    'الحساب والنسبة المئوية',
    'الأعداد والعمليات',
    'الكسور والأعداد العشرية',
    'الجبر والمعادلات',
    'المتتاليات والأنماط',
    'الهندسة والمساحات',
    'النسبة والتناسب',
    'الإحصاء وتحليل البيانات',
    'المقارنات الكمية',
    'المسائل اللفظية',
  ],
  VERBAL: [
    'التناظر اللفظي',
    'إكمال الجمل',
    'الخطأ السياقي',
    'الفهم المقروء',
    'الروابط اللغوية',
    'الاستنتاج والتحليل',
  ],
}

export const EXAM_TYPE_LABEL: Record<string, string> = {
  MOCK: 'محاكاة شاملة',
  SECTION: 'قسم كامل',
  TOPIC: 'تدريب مهارة',
  CUSTOM: 'اختبار مخصص',
}

export const ROLE_LABEL: Record<string, string> = {
  OWNER: 'مالك المنصة',
  TEACHER: 'معلم',
  STUDENT: 'طالب',
}

export const ROLE_STYLE: Record<string, string> = {
  OWNER: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  TEACHER: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  STUDENT: 'bg-secondary text-secondary-foreground',
}

export const EVENT_TYPE_LABEL: Record<string, string> = {
  NEWS: 'إعلان',
  EVENT: 'حدث',
  COMPETITION: 'مسابقة',
  TIP: 'نصيحة',
}

export const EVENT_TYPE_STYLE: Record<string, string> = {
  NEWS: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  EVENT: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  COMPETITION: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  TIP: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function timeAgo(date: string | Date): string {
  const d = new Date(date)
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60) return 'الآن'
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`
  if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`
  return d.toLocaleDateString('ar-SA')
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s} ثانية`
  return `${m} دقيقة و${s} ثانية`
}

export function scoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 70) return 'text-teal-600 dark:text-teal-400'
  if (score >= 50) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
}
