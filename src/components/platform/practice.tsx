'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { QuestionCard, type QuestionData } from '@/components/platform/question-card'
import { api, navigate, useSession, CATEGORY_LABEL, DIFFICULTY_LABEL, TOPICS } from '@/lib/client'
import { ChevronRight, ChevronLeft, Shuffle, Heart, Loader2, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

type Filter = { category: string; topic: string; difficulty: string }

export function Practice() {
  const { user } = useSession()
  const [filter, setFilter] = useState<Filter>({ category: '', topic: '', difficulty: '' })
  const [question, setQuestion] = useState<QuestionData | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<{ isCorrect: boolean; correctAnswer: string; explanation: string } | null>(null)
  const [checking, setChecking] = useState(false)
  const [loading, setLoading] = useState(true)
  const [favorite, setFavorite] = useState(false)
  const [stats, setStats] = useState<{ solved: number; correct: number }>({ solved: 0, correct: 0 })

  const loadQuestion = useCallback(async () => {
    setLoading(true)
    setAnswerState(null)
    setSelected(null)
    try {
      const params = new URLSearchParams({ random: '1', limit: '1' })
      if (filter.category) params.set('category', filter.category)
      if (filter.topic) params.set('topic', filter.topic)
      if (filter.difficulty) params.set('difficulty', filter.difficulty)
      const data = await api<{ questions: QuestionData[] }>(`/api/questions?${params}`)
      if (!data.questions.length) {
        setQuestion(null)
        toast.info('لا توجد أسئلة تطابق هذه الفلترة')
      } else {
        setQuestion(data.questions[0])
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر تحميل السؤال')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadQuestion()
  }, [loadQuestion])

  useEffect(() => {
    // تحميل إجماليات الطالب مرة واحدة
    api<{ totals: { totalAnswered: number; totalCorrect: number } }>('/api/stats/dashboard')
      .then((d) => setStats({ solved: d.totals.totalAnswered, correct: d.totals.totalCorrect }))
      .catch(() => null)
  }, [])

  useEffect(() => {
    if (question && user) {
      api<{ favorite: boolean }>(`/api/questions/${question.id}`)
        .then((d) => setFavorite(d.favorite))
        .catch(() => null)
    } else if (question) {
      setFavorite(false)
    }
  }, [question, user])

  const checkAnswer = async () => {
    if (!question || !selected) return
    setChecking(true)
    try {
      const res = await api<{ isCorrect: boolean; correctAnswer: string; explanation: string }>(
        `/api/questions/${question.id}/answer`,
        { method: 'POST', body: JSON.stringify({ selectedKey: selected }) }
      )
      setAnswerState(res)
      setStats((s) => ({ solved: s.solved + 1, correct: s.correct + (res.isCorrect ? 1 : 0) }))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر تسجيل الإجابة')
    } finally {
      setChecking(false)
    }
  }

  const toggleFavorite = async () => {
    if (!question) return
    if (!user) {
      toast.info('سجّل الدخول لحفظ الأسئلة في مفضلتك')
      return
    }
    try {
      const res = await api<{ favorite: boolean }>(`/api/questions/${question.id}/favorite`, { method: 'POST' })
      setFavorite(res.favorite)
      toast.success(res.favorite ? 'أُضيف إلى مفضلتك ⭐' : 'أُزيل من المفضلة')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر التحديث')
    }
  }

  const accuracy = stats.solved > 0 ? Math.round((stats.correct / stats.solved) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-5 fade-up pb-20 md:pb-8">
      {/* Header + filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">تدريب حر</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            أسئلة عشوائية مع تصحيح فوري وشرح مباشر — {stats.solved > 0 && <>دقتك في هذه الجلسة: <span className="font-bold text-foreground tabular-nums">{accuracy}%</span> من {stats.solved} سؤال</>}
          </p>
        </div>
        {user ? (
          <div className="flex items-center gap-2 text-sm">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate('/favorites')}>
              <Heart className="h-4 w-4" /> المفضلة
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            سجّل الدخول لتتبع تقدمك
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Select
            dir="rtl"
            value={filter.category || 'ALL'}
            onValueChange={(v) => setFilter((f) => ({ ...f, category: v === 'ALL' ? '' : v, topic: '' }))}
          >
            <SelectTrigger aria-label="القسم">
              <SelectValue placeholder="القسم" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">كل الأقسام</SelectItem>
              <SelectItem value="QUANTITATIVE">كمي</SelectItem>
              <SelectItem value="VERBAL">لفظي</SelectItem>
            </SelectContent>
          </Select>

          <Select
            dir="rtl"
            value={filter.topic || 'ALL'}
            onValueChange={(v) => setFilter((f) => ({ ...f, topic: v === 'ALL' ? '' : v }))}
            disabled={!filter.category}
          >
            <SelectTrigger aria-label="الموضوع">
              <SelectValue placeholder={filter.category ? 'الموضوع' : 'اختر قسمًا أولًا'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">كل المواضيع</SelectItem>
              {(filter.category ? TOPICS[filter.category] : Object.values(TOPICS).flat()).map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            dir="rtl"
            value={filter.difficulty || 'ALL'}
            onValueChange={(v) => setFilter((f) => ({ ...f, difficulty: v === 'ALL' ? '' : v }))}
          >
            <SelectTrigger aria-label="الصعوبة">
              <SelectValue placeholder="الصعوبة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">كل المستويات</SelectItem>
              <SelectItem value="EASY">{DIFFICULTY_LABEL.EASY}</SelectItem>
              <SelectItem value="MEDIUM">{DIFFICULTY_LABEL.MEDIUM}</SelectItem>
              <SelectItem value="HARD">{DIFFICULTY_LABEL.HARD}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="secondary" className="gap-1.5" onClick={loadQuestion} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
            سؤال جديد
          </Button>
        </CardContent>
      </Card>

      {/* Question */}
      {loading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : question ? (
        <div className="space-y-4">
          <QuestionCard
            question={question}
            selected={selected}
            onSelect={setSelected}
            answerState={answerState}
            onCheck={checkAnswer}
            checking={checking}
            favorite={favorite}
            onToggleFavorite={toggleFavorite}
            onOpenComments={() => navigate(`/q/${question.id}`)}
          />
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" className="gap-1.5" onClick={() => navigate(`/q/${question.id}`)}>
              صفحة السؤال والنقاش <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button className="gap-1.5" onClick={loadQuestion} disabled={loading}>
              {answerState ? (
                <>
                  السؤال التالي <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" /> تخطي
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-14 text-center text-muted-foreground">
            لا توجد أسئلة مطابقة — جرّب توسيع الفلترة.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

void CATEGORY_LABEL
