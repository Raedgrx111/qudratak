'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/client'
import { cn } from '@/lib/utils'
import { Bot, Send, Loader2, Sparkles, Lightbulb, GraduationCap, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

type Msg = { role: 'user' | 'assistant'; content: string }

const QUICK_PROMPTS = [
  { icon: Lightbulb, label: 'أعطني استراتيجية للتناظر اللفظي', text: 'ما أفضل استراتيجية لحل أسئلة التناظر اللفظي بسرعة في الاختبار؟' },
  { icon: Sparkles, label: 'كيف أحل المقارنات الكمية؟', text: 'اشرح لي استراتيجية حل المقارنات الكمية خطوة بخطوة مع مثال.' },
  { icon: GraduationCap, label: 'خطة مراجعة أسبوع', text: 'اقترح لي خطة مراجعة مكثفة لأسبوع واحد قبل اختبار القدرات، موزعة يوميًا.' },
  { icon: Bot, label: 'أخطاء شائعة يجب تجنبها', text: 'ما أكثر الأخطاء الشائعة التي يقع فيها الطلاب في قسم الجبر؟ وكيف أتجنبها؟' },
]

export function AITutor() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        'أهلًا بك! أنا مدرّب قدراتك الذكي 🎓\n\nهنا لأساعدك في:\n• شرح حلول الأسئلة خطوة بخطوة\n• استراتيجيات سريعة للإجابة تحت ضغط الوقت\n• فهم أخطائك وتصحيح مفاهيمك\n\nاسألني أي شيء عن القسم الكمي أو اللفظي!',
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || sending) return
    setInput('')
    const newMessages: Msg[] = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setSending(true)
    try {
      const res = await api<{ reply: string }>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: content, history: messages.slice(-10) }),
      })
      setMessages((m) => [...m, { role: 'assistant', content: res.reply }])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر الاتصال بالمساعد')
      setMessages((m) => [...m, { role: 'assistant', content: 'عذرًا، حدث خلل تقني. جرّب مرة أخرى بعد قليل.' }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col fade-up" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold">مدرّب قدراتك الذكي</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> متصل — يجيب فورًا
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            setMessages([
              {
                role: 'assistant',
                content: 'محادثة جديدة! اسألني عن أي سؤال أو موضوع في اختبار القدرات 📚',
              },
            ])
          }
        >
          <RotateCcw className="h-3.5 w-3.5" /> محادثة جديدة
        </Button>
      </div>

      {/* Messages */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-scroll">
          {messages.map((m, i) => (
            <div key={i} className={cn('flex', m.role === 'user' ? 'justify-start' : 'justify-end')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line',
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted rounded-bl-sm'
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-end">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> المدرّب يفكر...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q.label}
                onClick={() => send(q.text)}
                className="flex items-center gap-2 rounded-xl border p-3 text-right text-xs font-medium hover:bg-muted hover:border-primary/40 transition-colors"
              >
                <q.icon className="h-4 w-4 text-amber-500 shrink-0" />
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t p-3 flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="اكتب سؤالك هنا... (مثال: اشرح لي كيف أحل معادلات من الدرجة الأولى)"
            rows={1}
            className="resize-none min-h-11 max-h-32"
            disabled={sending}
          />
          <Button size="icon" className="h-11 w-11 shrink-0" onClick={() => send()} disabled={sending || !input.trim()} aria-label="إرسال">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
