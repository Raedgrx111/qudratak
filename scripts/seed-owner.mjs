// ===== زرع حساب صاحب المنصة (بيئات النشر السحابي — يقرأ البيانات من متغيرات البيئة) =====
// الاستخدام:  OWNER_EMAIL="بريدك" OWNER_NAME="اسمك" OWNER_PASS="كلمة مرور قوية" npm run seed:owner
// السكربت غير مدمّر: يُنشئ المالك إن لم يوجد، ويصحح دوره إن وُجد، ولا يمس أي مستخدم آخر.
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  const OWNER_EMAIL = (process.env.OWNER_EMAIL || '').trim().toLowerCase()
  const OWNER_NAME = (process.env.OWNER_NAME || '').trim() || 'مالك المنصة'
  const OWNER_PASSWORD = process.env.OWNER_PASS || ''

  if (!OWNER_EMAIL || !OWNER_EMAIL.includes('@')) {
    console.error('❌ اضبط OWNER_EMAIL في متغيرات البيئة (بريد إلكتروني صحيح)')
    process.exit(1)
  }
  if (!OWNER_PASSWORD || OWNER_PASSWORD.length < 8) {
    console.error('❌ اضبط OWNER_PASS في متغيرات البيئة (٨ أحرف على الأقل، ولا تستخدم كلمة منقوصة في المستودع)')
    process.exit(1)
  }

  let owner = await db.user.findUnique({ where: { email: OWNER_EMAIL } })

  if (!owner) {
    const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 10)
    owner = await db.user.create({
      data: {
        name: OWNER_NAME,
        email: OWNER_EMAIL,
        passwordHash,
        role: 'OWNER',
        emailVerified: true,
      },
    })
    console.log(`✅ تم إنشاء حساب المالك: ${OWNER_NAME} — ${OWNER_EMAIL}`)
  } else {
    const needsUpdate =
      owner.role !== 'OWNER' || owner.name !== OWNER_NAME || owner.isBanned || !owner.emailVerified
    if (needsUpdate) {
      owner = await db.user.update({
        where: { id: owner.id },
        data: { role: 'OWNER', name: OWNER_NAME, isBanned: false, emailVerified: true },
      })
      console.log(`✅ تم تحديث الحساب ${OWNER_EMAIL} إلى دور المالك`)
    } else {
      console.log(`ℹ️ حساب المالك (${OWNER_EMAIL}) موجود مسبقًا وصحيح — لم تُغيَّر كلمة المرور`)
    }
  }

  const totalUsers = await db.user.count()
  console.log(`📊 إجمالي المستخدمين في قاعدة البيانات: ${totalUsers}`)
}

main()
  .catch((e) => {
    console.error('❌ فشل زرع حساب المالك:', e.message)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
