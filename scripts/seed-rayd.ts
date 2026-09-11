// ===== زرع حساب صاحب المنصة: رائد الحربي (سكربت غير مدمّر — يمكن تشغيله أكثر من مرة) =====
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

const OWNER_EMAIL = 'owner@example.com'
const OWNER_NAME = 'رائد الحربي'
const OWNER_PASSWORD = 'OWNER_PASS_PLACEHOLDER'

async function main() {
  let owner = await db.user.findUnique({ where: { email: OWNER_EMAIL } })

  if (!owner) {
    const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 10)
    owner = await db.user.create({
      data: {
        name: OWNER_NAME,
        email: OWNER_EMAIL,
        passwordHash,
        role: 'OWNER',
      },
    })
    console.log(`✅ تم إنشاء حساب المالك: ${OWNER_NAME} — ${OWNER_EMAIL} / ${OWNER_PASSWORD}`)
  } else {
    // ضمان الاسم والدور الصحيحين حتى لو كان الحساب موجودًا مسبقًا
    const needsUpdate = owner.role !== 'OWNER' || owner.name !== OWNER_NAME || owner.isBanned
    if (needsUpdate) {
      owner = await db.user.update({
        where: { id: owner.id },
        data: { role: 'OWNER', name: OWNER_NAME, isBanned: false },
      })
      console.log(`✅ تم تحديث حساب ${OWNER_EMAIL} إلى دور المالك`)
    } else {
      console.log('ℹ️ حساب المالك (رائد الحربي) موجود مسبقًا وصحيح')
    }
  }

  // تقرير سريع عن عدد الحسابات في قاعدة البيانات (تأكيد الحفظ الفعلي)
  const totalUsers = await db.user.count()
  const students = await db.user.count({ where: { role: 'STUDENT' } })
  const teachers = await db.user.count({ where: { role: 'TEACHER' } })
  const owners = await db.user.count({ where: { role: 'OWNER' } })
  console.log(`📊 الحسابات المحفوظة في قاعدة البيانات: ${totalUsers} (طلاب: ${students} — معلمون: ${teachers} — مالك: ${owners})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
