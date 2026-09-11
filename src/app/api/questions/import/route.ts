import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireStaff } from '@/lib/auth'
import { guardByUser } from '@/lib/rate-limit'
import { handle, fail, CATEGORIES, DIFFICULTIES, CHOICE_KEYS } from '@/lib/api'
import * as XLSX from 'xlsx'

type Row = Record<string, unknown>

const KEY_ALIASES: Record<string, string> = {
  'أ': 'أ', 'ا': 'أ', 'a': 'أ', '1': 'أ',
  'ب': 'ب', 'b': 'ب', '2': 'ب',
  'ج': 'ج', 'c': 'ج', '3': 'ج',
  'د': 'د', 'd': 'د', '4': 'د',
}

function norm(v: unknown): string {
  return String(v ?? '').trim()
}

function normalizeKey(v: unknown): string | null {
  const s = norm(v).toLowerCase()
  return KEY_ALIASES[s] || null
}

function normalizeCategory(v: unknown): string | null {
  const s = norm(v)
  if (/كمي|quant/i.test(s)) return 'QUANTITATIVE'
  if (/لفظي|verbal/i.test(s)) return 'VERBAL'
  return null
}

function normalizeDifficulty(v: unknown): string | null {
  const s = norm(v)
  if (/سهل|easy/i.test(s)) return 'EASY'
  if (/متوسط|medium/i.test(s)) return 'MEDIUM'
  if (/صعب|hard/i.test(s)) return 'HARD'
  return null
}

// POST /api/questions/import — رفع ملف Excel/CSV واستيراد الأسئلة
export async function POST(req: NextRequest) {
  return handle(async () => {
    const teacher = await requireStaff()
    // حماية: الاستيراد عملية ثقيلة على القاعدة — حد 5 ملفات كل 10 دقائق
    const g = guardByUser(teacher.id, 'import', 5, 600_000, 'عمليات استيراد كثيرة — انتظر 10 دقائق بين الملفات')
    if (g) return g
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return fail('لم يتم إرفاق ملف', 422)
    if (file.size > 10 * 1024 * 1024) return fail('حجم الملف يتجاوز 10MB', 422)

    const buf = Buffer.from(await file.arrayBuffer())
    let rows: Row[] = []
    try {
      const wb = XLSX.read(buf, { type: 'buffer' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: '' })
    } catch {
      return fail('تعذر قراءة الملف — تأكد أنه Excel أو CSV صحيح', 422)
    }

    if (!rows.length) return fail('الملف فارغ أو لا يحتوي صفوفًا', 422)

    const errors: string[] = []
    const toInsert: {
      category: string
      topic: string
      difficulty: string
      text: string
      choices: string
      correctAnswer: string
      explanation: string
      source: string
      createdBy: string
    }[] = []

    rows.forEach((row, idx) => {
      const line = idx + 2 // +1 للعناوين
      const category = normalizeCategory(row['القسم'] ?? row['category'])
      const topic = norm(row['الموضوع'] ?? row['topic'])
      const difficulty = normalizeDifficulty(row['الصعوبة'] ?? row['difficulty']) || 'MEDIUM'
      const text = norm(row['السؤال'] ?? row['question'] ?? row['النص'])
      const cA = norm(row['الخيار أ'] ?? row['الخيارA'] ?? row['choice_a'] ?? row['الخيار 1'])
      const cB = norm(row['الخيار ب'] ?? row['الخيارB'] ?? row['choice_b'] ?? row['الخيار 2'])
      const cC = norm(row['الخيار ج'] ?? row['الخيارC'] ?? row['choice_c'] ?? row['الخيار 3'])
      const cD = norm(row['الخيار د'] ?? row['الخيارD'] ?? row['choice_d'] ?? row['الخيار 4'])
      const correct = normalizeKey(row['الإجابة'] ?? row['الإجابة الصحيحة'] ?? row['correct'] ?? row['الإجابةالصحيحة'])
      const explanation = norm(row['الشرح'] ?? row['الشرح والحل'] ?? row['explanation'])

      if (!category) {
        errors.push(`صف ${line}: القسم غير صحيح (يجب "كمي" أو "لفظي")`)
        return
      }
      if (!topic) {
        errors.push(`صف ${line}: الموضوع مفقود`)
        return
      }
      if (text.length < 5) {
        errors.push(`صف ${line}: نص السؤال مفقود أو قصير جدًا`)
        return
      }
      if (!cA || !cB || !cC || !cD) {
        errors.push(`صف ${line}: أحد الخيارات الأربعة فارغ`)
        return
      }
      if (!correct || !CHOICE_KEYS.includes(correct as never)) {
        errors.push(`صف ${line}: الإجابة الصحيحة يجب أن تكون أ/ب/ج/د`)
        return
      }
      if (!explanation) {
        errors.push(`صف ${line}: الشرح مفقود`)
        return
      }
      toInsert.push({
        category,
        topic,
        difficulty,
        text,
        choices: JSON.stringify([
          { key: 'أ', text: cA },
          { key: 'ب', text: cB },
          { key: 'ج', text: cC },
          { key: 'د', text: cD },
        ]),
        correctAnswer: correct,
        explanation,
        source: norm(row['المصدر']) || `استيراد: ${file.name}`,
        createdBy: teacher.id,
      })
    })

    // زرع على دفعات
    let inserted = 0
    for (let i = 0; i < toInsert.length; i += 300) {
      const res = await db.question.createMany({ data: toInsert.slice(i, i + 300) })
      inserted += res.count
    }

    const log = await db.importLog.create({
      data: {
        fileName: file.name,
        totalCount: rows.length,
        successCount: inserted,
        failedCount: errors.length,
        errors: errors.length ? JSON.stringify(errors.slice(0, 100)) : null,
        createdBy: teacher.id,
      },
    })

    return Response.json({ log, errors: errors.slice(0, 30) }, { status: 201 })
  })
}

// GET — قائمة سجلات الاستيراد السابقة
export async function GET() {
  return handle(async () => {
    await requireStaff()
    const logs = await db.importLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 })
    return Response.json({ logs })
  })
}

void CATEGORIES
void DIFFICULTIES
