import { clearSessionCookie } from '@/lib/auth'
import { handle } from '@/lib/api'

export async function POST() {
  return handle(async () => {
    await clearSessionCookie()
    return Response.json({ ok: true })
  })
}
