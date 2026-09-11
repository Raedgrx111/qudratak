import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies, headers } from 'next/headers'
import { db } from '@/lib/db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'qudratak-dev-secret-change-in-production-2024'
)
const COOKIE_NAME = 'qudratak_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export type SessionUser = {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TEACHER' | 'OWNER'
  emailVerified: boolean
}

// ---------- Password ----------
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ---------- JWT ----------
export async function createToken(userId: string, role: string): Promise<string> {
  return new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ sub: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { sub: payload.sub as string, role: payload.role as string }
  } catch {
    return null
  }
}

// ---------- Session cookie + Bearer fallback ----------
// هل الطلب قادم عبر HTTPS؟ (خلف بروكسي Caddy نعتمد x-forwarded-proto)
async function isHttpsRequest(): Promise<boolean> {
  try {
    const h = await headers()
    const proto = (h.get('x-forwarded-proto') ?? 'http').split(',')[0].trim()
    return proto === 'https'
  } catch {
    return false
  }
}

/**
 * تعيين كوكي الجلسة وإرجاع التوكن.
 * عبر HTTPS نستخدم SameSite=None; Secure; Partitioned (CHIPS) ليعمل داخل iframes
 * المعاينة، وعبر HTTP المحلي نستخدم Lax. وإذا حجب المتصفح الكوكيز أصلًا
 * فالعميل يعوّض ذلك بتوكن Bearer في كل طلب.
 */
export async function setSessionCookie(userId: string, role: string): Promise<string> {
  const token = await createToken(userId, role)
  const cookieStore = await cookies()
  const https = await isHttpsRequest()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: https ? 'none' : 'lax',
    secure: https,
    partitioned: https,
    maxAge: MAX_AGE,
    path: '/',
  })
  return token
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  const https = await isHttpsRequest()
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: https ? 'none' : 'lax',
    secure: https,
    partitioned: https,
    maxAge: 0,
    path: '/',
  })
}

/** استخراج التوكن: من ترويسة Authorization (لتجاوز حجب الكوكيز في iframes) ثم من الكوكي */
async function extractToken(): Promise<string | null> {
  try {
    const h = await headers()
    const auth = h.get('authorization')
    if (auth?.startsWith('Bearer ')) return auth.slice(7).trim() || null
  } catch {
    // تجاهل — خارج سياق طلب
  }
  try {
    const cookieStore = await cookies()
    return cookieStore.get(COOKIE_NAME)?.value ?? null
  } catch {
    return null
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const token = await extractToken()
    if (!token) return null
    const payload = await verifyToken(token)
    if (!payload) return null
    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, isBanned: true, emailVerified: true },
    })
    if (!user || user.isBanned) return null
    return { id: user.id, name: user.name, email: user.email, role: user.role, emailVerified: user.emailVerified } as SessionUser
  } catch {
    return null
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) throw new AuthError('يجب تسجيل الدخول للمتابعة', 401)
  return user
}

/** طالب أو معلم أو مالك — مستخدم صالح غير محظور */
export async function requireStaff(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role !== 'TEACHER' && user.role !== 'OWNER') {
    throw new AuthError('هذه العملية متاحة لفريق الإدارة فقط', 403)
  }
  return user
}

/** مستخدم أكّد بريده الإلكتروني — الإدارة معفاة (حساباتها يُنشئها المالك) */
export async function requireVerified(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role === 'STUDENT' && !user.emailVerified) {
    throw new AuthError('أكمل تأكيد بريدك الإلكتروني أولًا لتبدأ التدريب', 403)
  }
  return user
}

/** المالك فقط — صاحب المنصة */
export async function requireOwner(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role !== 'OWNER') {
    throw new AuthError('هذه العملية متاحة لمالك المنصة فقط', 403)
  }
  return user
}

/** تحديث آخر نشاط للمستخدم (لتتبع الحسابات) */
export async function touchLastActive(userId: string) {
  try {
    await db.user.update({ where: { id: userId }, data: { lastActiveAt: new Date() } })
  } catch {
    // لا نفشل الطلب بسبب تتبع النشاط
  }
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}
