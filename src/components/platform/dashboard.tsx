'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { api, navigate, useSession, timeAgo, scoreColor, EXAM_TYPE_LABEL, EVENT_TYPE_LABEL, EVENT_TYPE_STYLE } from '@/lib/client'
import { cn } from '@/lib/utils'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Target,
  TrendingUp,
  ClipboardList,
  Heart,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Trophy,
  BookOpen,
  Loader2,
  Megaphone,
  CalendarDays,
  MonitorPlay,
  Play,
  MailWarning,
} from 'lucide-react'
import { toast } from 'sonner'

type DashData = {
  totals: { totalAnswered: number; totalCorrect: number; accuracy: number; favorites: number; examsTaken: number }
  recentAttempts: { id: string; examId: string; examTitle: string; examType: string; score: number | null; completedAt: string }[]
  topics: { topic: string; total: number; correct: number; accuracy: number }[]
  weakAreas: { topic: string; total: number; correct: number; accuracy: number }[]
  strongAreas: { topic: string; total: number; correct: number; accuracy: number }[]
  progressSeries: { date: string; label: string; answered: number; accuracy: number }[]
  recommendations: { topic: string; reason: string }[]
}

type EventItem = { id: string; title: string; body: string; type: string; startsAt: string | null; createdAt: string }

type ClipItem = { id: string; title: string; category: string; views: number; createdAt: string }

export function Dashboard() {
  const { user } = useSession()
  const [data, setData] = useState<DashData | null>(null)
  const [training, setTraining] = useState<string | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [clips, setClips] = useState<ClipItem[]>([])

  useEffect(() => {
    api<DashData>('/api/stats/dashboard')
      .then(setData)
      .catch((e) => toast.error(e.message))
    api<{ events: EventItem[] }>('/api/events')
      .then((d) => setEvents(d.events.slice(0, 2)))
      .catch(() => null)
    api<{ clips: ClipItem[] }>('/api/clips')
      .then((d) => setClips(d.clips.slice(0, 2)))
      .catch(() => null)
  }, [])

  const startTraining = async (topic: string) => {
    setTraining(topic)
    try {
      const res = await api<{ exam: { id: string } }>('/api/exams', {
        method: 'POST',
        body: JSON.stringify({
          title: `تدريب مركّز: ${topic}`,
          description: `اختبار مهارة مركّز على «${topic}» مولّد تلقائيًا من توصيات لوحتك.`,
          mode: 'auto',
          count: 10,
          topics: [topic],
          durationMinutes: 15,
        }),
      })
      const { attemptId } = await api<{ attemptId: string }>(`/api/exams/${res.exam.id}/start`, { method: 'POST' })
      navigate(`/run/${attemptId}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر بدء التدريب')
      setTraining(null)
    }
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  const { totals, progressSeries, recentAttempts, weakAreas, strongAreas, recommendations } = data

  const statCards = [
    { icon: Target, label: 'أسئلة حللتها', value: String(totals.totalAnswered), hint: 'في التدريب والاختبارات' },
    { icon: TrendingUp, label: 'نسبة الدقة', value: `${totals.accuracy}%`, hint: `أجبت الصحيح ${totals.totalCorrect} مرة` },
    { icon: ClipboardList, label: 'اختبارات مكتملة', value: String(totals.examsTaken), hint: 'من اختبارات المحاكاة' },
    { icon: Heart, label: 'المفضلة', value: String(totals.favorites), hint: 'أسئلة حفظتها للمراجعة' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 fade-up pb-20 md:pb-8">
      {/* لافتة تأكيد البريد للطلاب غير الموثقين */}
      {user?.role === 'STUDENT' && user?.emailVerified === false && (
        <button
          onClick={() => navigate('/verify')}
          className="w-full text-right flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
        >
          <MailWarning className="h-5 w-5 text-amber-600 shrink-0" />
          <span className="text-sm text-amber-900 dark:text-amber-200 flex-1">
            <b>بريدك غير مؤكّد بعد</b> — أكمل تأكيد بريدك بالرمز المُرسل لتفتح التدريب والاختبارات والمساعد الذكي
          </span>
          <span className="text-xs font-bold text-amber-700 dark:text-amber-300 shrink-0">تأكيد الآن ←</span>
        </button>
      )}
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">أهلًا، {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">
            هذا ملخص تقدمك — استمر، فكل سؤال يقربك من هدفك.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/practice')} className="gap-1.5">
            <BookOpen className="h-4 w-4" /> تدريب سريع
          </Button>
          <Button variant="outline" onClick={() => navigate('/exams')} className="gap-1.5">
            <ClipboardList className="h-4 w-4" /> اختبار محاكاة
          </Button>
          <Button variant="outline" onClick={() => navigate('/leaderboard')} className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/40">
            <Trophy className="h-4 w-4" /> المتصدرون
          </Button>
        </div>
      </div>

      {/* شريط الأحداث */}
      {events.length > 0 && (
        <div className="space-y-2">
          {events.map((e) => (
            <button
              key={e.id}
              onClick={() => navigate('/events')}
              className="w-full text-right rounded-2xl border border-amber-200/80 bg-gradient-to-l from-amber-50/80 to-transparent dark:border-amber-900/50 dark:from-amber-950/25 p-4 flex items-center gap-3.5 hover:shadow-sm transition-shadow"
            >
              <span className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                <Megaphone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <Badge className={cn('text-[10px] border-0', EVENT_TYPE_STYLE[e.type] || EVENT_TYPE_STYLE.NEWS)}>
                    {EVENT_TYPE_LABEL[e.type] || e.type}
                  </Badge>
                  <span className="font-extrabold text-sm truncate">{e.title}</span>
                </span>
                <span className="text-xs text-muted-foreground line-clamp-1 block">{e.body}</span>
              </span>
              <CalendarDays className="h-4 w-4 text-amber-500 shrink-0" />
            </button>
          ))}
          {events.length >= 2 && (
            <button onClick={() => navigate('/events')} className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
              كل الأحداث والنشاطات <ArrowLeft className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* شريط المقاطع التعليمية */}
      {clips.length > 0 && (
        <div className="space-y-2">
          {clips.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/clips/${c.id}`)}
              className="w-full text-right rounded-2xl border border-teal-200/80 bg-gradient-to-l from-teal-50/80 to-transparent dark:border-teal-900/50 dark:from-teal-950/25 p-4 flex items-center gap-3.5 hover:shadow-sm transition-shadow"
            >
              <span className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center shrink-0">
                <MonitorPlay className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 mb-0.5">
                  <Badge variant="outline" className="text-[10px] border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-400">مقطع تعليمي</Badge>
                  <span className="font-extrabold text-sm truncate">{c.title}</span>
                </span>
                <span className="text-xs text-muted-foreground block">{c.views} مشاهدة — شاهده الآن</span>
              </span>
              <Play className="h-4 w-4 text-teal-500 shrink-0 fill-teal-500 -scale-x-100" />
            </button>
          ))}
          {clips.length >= 2 && (
            <button onClick={() => navigate('/clips')} className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
              كل المقاطع التعليمية <ArrowLeft className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-extrabold tabular-nums leading-none">{s.value}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-1 truncate">{s.label}</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/70 mt-3">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress + Recommendations */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              تقدمك خلال 14 يومًا
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                  <ReTooltip
                    contentStyle={{ direction: 'rtl', borderRadius: 12, fontSize: 12, border: '1px solid #e2e8f0' }}
                    formatter={(value: number, name: string) =>
                      name === 'accuracy' ? [`${value}%`, 'الدقة'] : [value, 'أسئلة']
                    }
                  />
                  <Area type="monotone" dataKey="accuracy" stroke="#059669" strokeWidth={2.5} fill="url(#accGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              النسبة تمثل دقة إجاباتك في كل يوم — الاستمرار اليومي هو سر التحسن.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              توصيات تدريب مخصصة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                لا توجد نقاط ضعف واضحة حتى الآن. أكمل اختبارات أكثر لنتمكن من تحليل مواضيعك بدقة أكبر.
              </p>
            ) : (
              recommendations.map((r) => (
                <div key={r.topic} className="rounded-xl border border-amber-200/70 bg-amber-50/60 dark:bg-amber-950/30 dark:border-amber-900/50 p-3.5">
                  <p className="text-xs font-bold mb-1">{r.topic}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">{r.reason}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs"
                    disabled={training === r.topic}
                    onClick={() => startTraining(r.topic)}
                  >
                    {training === r.topic ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> جارٍ التجهيز...
                      </>
                    ) : (
                      <>
                        ابدأ تدريبًا مكثفًا <ArrowLeft className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weak / Strong + Recent */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              نقاط تحتاج تركيزك
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {weakAreas.length === 0 ? (
              <p className="text-sm text-muted-foreground">ممتاز! لا توجد مواضيع ضعيفة مسجلة حاليًا.</p>
            ) : (
              weakAreas.map((t) => (
                <div key={t.topic}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium">{t.topic}</span>
                    <span className="tabular-nums text-rose-600 dark:text-rose-400 font-bold">{t.accuracy}%</span>
                  </div>
                  <Progress value={t.accuracy} className="h-2 [&>div]:bg-rose-500" />
                </div>
              ))
            )}
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate('/practice')}>
              انتقل للتدريب
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              مواضيع تتفوق فيها
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {strongAreas.length === 0 ? (
              <p className="text-sm text-muted-foreground">استمر بالتدريب وستظهر مواضيع قوتك هنا قريبًا.</p>
            ) : (
              strongAreas.map((t) => (
                <div key={t.topic}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium">{t.topic}</span>
                    <span className="tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">{t.accuracy}%</span>
                  </div>
                  <Progress value={t.accuracy} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              أحدث اختباراتك
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {recentAttempts.length === 0 ? (
              <div className="text-sm text-muted-foreground space-y-3">
                <p>لم تخُض أي اختبار بعد.</p>
                <Button size="sm" onClick={() => navigate('/exams')}>
                  ابدأ أول اختبار محاكاة
                </Button>
              </div>
            ) : (
              recentAttempts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => navigate(`/result/${a.id}`)}
                  className="w-full text-right rounded-xl border p-3 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-bold truncate">{a.examTitle}</span>
                    <span className={`text-sm font-extrabold tabular-nums shrink-0 ${scoreColor(a.score ?? 0)}`}>
                      {Math.round(a.score ?? 0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px] px-1.5 h-4.5">
                      {EXAM_TYPE_LABEL[a.examType] || a.examType}
                    </Badge>
                    <span>{timeAgo(a.completedAt)}</span>
                  </div>
                </button>
              ))
            )}
            {recentAttempts.length > 0 && (
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => navigate('/results')}>
                عرض السجل الكامل
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
