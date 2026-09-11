'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { QuestionCard, type QuestionData } from '@/components/platform/question-card'
import { api, navigate } from '@/lib/client'
import { Heart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function Favorites() {
  const [items, setItems] = useState<QuestionData[] | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<{ isCorrect: boolean; correctAnswer: string; explanation: string } | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const load = () => {
    api<{ favorites: QuestionData[] }>('/api/favorites?limit=50')
      .then((d) => setItems(d.favorites))
      .catch(() => setItems([]))
  }

  useEffect(() => {
    load()
  }, [])

  const toggleRemove = async (id: string) => {
    setRemoving(id)
    try {
      await api(`/api/questions/${id}/favorite`, { method: 'POST' })
      toast.success('أُزيل من المفضلة')
      setItems((prev) => prev?.filter((q) => q.id !== id) || [])
      setOpenId(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر التحديث')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-5 fade-up pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" /> الأسئلة المفضلة
          </h1>
          <p className="text-sm text-muted-foreground mt-1">أسئلة حفظتها لمراجعتها لاحقًا — راجعها وتأكد من إتقانها.</p>
        </div>
      </div>

      {items === null ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <Heart className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">لم تحفظ أي سؤال بعد — أثناء التدريب اضغط ♥ على أي سؤال مهم.</p>
            <Button onClick={() => navigate('/practice')}>ابدأ التدريب</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((q) =>
            openId === q.id ? (
              <div key={q.id} className="space-y-3">
                <QuestionCard
                  question={q}
                  selected={selected}
                  onSelect={setSelected}
                  answerState={answerState}
                  favorite
                  onToggleFavorite={() => toggleRemove(q.id)}
                  onOpenComments={() => navigate(`/q/${q.id}`)}
                  onCheck={async () => {
                    if (!selected) return
                    const res = await api<{ isCorrect: boolean; correctAnswer: string; explanation: string }>(
                      `/api/questions/${q.id}/answer`,
                      { method: 'POST', body: JSON.stringify({ selectedKey: selected }) }
                    )
                    setAnswerState(res)
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setOpenId(null)
                    setAnswerState(null)
                    setSelected(null)
                  }}
                >
                  إغلاق
                </Button>
              </div>
            ) : (
              <Card key={q.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setOpenId(q.id)}>
                <CardContent className="p-4 md:p-5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold leading-relaxed line-clamp-2 whitespace-pre-line">{q.text}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">{q.topic}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 text-rose-500"
                    disabled={removing === q.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleRemove(q.id)
                    }}
                    aria-label="إزالة من المفضلة"
                  >
                    {removing === q.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4 fill-current" />}
                  </Button>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  )
}
