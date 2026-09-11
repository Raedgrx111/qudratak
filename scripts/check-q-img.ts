import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  const qs = await p.question.findMany({ where: { image: { not: null } }, take: 3, select: { image: true } })
  console.log(JSON.stringify(qs))
}
main().then(() => p.$disconnect())
