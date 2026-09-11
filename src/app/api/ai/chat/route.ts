import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireVerified } from '@/lib/auth'
import { guard, guardByUser } from '@/lib/rate-limit'
import { handle, fail, DIFFICULTY_LABEL, CATEGORY_LABEL } from '@/lib/api'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/chat — المساعد الذكي (مدرّب خاص)
export async function POST(req: NextRequest) {
  // حماية تكلفة: استدعاءات LLM مكلفة — حد صارم لكل مستخدم + حد احتياطي للمصدر
  const ipGuard = guard(req, 'ai-ip', 30, 60_000)
  if (ipGuard) return ipGuard

  return handle(async () => {
    const user = await requireVerified()
    const g = guardByUser(user.id, 'ai', 20, 60_000, 'طلبات كثيرة على المساعد الذكي — انتظر دقيقة ليستعيد توازنه 🧠')
    if (g) return g
    const body = await req.json().catch(() => null)
    const message = body?.message?.trim()
    if (!message) return fail('الرسالة مطلوبة', 422)
    if (message.length > 4000) return fail('الرسالة طويلة جدًا', 422)

    const history: Array<{ role: 'user' | 'assistant'; content: string }> = Array.isArray(body?.history)
      ? body.history.slice(-10).filter((m: unknown) => m && typeof (m as { content: string }).content === 'string')
      : []

    const systemPrompt = `أنت "مدرّب قدراتك" — مساعد ذكي متخصص في تدريب الطلاب السعوديين على اختبار القدرات العامة (قياس/GAT).
مهمتك:
1. شرح حلول أسئلة القدرات (القسم الكمي: حساب، جبر، هندسة، إحصاء، مقارنات، مسائل لفظية — والقسم اللفظي: تناظر، إكمال جمل، خطأ سياقي، فهم مقروء، روابط، استنتاج).
2. تقديم استراتيجيات حل سريعة وفعالة مناسبة للاختبار الموقوت (مثل: التعويض الذكي، الاستبعاد، التقريب، القواعد المختصرة).
3. مساعدة الطالب على فهم أخطائه بأسلوب إيجابي مشجع.
4. اقتراح خطط تدريب حسب مستوى الطالب.

قواعد الرد:
- اكتب بالعربية الفصحى المبسطة بأسلوب ودّي ومحترف.
- استخدم خطوات مرقمة قصيرة وواضحة عند شرح الحلول.
- إن سُئلت عن سؤال محدد، اعرض الحل خطوة خطوة ثم قل "الإجابة الصحيحة: ..." ثم نصيحة اختبار سريعة.
- اجعل الردود مركزة (بحد أقصى ~200 كلمة) إلا إذا طلب الطالب تفصيلًا أكثر.
- لا تقدم أي محتوى خارج نطاق التدريب والقدرات والدراسة.`

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ],
    })

    const reply = completion?.choices?.[0]?.message?.content
    if (!reply) return fail('تعذر الحصول على رد المساعد، حاول مرة أخرى', 502)

    return Response.json({ reply })
  })
}

// GET /api/ai/chat — سؤال السياق: شرح سؤال معين مرتبط بحالة الطالب
export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireVerified()
    const questionId = req.nextUrl.searchParams.get('questionId')
    if (!questionId) return fail('معرف السؤال مطلوب', 422)
    const question = await db.question.findUnique({ where: { id: questionId } })
    if (!question) return fail('السؤال غير موجود', 404)

    const lastAttempt = await db.answerRecord.findFirst({
      where: { questionId },
      orderBy: { createdAt: 'desc' },
    })

    const context = `السؤال: ${question.text}
الخيارات: ${JSON.parse(question.choices).map((c: { key: string; text: string }) => `${c.key}) ${c.text}`).join(' | ')}`
    const studentState = lastAttempt
      ? `حالة الطالب: أجاب "${lastAttempt.selectedKey}" وكانت إجابته ${lastAttempt.isCorrect ? 'صحيحة' : 'خاطئة'} (الإجابة الصحيحة: ${question.correctAnswer}).`
      : 'الطالب لم يحاول هذا السؤال بعد.'

    return Response.json({ context, studentState, category: CATEGORY_LABEL[question.category], difficulty: DIFFICULTY_LABEL[question.difficulty] })
  })
}
