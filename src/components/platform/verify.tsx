'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession, navigate, setToken } from '@/lib/client'
import { MailCheck, Loader2, LogOut, LifeBuoy, ShieldCheck, RefreshCw, MailWarning } from 'lucide-react'
import { toast } from 'sonner'

const RESEND_SECONDS = 60

export function VerifyEmailPage() {
  const { user, refresh } = useSession()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(RESEND_SECONDS)
  const [mailConfigured, setMailConfigured] = useState<boolean | null>(null)
  const redirected = useRef(false)

  // هل الإرسال البريدي مفعّل على المنصة؟
  useEffect(() => {
    fetch('/api/auth/mail-status')
      .then((r) => r.json())
      .then((d) => setMailConfigured(!!d.configured))
      .catch(() => setMailConfigured(true)) // عند الشك لا نُقلق المستخدم
  }, [])

  // موثق مسبقًا؟ لا داعي للبقاء هنا
  useEffect(() => {
    if (user && user.emailVerified && !redirected.current) {
      redirected.current = true
      navigate('/dashboard')
    }
  }, [user])

  // عدّاد تبريد إعادة الإرسال
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  if (!user) return null // الراوتر يعرض صفحة الدخول

  const verify = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (code.replace(/\D/g, '').length !== 6) {
      toast.error('أدخل الرمز المكوّن من 6 أرقام')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code: code.replace(/\D/g, '') }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل التأكيد')
      if (data.token) setToken(data.token)
      toast.success('تم تأكيد بريدك بنجاح — أهلًا بك في قدراتك! ✅')
      await refresh()
      navigate('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setResending(true)
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'تعذر الإرسال')
      toast.success('أُرسل رمز جديد إلى بريدك إن كان صحيحًا')
      setCooldown(RESEND_SECONDS)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setResending(false)
    }
  }

  const logout = async () => {
    await useSession.getState().logout()
    navigate('/')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-secondary/60 to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
            <MailCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold">أكّد بريدك الإلكتروني</h1>
          {mailConfigured === false ? (
            <p className="text-sm text-muted-foreground mt-1.5">
              سجّلنا بريدك
              <span className="font-bold text-foreground mx-1" dir="ltr">{user.email}</span>
              وأكّد حسابك يدويًا
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1.5">
              أرسلنا رمز تأكيد من 6 أرقام إلى
              <span className="font-bold text-foreground mx-1" dir="ltr">{user.email}</span>
            </p>
          )}
        </div>

        {mailConfigured === false && (
          <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-1.5">
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <MailWarning className="h-4 w-4" /> الإرسال البريدي غير مفعّل بعد
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              أرسل اسمك والبريد الذي سجّلت به إلى مالك المنصة
              <span className="font-bold text-foreground"> رائد الحربي </span>
              ليؤكد حسابك يدويًا من لوحة الإدارة، وستتمكن من الدخول فورًا.
            </p>
          </div>
        )}

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={verify} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium sr-only">رمز التأكيد</label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  dir="ltr"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="● ● ● ● ● ●"
                  className="text-center text-2xl font-extrabold tracking-[0.6em] h-14"
                />
              </div>

              <Button type="submit" className="w-full h-11 text-base" disabled={loading || code.replace(/\D/g, '').length !== 6}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                تأكيد البريد والبدء
              </Button>
            </form>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 mt-3"
              disabled={resending || cooldown > 0}
              onClick={resend}
            >
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {cooldown > 0 ? `إعادة إرسال الرمز بعد ${cooldown} ثانية` : 'لم يصلك الرمز؟ أعد الإرسال'}
            </Button>

            <div className="mt-4 rounded-xl border p-3.5 bg-muted/40 space-y-1.5">
              <p className="text-xs font-bold flex items-center gap-1.5">
                <LifeBuoy className="h-3.5 w-3.5 text-primary" /> لم يصلك الرمز؟
              </p>
              <ul className="text-[11.5px] text-muted-foreground leading-relaxed list-disc pr-4 space-y-0.5">
                <li>افحص مجلد البريد غير المرغوب (Spam/Junk)</li>
                <li>انتظر دقيقة ثم استخدم زر إعادة الإرسال أعلاه</li>
                <li>
                  إذا كنت مسجلًا ببريد خاطئ أو لم يصل الرمز إطلاقًا، تواصل مع مالك المنصة
                  <span className="font-bold text-foreground"> رائد الحربي </span>
                  ليؤكد حسابك يدويًا أو احذف الحساب وسجّل ببريدك الصحيح
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-3 text-xs text-muted-foreground hover:text-destructive font-medium mx-auto flex items-center gap-1 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> هذا ليس بريدي — تسجيل الخروج
            </button>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground mt-4">
          نطلب تأكيد البريد لحماية الحسابات من الوهمية ولضمان وصول الاستعلامات المهمة إليك
        </p>
      </div>
    </div>
  )
}
