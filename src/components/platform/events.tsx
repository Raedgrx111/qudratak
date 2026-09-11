'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { api, EVENT_TYPE_LABEL, EVENT_TYPE_STYLE, formatDate, timeAgo } from '@/lib/client'
import { cn } from '@/lib/utils'
import { CalendarDays, Megaphone, Lightbulb, Trophy, Newspaper, Clock } from 'lucide-react'

type EventItem = {
  id: string
  title: string
  body: string
  type: string
  startsAt: string | null
  createdAt: string
  creator?: { name: string } | null
}

const TYPE_ICON: Record<string, typeof Megaphone> = {
  NEWS: Newspaper,
  EVENT: CalendarDays,
  COMPETITION: Trophy,
  TIP: Lightbulb,
}

export function EventsPage() {
  const [events, setEvents] = useState<EventItem[] | null>(null)

  useEffect(() => {
    api<{ events: EventItem[] }>('/api/events')
      .then((d) => setEvents(d.events))
      .catch(() => setEvents([]))
  }, [])

  if (!events) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-20 w-full" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 fade-up pb-20 md:pb-8">
      <div className="mb-7">
        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2.5">
          <span className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="h-6 w-6 text-primary" />
          </span>
          الأحداث والنشاطات
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          إعلانات المنصة، المسابقات، البثوث المباشرة ونصائح الفريق التعليمي.
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-3">
            <Megaphone className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <h3 className="font-bold text-lg">لا توجد أحداث حاليًا</h3>
            <p className="text-sm text-muted-foreground">تابعنا قريبًا — تُنشر هنا المسابقات والجلسات التدريبية الجديدة.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((e) => {
            const Icon = TYPE_ICON[e.type] || Newspaper
            return (
              <Card key={e.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                        EVENT_TYPE_STYLE[e.type] || EVENT_TYPE_STYLE.NEWS
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge className={cn('text-[10px] border-0', EVENT_TYPE_STYLE[e.type] || EVENT_TYPE_STYLE.NEWS)}>
                          {EVENT_TYPE_LABEL[e.type] || e.type}
                        </Badge>
                        {e.startsAt && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                            <Clock className="h-3 w-3" />
                            {formatDate(e.startsAt)}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">نُشر {timeAgo(e.createdAt)}</span>
                      </div>
                      <h3 className="font-extrabold text-base mb-1.5 leading-snug">{e.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{e.body}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
