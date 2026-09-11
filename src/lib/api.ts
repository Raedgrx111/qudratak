import { NextResponse } from 'next/server'
import { AuthError } from '@/lib/auth'

export function ok<T>(data: T, init?: number) {
  return NextResponse.json(data as object, { status: init ?? 200 })
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status })
}

/** Wrap a route handler with unified error handling */
export async function handle<T>(fn: () => Promise<T>): Promise<T | NextResponse> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof AuthError) {
      return fail(err.message, err.status)
    }
    const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
    console.error('[API Error]', err)
    return fail(message, 500)
  }
}

// ---------- Domain constants ----------
export const CATEGORIES = ['QUANTITATIVE', 'VERBAL'] as const
export type Category = (typeof CATEGORIES)[number]

export const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export const CHOICE_KEYS = ['أ', 'ب', 'ج', 'د'] as const
export type ChoiceKey = (typeof CHOICE_KEYS)[number]

export const CATEGORY_LABEL: Record<string, string> = {
  QUANTITATIVE: 'كمي',
  VERBAL: 'لفظي',
}

export const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: 'سهل',
  MEDIUM: 'متوسط',
  HARD: 'صعب',
}

export const TOPICS: Record<Category, string[]> = {
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
