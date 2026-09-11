// ===== سكربت الطوارئ: إعادة تعيين كلمة مرور أي حساب =====
// الاستخدام:  bun run scripts/reset-password.ts <البريد الإلكتروني> <كلمة المرور الجديدة>
// مثال:      bun run scripts/reset-password.ts owner@example.com NewPass@123
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  const [email, newPassword] = process.argv.slice(2)

  if (!email || !newPassword) {
    console.log('❌ الاستخدام: bun run scripts/reset-password.ts <البريد> <كلمة المرور الجديدة>')
    console.log('   مثال:      bun run scripts/reset-password.ts owner@example.com NewPass@123')
    process.exit(1)
  }
  if (newPassword.length < 8) {
    console.log('❌ كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    process.exit(1)
  }

  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (!user) {
    console.log(`❌ لا يوجد حساب بالبريد: ${email}`)
    const all = await db.user.findMany({ select: { email: true }, take: 20 })
    console.log('   حسابات موجودة:', all.map((u) => u.email).join(' | '))
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await db.user.update({ where: { id: user.id }, data: { passwordHash, isBanned: false } })
  console.log(`✅ عُيّنت كلمة مرور جديدة للحساب: ${user.name} (${user.email}) — الدور: ${user.role}`)
  console.log(`   الدخول الآن: ${user.email} / ${newPassword}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
