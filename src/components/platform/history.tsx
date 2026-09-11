'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api, navigate, timeAgo, formatDuration, scoreColor, EXAM_TYPE_LABEL } from '@/lib/client'
import { History, ChevronLeft, ClipboardList } from 'lucide-react'

type AttemptRow = {
  id: string
  examId: string
  examTitle: string
  examType: string
  examCategory: string | null
  score: number | null
  correctCount: number | null
  wrongCount: number | null
  skippedCount: number | null
  timeSpentSeconds: number | null
  completedAt: string
}

export function HistoryView() {
  const [rows, setRows] = useState<AttemptRow[] | null>(null)

  useEffect(() => {
    api<{ attempts: AttemptRow[] }>('/api/attempts')
      .then((d) => setRows(d.attempts))
      .catch(() => setRows([]))
  }, [])

  const avg = rows && rows.length ? Math.round(rows.reduce((a, b) => a + (b.score || 0), 0) / rows.length) : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-5 fade-up pb-20 md:pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <History className="h-6 w-6 text-primary" /> سجل المحاولات
        </h1>
        {rows && rows.length > 0 && (
          <Badge variant="secondary" className="text-sm px-3 py-1 tabular-nums">
            المتوسط العام: {avg}%
          </Badge>
        )}
      </div>

      {rows === null ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">لم تخُض أي اختبار حتى الآن.</p>
            <Button onClick={() => navigate('/exams')}>استعرض اختبارات المحاكاة</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <button key={r.id} onClick={() => navigate(`/result/${r.id}`)} className="w-full text-right">
              <Card className="hover:shadow-md hover:border-primary/40 transition-all">
                <CardContent className="p-4 md:p-5 flex items-center gap-4">
                  <div className={`text-2xl font-extrabold tabular-nums w-16 text-center shrink-0 ${scoreColor(r.score || 0)}`}>
                    {Math.round(r.score || 0)}%
                  </div>
                  <div className="flex-1 min-w-0 border-r pr-4">
                    <p className="font-bold truncate">{r.examTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>{EXAM_TYPE_LABEL[r.examType]}</span>
                      <span className="tabular-nums">
                        ✓ {r.correctCount ?? 0} ✗ {r.wrongCount ?? 0} — {r.skippedCount ?? 0} متروكة
                      </span>
                      <span className="tabular-nums">{r.timeSpentSeconds ? formatDuration(r.timeSpentSeconds) : ''}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-left flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:block">{timeAgo(r.completedAt)}</span>
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
