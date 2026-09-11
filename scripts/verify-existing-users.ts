// توثيق الحسابات الحالية (لمرة واحدة) — سُجلت قبل نظام تأكيد البريد
// الاستخدام: bun run scripts/verify-existing-users.ts
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const result = await db.user.updateMany({
    where: { emailVerified: false },
    data: { emailVerified: true },
  })
  console.log(`تم توثيق ${result.count} حساب موجود مسبقًا (سُجلوا قبل نظام تأكيد البريد)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
