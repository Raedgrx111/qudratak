import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  const [users, students, owners, teachers, questions, quant, verbal, exams, publicExams, attempts, answers, clips, comments, events, favorites] = await Promise.all([
    p.user.count(),
    p.user.count({ where: { role: 'STUDENT' } }),
    p.user.count({ where: { role: 'OWNER' } }),
    p.user.count({ where: { role: 'TEACHER' } }),
    p.question.count(),
    p.question.count({ where: { category: 'QUANTITATIVE' } }),
    p.question.count({ where: { category: 'VERBAL' } }),
    p.exam.count(),
    p.exam.count({ where: { isPublic: true } }),
    p.examAttempt.count(),
    p.answerRecord.count(),
    p.clip.count(),
    p.comment.count(),
    p.event.count().catch(() => -1),
    p.favorite.count(),
  ])
  console.log(JSON.stringify({
    users: { total: users, students, teachers, owners },
    questions: { total: questions, quant, verbal },
    exams: { total: exams, public: publicExams },
    activity: { examAttempts: attempts, answerRecords: answers, comments, favorites },
    content: { clips, events },
  }, null, 1))
  const verified = await p.user.count({ where: { emailVerified: true } })
  const banned = await p.user.count({ where: { isBanned: true } }).catch(() => -1)
  console.log('emailVerified:', verified, '| banned:', banned)
}
main().then(() => p.$disconnect()).catch(e => { console.error('DB ERROR:', e.message); process.exit(1) })
