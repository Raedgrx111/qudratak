'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { api, useSession, navigate } from '@/lib/client'
import { User, Mail, School, Target, ClipboardList, Heart, CalendarDays, Loader2, Save, ShieldCheck, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

export function ProfileView() {
  const { user, refresh } = useSession()
  const [name, setName] = useState(user?.name || '')
  const [grade, setGrade] = useState(user?.grade || '')
  const [school, setSchool] = useState(user?.school || '')
  const [sectionNumber, setSectionNumber] = useState(user?.sectionNumber || '')
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<{ totalAnswered: number; accuracy: number; favorites: number; examsTaken: number } | null>(null)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwBusy, setPwBusy] = useState(false)

  useEffect(() => {
    api<{ totals: { totalAnswered: number; accuracy: number; favorites: number; examsTaken: number } }>('/api/stats/dashboard')
      .then((d) => setStats(d.totals))
      .catch(() => null)
  }, [])

  if (!user) return null

  const save = async () => {
    setSaving(true)
    try {
      await api('/api/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          grade,
          school: school || null,
          sectionNumber: school === 'مجمع الأمير محمد بن فهد' ? sectionNumber : null,
        }),
      })
      await refresh()
      toast.success('حُفظت التغييرات بنجاح')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر التحديث')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (newPw.length < 8) {
      toast.error('كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل')
      return
    }
    if (newPw !== confirmPw) {
      toast.error('كلمتا المرور الجديدتان غير متطابقتين')
      return
    }
    setPwBusy(true)
    try {
      await api('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      toast.success('غُيّرت كلمة المرور بنجاح — استخدمها في دخولك القادم')
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر تغيير كلمة المرور')
    } finally {
      setPwBusy(false)
    }
  }

  const statsCards = stats
    ? [
        { icon: Target, label: 'أسئلة محلولة', value: String(stats.totalAnswered) },
        { icon: ShieldCheck, label: 'نسبة الدقة', value: `${stats.accuracy}%` },
        { icon: ClipboardList, label: 'اختبارات', value: String(stats.examsTaken) },
        { icon: Heart, label: 'مفضلة', value: String(stats.favorites) },
      ]
    : []

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 fade-up pb-20 md:pb-8">
      {/* Identity card */}
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-extrabold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-right flex-1">
              <h1 className="text-2xl font-extrabold">{user.name}</h1>
              <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-1" dir="ltr">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2.5">
                <Badge variant={user.role === 'STUDENT' ? 'secondary' : 'default'}>
                  {user.role === 'OWNER' ? '👑 مالك المنصة' : user.role === 'TEACHER' ? 'معلم' : 'طالب'}
                </Badge>
                {user.grade && (
                  <Badge variant="outline" className="gap-1">
                    <School className="h-3 w-3" /> {user.grade}
                  </Badge>
                )}
                {user.school && (
                  <Badge variant="outline" className="gap-1">
                    <School className="h-3 w-3" />
                    {user.school === 'مجمع الأمير محمد بن فهد' ? 'مجمع الأمير محمد بن فهد' : user.school}
                    {user.sectionNumber ? ` · شعبة ${user.sectionNumber}` : ''}
                  </Badge>
                )}
                {user.createdAt && (
                  <Badge variant="outline" className="gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(user.createdAt).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <s.icon className="h-5 w-5 mx-auto text-primary mb-2" />
              <p className="text-xl font-extrabold tabular-nums">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> البيانات الشخصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">الاسم</Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-grade">المرحلة الدراسية</Label>
            <Input id="profile-grade" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="مثال: السنة الثالثة ثانوي" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-school">المجمع / المدرسة</Label>
            <Input
              id="profile-school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="مثال: مجمع الأمير محمد بن فهد"
              list="schools-list"
            />
            <datalist id="schools-list">
              <option value="مجمع الأمير محمد بن فهد" />
            </datalist>
          </div>
          {school.trim() === 'مجمع الأمير محمد بن فهد' && (
            <div className="space-y-2 rounded-xl border border-primary/25 bg-primary/5 p-3">
              <Label htmlFor="profile-section">رقم الشعبة</Label>
              <Input
                id="profile-section"
                inputMode="numeric"
                value={sectionNumber}
                onChange={(e) => setSectionNumber(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="مثال: 101 أو 204 أو 308"
                className="text-center font-bold tracking-widest"
              />
              <p className="text-[11px] text-muted-foreground">3 أرقام مثل 101 أو 204 أو 308</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input value={user.email} disabled dir="ltr" className="text-left" />
            <p className="text-[11px] text-muted-foreground">البريد الإلكتروني لا يمكن تغييره.</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" /> حفظ التغييرات
          </Button>
        </CardContent>
      </Card>

      {/* Password change */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" /> تغيير كلمة المرور
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pw-current">الحالية</Label>
              <Input
                id="pw-current"
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw-new">الجديدة</Label>
              <Input
                id="pw-new"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="8 أحرف على الأقل"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw-confirm">تأكيد الجديدة</Label>
              <Input
                id="pw-confirm"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="أعد كتابتها"
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={changePassword}
              disabled={pwBusy || !currentPw || newPw.length < 8 || !confirmPw}
              className="gap-1.5"
            >
              {pwBusy && <Loader2 className="h-4 w-4 animate-spin" />}
              <KeyRound className="h-4 w-4" /> تحديث كلمة المرور
            </Button>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> تُخزّن كلمات المرور مشفّرة ولا يمكن لأحد قراءتها.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

void navigate
