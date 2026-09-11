'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CATEGORY_LABEL, DIFFICULTY_LABEL, DIFFICULTY_STYLE } from '@/lib/client'
import { cn } from '@/lib/utils'
import { Check, X, MessageCircle, Heart, Lightbulb, Loader2 } from 'lucide-react'
import { useState } from 'react'

export type QuestionData = {
  id: string
  category: string
  topic: string
  difficulty: string
  text: string
  choices: { key: string; text: string }[]
  image?: string | null
  correctAnswer?: string
  explanation?: string
}

type AnswerState = {
  isCorrect: boolean
  correctAnswer: string
  explanation: string
} | null

export function QuestionCard({
  question,
  selected,
  onSelect,
  answerState,
  onCheck,
  checking,
  favorite,
  onToggleFavorite,
  onOpenComments,
  commentCount,
  showFeedback = true,
  disabled = false,
  onAskAI,
}: {
  question: QuestionData
  selected: string | null
  onSelect: (key: string) => void
  answerState?: AnswerState
  onCheck?: () => void
  checking?: boolean
  favorite?: boolean
  onToggleFavorite?: () => void
  onOpenComments?: () => void
  commentCount?: number
  showFeedback?: boolean
  disabled?: boolean
  onAskAI?: () => void
}) {
  const answered = !!answerState
  const canShowAnswer = showFeedback && answered

  const choiceStyle = (key: string) => {
    if (!canShowAnswer) {
      return selected === key
        ? 'border-primary bg-secondary ring-1 ring-primary'
        : 'border hover:border-primary/50 hover:bg-muted/50'
    }
    if (key === answerState.correctAnswer)
      return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
    if (key === selected && key !== answerState.correctAnswer)
      return 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 ring-1 ring-rose-500'
    return 'border opacity-60'
  }

  return (
    <div className="rounded-2xl border bg-card p-5 md:p-7 space-y-5 shadow-sm">
      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{CATEGORY_LABEL[question.category] || question.category}</Badge>
        <Badge variant="outline">{question.topic}</Badge>
        <Badge className={cn('border-0', DIFFICULTY_STYLE[question.difficulty])}>
          {DIFFICULTY_LABEL[question.difficulty]}
        </Badge>
        <div className="flex-1" />
        {onToggleFavorite && (
          <Button
            size="icon"
            variant="ghost"
            className={cn('h-8 w-8', favorite && 'text-rose-500')}
            onClick={onToggleFavorite}
            aria-label={favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            title={favorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
          >
            <Heart className={cn('h-4 w-4', favorite && 'fill-current')} />
          </Button>
        )}
        {onOpenComments && (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 text-xs"
            onClick={onOpenComments}
            aria-label="عرض النقاش"
          >
            <MessageCircle className="h-4 w-4" />
            النقاش {typeof commentCount === 'number' && commentCount > 0 ? `(${commentCount})` : ''}
          </Button>
        )}
      </div>

      {/* Question */}
      <p className="text-lg md:text-xl font-bold leading-relaxed whitespace-pre-line">{question.text}</p>

      {question.image && (
        <div className="flex justify-center">
          <img src={question.image} alt="شكل السؤال" className="max-w-full md:max-w-sm rounded-xl border" />
        </div>
      )}

      {/* Choices */}
      <div className="grid gap-2.5" role="radiogroup" aria-label="خيارات السؤال">
        {question.choices.map((c) => (
          <button
            key={c.key}
            role="radio"
            aria-checked={selected === c.key}
            disabled={disabled || (showFeedback && answered)}
            onClick={() => onSelect(c.key)}
            className={cn(
              'flex items-center gap-3 rounded-xl border-2 p-3.5 text-right transition-all',
              'disabled:cursor-not-allowed',
              choiceStyle(c.key)
            )}
          >
            <span
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center font-extrabold shrink-0 transition-colors',
                selected === c.key && !canShowAnswer
                  ? 'bg-primary text-primary-foreground'
                  : canShowAnswer && c.key === answerState.correctAnswer
                    ? 'bg-emerald-500 text-white'
                    : canShowAnswer && c.key === selected
                      ? 'bg-rose-500 text-white'
                      : 'bg-muted text-foreground'
              )}
            >
              {c.key}
            </span>
            <span className="flex-1 font-medium leading-relaxed">{c.text}</span>
            {canShowAnswer && c.key === answerState.correctAnswer && <Check className="h-5 w-5 text-emerald-600 shrink-0" />}
            {canShowAnswer && c.key === selected && c.key !== answerState.correctAnswer && (
              <X className="h-5 w-5 text-rose-600 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      {showFeedback && !answered && (
        <Button className="w-full h-11 text-base" disabled={!selected || checking} onClick={onCheck}>
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : selected ? 'تحقق من الإجابة' : 'اختر إجابة أولًا'}
        </Button>
      )}

      {/* Feedback + explanation */}
      {canShowAnswer && (
        <div className="space-y-3">
          <div
            className={cn(
              'rounded-xl p-4 border',
              answerState.isCorrect
                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900'
                : 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900'
            )}
          >
            <p className={cn('font-bold text-sm mb-1', answerState.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400')}>
              {answerState.isCorrect ? '✓ إجابة صحيحة! أحسنت.' : `✗ إجابة خاطئة — الصحيح هو (${answerState.correctAnswer})`}
            </p>
            <p className="text-sm font-medium text-muted-foreground whitespace-pre-line leading-relaxed">
              {answerState.explanation}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {onAskAI && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={onAskAI}>
                <Lightbulb className="h-4 w-4 text-amber-500" /> اشرح لي بالذكاء الاصطناعي
              </Button>
            )}
            {onOpenComments && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={onOpenComments}>
                <MessageCircle className="h-4 w-4 text-primary" /> اسأل في النقاش
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
