'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSession, navigate, setToken } from '@/lib/client'
import { GraduationCap, Loader2, Mail, KeyRound, User, School, ShieldCheck, LifeBuoy, Crown, TerminalSquare } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const GRADES = ['السنة الأولى ثانوي', 'السنة الثانية ثانوي', 'السنة الثالثة ثانوي', 'خريج']
const COMPLEX = 'مجمع الأمير محمد بن فهد'
const SCHOOLS = [COMPLEX, 'مدرسة أو مجمع آخر']

export function AuthView({ mode, redirect }: { mode: 'login' | 'register'; redirect?: string }) {
  const { refresh } = useSession()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [grade, setGrade] = useState('')
  const [school, setSchool] = useState('')
  const [sectionNumber, setSectionNumber] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)

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
        if (school === COMPLEX && !/^\d{3}$/.test(sectionNumber)) {
          toast.error('اكتب رقم شعبتك بـ 3 أرقام — مثل 101 أو 204 أو 308')
          setLoading(false)
          return
        }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            password,
            grade,
            school: school || null,
            sectionNumber: school === COMPLEX ? sectionNumber : null,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'فشل إنشاء الحساب')
        if (data.token) setToken(data.token)
        toast.success(`مرحبًا بك في قدراتك، ${data.user.name}! 🎉`)
      }
      await refresh()
      // الطلاب غير الموثقين يُحوّلون لصفحة تأكيد البريد أولًا
      const me = useSession.getState().user
      const needsVerify = me?.role === 'STUDENT' && me?.emailVerified === false
      navigate(redirect || (needsVerify ? '/verify' : '/dashboard'))
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
          <h1 className="text-2xl font-extrabold">{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب طالب'}</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {mode === 'login'
              ? 'أهلًا بعودتك — تابع رحلتك نحو درجتك'
              : 'التسجيل متاح للطلاب فقط — انضم مجانًا وابدأ تدريبك فورًا'}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-4">
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
                  <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <School className="h-3 w-3" /> نساعدك بتخصيص التدريب حسب مرحلتك
                  </p>
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label>المجمع / المدرسة (اختياري)</Label>
                  <Select
                    value={school}
                    onValueChange={(v) => {
                      setSchool(v)
                      if (v !== COMPLEX) setSectionNumber('')
                    }}
                    dir="rtl"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مجمعك أو مدرستك" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOOLS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {mode === 'register' && school === COMPLEX && (
                <div className="space-y-2 rounded-xl border border-primary/25 bg-primary/5 p-3 animate-in fade-in slide-in-from-top-1">
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
                    اكتب رقم شعبتك بالمجمع — 3 أرقام مثل 101 أو 204 أو 308
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'login' ? 'دخول' : 'إنشاء حساب الطالب'}
              </Button>
            </form>

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
