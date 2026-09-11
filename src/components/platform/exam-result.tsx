'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { api, navigate, formatDuration, timeAgo, scoreColor, CATEGORY_LABEL } from '@/lib/client'
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis, Cell } from 'recharts'
import { Trophy, CheckCircle2, XCircle, SkipForward, Timer, TrendingUp, ChevronRight, Award, AlertTriangle } from 'lucide-react'

type ResultData = {
  attemptId: string
  score: number
  correct: number
  wrong: number
  skipped: number
  total: number
  timeSpentSeconds: number
  topicsAnalysis: { topic: string; total: number; correct: number; accuracy: number }[]
  categoryAnalysis: { category: string; total: number; correct: number; accuracy: number }[]
  alreadySubmitted?: boolean
}

export function ExamResult({ attemptId }: { attemptId: string }) {
  const [data, setData] = useState<ResultData | null>(null)
  const [meta, setMeta] = useState<{ examTitle: string; completedAt: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<ResultData>(`/api/attempts/${attemptId}/submit`, { method: 'POST' })
      .then((d) => {
        setData(d)
        // جلب عنوان الاختبار من المحاولة
        return api<{ exam: { title: string }; attempt: { completedAt: string } }>(`/api/attempts/${attemptId}`)
      })
      .then((d) => {
        if (d) setMeta({ examTitle: d.exam.title, completedAt: (d as { attempt?: { completedAt?: string } }).attempt?.completedAt || '' })
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'تعذر تحميل النتيجة')
      })
  }, [attemptId])

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate('/exams')}>العودة للاختبارات</Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    )
  }

  const accuracy = data.score ?? 0
  const grade = accuracy >= 90 ? 'ممتاز' : accuracy >= 80 ? 'جيد جدًا' : accuracy >= 70 ? 'جيد' : accuracy >= 60 ? 'مقبول' : 'يحتاج تعزيز'
  const topics = data.topicsAnalysis || []
  const worst = [...topics].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3)
  const chartData = topics.map((t) => ({ name: t.topic.length > 14 ? t.topic.slice(0, 14) + '…' : t.topic, accuracy: t.accuracy }))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-5 fade-up pb-20 md:pb-8">
      {/* Hero score */}
      <Card className="overflow-hidden border-0 text-primary-foreground bg-gradient-to-l from-primary to-emerald-700">
        <CardContent className="p-7 md:p-9 text-center space-y-3">
          <Trophy className="h-10 w-10 mx-auto opacity-90" />
          <p className="text-sm opacity-80">{meta?.examTitle || 'نتيجة الاختبار'}</p>
          <p className="text-6xl font-extrabold tabular-nums">{Math.round(accuracy)}%</p>
          <p className="text-lg font-bold">{grade}</p>
          <p className="text-xs opacity-75">{timeAgo(meta?.completedAt || new Date())}</p>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: CheckCircle2, label: 'صحيحة', value: data.correct, color: 'text-emerald-600' },
          { icon: XCircle, label: 'خاطئة', value: data.wrong, color: 'text-rose-600' },
          { icon: SkipForward, label: 'متروكة', value: data.skipped, color: 'text-slate-500' },
          { icon: Timer, label: 'الزمن', value: formatDuration(data.timeSpentSeconds), color: 'text-primary', small: true },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
              <p className={`font-extrabold tabular-nums ${s.small ? 'text-sm' : 'text-2xl'}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category bars */}
      <div className="grid md:grid-cols-2 gap-4">
        {data.categoryAnalysis.map((c) => (
          <Card key={c.category}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold">القسم {CATEGORY_LABEL[c.category] || c.category}</p>
                <span className={`font-extrabold tabular-nums ${scoreColor(c.accuracy)}`}>{c.accuracy}%</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {c.correct} صحيحة من {c.total} سؤالًا
              </p>
              <Progress value={c.accuracy} className="h-2.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Topics chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> تحليل الدقة حسب الموضوع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 40, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: '#334155' }}
                  orientation="right"
                />
                <ReTooltip
                  contentStyle={{ direction: 'rtl', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, 'الدقة']}
                />
                <Bar dataKey="accuracy" radius={[0, 8, 8, 0]} barSize={18}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.accuracy >= 75 ? '#059669' : entry.accuracy >= 50 ? '#d97706' : '#e11d48'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" /> خطة ما بعد الاختبار
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {worst
            .filter((t) => t.accuracy < 80)
            .map((t) => (
              <div key={t.topic} className="flex items-center justify-between gap-3 rounded-xl border p-3.5">
                <div>
                  <p className="font-bold text-sm">{t.topic}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    دقتك {t.accuracy}% — ننصح بتدريب مركّز قبل الاختبار القادم.
                  </p>
                </div>
                <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => navigate(`/practice?topic=${encodeURIComponent(t.topic)}`)}>
                  درّب الآن <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          {(topics.length > 0 && worst.every((t) => t.accuracy >= 80)) && (
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
              🎉 أداء متوازن في جميع المواضيع — حافظ على هذا المستوى وواصل الاختبارات الأصعب!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1 h-11" onClick={() => navigate('/exams')}>
          اختبار آخر
        </Button>
        <Button variant="outline" className="flex-1 h-11" onClick={() => navigate('/dashboard')}>
          العودة للوحة
        </Button>
        <Button variant="outline" className="flex-1 h-11 gap-1.5" onClick={() => navigate('/results')}>
          سجل المحاولات
        </Button>
      </div>
    </div>
  )
}

void Badge
