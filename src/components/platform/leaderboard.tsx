'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, navigate } from '@/lib/client'
import { cn } from '@/lib/utils'
import { Trophy, Target, TrendingUp, ClipboardList, Loader2, ArrowLeft } from 'lucide-react'

type Entry = {
  rank: number
  userId: string
  name: string
  grade: string | null
  solved: number
  attempts: number
  accuracy: number
  exams: number
  avgScore: number | null
  isMe: boolean
}

type Board = { board: Entry[]; me: Entry | null }

const PERIODS = [
  { value: 'week', label: 'هذا الأسبوع' },
  { value: 'month', label: 'هذا الشهر' },
  { value: 'all', label: 'الكل' },
]

export function Leaderboard() {
  const [period, setPeriod] = useState('all')
  const [data, setData] = useState<Board | null>(null)
  const [loadedPeriod, setLoadedPeriod] = useState('')

  useEffect(() => {
    let cancelled = false
    api<Board>(`/api/leaderboard?period=${period}`)
      .then((d) => {
        if (!cancelled) {
          setData(d)
          setLoadedPeriod(period)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData({ board: [], me: null })
          setLoadedPeriod(period)
        }
      })
    return () => {
      cancelled = true
    }
  }, [period])

  const loading = loadedPeriod !== period

  const top = data?.board.slice(0, 3) ?? []
  const podiumOrder = [top[1], top[0], top[2]] // ثاني، أول، ثالث

  const medalStyle = (rank: number) =>
    rank === 1
      ? 'from-amber-300 to-amber-500 text-amber-950'
      : rank === 2
        ? 'from-slate-300 to-slate-400 text-slate-800'
        : 'from-orange-300 to-orange-400 text-orange-950'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 fade-up pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2.5">
            <span className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-amber-500" />
            </span>
            قائمة المتصدّرين
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            ترتيب حقيقي مبني على الحل الفعلي: عدد الأسئلة المختلفة التي أجبت عنها إجابة صحيحة في التدريب والاختبارات.
          </p>
        </div>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList>
            {PERIODS.map((p) => (
              <TabsTrigger key={p.value} value={p.value} className="text-xs sm:text-sm">
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : !data || data.board.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <Trophy className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <h3 className="font-bold text-lg">المنافسة لم تبدأ بعد</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              لا توجد نتائج كافية في هذه الفترة — أول من يحل 5 أسئلة أو أكثر يظهر هنا فورًا. كن أول المتصدرين!
            </p>
            <button
              onClick={() => navigate('/practice')}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
            >
              ابدأ الحل الآن <ArrowLeft className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Podium */}
          <div className="grid grid-cols-3 gap-3 md:gap-5 items-end mb-8">
            {podiumOrder.map((e, i) => {
              if (!e) return <div key={i} />
              const isFirst = e.rank === 1
              return (
                <div key={e.userId} className={cn('flex flex-col items-center', isFirst && '-translate-y-4')}>
                  <Avatar className={cn('border-4 shadow-lg', isFirst ? 'h-20 w-20 border-amber-400' : 'h-14 w-14 border-muted')}>
                    <AvatarFallback
                      className={cn(
                        'font-extrabold',
                        isFirst ? 'text-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950' : 'bg-secondary text-secondary-foreground'
                      )}
                    >
                      {e.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className={cn('font-bold mt-2 truncate max-w-full text-center', isFirst ? 'text-base' : 'text-sm')}>
                    {e.name}
                  </p>
                  <Badge className={cn('mt-1.5 bg-gradient-to-l text-xs border-0', medalStyle(e.rank))}>
                    المركز {e.rank}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1.5 text-center">
                    <span className="font-extrabold text-foreground tabular-nums">{e.solved}</span> سؤال صحيح
                  </p>
                  <p className="text-[11px] text-muted-foreground">دقة {e.accuracy}%</p>
                  {isFirst && <Trophy className="h-5 w-5 text-amber-500 mt-1.5" />}
                </div>
              )
            })}
          </div>

          {/* My rank banner */}
          {data.me && (
            <div
              className={cn(
                'rounded-2xl border-2 p-4 mb-6 flex items-center gap-4',
                data.me.isMe && data.me.rank > 3
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border bg-card'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-extrabold tabular-nums">{data.me.rank}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate">ترتيبك الحالي: {data.me.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data.me.solved} سؤالًا صحيحًا · دقة {data.me.accuracy}% · {data.me.attempts} محاولة إجابة
                </p>
              </div>
              <button
                onClick={() => navigate('/practice')}
                className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                تحسّن ترتيبك <ArrowLeft className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Full table */}
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[3.5rem_1fr_5rem_5rem_6rem] gap-2 px-4 py-3 border-b text-[11px] font-bold text-muted-foreground">
                <span>#</span>
                <span>الطالب</span>
                <span className="text-center hidden sm:block">الدقة</span>
                <span className="text-center hidden sm:block">اختبارات</span>
                <span className="text-center">أسئلة صحيحة</span>
              </div>
              <div className="max-h-[32rem] overflow-y-auto">
                {data.board.map((e) => (
                  <div
                    key={e.userId}
                    className={cn(
                      'grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[3.5rem_1fr_5rem_5rem_6rem] gap-2 px-4 py-3 border-b last:border-0 items-center text-sm',
                      e.isMe ? 'bg-primary/5 border-r-2 border-r-primary' : 'hover:bg-muted/40'
                    )}
                  >
                    <span className="font-extrabold tabular-nums text-muted-foreground">{e.rank}</span>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-bold">
                          {e.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold truncate flex items-center gap-1.5">
                          {e.name}
                          {e.isMe && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                              أنت
                            </Badge>
                          )}
                        </p>
                        {e.grade && <p className="text-[11px] text-muted-foreground truncate">{e.grade}</p>}
                      </div>
                    </div>
                    <span className="text-center hidden sm:flex items-center justify-center gap-1 text-xs font-bold tabular-nums">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      {e.accuracy}%
                    </span>
                    <span className="text-center hidden sm:flex items-center justify-center gap-1 text-xs font-bold tabular-nums text-muted-foreground">
                      <ClipboardList className="h-3.5 w-3.5" />
                      {e.exams}
                    </span>
                    <span className="text-center flex items-center justify-center gap-1 font-extrabold tabular-nums text-primary">
                      <Target className="h-3.5 w-3.5" />
                      {e.solved}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <p className="text-[11px] text-muted-foreground text-center mt-4 leading-relaxed">
            الحد الأدنى للظهور: 5 محاولات إجابة. يُحتسب كل سؤال مرة واحدة فقط حتى لا تتكرر الأسئلة ويبقى الترتيب عادلًا.
          </p>
        </>
      )}

      {loading && (
        <div className="fixed bottom-4 left-4 z-50">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
