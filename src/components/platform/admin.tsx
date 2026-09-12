'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { api, CATEGORY_LABEL, DIFFICULTY_LABEL, DIFFICULTY_STYLE, TOPICS, timeAgo, navigate, useSession, ROLE_LABEL, ROLE_STYLE, EVENT_TYPE_LABEL, EVENT_TYPE_STYLE, formatDate } from '@/lib/client'
import { cn } from '@/lib/utils'
import { CLIP_CATEGORY_LABEL, detectClipProvider, youtubeThumbUrl, formatBytes, formatDuration } from '@/lib/clips'
import {
  Users,
  FileQuestion,
  ClipboardList,
  MessageSquare,
  Upload,
  Download,
  Search,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  TrendingUp,
  Pin,
  BarChart3,
  GraduationCap,
  Crown,
  CalendarDays,
  Activity,
  Ban,
  Eye,
  UserCog,
  ShieldCheck,
  KeyRound,
  MonitorPlay,
  BadgeCheck,
  MailX,
  HardDriveUpload,
  FileVideo,
  Ticket,
  Copy,
  Check,
  Lock,
  LockOpen,
} from 'lucide-react'
import { toast } from 'sonner'

// ================= لوحة الإدارة (المالك / المعلم) =================
export function AdminView({ tab }: { tab?: string }) {
  const { user } = useSession()
  const isOwner = user?.role === 'OWNER'
  const active = tab || 'overview'
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 fade-up pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          {isOwner ? (
            <h1 className="text-2xl font-extrabold flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-sm">
                <Crown className="h-5 w-5 text-amber-950" />
              </span>
              لوحة المالك
            </h1>
          ) : (
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" /> لوحة المعلم
            </h1>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {isOwner
              ? 'أنت صاحب المنصة — تحكم كامل في الحسابات والأسئلة والاختبارات والأحداث والإشراف على كل شيء.'
              : 'إدارة بنك الأسئلة والطلاب والاختبارات والإشراف على النقاشات.'}
          </p>
        </div>
      </div>

      <Tabs value={active} onValueChange={(v) => navigate(`/admin/${v}`)}>
        <TabsList className="w-full justify-start overflow-x-auto h-auto flex-wrap sm:flex-nowrap">
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="h-4 w-4" /> نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-1.5">
            <FileQuestion className="h-4 w-4" /> الأسئلة
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-1.5">
            <Upload className="h-4 w-4" /> استيراد ملفات
          </TabsTrigger>
          {isOwner ? (
            <TabsTrigger value="accounts" className="gap-1.5">
              <Activity className="h-4 w-4" /> تتبع الحسابات
            </TabsTrigger>
          ) : (
            <TabsTrigger value="students" className="gap-1.5">
              <Users className="h-4 w-4" /> الطلاب
            </TabsTrigger>
          )}
          <TabsTrigger value="exams" className="gap-1.5">
            <ClipboardList className="h-4 w-4" /> الاختبارات
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5">
            <CalendarDays className="h-4 w-4" /> الأحداث
          </TabsTrigger>
          <TabsTrigger value="clips" className="gap-1.5">
            <MonitorPlay className="h-4 w-4" /> المقاطع
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-1.5">
            <MessageSquare className="h-4 w-4" /> الإشراف
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <Overview isOwner={isOwner} />
        </TabsContent>
        <TabsContent value="questions" className="mt-5">
          <QuestionsManager />
        </TabsContent>
        <TabsContent value="import" className="mt-5">
          <ImportPanel />
        </TabsContent>
        {isOwner ? (
          <TabsContent value="accounts" className="mt-5">
            <AccountsTracking />
          </TabsContent>
        ) : (
          <TabsContent value="students" className="mt-5">
            <StudentsPanel />
          </TabsContent>
        )}
        <TabsContent value="exams" className="mt-5">
          <ExamsManager />
        </TabsContent>
        <TabsContent value="events" className="mt-5">
          <EventsManager />
        </TabsContent>
        <TabsContent value="clips" className="mt-5">
          <ClipsManager />
        </TabsContent>
        <TabsContent value="comments" className="mt-5">
          <CommentsModeration />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ================= نظرة عامة =================
type AdminStats = {
  totals: { students: number; questions: number; exams: number; attempts: number; comments: number }
  staff?: { teachers: number }
  activeWeek?: number
  eventsCount?: number
  answeredTotal?: number
  correctTotal?: number
  questionsByCategory: { category: string; total: number }[]
  questionsByDifficulty: { difficulty: string; total: number }[]
  topicStats: { topic: string; questions: number; attempts: number; avgAccuracy: number }[]
  recentImports: { id: string; fileName: string; totalCount: number; successCount: number; failedCount: number; createdAt: string }[]
  topStudents: { id: string; name: string; exams: number; avgScore: number }[]
}

function Overview({ isOwner }: { isOwner: boolean }) {
  const [data, setData] = useState<AdminStats | null>(null)
  useEffect(() => {
    api<AdminStats>('/api/stats/admin').then(setData).catch(() => setData(null))
  }, [])

  if (!data) return <Skeleton className="h-96 rounded-2xl" />

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: Users, label: 'طلاب مسجلون', value: data.totals.students },
          ...(isOwner
            ? [
                { icon: Activity, label: 'نشطوا هذا الأسبوع', value: data.activeWeek ?? 0 },
                { icon: CalendarDays, label: 'أحداث منشورة', value: data.eventsCount ?? 0 },
              ]
            : []),
          { icon: FileQuestion, label: 'أسئلة البنك', value: data.totals.questions },
          { icon: ClipboardList, label: 'اختبارات', value: data.totals.exams },
          { icon: TrendingUp, label: 'محاولات مكتملة', value: data.totals.attempts },
          { icon: MessageSquare, label: 'تعليقات', value: data.totals.comments },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <s.icon className="h-5 w-5 text-primary mb-2.5" />
              <p className="text-2xl font-extrabold tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isOwner && data.answeredTotal !== undefined && (
        <Card className="border-amber-200 dark:border-amber-900/50">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div className="flex items-center gap-2.5">
                <Crown className="h-5 w-5 text-amber-500" />
                <span className="font-bold text-sm">نبض المنصة:</span>
              </div>
              <div>
                <p className="text-xl font-extrabold tabular-nums">{data.answeredTotal.toLocaleString('ar-SA')}</p>
                <p className="text-[11px] text-muted-foreground">إجابة مسجلة إجمالًا</p>
              </div>
              <div>
                <p className="text-xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {data.answeredTotal > 0 ? Math.round(((data.correctTotal ?? 0) / data.answeredTotal) * 100) : 0}%
                </p>
                <p className="text-[11px] text-muted-foreground">متوسط دقة الطلاب</p>
              </div>
              <div>
                <p className="text-xl font-extrabold tabular-nums">{data.staff?.teachers ?? 0}</p>
                <p className="text-[11px] text-muted-foreground">معلم في الفريق</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">توزيع البنك حسب القسم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.questionsByCategory.map((c) => (
              <div key={c.category}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{CATEGORY_LABEL[c.category]}</span>
                  <span className="tabular-nums text-muted-foreground">{c.total} سؤال</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', c.category === 'QUANTITATIVE' ? 'bg-primary' : 'bg-amber-500')}
                    style={{ width: `${(c.total / data.totals.questions) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 flex flex-wrap gap-2">
              {data.questionsByDifficulty.map((d) => (
                <Badge key={d.difficulty} className={cn('border-0', DIFFICULTY_STYLE[d.difficulty])}>
                  {DIFFICULTY_LABEL[d.difficulty]}: {d.total}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">أبرز الطلاب (بمتوسط الدرجات)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {data.topStudents.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-extrabold">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{s.name}</span>
                  <span className="text-sm tabular-nums text-muted-foreground">{s.exams} اختبار</span>
                  <span className="text-sm font-extrabold tabular-nums text-primary w-12 text-left">{s.avgScore}%</span>
                </div>
              ))}
              {data.topStudents.length === 0 && <p className="text-sm text-muted-foreground">لا توجد بيانات كافية بعد.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">دقة الطلاب حسب الموضوع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {data.topicStats.map((t) => (
              <div key={t.topic} className="flex items-center gap-3">
                <span className="flex-1 text-sm truncate">{t.topic}</span>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">{t.attempts} إجابة</span>
                <div className="w-24 h-2 rounded-full bg-muted overflow-hidden shrink-0">
                  <div
                    className={cn('h-full', t.avgAccuracy >= 70 ? 'bg-primary' : t.avgAccuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500')}
                    style={{ width: `${t.avgAccuracy}%` }}
                  />
                </div>
                <span className="text-xs font-bold tabular-nums w-9 text-left">{t.avgAccuracy}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ================= إدارة الأسئلة =================
type QuestionRow = {
  id: string
  category: string
  topic: string
  difficulty: string
  text: string
  choices: { key: string; text: string }[]
  correctAnswer?: string
  explanation?: string
}

function QuestionsManager() {
  const [rows, setRows] = useState<QuestionRow[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [editing, setEditing] = useState<QuestionRow | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' })
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (difficulty) params.set('difficulty', difficulty)
      const data = await api<{ questions: QuestionRow[]; total: number }>(`/api/questions?${params}`)
      setRows(data.questions)
      setTotal(data.total)
    } catch {
      setRows([])
    }
  }, [page, search, category, difficulty])

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: '10' })
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (difficulty) params.set('difficulty', difficulty)
    api<{ questions: QuestionRow[]; total: number }>(`/api/questions?${params}`)
      .then((data) => {
        setRows(data.questions)
        setTotal(data.total)
      })
      .catch(() => setRows([]))
  }, [page, search, category, difficulty])

  const remove = async (q: QuestionRow) => {
    if (!confirm(`حذف السؤال: «${q.text.slice(0, 50)}…»؟`)) return
    try {
      await api(`/api/questions/${q.id}`, { method: 'DELETE' })
      toast.success('حُذف السؤال')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر الحذف')
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / 10))

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearch(searchInput)
                  setPage(1)
                }
              }}
              placeholder="ابحث في نص السؤال أو الشرح أو الموضوع... (Enter للبحث)"
              className="pr-9"
            />
          </div>
          <Select dir="rtl" value={category || 'ALL'} onValueChange={(v) => { setCategory(v === 'ALL' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="القسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">كل الأقسام</SelectItem>
              <SelectItem value="QUANTITATIVE">كمي</SelectItem>
              <SelectItem value="VERBAL">لفظي</SelectItem>
            </SelectContent>
          </Select>
          <Select dir="rtl" value={difficulty || 'ALL'} onValueChange={(v) => { setDifficulty(v === 'ALL' ? '' : v); setPage(1) }}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="الصعوبة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">كل المستويات</SelectItem>
              <SelectItem value="EASY">سهل</SelectItem>
              <SelectItem value="MEDIUM">متوسط</SelectItem>
              <SelectItem value="HARD">صعب</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-1.5" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> سؤال جديد
          </Button>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        <span className="font-bold text-foreground tabular-nums">{total}</span> سؤال — صفحة {page} من {totalPages}
      </p>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {rows === null ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-64">السؤال</TableHead>
                    <TableHead>القسم</TableHead>
                    <TableHead>الموضوع</TableHead>
                    <TableHead>الصعوبة</TableHead>
                    <TableHead className="w-20">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="max-w-72">
                        <p className="truncate text-sm font-medium">{q.text.replace(/\n/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground truncate">الصحيح: ({q.correctAnswer}) {q.choices.find((c) => c.key === q.correctAnswer)?.text}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{CATEGORY_LABEL[q.category]}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{q.topic}</TableCell>
                      <TableCell>
                        <Badge className={cn('border-0', DIFFICULTY_STYLE[q.difficulty])}>{DIFFICULTY_LABEL[q.difficulty]}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(q)} aria-label="تعديل">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => remove(q)} aria-label="حذف">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                        لا توجد أسئلة مطابقة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            السابق
          </Button>
          <span className="text-sm tabular-nums px-3">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            التالي
          </Button>
        </div>
      )}

      {/* Edit/Create dialogs */}
      <QuestionFormDialog
        open={creating || !!editing}
        question={editing}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSaved={() => {
          setCreating(false)
          setEditing(null)
          load()
        }}
      />
    </div>
  )
}

function QuestionFormDialog({
  open,
  question,
  onClose,
  onSaved,
}: {
  open: boolean
  question: QuestionRow | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!question
  const [category, setCategory] = useState(question?.category || '')
  const [topic, setTopic] = useState(question?.topic || '')
  const [difficulty, setDifficulty] = useState(question?.difficulty || '')
  const [text, setText] = useState(question?.text || '')
  const [choices, setChoices] = useState(
    question?.choices || [
      { key: 'أ', text: '' },
      { key: 'ب', text: '' },
      { key: 'ج', text: '' },
      { key: 'د', text: '' },
    ]
  )
  const [correct, setCorrect] = useState(question?.correctAnswer || '')
  const [explanation, setExplanation] = useState(question?.explanation || '')
  const [saving, setSaving] = useState(false)

  // إعادة تهيئة عند تغيير السؤال
  useEffect(() => {
    if (open) {
      setCategory(question?.category || '')
      setTopic(question?.topic || '')
      setDifficulty(question?.difficulty || '')
      setText(question?.text || '')
      setChoices(
        question?.choices || [
          { key: 'أ', text: '' },
          { key: 'ب', text: '' },
          { key: 'ج', text: '' },
          { key: 'د', text: '' },
        ]
      )
      setCorrect(question?.correctAnswer || '')
      setExplanation(question?.explanation || '')
    }

  }, [open, question])

  const save = async () => {
    setSaving(true)
    try {
      const payload = { category, topic, difficulty, text, choices, correctAnswer: correct, explanation }
      if (isEdit) await api(`/api/questions/${question!.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      else await api('/api/questions', { method: 'POST', body: JSON.stringify(payload) })
      toast.success(isEdit ? 'حُدّث السؤال' : 'أُضيف السؤال للبنك')
      onSaved()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const valid = category && topic && difficulty && text.length >= 5 && choices.every((c) => c.text.trim()) && correct && explanation

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>القسم</Label>
              <Select dir="rtl" value={category} onValueChange={(v) => { setCategory(v); setTopic('') }}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUANTITATIVE">كمي</SelectItem>
                  <SelectItem value="VERBAL">لفظي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الموضوع</Label>
              <Select dir="rtl" value={topic} onValueChange={setTopic} disabled={!category}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  {(category ? TOPICS[category] : []).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الصعوبة</Label>
              <Select dir="rtl" value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">سهل</SelectItem>
                  <SelectItem value="MEDIUM">متوسط</SelectItem>
                  <SelectItem value="HARD">صعب</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>نص السؤال</Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="اكتب نص السؤال..." />
          </div>

          <div className="space-y-2.5">
            <Label>الخيارات (حدد زر الراديو للإجابة الصحيحة)</Label>
            {choices.map((c, i) => (
              <div key={c.key} className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCorrect(c.key)}
                  aria-label={`الإجابة الصحيحة ${c.key}`}
                  className={cn(
                    'w-9 h-9 rounded-lg border-2 font-extrabold text-sm shrink-0 transition-colors',
                    correct === c.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:border-primary/50'
                  )}
                >
                  {c.key}
                </button>
                <Input
                  value={c.text}
                  onChange={(e) => setChoices(choices.map((cc, j) => (j === i ? { ...cc, text: e.target.value } : cc)))}
                  placeholder={`نص الخيار ${c.key}`}
                />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>شرح الحل</Label>
            <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={3} placeholder="اشرح خطوات الحل..." />
          </div>

          <div className="flex gap-2.5 justify-end">
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button onClick={save} disabled={!valid || saving} className="gap-1.5">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'حفظ التعديل' : 'إضافة السؤال'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ================= استيراد الملفات =================
function ImportPanel() {
  const [uploading, setUploading] = useState(false)
  const [logs, setLogs] = useState<AdminStats['recentImports']>([])
  const [result, setResult] = useState<{ successCount: number; failedCount: number; totalCount: number; errors: string[] } | null>(null)

  const loadLogs = () => {
    api<{ logs: AdminStats['recentImports'] }>('/api/questions/import').then((d) => setLogs(d.logs)).catch(() => null)
  }
  useEffect(loadLogs, [])

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/questions/import', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل الاستيراد')
      setResult({ ...data.log, errors: data.errors })
      toast.success(`تم استيراد ${data.log.successCount} سؤال بنجاح${data.log.failedCount ? ` — وفشل ${data.log.failedCount}` : ''}`)
      loadLogs()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'فشل الاستيراد')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" /> استيراد أسئلة من Excel / CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            ارفع ملف Excel أو CSV يحتوي أعمدة: <b>القسم</b> (كمي/لفظي)، <b>الموضوع</b>، <b>الصعوبة</b> (سهل/متوسط/صعب)،
            <b> السؤال</b>، <b>الخيار أ/ب/ج/د</b>، <b>الإجابة</b> (أ/ب/ج/د)، <b>الشرح</b>. سيتم التحقق من كل صف وإدراج الأسئلة
            الصالحة تلقائيًا — مهما كان عددُها.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/api/questions/template" download>
              <Button variant="outline" className="gap-1.5">
                <Download className="h-4 w-4" /> تنزيل قالب جاهز
              </Button>
            </a>
            <label>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={upload} disabled={uploading} className="hidden" id="import-file" />
              <Button asChild disabled={uploading}>
                <label htmlFor="import-file" className="gap-1.5 cursor-pointer">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? 'جارٍ الاستيراد...' : 'اختر ملفًا واستورد'}
                </label>
              </Button>
            </label>
          </div>

          {result && (
            <div className="rounded-xl border p-4 space-y-2">
              <p className="font-bold text-sm">
                نتائج آخر استيراد: <span className="text-emerald-600">{result.successCount} ناجح</span>
                {result.failedCount > 0 && <span className="text-rose-600"> — {result.failedCount} فاشل</span>}
                <span className="text-muted-foreground"> من {result.totalCount} صف</span>
              </p>
              {result.errors?.length > 0 && (
                <div className="text-xs text-rose-700 dark:text-rose-400 space-y-1 max-h-40 overflow-y-auto rounded bg-rose-50 dark:bg-rose-950/30 p-3">
                  {result.errors.map((er, i) => (
                    <p key={i}>• {er}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">سجل عمليات الاستيراد</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد عمليات استيراد سابقة.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((l) => (
                <div key={l.id} className="flex items-center justify-between text-sm rounded-xl border p-3">
                  <span className="font-medium truncate">{l.fileName}</span>
                  <span className="text-muted-foreground tabular-nums text-xs">
                    {l.successCount}/{l.totalCount} ناجح {l.failedCount > 0 && `— ${l.failedCount} فاشل`} · {timeAgo(l.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ================= الطلاب =================
type StudentRow = {
  id: string
  name: string
  email: string
  grade: string | null
  school: string | null
  sectionNumber: string | null
  createdAt: string
  answeredCount: number
  examsCount: number
  commentsCount: number
  avgScore: number | null
}

function StudentsPanel() {
  const [rows, setRows] = useState<StudentRow[] | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api<{ students: StudentRow[] }>(`/api/admin/students${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      .then((d) => setRows(d.students))
      .catch(() => setRows([]))
  }, [search])

  return (
    <Card>
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-base">الطلاب المسجلون</CardTitle>
        <div className="relative w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو البريد..." className="pr-9" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {rows === null ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الطالب</TableHead>
                  <TableHead>المرحلة</TableHead>
                  <TableHead>المجمع / الشعبة</TableHead>
                  <TableHead>أسئلة محلولة</TableHead>
                  <TableHead>اختبارات</TableHead>
                  <TableHead>متوسط الدرجات</TableHead>
                  <TableHead>تعليقات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        {s.email}
                      </p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.grade || '—'}</TableCell>
                    <TableCell className="text-xs">
                      {s.school ? (
                        <span className="font-medium">
                          {s.school === 'مجمع الأمير محمد بن فهد' ? 'المجمع' : s.school}
                          {s.sectionNumber && <span className="text-primary font-bold"> · شعبة {s.sectionNumber}</span>}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums font-medium">{s.answeredCount}</TableCell>
                    <TableCell className="tabular-nums font-medium">{s.examsCount}</TableCell>
                    <TableCell className="tabular-nums font-bold">{s.avgScore !== null ? `${s.avgScore}%` : '—'}</TableCell>
                    <TableCell className="tabular-nums">{s.commentsCount}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      لا يوجد طلاب مطابقون
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ================= إدارة الاختبارات =================
type ExamRow = {
  id: string
  title: string
  description: string | null
  type: string
  category: string | null
  durationMinutes: number
  questionCount: number
  attemptsCount: number
}

function ExamsManager() {
  const [rows, setRows] = useState<ExamRow[] | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(() => {
    api<{ exams: ExamRow[] }>('/api/exams')
      .then((d) => setRows(d.exams))
      .catch(() => setRows([]))
  }, [])
  useEffect(() => load(), [load])

  const remove = async (e: ExamRow) => {
    if (!confirm(`حذف الاختبار «${e.title}» وكل محاولاته؟`)) return
    try {
      await api(`/api/exams/${e.id}`, { method: 'DELETE' })
      toast.success('حُذف الاختبار')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر الحذف')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="gap-1.5" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> إنشاء اختبار
        </Button>
      </div>

      {rows === null ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rows.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-extrabold truncate">{e.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{e.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <Badge variant="secondary">{e.questionCount} سؤالًا</Badge>
                      <Badge variant="outline">{e.durationMinutes} دقيقة</Badge>
                      <Badge variant="outline">{e.attemptsCount} محاولة</Badge>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => remove(e)} aria-label="حذف">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateExamDialog open={creating} onClose={() => setCreating(false)} onCreated={() => { setCreating(false); load() }} />
    </div>
  )
}

function CreateExamDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [count, setCount] = useState(20)
  const [duration, setDuration] = useState(40)
  const [category, setCategory] = useState('')
  const [topic, setTopic] = useState('')
  const [busy, setBusy] = useState(false)

  const create = async () => {
    setBusy(true)
    try {
      await api<{ exam: { id: string } }>('/api/exams', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          mode: 'auto',
          count,
          durationMinutes: duration,
          category: category || undefined,
          topics: topic ? [topic] : [],
        }),
      })
      toast.success(`أُنشئ الاختبار «${title}» وظهر للطلاب`)
      onCreated()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر الإنشاء')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>إنشاء اختبار جديد (توليد تلقائي)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>عنوان الاختبار</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: اختبار تجريبي — النسبة المئوية" />
          </div>
          <div className="space-y-1.5">
            <Label>الوصف (اختياري)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>عدد الأسئلة</Label>
              <Input type="number" min={3} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>المدة (دقيقة)</Label>
              <Input type="number" min={5} max={240} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>القسم</Label>
              <Select dir="rtl" value={category || 'ALL'} onValueChange={(v) => { setCategory(v === 'ALL' ? '' : v); setTopic('') }}>
                <SelectTrigger>
                  <SelectValue placeholder="مختلط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">كمي + لفظي</SelectItem>
                  <SelectItem value="QUANTITATIVE">كمي فقط</SelectItem>
                  <SelectItem value="VERBAL">لفظي فقط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الموضوع (اختياري)</Label>
              <Select dir="rtl" value={topic || 'ALL'} onValueChange={(v) => setTopic(v === 'ALL' ? '' : v)} disabled={!category}>
                <SelectTrigger>
                  <SelectValue placeholder={category ? 'كل المواضيع' : 'اختر قسمًا أولًا'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">كل المواضيع</SelectItem>
                  {(category ? TOPICS[category] : []).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2.5 justify-end">
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button onClick={create} disabled={busy || title.length < 3} className="gap-1.5">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              إنشاء ونشر
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ================= إشراف التعليقات =================
type ModComment = {
  id: string
  text: string
  isPinned: boolean
  createdAt: string
  user: { id: string; name: string; role: string }
  question: { id: string; text: string; topic: string }
  likeCount: number
}

function CommentsModeration() {
  const [rows, setRows] = useState<ModComment[] | null>(null)
  const [page, setPage] = useState(1)

  const load = useCallback(() => {
    api<{ comments: ModComment[]; totalPages: number }>(`/api/admin/comments?page=${page}`)
      .then((d) => setRows(d.comments))
      .catch(() => setRows([]))
  }, [page])
  useEffect(() => load(), [load])

  const pin = async (c: ModComment) => {
    await api(`/api/comments/${c.id}`, { method: 'PATCH', body: JSON.stringify({ isPinned: !c.isPinned }) })
    toast.success(c.isPinned ? 'أُلغي التثبيت' : 'ثُبّت التعليق')
    load()
  }

  const del = async (c: ModComment) => {
    if (!confirm('حذف هذا التعليق نهائيًا؟')) return
    await api(`/api/comments/${c.id}`, { method: 'DELETE' })
    toast.success('حُذف التعليق')
    load()
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">أحدث التعليقات — إشراف المعلم</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows === null ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">لا توجد تعليقات بعد.</p>
        ) : (
          rows.map((c) => (
            <div key={c.id} className="rounded-xl border p-4 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={c.user.role === 'STUDENT' ? 'secondary' : 'default'}>
                  {c.user.role === 'OWNER' ? '👑 ' : ''}{c.user.name}
                </Badge>
                <span className="text-[11px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                {c.isPinned && (
                  <Badge variant="outline" className="text-primary border-primary/40">
                    <Pin className="h-3 w-3 ml-1" /> مثبّت
                  </Badge>
                )}
                <span className="flex-1" />
                <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => pin(c)}>
                  <Pin className="h-3 w-3" /> {c.isPinned ? 'إلغاء' : 'تثبيت'}
                </Button>
                <Button size="sm" variant="outline" className="h-7 gap-1 text-destructive" onClick={() => del(c)}>
                  <Trash2 className="h-3 w-3" /> حذف
                </Button>
              </div>
              <p className="text-sm leading-relaxed">{c.text}</p>
              <button
                className="text-xs text-muted-foreground hover:text-primary truncate block w-full text-right"
                onClick={() => navigate(`/q/${c.question.id}`)}
              >
                على سؤال: {c.question.text.replace(/\n/g, ' ').slice(0, 80)}…
              </button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

// ================= تتبع الحسابات (المالك) =================
type AccountRow = {
  id: string
  name: string
  email: string
  role: string
  grade: string | null
  school: string | null
  sectionNumber: string | null
  isBanned: boolean
  emailVerified: boolean
  lastActiveAt: string
  createdAt: string
  activeThisWeek: boolean
  answeredCount: number
  correctCount: number
  accuracy: number | null
  examsCount: number
  completedExams: number
  avgScore: number | null
  commentsCount: number
  favoritesCount: number
}

// ---------- بطاقة بوابة التسجيل: رمز الدعوة + فتح/إغلاق التسجيل (المالك فقط) ----------
function RegistrationGateCard() {
  const [state, setState] = useState<{ inviteCode: string; registrationOpen: boolean } | null>(null)
  const [newCode, setNewCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const load = useCallback(() => {
    api<{ inviteCode: string; registrationOpen: boolean }>('/api/admin/settings')
      .then((d) => {
        setState(d)
        setNewCode('')
      })
      .catch(() => setState(null))
  }, [])
  useEffect(() => {
    load()
  }, [load])

  const patch = async (data: Record<string, unknown>, msg: string) => {
    setBusy(true)
    try {
      const d = await api<{ inviteCode: string; registrationOpen: boolean }>('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      setState(d)
      setNewCode('')
      toast.success(msg)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر التنفيذ')
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    if (!state) return
    try {
      await navigator.clipboard.writeText(state.inviteCode)
      setCopied(true)
      toast.success('نُسخ رمز الدعوة — شاركه مع طلابك')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('تعذر النسخ — انسخه يدويًا')
    }
  }

  if (!state) return null

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Ticket className="h-4 w-4 text-primary" /> بوابة التسجيل ورمز الدعوة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full',
              state.registrationOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            )}
          >
            {state.registrationOpen ? <LockOpen className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {state.registrationOpen ? 'التسجيل الجديد مفتوح' : 'التسجيل الجديد مغلق'}
          </span>
          <Switch
            checked={state.registrationOpen}
            disabled={busy}
            onCheckedChange={(v) =>
              patch(
                { registrationOpen: v },
                v ? 'فُتح التسجيل للطلاب الجدد' : 'أُغلق التسجيل — لن يستطيع أحد التسجيل حتى تعيد فتحه'
              )
            }
            aria-label="فتح أو إغلاق التسجيل الجديد"
          />
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">رمز الدعوة الحالي (يطلبه الطالب في أول خطوة)</Label>
            <div className="flex items-center gap-2">
              <code
                className="text-lg font-extrabold tracking-widest bg-background border rounded-lg px-3 py-1.5"
                dir="ltr"
              >
                {state.inviteCode}
              </code>
              <Button size="icon" variant="ghost" className="h-9 w-9" onClick={copy} aria-label="نسخ الرمز" title="نسخ الرمز">
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex items-end gap-2 grow min-w-56">
            <div className="space-y-1 grow">
              <Label htmlFor="new-invite" className="text-xs text-muted-foreground">
                تغيير الرمز
              </Label>
              <Input
                id="new-invite"
                dir="ltr"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="رمز جديد مثل: QDR-774210"
                className="text-left tracking-wider"
                autoComplete="off"
              />
            </div>
            <Button
              variant="outline"
              disabled={busy || !/^[\w-]{4,24}$/.test(newCode.trim())}
              onClick={() => patch({ inviteCode: newCode.trim() }, 'تغيّر رمز الدعوة — الرمز القديم لن يعمل بعد الآن')}
            >
              حفظ الرمز
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
          الرمز يُتحقق بجهة الخادم فقط ولا يُخزَّن في الواجهة — شاركه مع طلاب شعبتك فقط، وغيّره متى شئت
        </p>
      </CardContent>
    </Card>
  )
}

function AccountsTracking() {
  const [rows, setRows] = useState<AccountRow[] | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [pwTarget, setPwTarget] = useState<AccountRow | null>(null)

  const load = useCallback(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (roleFilter !== 'ALL') params.set('role', roleFilter)
    api<{ users: AccountRow[] }>(`/api/admin/users?${params}`)
      .then((d) => setRows(d.users))
      .catch(() => setRows([]))
  }, [search, roleFilter])
  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  const patch = async (u: AccountRow, data: Record<string, unknown>, msg: string) => {
    try {
      await api(`/api/admin/users/${u.id}`, { method: 'PATCH', body: JSON.stringify(data) })
      toast.success(msg)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر التنفيذ')
    }
  }

  const del = async (u: AccountRow) => {
    if (!confirm(`حذف حساب «${u.name}» نهائيًا مع كل بياناته؟ لا يمكن التراجع.`)) return
    try {
      await api(`/api/admin/users/${u.id}`, { method: 'DELETE' })
      toast.success('حُذف الحساب نهائيًا')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر الحذف')
    }
  }

  return (
    <div className="space-y-4">
      <RegistrationGateCard />
      <Card>
        <CardHeader className="pb-2 flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> تتبع جميع الحسابات
            <span className="text-xs font-normal text-muted-foreground">
              ({rows?.length ?? '…'} حساب)
            </span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select dir="rtl" value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">كل الأدوار</SelectItem>
                <SelectItem value="STUDENT">طلاب</SelectItem>
                <SelectItem value="TEACHER">معلمون</SelectItem>
                <SelectItem value="OWNER">المالك</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-56">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم أو البريد..." className="pr-9 h-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rows === null ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الحساب</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>حلّها صحيحًا</TableHead>
                    <TableHead>الدقة</TableHead>
                    <TableHead>متوسط الاختبارات</TableHead>
                    <TableHead>آخر نشاط</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((u) => (
                    <TableRow key={u.id} className={u.isBanned ? 'bg-rose-50/50 dark:bg-rose-950/20' : undefined}>
                      <TableCell>
                        <p className="font-medium text-sm flex items-center gap-1.5">
                          {u.name}
                          {u.isBanned && (
                            <Badge className="bg-rose-100 text-rose-800 border-0 text-[9px] h-4">محظور</Badge>
                          )}
                          {u.role === 'STUDENT' && (
                            u.emailVerified ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[9px] h-4 gap-0.5">
                                <BadgeCheck className="h-2.5 w-2.5" /> موثّق
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border-0 text-[9px] h-4 gap-0.5">
                                <MailX className="h-2.5 w-2.5" /> غير موثّق
                              </Badge>
                            )
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground" dir="ltr">{u.email}</p>
                        {(u.school || u.sectionNumber) && (
                          <p className="text-[10px] text-muted-foreground">
                            {u.school}
                            {u.sectionNumber && (
                              <span className="font-bold text-primary"> · شعبة {u.sectionNumber}</span>
                            )}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('border-0 text-[10px]', ROLE_STYLE[u.role] || ROLE_STYLE.STUDENT)}>
                          {u.role === 'OWNER' && '👑 '}
                          {ROLE_LABEL[u.role] || u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums font-extrabold text-primary">{u.correctCount}</TableCell>
                      <TableCell className="tabular-nums font-medium">
                        {u.accuracy !== null ? `${u.accuracy}%` : '—'}
                        <span className="text-[10px] text-muted-foreground block">{u.answeredCount} إجابة</span>
                      </TableCell>
                      <TableCell className="tabular-nums font-bold">
                        {u.avgScore !== null ? `${u.avgScore}%` : '—'}
                        <span className="text-[10px] text-muted-foreground block">{u.completedExams} مكتملة</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className={cn('inline-flex items-center gap-1', u.activeThisWeek && 'font-bold text-emerald-600 dark:text-emerald-400')}>
                          <span className={cn('w-1.5 h-1.5 rounded-full inline-block', u.activeThisWeek ? 'bg-emerald-500' : 'bg-muted-foreground/40')} />
                          {timeAgo(u.lastActiveAt)}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">تسجيل {formatDate(u.createdAt)}</span>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center gap-1 justify-end">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDetailId(u.id)} aria-label="تفاصيل التتبع" title="تفاصيل التتبع">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {u.role === 'STUDENT' && !u.emailVerified && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-emerald-600"
                              title="توثيق البريد يدويًا (بعد التأكد من صاحب الحساب)"
                              aria-label="توثيق البريد يدويًا"
                              onClick={() => patch(u, { emailVerified: true }, `تم توثيق بريد «${u.name}» — صارت المنصة متاحة له`)}
                            >
                              <BadgeCheck className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title="تعيين كلمة مرور جديدة"
                            aria-label="تعيين كلمة مرور"
                            onClick={() => setPwTarget(u)}
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          {u.role !== 'OWNER' && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                title="تغيير الدور (طالب ↔ معلم)"
                                aria-label="تغيير الدور"
                                onClick={() =>
                                  patch(
                                    u,
                                    { role: u.role === 'TEACHER' ? 'STUDENT' : 'TEACHER' },
                                    u.role === 'TEACHER' ? `أُعيد «${u.name}» إلى طالب` : `رُقّي «${u.name}» إلى معلم`
                                  )
                                }
                              >
                                <UserCog className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className={cn('h-8 w-8', u.isBanned && 'text-emerald-600')}
                                title={u.isBanned ? 'رفع الحظر' : 'حظر/تعليق الحساب'}
                                aria-label={u.isBanned ? 'رفع الحظر' : 'حظر الحساب'}
                                onClick={() =>
                                  patch(
                                    u,
                                    { isBanned: !u.isBanned },
                                    u.isBanned ? `رُفع الحظر عن «${u.name}»` : `عُلّق حساب «${u.name}»`
                                  )
                                }
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => del(u)} title="حذف نهائي" aria-label="حذف الحساب">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                        لا توجد حسابات مطابقة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {detailId && <AccountDetailDialog id={detailId} onClose={() => setDetailId(null)} />}
      {pwTarget && <PasswordDialog target={pwTarget} onClose={() => setPwTarget(null)} />}
    </div>
  )
}

// ---------- نافذة تعيين كلمة مرور جديدة (المالك) ----------
function PasswordDialog({ target, onClose }: { target: AccountRow; onClose: () => void }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const isSelf = target.role === 'OWNER'

  const submit = async () => {
    if (value.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }
    setBusy(true)
    try {
      await api(`/api/admin/users/${target.id}`, { method: 'PATCH', body: JSON.stringify({ newPassword: value }) })
      toast.success(`عُيّنت كلمة مرور جديدة لـ «${target.name}»`)
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر التعيين')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" /> تعيين كلمة مرور جديدة
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/40 p-3 text-sm">
            <p className="font-bold">{isSelf ? '👑 ' : ''}{target.name}</p>
            <p className="text-xs text-muted-foreground" dir="ltr">{target.email}</p>
            {isSelf && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
                هذا حسابك الشخصي — ستُستخدم الكلمة الجديدة في دخولك القادم.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password-input">كلمة المرور الجديدة</Label>
            <Input
              id="new-password-input"
              type="text"
              dir="ltr"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="8 أحرف على الأقل"
              className="text-left"
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground">
              سيُطلب من المستخدم الدخول بهذه الكلمة مباشرة — لا حاجة لكلمة المرور القديمة.
            </p>
          </div>
          <div className="flex gap-2 justify-start">
            <Button onClick={submit} disabled={busy || value.length < 8} className="gap-1.5">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              <KeyRound className="h-4 w-4" /> تعيين الكلمة
            </Button>
            <Button variant="outline" onClick={onClose}>إلغاء</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---------- ملف تتبع تفصيلي لحساب ----------
type AccountDetail = {
  user: {
    id: string; name: string; email: string; role: string; grade: string | null
    isBanned: boolean; lastActiveAt: string; createdAt: string
    _count: { answers: number; attempts: number; comments: number; favorites: number }
    commentsCount: number
  }
  stats: { answered: number; correct: number; accuracy: number | null }
  topics: { topic: string; category: string; total: number; accuracy: number }[]
  attempts: { id: string; examTitle: string; examType: string; score: number | null; status: string; startedAt: string; completedAt: string | null }[]
  recentAnswers: { id: string; isCorrect: boolean; mode: string; createdAt: string; questionText: string; topic: string }[]
}

function AccountDetailDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const [d, setD] = useState<AccountDetail | null>(null)

  useEffect(() => {
    api<AccountDetail>(`/api/admin/users/${id}`).then(setD).catch(() => setD(null))
  }, [id])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" /> ملف التتبع التفصيلي
          </DialogTitle>
        </DialogHeader>
        {!d ? (
          <Skeleton className="h-72 rounded-xl" />
        ) : (
          <div className="space-y-5">
            {/* بطاقة الحساب */}
            <div className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-extrabold flex items-center gap-2">
                    {d.user.name}
                    <Badge className={cn('border-0 text-[10px]', ROLE_STYLE[d.user.role] || ROLE_STYLE.STUDENT)}>
                      {ROLE_LABEL[d.user.role] || d.user.role}
                    </Badge>
                    {d.user.isBanned && <Badge className="bg-rose-100 text-rose-800 border-0 text-[10px]">محظور</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">{d.user.email}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {d.user.grade ? `${d.user.grade} · ` : ''}انضم {timeAgo(d.user.createdAt)} · آخر نشاط {timeAgo(d.user.lastActiveAt)}
                  </p>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-xl font-extrabold tabular-nums text-primary">{d.stats.correct}</p>
                    <p className="text-[10px] text-muted-foreground">صحيحة</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold tabular-nums">{d.stats.answered}</p>
                    <p className="text-[10px] text-muted-foreground">إجابة</p>
                  </div>
                  <div>
                    <p className={cn('text-xl font-extrabold tabular-nums', (d.stats.accuracy ?? 0) >= 70 ? 'text-emerald-600' : 'text-amber-600')}>
                      {d.stats.accuracy !== null ? `${d.stats.accuracy}%` : '—'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">الدقة</p>
                  </div>
                  <div>
                    <p className="text-xl font-extrabold tabular-nums">{d.user._count.favorites}</p>
                    <p className="text-[10px] text-muted-foreground">مفضلة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* دقة المواضيع */}
            <div>
              <h4 className="font-bold text-sm mb-2.5">الأداء حسب الموضوع</h4>
              {d.topics.length === 0 ? (
                <p className="text-xs text-muted-foreground">لم يحل أي سؤال بعد.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-x-5 gap-y-3">
                  {d.topics.slice(0, 8).map((t) => (
                    <div key={t.topic}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-medium truncate">{t.topic}</span>
                        <span className="tabular-nums text-muted-foreground shrink-0">{t.accuracy}% ({t.total})</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', t.accuracy >= 70 ? 'bg-emerald-500' : t.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500')}
                          style={{ width: `${t.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* آخر الاختبارات */}
            <div>
              <h4 className="font-bold text-sm mb-2.5">آخر محاولات الاختبارات</h4>
              {d.attempts.length === 0 ? (
                <p className="text-xs text-muted-foreground">لم يخُض أي اختبار بعد.</p>
              ) : (
                <div className="space-y-2">
                  {d.attempts.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2 text-xs rounded-lg border p-2.5">
                      <span className="font-medium truncate">{a.examTitle}</span>
                      <span className="flex items-center gap-2 shrink-0">
                        {a.status === 'COMPLETED' ? (
                          <span className={cn('font-extrabold tabular-nums', a.score !== null && (a.score >= 70 ? 'text-emerald-600' : 'text-amber-600'))}>
                            {Math.round(a.score ?? 0)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">قيد الحل</span>
                        )}
                        <span className="text-muted-foreground">{timeAgo(a.startedAt)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* آخر الإجابات */}
            <div>
              <h4 className="font-bold text-sm mb-2.5">آخر الإجابات المسجلة</h4>
              {d.recentAnswers.length === 0 ? (
                <p className="text-xs text-muted-foreground">لا توجد إجابات بعد.</p>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {d.recentAnswers.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 text-[11px] rounded-lg border p-2">
                      <span className={cn('w-2 h-2 rounded-full shrink-0', r.isCorrect ? 'bg-emerald-500' : 'bg-rose-500')} />
                      <span className="truncate flex-1">{r.questionText.replace(/\n/g, ' ').slice(0, 70)}</span>
                      <Badge variant="outline" className="text-[9px] h-4 shrink-0">{r.topic}</Badge>
                      <span className="text-muted-foreground shrink-0">{timeAgo(r.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ================= إدارة الأحداث (المالك والمعلم) =================
type EventRow = {
  id: string
  title: string
  body: string
  type: string
  startsAt: string | null
  isActive: boolean
  createdAt: string
  creator?: { name: string } | null
}

function EventsManager() {
  const [rows, setRows] = useState<EventRow[] | null>(null)
  const [editing, setEditing] = useState<EventRow | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(() => {
    api<{ events: EventRow[] }>('/api/events?all=1')
      .then((d) => setRows(d.events))
      .catch(() => setRows([]))
  }, [])
  useEffect(() => load(), [load])

  const toggle = async (e: EventRow) => {
    try {
      await api(`/api/events/${e.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !e.isActive }) })
      toast.success(e.isActive ? 'أُخفي الحدث عن الطلاب' : 'نُشر الحدث للطلاب')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر التنفيذ')
    }
  }

  const del = async (e: EventRow) => {
    if (!confirm(`حذف «${e.title}» نهائيًا؟`)) return
    try {
      await api(`/api/events/${e.id}`, { method: 'DELETE' })
      toast.success('حُذف الحدث')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر الحذف')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          الأحداث المنشورة تظهر للطلاب في صفحة الأحداث ولوحة الطالب — إعلانات، مسابقات، جلسات ونصائح.
        </p>
        <Button className="gap-1.5" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> حدث جديد
        </Button>
      </div>

      {rows === null ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            لا توجد أحداث بعد — أنشئ أول حدث لطلابك.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((e) => (
            <Card key={e.id} className={cn(!e.isActive && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', EVENT_TYPE_STYLE[e.type] || EVENT_TYPE_STYLE.NEWS)}>
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge className={cn('border-0 text-[10px]', EVENT_TYPE_STYLE[e.type] || EVENT_TYPE_STYLE.NEWS)}>
                        {EVENT_TYPE_LABEL[e.type] || e.type}
                      </Badge>
                      {e.startsAt && (
                        <span className="text-[11px] font-bold text-primary">موعد: {formatDate(e.startsAt)}</span>
                      )}
                      {!e.isActive && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">مخفي</Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">نُشر {timeAgo(e.createdAt)}</span>
                    </div>
                    <h3 className="font-extrabold text-sm">{e.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{e.body}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => toggle(e)}>
                      {e.isActive ? 'إخفاء' : 'نشر'}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(e)} aria-label="تعديل">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => del(e)} aria-label="حذف">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EventFormDialog
        open={creating || !!editing}
        event={editing}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSaved={() => {
          setCreating(false)
          setEditing(null)
          load()
        }}
      />
    </div>
  )
}

function EventFormDialog({ open, event, onClose, onSaved }: { open: boolean; event: EventRow | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!event
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState('NEWS')
  const [startsAt, setStartsAt] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(event?.title || '')
      setBody(event?.body || '')
      setType(event?.type || 'NEWS')
      setStartsAt(event?.startsAt ? new Date(event.startsAt).toISOString().slice(0, 10) : '')
    }
  }, [open, event])

  const save = async () => {
    setSaving(true)
    try {
      const payload = { title, body, type, startsAt: startsAt || null }
      if (isEdit) await api(`/api/events/${event!.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      else await api('/api/events', { method: 'POST', body: JSON.stringify(payload) })
      toast.success(isEdit ? 'حُدّث الحدث' : 'نُشر الحدث للطلاب')
      onSaved()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const valid = title.trim().length >= 3 && body.trim().length >= 5

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل الحدث' : 'حدث جديد'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>النوع</Label>
              <Select dir="rtl" value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEWS">إعلان</SelectItem>
                  <SelectItem value="EVENT">حدث</SelectItem>
                  <SelectItem value="COMPETITION">مسابقة</SelectItem>
                  <SelectItem value="TIP">نصيحة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الموعد (اختياري)</Label>
              <Input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} dir="ltr" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>العنوان</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مسابقة المتصدر الأسبوعي" />
          </div>
          <div className="space-y-1.5">
            <Label>التفاصيل</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="اكتب تفاصيل الحدث التي سيقرؤها الطلاب..." />
          </div>
          <div className="flex gap-2.5 justify-end">
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button onClick={save} disabled={!valid || saving} className="gap-1.5">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'حفظ التعديل' : 'نشر الحدث'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ================= إدارة المقاطع التعليمية (المالك والمعلم) =================
type ClipRow = {
  id: string
  title: string
  description: string | null
  url: string
  provider: string
  videoId: string | null
  category: string
  topic: string | null
  views: number
  isActive: boolean
  createdAt: string
  creator?: { name: string } | null
  uploaded?: boolean
  hasPoster?: boolean
  fileSize?: number | null
  durationSec?: number | null
}

function ClipsManager() {
  const [rows, setRows] = useState<ClipRow[] | null>(null)
  const [editing, setEditing] = useState<ClipRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(() => {
    api<{ clips: ClipRow[] }>('/api/clips?all=1')
      .then((d) => setRows(d.clips))
      .catch(() => setRows([]))
  }, [])
  useEffect(() => load(), [load])

  const toggle = async (c: ClipRow) => {
    try {
      await api(`/api/clips/${c.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !c.isActive }) })
      toast.success(c.isActive ? 'أُخفي المقطع عن الطلاب' : 'نُشر المقطع للطلاب')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر التنفيذ')
    }
  }

  const del = async (c: ClipRow) => {
    if (!confirm(`حذف «${c.title}» نهائيًا؟`)) return
    try {
      await api(`/api/clips/${c.id}`, { method: 'DELETE' })
      toast.success('حُذف المقطع')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذر الحذف')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          المقاطع المنشورة تظهر للطلاب في صفحة «المقاطع التعليمية» — الصق رابط يوتيوب، أو ارفع فيديو من جهازك مباشرة (حتى 500MB).
          ملفات الفيديو تُبث للطلاب برابط موقّع مؤقت: لا يُكشف مصدرها ولا يمكن تحميلها.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button className="gap-1.5" variant="outline" onClick={() => setUploading(true)}>
            <HardDriveUpload className="h-4 w-4" /> رفع من جهازي
          </Button>
          <Button className="gap-1.5" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> مقطع جديد
          </Button>
        </div>
      </div>

      {rows === null ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            لا توجد مقاطع بعد — أضف أول درس مرئي لطلابك.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((c) => (
            <Card key={c.id} className={cn(!c.isActive && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    {c.provider === 'YOUTUBE' && c.videoId ? (
                      <img src={youtubeThumbUrl(c.videoId)} alt="" className="w-full h-full object-cover" />
                    ) : c.hasPoster ? (
                      <img src={`/api/clips/${c.id}/poster`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <MonitorPlay className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">
                        {CLIP_CATEGORY_LABEL[c.category] || c.category}
                        {c.topic ? ` · ${c.topic}` : ''}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {c.provider === 'YOUTUBE' ? 'يوتيوب' : c.uploaded ? `مرفوع · ${formatBytes(c.fileSize)}` : 'ملف فيديو'}
                      </Badge>
                      {c.uploaded && !!c.durationSec && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1">
                          <FileVideo className="h-3 w-3" /> {formatDuration(c.durationSec)}
                        </Badge>
                      )}
                      {c.provider === 'FILE' && (
                        <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-400 border-emerald-300/60 dark:border-emerald-800/60 gap-1">
                          <ShieldCheck className="h-3 w-3" /> محمي من التحميل
                        </Badge>
                      )}
                      {!c.isActive && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">مخفي</Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">{c.views} مشاهدة · أُضيف {timeAgo(c.createdAt)}</span>
                    </div>
                    <h3 className="font-extrabold text-sm">{c.title}</h3>
                    {c.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-1">{c.description}</p>
                    )}
                    <p dir="ltr" className="text-[10px] text-muted-foreground/70 mt-1 truncate text-left">{c.url}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => toggle(c)}>
                      {c.isActive ? 'إخفاء' : 'نشر'}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(c)} aria-label="تعديل">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => del(c)} aria-label="حذف">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClipFormDialog
        open={creating || !!editing}
        clip={editing}
        onClose={() => {
          setCreating(false)
          setEditing(null)
        }}
        onSaved={() => {
          setCreating(false)
          setEditing(null)
          load()
        }}
      />

      <UploadClipDialog
        open={uploading}
        onClose={() => setUploading(false)}
        onSaved={() => {
          setUploading(false)
          load()
        }}
      />
    </div>
  )
}

const MAX_CLIP_MB = 500

/**
 * نافذة رفع مقطع من جهاز المالك/المعلم:
 *  - سحب وإفلات أو اختيار ملف فيديو (mp4/webm/mov/m4v/mkv/ogv)
 *  - رفع raw body مع XHR لإظهار نسبة التقدم الحقيقية
 *  - الخادم يولّد الصورة المصغرة ويستخرج المدة تلقائيًا، والبث محمي برابط موقّع
 */
function UploadClipDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('GENERAL')
  const [topic, setTopic] = useState('none')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [inputKey, setInputKey] = useState(0)

  const reset = () => {
    setFile(null)
    setTitle('')
    setDescription('')
    setCategory('GENERAL')
    setTopic('none')
    setProgress(0)
    setUploading(false)
    setDragOver(false)
    setInputKey((k) => k + 1)
  }

  // كل مسارات الإغلاق تمر من هنا حتى يبدأ النموذج نظيفًا في المرة التالية
  const handleClose = () => {
    reset()
    onClose()
  }

  const pickFile = (f: File | null) => {
    if (!f) return
    if (f.size > MAX_CLIP_MB * 1024 * 1024) {
      toast.error(`حجم الملف ${(f.size / (1024 * 1024)).toFixed(0)}MB يتجاوز الحد ${MAX_CLIP_MB}MB`)
      return
    }
    setFile(f)
    if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, '').slice(0, 80))
  }

  const startUpload = () => {
    if (!file || title.trim().length < 3 || uploading) return
    setUploading(true)
    setProgress(0)

    const params = new URLSearchParams({
      title: title.trim(),
      filename: file.name,
      category,
      topic: topic === 'none' ? '' : topic,
      description: description.trim(),
    })
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `/api/clips/upload?${params.toString()}`)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      setUploading(false)
      let msg = 'تعذر الرفع — حاول مجددًا'
      try {
        const data = JSON.parse(xhr.responseText)
        if (data?.error) msg = data.error
      } catch {
        /* رد غير JSON */
      }
      if (xhr.status === 201) {
        toast.success('رُفع المقطع ونُشر للطلاب بنجاح')
        reset()
        onSaved()
      } else {
        toast.error(msg)
      }
    }
    xhr.onerror = () => {
      setUploading(false)
      toast.error('انقطع الاتصال أثناء الرفع — تأكد من الشبكة وحاول مجددًا')
    }
    xhr.send(file)
  }

  const valid = !!file && title.trim().length >= 3

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !uploading && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDriveUpload className="h-5 w-5 text-primary" /> رفع مقطع من جهازي
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* منطقة اختيار/إفلات الملف */}
          <label
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              pickFile(e.dataTransfer.files?.[0] || null)
            }}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors',
              dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            )}
          >
            <input
              key={inputKey}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/x-matroska,.mp4,.webm,.mov,.m4v,.mkv,.ogv"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] || null)}
              disabled={uploading}
            />
            {file ? (
              <>
                <span className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileVideo className="h-6 w-6 text-primary" />
                </span>
                <p className="text-sm font-bold break-all max-w-xs">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)} — اضغط للتغيير</p>
              </>
            ) : (
              <>
                <span className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </span>
                <p className="text-sm font-bold">اسحب الفيديو هنا أو اضغط للاختيار من جهازك</p>
                <p className="text-xs text-muted-foreground">mp4 / webm / mov / m4v / mkv — حتى {MAX_CLIP_MB}MB</p>
              </>
            )}
          </label>

          <div className="space-y-1.5">
            <Label>العنوان *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: شرح التناظر اللفظي — خطوة بخطوة"
              disabled={uploading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>القسم</Label>
              <Select dir="rtl" value={category} onValueChange={setCategory} disabled={uploading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">عام</SelectItem>
                  <SelectItem value="QUANTITATIVE">كمي</SelectItem>
                  <SelectItem value="VERBAL">لفظي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الموضوع (اختياري)</Label>
              <Select dir="rtl" value={topic} onValueChange={setTopic} disabled={uploading}>
                <SelectTrigger>
                  <SelectValue placeholder="بدون" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون موضوع</SelectItem>
                  {(TOPICS[category] || []).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>وصف مختصر (اختياري)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="ماذا سيتعلم الطالب من هذا المقطع؟"
              disabled={uploading}
            />
          </div>

          {/* شريط التقدم */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span>جارٍ الرفع…</span>
                <span className="text-primary">{progress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">لا تغلق النافذة حتى يكتمل الرفع</p>
            </div>
          )}

          <div className="flex gap-2.5 justify-end">
            <Button variant="outline" onClick={handleClose} disabled={uploading}>
              {uploading ? 'الرفع جارٍ…' : 'إلغاء'}
            </Button>
            <Button onClick={startUpload} disabled={!valid || uploading} className="gap-1.5">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <HardDriveUpload className="h-4 w-4" />}
              {uploading ? `${progress}%` : 'رفع ونشر'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ClipFormDialog({ open, clip, onClose, onSaved }: { open: boolean; clip: ClipRow | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!clip
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('GENERAL')
  const [topic, setTopic] = useState('none')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(clip?.title || '')
      setUrl(clip?.url || '')
      setDescription(clip?.description || '')
      setCategory(clip?.category || 'GENERAL')
      setTopic(clip?.topic || 'none')
    }
  }, [open, clip])

  const detected = url.trim() ? detectClipProvider(url.trim()) : null
  const isUploadedClip = !!clip?.uploaded

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        title,
        ...(isUploadedClip ? {} : { url }),
        description: description || null,
        category,
        topic: topic === 'none' ? null : topic,
      }
      if (isEdit) await api(`/api/clips/${clip!.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      else await api('/api/clips', { method: 'POST', body: JSON.stringify(payload) })
      toast.success(isEdit ? 'حُدّث المقطع' : 'نُشر المقطع للطلاب')
      onSaved()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const valid = title.trim().length >= 3 && (isUploadedClip || /^https?:\/\/.+\..+/.test(url.trim()))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'تعديل المقطع' : 'مقطع تعليمي جديد'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isUploadedClip ? (
            <div className="rounded-xl border bg-muted/40 p-3.5 space-y-1">
              <p className="text-sm font-bold flex items-center gap-1.5">
                <FileVideo className="h-4 w-4 text-primary" /> مقطع مرفوع من جهازك
              </p>
              <p dir="ltr" className="text-[11px] text-muted-foreground truncate text-left">{clip!.url}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatBytes(clip!.fileSize)}{clip!.durationSec ? ` · المدة ${formatDuration(clip!.durationSec)}` : ''} — ملفه محفوظ على الخادم ولا يمكن تغيير رابطه.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>رابط الفيديو *</Label>
              <Input
                dir="ltr"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... أو رابط mp4"
                className="text-left"
              />
              {detected && (
                <p className={cn('text-[11px] font-bold', detected.provider === 'YOUTUBE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-teal-600 dark:text-teal-400')}>
                  {detected.provider === 'YOUTUBE' ? '✓ رابط يوتيوب — سيُضمَّن المشغل تلقائيًا' : '✓ ملف فيديو مباشر — سيُبث محميًا عبر المنصة برابط مؤقت، والطلاب لا يستطيعون تحميله أو معرفة مصدره'}
                </p>
              )}
              {url.trim() && !detected && (
                <p className="text-[11px] text-muted-foreground">سيُعامَل كملف فيديو مباشر (mp4/webm) أو تأكد أن الرابط رابط يوتيوب صحيح.</p>
              )}
              {!isEdit && (
                <p className="text-[11px] text-muted-foreground">
                  تريد رفع فيديو من جهازك؟ استخدم زر «رفع من جهازي» في قائمة المقاطع.
                </p>
              )}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>العنوان *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: شرح التناظر اللفظي — خطوة بخطوة" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>القسم</Label>
              <Select dir="rtl" value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">عام</SelectItem>
                  <SelectItem value="QUANTITATIVE">كمي</SelectItem>
                  <SelectItem value="VERBAL">لفظي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>الموضوع (اختياري)</Label>
              <Select dir="rtl" value={topic} onValueChange={setTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="بدون" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون موضوع</SelectItem>
                  {(TOPICS[category] || []).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>وصف مختصر (اختياري)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="ماذا سيتعلم الطالب من هذا المقطع؟"
            />
          </div>
          <div className="flex gap-2.5 justify-end">
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button onClick={save} disabled={!valid || saving} className="gap-1.5">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'حفظ التعديل' : 'نشر المقطع'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
