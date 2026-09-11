// ===== زرع حساب المالك والأحداث (سكربت إضافي غير مدمّر) =====
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  // ---------- 1) حساب المالك (صاحب المنصة) ----------
  let owner = await db.user.findUnique({ where: { email: 'owner@qudratak.sa' } })
  if (!owner) {
    const passwordHash = await bcrypt.hash('Owner@1234', 10)
    owner = await db.user.create({
      data: {
        name: 'مالك المنصة',
        email: 'owner@qudratak.sa',
        passwordHash,
        role: 'OWNER',
      },
    })
    console.log('✅ تم إنشاء حساب المالك: owner@qudratak.sa / Owner@1234')
  } else if (owner.role !== 'OWNER') {
    owner = await db.user.update({ where: { id: owner.id }, data: { role: 'OWNER' } })
    console.log('✅ تمت ترقية الحساب إلى OWNER')
  } else {
    console.log('ℹ️ حساب المالك موجود مسبقًا')
  }

  // ---------- 2) تحديث آخر نشاط للحسابات التجريبية (تتبع واقعي) ----------
  const users = await db.user.findMany()
  const now = Date.now()
  let i = 0
  for (const u of users) {
    if (u.id === owner.id) continue
    // نشاط متدرج: بعضهم نشط اليوم وبعضهم قبل أيام
    const hoursAgo = [1, 5, 20, 40, 80, 140, 200, 300][i % 8] + Math.floor(Math.random() * 6)
    await db.user.update({
      where: { id: u.id },
      data: { lastActiveAt: new Date(now - hoursAgo * 3600_000) },
    })
    i++
  }
  console.log(`✅ تم تحديث آخر نشاط لـ ${i} حساب`)

  // ---------- 3) الأحداث والنشاطات ----------
  const eventsCount = await db.event.count()
  if (eventsCount === 0) {
    const week = 7 * 86400_000
    await db.event.createMany({
      data: [
        {
          title: 'مسابقة المتصدّر الأسبوعي — جوائز فورية',
          body: 'حل أكبر عدد من الأسئلة الصحيحة هذا الأسبوع وثبّت مركزك الأول في قائمة الصدارة. يُحتسب ترتيب المسابقة من عدد الأسئلة المختلفة التي أجبت عنها إجابة صحيحة خلال 7 أيام، ويُعلن الفائز كل خميس على صفحة الأحداث.',
          type: 'COMPETITION',
          startsAt: new Date(now + 2 * 24 * 3600_000),
          createdBy: owner.id,
        },
        {
          title: 'اختبار محاكاة شامل جديد بنمط قياس 2026',
          body: 'أضفنا اختبار محاكاة كاملًا (96 سؤالًا — لفظي وكمي) بمؤقت واقعي مطابق لاختبار قياس الرسمي. متاح الآن لجميع الطلاب مجانًا من صفحة الاختبارات.',
          type: 'NEWS',
          createdBy: owner.id,
        },
        {
          title: 'بث مباشر: استراتيجيات قسم الفهم المقروء',
          body: 'جلسة تفاعلية مع فريق قدراتك لشرح أفضل استراتيجيات حل أسئلة الفهم المقروء والتناظر اللفظي، مع تحليل أخطاء شائعة وإجابة عن أسئلتكم مباشرة.',
          type: 'EVENT',
          startsAt: new Date(now + 5 * 24 * 3600_000),
          createdBy: owner.id,
        },
        {
          title: 'نصيحة الأسبوع: أتقن المقارنات الكمية',
          body: 'في أسئلة المقارنة الكمية لا تحسب القيمتين بالكامل — قارن البنية فقط. مثال: عند مقارنة 25% من 200 مع 20% من 250، لاحظ أن كليهما يساوي 50. تدرّب على هذا النمط من قسم التدريب.',
          type: 'TIP',
          createdBy: owner.id,
        },
      ],
    })
    console.log('✅ تم زرع 4 أحداث وفعاليات')
  } else {
    console.log('ℹ️ الأحداث موجودة مسبقًا')
  }
  // ---------- 4) إعادة توزيع تواريخ النشاط على آخر 30 يومًا (تتبع وصدارة واقعية) ----------
  const answers = await db.answerRecord.findMany({ orderBy: { createdAt: 'asc' } })
  const attempts = await db.examAttempt.findMany({ where: { status: 'COMPLETED' } })

  // توزيع بواقعية: تركيز أكبر في الأيام الأخيرة (نشاط متصاعد)
  const pickDaysAgo = () => {
    const r = Math.random()
    if (r < 0.35) return Math.floor(Math.random() * 5) // 35% خلال آخر 5 أيام
    if (r < 0.6) return 5 + Math.floor(Math.random() * 9) // 25% أيام 5-13
    if (r < 0.85) return 14 + Math.floor(Math.random() * 10) // 25% أيام 14-23
    return 24 + Math.floor(Math.random() * 6) // 15% أيام 24-29
  }

  let aIdx = 0
  for (const a of answers) {
    const daysAgo = pickDaysAgo()
    const createdAt = new Date(now - daysAgo * 86400_000 - Math.floor(Math.random() * 20) * 3600_000)
    await db.answerRecord.update({ where: { id: a.id }, data: { createdAt } })
    aIdx++
  }
  for (const at of attempts) {
    const daysAgo = pickDaysAgo()
    const completedAt = new Date(now - daysAgo * 86400_000 - Math.floor(Math.random() * 10) * 3600_000)
    await db.examAttempt.update({ where: { id: at.id }, data: { completedAt, startedAt: new Date(completedAt.getTime() - 45 * 60_000) } })
  }
  console.log(`✅ أُعيد توزيع تواريخ ${aIdx} إجابة و${attempts.length} محاولة على آخر 30 يومًا`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
