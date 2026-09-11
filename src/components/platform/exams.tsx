'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api, navigate, CATEGORY_LABEL, EXAM_TYPE_LABEL, timeAgo, scoreColor } from '@/lib/client'
import { useSession } from '@/lib/client'
import { ClipboardList, Timer, ListChecks, Play, Loader2, History } from 'lucide-react'
import { toast } from 'sonner'

type ExamItem = {
  id: string
  title: string
  description: string | null
  type: string
  category: string | null
  durationMinutes: number
  questionCount: number
  attemptsCount: number
  lastScore: number | null
}

export function ExamsList() {
  const { user } = useSession()
  const [exams, setExams] = useState<ExamItem[] | null>(null)
  const [starting, setStarting] = useState<string | null>(null)

  useEffect(() => {
    api<{ exams: ExamItem[] }>('/api/exams')
      .then((d) => setExams(d.exams))
      .catch((e) => {
        toast.error(e.message)
        setExams([])
      })
  }, [])

  const startExam = async (examId: string) => {
    if (!user) {
      toast.info('سجّل الدخول لبدء الاختبار')
      navigate('/login')
      return
    }
    setStarting(examId)
    try {
      const { attemptId } = await api<{ attemptId: string }>(`/api/exams/${examId}/start`, { method: 'POST' })
      navigate(`/run/${attemptId}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر بدء الاختبار')
      setStarting(null)
    }
  }

  if (exams === null) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-10 w-52" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-5 fade-up pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> اختبارات المحاكاة
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            خُض اختبارات بأسلوب قياس الحقيقي: مؤقت، تصحيح آلي، وتحليل مفصل بعد التسليم.
          </p>
        </div>
        {user && (
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={() => navigate('/results')}>
            <History className="h-4 w-4" /> سجل محاولاتي
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {exams.map((exam) => (
          <Card key={exam.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="secondary">{EXAM_TYPE_LABEL[exam.type]}</Badge>
                    {exam.category ? (
                      <Badge variant="outline">{CATEGORY_LABEL[exam.category]}</Badge>
                    ) : (
                      <Badge variant="outline">كمي + لفظي</Badge>
                    )}
                    {exam.lastScore !== null && (
                      <Badge className={scoreColor(exam.lastScore) + ' bg-muted border border-current/20'} variant="outline">
                        أفضل نتيجة: {Math.round(exam.lastScore)}%
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-extrabold mb-1">{exam.title}</h3>
                  {exam.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{exam.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5" /> {exam.durationMinutes} دقيقة
                    </span>
                    <span className="flex items-center gap-1">
                      <ListChecks className="h-3.5 w-3.5" /> {exam.questionCount} سؤالًا
                    </span>
                    {exam.attemptsCount > 0 && (
                      <span className="flex items-center gap-1">
                        <UsersIcon /> {exam.attemptsCount} محاولة
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="lg"
                  className="h-11 px-7 shrink-0 gap-1.5"
                  onClick={() => startExam(exam.id)}
                  disabled={starting === exam.id || exam.questionCount === 0}
                >
                  {starting === exam.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {exam.questionCount === 0 ? 'غير متاح' : exam.lastScore !== null ? 'إعادة الاختبار' : 'ابدأ الاختبار'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {exams.length === 0 && (
          <Card>
            <CardContent className="py-14 text-center text-muted-foreground">
              لا توجد اختبارات متاحة حاليًا.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
