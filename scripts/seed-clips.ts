// زرع مقاطع تعليمية حقيقية (غير مدمّر — يتحقق من وجود كل مقطع قبل الإضافة)
// تشغيل: bun scripts/seed-clips.ts
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const CLIPS: {
  title: string
  description: string
  url: string
  category: 'QUANTITATIVE' | 'VERBAL' | 'GENERAL'
  topic?: string
  views: number
}[] = [
  {
    title: 'مراجعة ليلة اختبار قدرات في ساعة',
    description: 'مراجعة مكثفة لأهم المفاهيم والأسرار قبل ليلة الاختبار — مناسبة لكل الطلاب في مرحلة الانطلاق.',
    url: 'https://www.youtube.com/watch?v=dK8xtPy0cMU',
    category: 'GENERAL',
    views: 342,
  },
  {
    title: 'كيف تحل أسئلة الكمي في أقل من دقيقة؟ أهم 4 اختصارات',
    description: 'اختصارات ذكية توفر عليك وقت الاختبار — تعلم حل المسألة بسرعة بدون آلة حاسبة.',
    url: 'https://www.youtube.com/watch?v=PSRaQbEzVb4',
    category: 'QUANTITATIVE',
    topic: 'الحساب والنسبة المئوية',
    views: 287,
  },
  {
    title: 'درس القوى والأسس — شرح أساسيات القدرات الكمي من الصفر',
    description: 'درس تأسيسي واضح في القوى والأسس مع أمثلة محلولة على نمط أسئلة الاختبار.',
    url: 'https://www.youtube.com/watch?v=KEglO1513G4',
    category: 'QUANTITATIVE',
    topic: 'الأعداد والعمليات',
    views: 198,
  },
  {
    title: 'حلقة 1: قدرات للمبتدئين من الصفر',
    description: 'الحلقة الأولى من سلسلة التأسيس الكامل — خطة دراستك وخريطة أقسام الاختبار.',
    url: 'https://www.youtube.com/watch?v=Y9FXKvcnK7c',
    category: 'GENERAL',
    views: 156,
  },
  {
    title: 'اختصار حل استيعاب المقروء في قدرات: لا تجاب العيد!',
    description: 'استراتيجية عملية للإجابة على أسئلة الفهم المقروء بسرعة ودقة دون قراءة النص كاملًا.',
    url: 'https://www.youtube.com/watch?v=p2Nn3Tk9D_g',
    category: 'VERBAL',
    topic: 'الفهم المقروء',
    views: 221,
  },
  {
    title: 'أساسيات القدرات لفظي — استيعاب مقروء 1',
    description: 'درس تأسيسي في الفهم المقروء: كيف تقرأ الفقرة بذكاء وتستخرج الإجابة الصحيحة.',
    url: 'https://www.youtube.com/watch?v=U3GvPniIoJA',
    category: 'VERBAL',
    topic: 'الفهم المقروء',
    views: 173,
  },
]

async function main() {
  // المالك رائد الحربي يضيف المقاطع
  const owner = await db.user.findUnique({ where: { email: 'owner@example.com' } })
  const ownerId = owner?.id

  let added = 0
  let skipped = 0
  for (const c of CLIPS) {
    const exists = await db.clip.findFirst({ where: { url: c.url } })
    if (exists) {
      skipped++
      continue
    }
    const videoId = c.url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)?.[1] ?? null
    await db.clip.create({
      data: {
        title: c.title,
        description: c.description,
        url: c.url,
        provider: 'YOUTUBE',
        videoId,
        category: c.category,
        topic: c.topic ?? null,
        views: c.views,
        isActive: true,
        createdBy: ownerId,
      },
    })
    added++
  }

  const total = await db.clip.count()
  console.log('══════════ مقاطع تعليمية ══════════')
  console.log(`أُضيف الآن: ${added} · موجود مسبقًا: ${skipped} · الإجمالي: ${total}`)
  if (!ownerId) console.log('تنبيه: حساب رائد غير موجود — أُضيفت المقاطع بدون منشئ')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
