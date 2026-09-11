import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const suspicious = await p.user.findMany({
    where: { OR: [{ email: { contains: 'test-' } }, { name: { contains: 'محدث' } }, { email: { contains: 'e2e' } }, { email: { contains: 'loadtest' } }, { email: { contains: 'sec-reg' } }] },
    select: { id: true, email: true, name: true, role: true }
  });
  console.log('SUSPICIOUS_TEST_ACCOUNTS:', suspicious.length);
  suspicious.forEach(u => console.log(' -', u.email, '|', u.name, '|', u.role));
  await p.$disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });
