// GET /api/auth/mail-status — هل الإرسال البريدي مفعّل؟ (عام، بلا معلومات حساسة)
import { mailerConfigured } from '@/lib/mailer'

export async function GET() {
  return Response.json({ configured: mailerConfigured() })
}
