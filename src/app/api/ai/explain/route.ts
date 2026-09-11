import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireVerified } from '@/lib/auth'
import { guardByUser } from '@/lib/rate-limit'
import { handle, fail, DIFFICULTY_LABEL, TOPICS } from '@/lib/api'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai/explain — شرح سؤال محدد بواسطة الذكاء الاصطناعي
export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireVerified()
    // حماية تكلفة: حد شرح المساعد لكل مستخدم
    const g = guardByUser(user.id, 'ai', 20, 60_000, 'طلبات كثيرة على المساعد الذكي — انتظر دقيقة ليستعيد توازنه 🧠')
    if (g) return g
    const body = await req.json().catch(() => null)
    const questionId = body?.questionId
    const focus = body?.focus // 'explain' | 'strategy' | 'mistake'
    if (!questionId) return fail('معرف السؤال مطلوب', 422)

    const question = await db.question.findUnique({ where: { id: questionId } })
    if (!question) return fail('السؤال غير موجود', 404)

    const lastAttempt = await db.answerRecord.findFirst({
      where: { userId: user.id, questionId },
      orderBy: { createdAt: 'desc' },
    })

    const focusPrompts: Record<string, string> = {
      explain: 'اشرح حل السؤال التالي خطوة بخطوة بلغة مبسطة، ثم اذكر "الإجابة الصحيحة" و"نصيحة اختبار" سريعة.',
      strategy: 'قدم استراتيجية أسرع لحل هذا السؤال في ظل ضغط وقت اختبار القدرات (أقل من دقيقة)، مع خطوات مختصرة وحيل ذكية.',
      mistake: `أجاب الطالب على هذا السؤال بخيار "${lastAttempt?.selectedKey || '؟'}" بينما الصحيح "${question.correctAnswer}". اشرح سبب الخطأ المحتمل بلطف، واذكر القاعدة التي يجب فهمها لتجنب الخطأ مستقبلًا.`,
    }

    const prompt = `${focusPrompts[focus] || focusPrompts.explain}

السؤال: ${question.text}
الخيارات: ${JSON.parse(question.choices).map((c: { key: string; text: string }) => `${c.key}) ${c.text}`).join(' | ')}
الإجابة الصحيحة: ${question.correctAnswer}
الشرح المرجعي: ${question.explanation}
القسم: ${question.category === 'QUANTITATIVE' ? 'كمي' : 'لفظي'} | الموضوع: ${question.topic} | الصعوبة: ${DIFFICULTY_LABEL[question.difficulty]}`

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'أنت مدرّب خبراء في اختبار القدرات العامة السعودي (قياس). اشرح بالعربية المبسطة بأسلوب ودّي، خطوات مرقمة، ومركز. لا تتجاوز 180 كلمة.',
        },
        { role: 'user', content: prompt },
      ],
    })

    const reply = completion?.choices?.[0]?.message?.content
    if (!reply) return fail('تعذر الحصول على الشرح، حاول مرة أخرى', 502)
    return Response.json({ reply })
  })
}

void TOPICS
