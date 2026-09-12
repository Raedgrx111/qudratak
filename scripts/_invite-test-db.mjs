// ===== أداة اختبار: إنشاء/حذف مالك وحسابات مؤقتة (تُستدعى من test-invite-registration.py) =====
// الاستخدام:
//   node scripts/_invite-test-db.mjs owner <email>     — إنشاء مالك اختبار بكلمة TestOwner@123
//   node scripts/_invite-test-db.mjs cleanup <email1> <email2> ... — حذف الحسابات
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()
const [, , mode, ...args] = process.argv

try {
  if (mode === 'owner') {
    const email = args[0]
    if (!email) throw new Error('email required')
    const hash = await bcrypt.hash('TestOwner@123', 10)
    await db.user.upsert({
      where: { email },
      update: { role: 'OWNER', isBanned: false, emailVerified: true, passwordHash: hash },
      create: { name: 'مالك اختبار', email, passwordHash: hash, role: 'OWNER', emailVerified: true },
    })
    console.log('owner ready:', email)
  } else if (mode === 'cleanup') {
    const res = await db.user.deleteMany({ where: { email: { in: args } } })
    console.log('deleted:', res.count)
  } else {
    throw new Error('unknown mode: ' + mode)
  }
} finally {
  await db.$disconnect()
}
