import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
const p = new PrismaClient();

async function main() {
  // 1) حذف المالك التجريبي الثاني نهائيًا (الملكية حصرية لرائد الحربي)
  const demoOwner = await p.user.findUnique({ where: { email: 'owner@qudratak.sa' } });
  if (demoOwner) {
    await p.answerRecord.deleteMany({ where: { userId: demoOwner.id } });
    await p.examAttempt.deleteMany({ where: { userId: demoOwner.id } });
    await p.comment.deleteMany({ where: { userId: demoOwner.id } });
    await p.commentLike.deleteMany({ where: { userId: demoOwner.id } }).catch(() => {});
    await p.favorite.deleteMany({ where: { userId: demoOwner.id } }).catch(() => {});
    await p.event.deleteMany({ where: { userId: demoOwner.id } }).catch(() => {});
    await p.user.delete({ where: { id: demoOwner.id } });
    console.log('DELETED demo owner: owner@qudratak.sa');
  }

  // 2) قفل الحسابات التجريبية بكلمات مرور عشوائية (لا أحد يدخل عليها)
  const demoEmails = ['teacher@qudratak.sa', 'sara@qudratak.sa', 'student@qudratak.sa', 'noura@qudratak.sa',
    'mohammed@qudratak.sa', 'reem@qudratak.sa', 'faisal@qudratak.sa', 'lama@qudratak.sa', 'khaled.new@qudratak.sa'];
  console.log('--- RANDOMIZED (nobody can log in) ---');
  for (const email of demoEmails) {
    const u = await p.user.findUnique({ where: { email } });
    if (!u) { console.log(email, '-> not found, skip'); continue; }
    const rnd = 'Qd#' + crypto.randomBytes(12).toString('hex') + '!9';
    await p.user.update({ where: { id: u.id }, data: { passwordHash: await bcrypt.hash(rnd, 10) } });
    console.log(`${email} -> locked`);
  }
  console.log('OWNERS_NOW:', await p.user.count({ where: { role: 'OWNER' } }));
  console.log('TOTAL_USERS:', await p.user.count());
  await p.$disconnect();
}
main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
