import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const users = await p.user.groupBy({ by: ['role'], _count: true });
  console.log('USERS:', users.map(u => `${u.role}=${u._count}`).join(' '));
  console.log('QUESTIONS total:', await p.question.count());
  console.log('QUANTITATIVE:', await p.question.count({ where: { category: 'QUANTITATIVE' } }));
  console.log('VERBAL:', await p.question.count({ where: { category: 'VERBAL' } }));
  console.log('EXAMS:', await p.exam.count());
  console.log('ATTEMPTS:', await p.examAttempt.count());
  console.log('ANSWER_RECORDS:', await p.answerRecord.count());
  console.log('CLIPS:', await p.clip.count());
  console.log('COMMENTS:', await p.comment.count());
  const owner = await p.user.findUnique({ where: { email: 'owner@example.com' } });
  console.log('OWNER:', owner ? `OK role=${owner.role} grade=${owner.grade}` : 'MISSING');
  const schoolFields = await p.user.count({ where: { school: { not: null } } });
  console.log('USERS_WITH_SCHOOL_FIELD:', schoolFields);
  await p.$disconnect();
}
main().catch(e => { console.error('ERR:', e.message); process.exit(1); });
