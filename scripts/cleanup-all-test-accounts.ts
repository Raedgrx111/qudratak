import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

// حسابات الاختبار المتبقية من الجولات السابقة + حسابات فحص النشر — تُحذف بكل بياناتها المرتبطة
const EMAILS = [
  'resend-channel-test@gmail.com',
  'publish-check@gmail.com',
  'sara-browser@qudratak.sa', 'saud.test@qudratak.sa', 'hack.test@qudratak.sa', 'prot-1788985430@qudratak.sa', 'prot-1788985448@qudratak.sa',
  'test-e2e@qudratak.sa', 'test-1788956957@qudratak.sa', 'test-1788956976@qudratak.sa',
  'test-1788969868@qudratak.sa', 'test-1788970556@qudratak.sa', 'test-1788971505@qudratak.sa',
  'test-1788971533@qudratak.sa', 'test-1788971907@qudratak.sa', 'test-1788972993@qudratak.sa',
  'test-1788973179@qudratak.sa', 'test-1788983690@qudratak.sa', 'test-1788983711@qudratak.sa',
  'test-1788984048@qudratak.sa', 'test-1788985183@qudratak.sa', 'test-1788985276@qudratak.sa',
  'test-1789042248@gmail.com', 'pub-check-1@gmail.com', 'pub-check-2@gmail.com', 'pub-check-3@gmail.com',
];

async function main() {
  const users = await p.user.findMany({ where: { email: { in: EMAILS } }, select: { id: true, email: true } });
  console.log('TO_DELETE:', users.length);
  for (const u of users) {
    const uid = u.id;
    // الإجابات مرتبطة بالمستخدم مباشرة (onDelete: Cascade على المحاولات والباقي)
    const del = await p.answerRecord.deleteMany({ where: { userId: uid } });
    const dAtt = await p.examAttempt.deleteMany({ where: { userId: uid } });
    const dCmt = await p.comment.deleteMany({ where: { userId: uid } });
    // إعجابات التعليقات وحفظ الأسئلة والفعاليات
    await p.commentLike.deleteMany({ where: { userId: uid } }).catch(() => {});
    await p.favorite.deleteMany({ where: { userId: uid } }).catch(() => {});
    await p.event.deleteMany({ where: { userId: uid } }).catch(() => {});
    const dU = await p.user.delete({ where: { id: uid } });
    console.log(`deleted ${u.email} (answers=${del.count} attempts=${dAtt.count} comments=${dCmt.count})`);
  }
  console.log('REMAINING_USERS:', await p.user.count());
  console.log('REMAINING_STUDENTS:', await p.user.count({ where: { role: 'STUDENT' } }));
  await p.$disconnect();
}
main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
