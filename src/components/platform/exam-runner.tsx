'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { QuestionCard, type QuestionData } from '@/components/platform/question-card'
import { api, navigate, CATEGORY_LABEL, DIFFICULTY_LABEL } from '@/lib/client'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

type AttemptState = {
  attempt: { id: string; status: string; answers: Record<string, string>; remainingSeconds: number; timedOut: boolean }
  exam: { id: string; title: string; durationMinutes: number; category: string | null }
  questions: QuestionData[]
}

export function ExamRunner({ attemptId }: { attemptId: string }) {
  const [state, setState] = useState<AttemptState | null>(null)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [remaining, setRemaining] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [timeWarning, setTimeWarning] = useState(false)
  const submittedRef = useRef(false)

  useEffect(() => {
    api<AttemptState>(`/api/attempts/${attemptId}`)
      .then((d) => {
        if (d.attempt.status !== 'IN_PROGRESS') {
          navigate(`/result/${attemptId}`)
          return
        }
        setState(d)
        setAnswers(d.attempt.answers)
        setRemaining(d.attempt.remainingSeconds)
        if (d.attempt.timedOut) submitRef.current()
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : 'المحاولة غير موجودة')
        navigate('/exams')
      })
  }, [attemptId])

  const submit = useCallback(
    async (auto = false) => {
      if (submittedRef.current) return
      submittedRef.current = true
      setSubmitting(true)
      try {
        await api(`/api/attempts/${attemptId}/submit`, { method: 'POST' })
        toast.success(auto ? 'انتهى الوقت — تم تسليم اختبارك تلقائيًا' : 'تم تسليم اختبارك بنجاح')
        navigate(`/result/${attemptId}`)
      } catch (e) {
        submittedRef.current = false
        setSubmitting(false)
        toast.error(e instanceof Error ? e.message : 'تعذر التسليم')
      }
    },
    [attemptId]
  )

  const submitRef = useRef(submit)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    submitRef.current = submit
  }, [submit])

  // Timer
  useEffect(() => {
    if (!state || submittedRef.current) return
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t)
          submitRef.current(true)
          return 0
        }
        if (r <= 60 && !timeWarning) setTimeWarning(true)
        return r - 1
      })
    }, 1000)
    return () => clearInterval(t)

  }, [state])

  // Auto-save current answer locally (answers sync on submit)
  const select = async (key: string) => {
    if (!state) return
    const q = state.questions[index]
    const newAnswers = { ...answers, [q.id]: key }
    setAnswers(newAnswers)
    try {
      await api(`/api/attempts/${attemptId}`, {
        method: 'PATCH',
        body: JSON.stringify({ questionId: q.id, selectedKey: key }),
      })
    } catch {
      // التخزين المحلي يكفي لو فشل الحفظ المؤقت
    }
  }

  const go = (i: number) => {
    if (!state) return
    setIndex(Math.min(state.questions.length - 1, Math.max(0, i)))
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const q = state.questions[index]
  const answeredCount = Object.keys(answers).length
  const total = state.questions.length
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const urgent = remaining <= 120

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm md:text-base truncate">{state.exam.title}</h1>
            <p className="text-[11px] text-muted-foreground">
              سؤال {index + 1} من {total} — أجبت {answeredCount}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-extrabold tabular-nums text-sm md:text-base border-2 transition-colors',
                urgent
                  ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 animate-pulse'
                  : 'border-primary/30 bg-secondary text-foreground'
              )}
              aria-live="polite"
            >
              <Clock className="h-4 w-4" />
              {mm}:{ss}
            </div>
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setConfirmOpen(true)}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              تسليم
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${total ? (answeredCount / total) * 100 : 0}%` }}
          />
        </div>
      </header>

      {/* Question palette */}
      <div className="border-b bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex gap-1.5 overflow-x-auto" dir="rtl">
          {state.questions.map((qq, i) => {
            const answered = !!answers[qq.id]
            return (
              <button
                key={qq.id}
                onClick={() => go(i)}
                aria-label={`الانتقال للسؤال ${i + 1}`}
                className={cn(
                  'w-8 h-8 shrink-0 rounded-lg text-xs font-bold border transition-all',
                  i === index
                    ? 'bg-primary text-primary-foreground border-primary scale-110'
                    : answered
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-800'
                      : 'bg-card text-muted-foreground hover:border-primary/50'
                )}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 space-y-5 pb-28">
        <QuestionCard
          question={q}
          selected={answers[q.id] || null}
          onSelect={select}
          showFeedback={false}
        />
      </main>

      {/* Bottom nav */}
      <div className="fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button variant="outline" disabled={index === 0} onClick={() => go(index - 1)} className="gap-1">
            <ChevronRight className="h-4 w-4" /> السابق
          </Button>
          <span className="text-xs text-muted-foreground hidden sm:block">
            {answeredCount}/{total} سؤالًا — {total - answeredCount} متبقي
          </span>
          {index === total - 1 ? (
            <Button onClick={() => setConfirmOpen(true)} className="gap-1.5">
              <Send className="h-4 w-4" /> تسليم الاختبار
            </Button>
          ) : (
            <Button onClick={() => go(index + 1)} className="gap-1">
              التالي <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> تأكيد التسليم
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-2">
                {total - answeredCount > 0 ? (
                  <p className="text-amber-700 dark:text-amber-400 font-medium">
                    تنبيه: لديك {total - answeredCount} سؤالًا بدون إجابة وستُحسب خاطئة.
                  </p>
                ) : (
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium">أجبت على جميع الأسئلة. جاهز للتصحيح!</p>
                )}
                <p>سيتم تصحيح اختبارك فورًا وإظهار التحليل التفصيلي.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              متابعة الحل
            </Button>
            <Button onClick={() => submit(false)} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />} تسليم نهائي
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

void DIFFICULTY_LABEL
void CATEGORY_LABEL
