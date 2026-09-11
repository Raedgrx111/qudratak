'use client'

import { useEffect, useState } from 'react'
import { api, navigate, useSession } from '@/lib/client'
import { QuestionCard, type QuestionData } from '@/components/platform/question-card'
import { CommentsSection } from '@/components/platform/comments'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronRight, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { MessageSquare } from 'lucide-react'

export function QuestionDetail({ id }: { id: string }) {
  const { user } = useSession()
  const [question, setQuestion] = useState<QuestionData | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<{ isCorrect: boolean; correctAnswer: string; explanation: string } | null>(null)
  const [favorite, setFavorite] = useState(false)
  const [commentCount, setCommentCount] = useState<number>(0)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ question: QuestionData & { correctAnswer?: string; explanation?: string }; favorite: boolean; lastAnswer: { selectedKey: string } | null }>(
      `/api/questions/${id}`
    )
      .then((d) => {
        setQuestion(d.question)
        setFavorite(d.favorite)
        if (d.lastAnswer) {
          // سبق أن أجاب: أعرض الحل مباشرة
          setSelected(d.lastAnswer.selectedKey)
          const wasCorrect = d.lastAnswer.selectedKey === d.question.correctAnswer
          setAnswerState({
            isCorrect: wasCorrect,
            correctAnswer: d.question.correctAnswer!,
            explanation: d.question.explanation!,
          })
        }
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'السؤال غير موجود'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    api<{ comments: unknown[] }>(`/api/questions/${id}/comments`)
      .then((d) => setCommentCount(d.comments.length))
      .catch(() => null)
  }, [id])

  const checkAnswer = async () => {
    if (!question || !selected) return
    try {
      const res = await api<{ isCorrect: boolean; correctAnswer: string; explanation: string }>(
        `/api/questions/${question.id}/answer`,
        { method: 'POST', body: JSON.stringify({ selectedKey: selected }) }
      )
      setAnswerState(res)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر تسجيل الإجابة')
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast.info('سجّل الدخول لحفظ الأسئلة')
      return
    }
    const res = await api<{ favorite: boolean }>(`/api/questions/${question!.id}/favorite`, { method: 'POST' })
    setFavorite(res.favorite)
    toast.success(res.favorite ? 'أُضيف إلى مفضلتك ⭐' : 'أُزيل من المفضلة')
  }

  const askAI = async (focus: 'explain' | 'mistake' = 'explain') => {
    setAiOpen(true)
    setAiLoading(true)
    setAiText('')
    try {
      const res = await api<{ reply: string }>('/api/ai/explain', {
        method: 'POST',
        body: JSON.stringify({ questionId: id, focus }),
      })
      setAiText(res.reply)
    } catch (e) {
      setAiText('')
      toast.error(e instanceof Error ? e.message : 'تعذر الاتصال بالمساعد')
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground">
        السؤال غير موجود.
        <Button variant="link" onClick={() => navigate('/practice')}>
          العودة للتدريب
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 fade-up pb-20 md:pb-8">
      <div>
        <Button variant="ghost" size="sm" className="gap-1.5 -mr-2" onClick={() => navigate('/practice')}>
          <ChevronRight className="h-4 w-4" /> التدريب الحر
        </Button>
      </div>

      <QuestionCard
        question={question}
        selected={selected}
        onSelect={setSelected}
        answerState={answerState}
        onCheck={checkAnswer}
        favorite={favorite}
        onToggleFavorite={toggleFavorite}
        commentCount={commentCount}
        onAskAI={() => askAI(answerState && !answerState.isCorrect ? 'mistake' : 'explain')}
      />

      {/* AI explain dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-amber-500" /> شرح المدرّب الذكي
            </DialogTitle>
          </DialogHeader>
          {aiLoading ? (
            <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> يحلّل المساعد السؤال...
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-line bg-muted/40 rounded-xl p-4">{aiText}</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Comments */}
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          النقاش والأسئلة
          <span className="text-sm font-medium text-muted-foreground">({commentCount})</span>
        </h2>
        <CommentsSection questionId={id} onChange={setCommentCount} />
      </section>
    </div>
  )
}
