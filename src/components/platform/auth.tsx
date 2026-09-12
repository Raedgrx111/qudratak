'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSession, navigate, setToken } from '@/lib/client'
import { GraduationCap, Loader2, Mail, KeyRound, User, ShieldCheck, LifeBuoy, Crown, TerminalSquare, Ticket, ArrowRight, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const GRADES = ['السنة الأولى ثانوي', 'السنة الثانية ثانوي', 'السنة الثالثة ثانوي', 'خريج']

export function AuthView({ mode, redirect }: { mode: 'login' | 'register'; redirect?: string }) {
  const { refresh } = useSession()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [grade, setGrade] = useState('')
  const [sectionNumber, setSectionNumber] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)

  // التسجيل بخطوتين: (1) رمز الدعوة (2) بيانات الطالب
  const [step, setStep] = useState<'code' | 'form'>(mode === 'register' ? 'code' : 'form')
  const [inviteCode, setInviteCode] = useState('')

  const emailsMismatch = mode === 'register' && step === 'form' && confirmEmail.length > 0 && email.length > 0 && confirmEmail.trim().toLowerCase() !== email.trim().toLowerCase()

  const checkInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) {
      toast.error('أدخل رمز الدعوة أولًا')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/invite-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'رمز الدعوة غير صحيح')
      toast.success('رمز الدعوة صحيح — أكمل بياناتك')
      setStep('form')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر التحقق من الرمز')
    } finally {
      setLoading(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول')
        if (data.token) setToken(data.token)
        toast.success(`أهلًا بك مجددًا، ${data.user.name}!`)
      } else {
        if (!/^\d{3}$/.test(sectionNumber)) {
          toast.error('اكتب رقم شعبتك بـ 3 أرقام — مثل 101 أو 204 أو 308')
          setLoading(false)
          return
        }
        if (emailsMismatch) {
          toast.error('البريد الإلكتروني غير متطابق')
          setLoading(false)
          return
        }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            confirmEmail: confirmEmail.trim(),
            password,
            grade,
            sectionNumber,
            inviteCode: inviteCode.trim(),
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'فشل إنشاء الحساب')
        if (data.token) setToken(data.token)
        toast.success(`مرحبًا بك في قدراتك، ${data.user.name}! 🎉`)
      }
      await refresh()
      // الطالب المسجل بدعوة يدخل المنصة مباشرة — لا يحتاج توثيق بريد
      navigate(redirect || '/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-secondary/60 to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold">{mode === 'login' ? 'تسجيل الدخول' : step === 'code' ? 'التسجيل برمز الدعوة' : 'بيانات الطالب'}</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {mode === 'login'
              ? 'أهلًا بعودتك — تابع رحلتك نحو درجتك'
              : step === 'code'
                ? 'التسجيل متاح بحسب دعوة من إدارة المنصة — أدخل الرمز الذي حصلت عليه'
                : 'أكمل بياناتك لتنشئ حسابك وتدخل المنصة فورًا'}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            {mode === 'register' && step === 'code' ? (
              /* ============ الخطوة 1: رمز الدعوة ============ */
              <form onSubmit={checkInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite" className="text-sm font-bold">
                    رمز الدعوة <span className="text-primary">*</span>
                  </Label>
                  <div className="relative">
                    <Ticket className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="invite"
                      dir="ltr"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="مثال: QDR-482913"
                      className="pr-9 text-left tracking-widest font-bold"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    احصل على رمز الدعوة من مالك المنصة (رائد الحربي) ثم أدخله هنا
                  </p>
                </div>
                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
                  تحقق من الرمز
                </Button>
                <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                  الرمز مخصص لطلاب المجمع — يُتحقق منه بجهة الخادم لحماية المنصة من الحسابات الوهمية
                </p>
              </form>
            ) : (
              /* ============ الخطوة 2: بيانات الطالب (أو تسجيل الدخول) ============ */
              <form onSubmit={submit} className="space-y-4">
                {mode === 'register' && (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 px-3 py-2">
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Ticket className="h-3.5 w-3.5" /> رمز الدعوة مقبول ✓
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep('code')}
                      className="text-[11px] font-bold text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      <ArrowRight className="h-3 w-3" /> تغيير الرمز
                    </button>
                  </div>
                )}

                {mode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: عبدالله المطيري"
                        className="pr-9"
                        required
                        minLength={2}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pr-9 text-left"
                      required
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmEmail">تأكيد البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmEmail"
                        type="email"
                        dir="ltr"
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        placeholder="أعد كتابة البريد نفسه"
                        className="pr-9 text-left"
                        required
                      />
                    </div>
                    {emailsMismatch && (
                      <p className="flex items-center gap-1 text-[11px] font-bold text-destructive animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-3.5 w-3.5" /> البريد الإلكتروني غير متطابق
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'register' ? '8 أحرف على الأقل' : '••••••••'}
                      className="pr-9"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                {mode === 'register' && (
                  <div className="space-y-2 rounded-xl border border-primary/25 bg-primary/5 p-3">
                    <Label htmlFor="section" className="text-sm font-bold">
                      رقم الشعبة <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="section"
                      inputMode="numeric"
                      value={sectionNumber}
                      onChange={(e) => setSectionNumber(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="مثال: 101 أو 204 أو 308"
                      className="text-center text-lg font-bold tracking-widest"
                      required
                    />
                    <p className="text-[11px] text-muted-foreground">
                      اكتب رقم شعبتك — 3 أرقام فقط مثل 101 أو 204 أو 308 (تُرفض الحروف والرموز)
                    </p>
                  </div>
                )}

                {mode === 'register' && (
                  <div className="space-y-2">
                    <Label>المرحلة الدراسية (اختياري)</Label>
                    <Select value={grade} onValueChange={setGrade} dir="rtl">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مرحلتك" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADES.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">نساعدك بتخصيص التدريب حسب مرحلتك</p>
                  </div>
                )}

                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === 'login' ? 'دخول' : 'إنشاء حساب الطالب'}
                </Button>
              </form>
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="mt-3 text-xs text-muted-foreground hover:text-primary font-medium mx-auto flex items-center gap-1 transition-colors"
              >
                <LifeBuoy className="h-3.5 w-3.5" /> نسيت كلمة المرور؟
              </button>
            )}

            {mode === 'register' && (
              <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground mt-3">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
                يُحفظ حسابك بأمان في قاعدة بيانات المنصة، وحسابات المعلمين يُنشئها مالك المنصة حصريًا.
              </p>
            )}

          </CardContent>
        </Card>

        <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LifeBuoy className="h-5 w-5 text-primary" /> استعادة كلمة المرور
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="rounded-xl border p-3.5 bg-muted/40 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" /> للطلاب
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  تواصل مع مالك المنصة (رائد الحربي) ليُعيد تعيين كلمة مرورك من لوحة
                  «تتبع الحسابات» — تُنشأ لك كلمة جديدة وتدخل بها فورًا.
                </p>
              </div>
              <div className="rounded-xl border p-3.5 bg-muted/40 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-amber-500" /> لمالك المنصة
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  إن نسيت كلمة مرورك، شغّل على الخادم سكربت الطوارئ:
                </p>
                <code className="block text-[11px] bg-background border rounded-lg px-3 py-2 font-mono text-left" dir="ltr">
                  bun run scripts/reset-password.ts your@email.com NewPass@123
                </code>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                <TerminalSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                لا يرسل النظام كلمات المرور بالبريد؛ تُخزّن مشفّرة (bcrypt) ولا يمكن استرجاعها — تُستبدل فقط.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <p className="text-center text-sm text-muted-foreground mt-5">
          {mode === 'login' ? (
            <>
              ليس لديك حساب؟{' '}
              <button onClick={() => navigate('/register')} className="text-primary font-bold hover:underline">
                أنشئ حساب طالب مجاني
              </button>
            </>
          ) : (
            <>
              لديك حساب بالفعل؟{' '}
              <button onClick={() => navigate('/login')} className="text-primary font-bold hover:underline">
                سجّل الدخول
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
