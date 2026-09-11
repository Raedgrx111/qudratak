'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { api, navigate, timeAgo, useSession } from '@/lib/client'
import { cn } from '@/lib/utils'
import { ThumbsUp, Pin, Trash2, CornerDownLeft, Loader2, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

export type CommentData = {
  id: string
  text: string
  isPinned: boolean
  createdAt: string
  user: { id: string; name: string; role: string }
  likeCount: number
  likedByMe: boolean
  replies: CommentData[]
}

export function CommentsSection({ questionId, onChange }: { questionId: string; onChange?: (count: number) => void }) {
  const { user } = useSession()
  const [comments, setComments] = useState<CommentData[] | null>(null)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<CommentData | null>(null)
  const [sending, setSending] = useState(false)

  const load = async () => {
    try {
      const data = await api<{ comments: CommentData[] }>(`/api/questions/${questionId}/comments`)
      setComments(data.comments)
      onChange?.(data.comments.length)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر تحميل النقاش')
      setComments([])
    }
  }

  useEffect(() => {
    load()

  }, [questionId])

  const submit = async () => {
    if (!text.trim()) return
    if (!user) {
      toast.info('سجّل الدخول للمشاركة في النقاش')
      return
    }
    setSending(true)
    try {
      await api(`/api/questions/${questionId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: text.trim(), parentId: replyTo?.id || null }),
      })
      setText('')
      setReplyTo(null)
      toast.success(replyTo ? 'أُضيف ردك بنجاح' : 'أُضيف تعليقك بنجاح')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر الإرسال')
    } finally {
      setSending(false)
    }
  }

  const toggleLike = async (c: CommentData) => {
    if (!user) {
      toast.info('سجّل الدخول للإعجاب بالشروحات')
      return
    }
    try {
      const res = await api<{ liked: boolean; likeCount: number }>(`/api/comments/${c.id}/like`, { method: 'POST' })
      setComments((prev) =>
        prev
          ? prev.map(updateTree(c.id, (node) => ({ ...node, likedByMe: res.liked, likeCount: res.likeCount })))
          : prev
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر التحديث')
    }
  }

  const togglePin = async (c: CommentData) => {
    try {
      await api(`/api/comments/${c.id}`, { method: 'PATCH', body: JSON.stringify({ isPinned: !c.isPinned }) })
      toast.success(c.isPinned ? 'أُلغي التثبيت' : 'ثُبّت التعليق في الأعلى 📌')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر التحديث')
    }
  }

  const remove = async (c: CommentData) => {
    try {
      await api(`/api/comments/${c.id}`, { method: 'DELETE' })
      toast.success('حُذف التعليق')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر الحذف')
    }
  }

  if (comments === null) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-5/6" />
        <Skeleton className="h-16 w-4/6" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Composer */}
      {user ? (
        <div className="rounded-xl border bg-card p-3.5 space-y-3">
          {replyTo && (
            <div className="flex items-center justify-between text-xs bg-muted rounded-lg px-3 py-2">
              <span>
                ترد على <b>{replyTo.user.name}</b>: «{replyTo.text.slice(0, 60)}{replyTo.text.length > 60 ? '…' : ''}»
              </span>
              <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground">
                إلغاء
              </button>
            </div>
          )}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="شارك فكرة، اطرح سؤالًا، أو اكتب ملاحظة تفيد زملاءك..."
            rows={3}
            className="resize-none"
            maxLength={2000}
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground tabular-nums">{text.length}/2000</span>
            <Button size="sm" onClick={submit} disabled={sending || !text.trim()} className="gap-1.5">
              {sending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {replyTo ? 'إرسال الرد' : 'نشر التعليق'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          <MessageCircle className="h-5 w-5 inline ml-1.5 text-primary" />
          <button onClick={() => navigate('/login')} className="font-bold text-primary hover:underline">
            سجّل الدخول
          </button>{' '}
          للمشاركة في النقاش
        </div>
      )}

      {/* List */}
      {comments.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          لا توجد تعليقات بعد — كن أول من يفتح النقاش!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              user={user}
              depth={0}
              onLike={toggleLike}
              onReply={(r) => {
                if (!user) {
                  toast.info('سجّل الدخول للمشاركة')
                  return
                }
                setReplyTo(r)
                document.getElementById('comment-composer')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
              onPin={togglePin}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function updateTree(id: string, fn: (c: CommentData) => CommentData) {
  return (node: CommentData): CommentData => {
    if (node.id === id) return fn(node)
    if (node.replies.length) return { ...node, replies: node.replies.map(updateTree(id, fn)) }
    return node
  }
}

function CommentNode({
  comment,
  user,
  depth,
  onLike,
  onReply,
  onPin,
  onDelete,
}: {
  comment: CommentData
  user: { id: string; role: string } | null
  depth: number
  onLike: (c: CommentData) => void
  onReply: (c: CommentData) => void
  onPin: (c: CommentData) => void
  onDelete: (c: CommentData) => void
}) {
  const isStaffComment = comment.user.role === 'TEACHER' || comment.user.role === 'OWNER'
  const canModerate = user?.role === 'TEACHER' || user?.role === 'OWNER'
  const canDelete = canModerate || user?.id === comment.user.id

  return (
    <div className={cn('rounded-xl border bg-card p-4', depth > 0 && 'mr-5 md:mr-8 border-r-2 border-r-primary/20')}>
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback
            className={cn(
              'text-sm font-bold',
              isStaffComment ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : 'bg-secondary text-secondary-foreground'
            )}
          >
            {comment.user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">{comment.user.name}</span>
            {isStaffComment && (
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-0 text-[10px] px-1.5 h-4.5">
                {comment.user.role === 'OWNER' ? 'مالك المنصة' : 'معلم'}
              </Badge>
            )}
            {comment.isPinned && (
              <Badge variant="outline" className="gap-1 text-[10px] px-1.5 h-4.5 border-primary/40 text-primary">
                <Pin className="h-3 w-3" /> مثبّت
              </Badge>
            )}
            <span className="text-[11px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm leading-relaxed mt-1.5 whitespace-pre-line">{comment.text}</p>
          <div className="flex items-center gap-1 mt-2 -ml-2">
            <Button
              size="sm"
              variant="ghost"
              className={cn('h-7 gap-1 text-xs', comment.likedByMe && 'text-primary')}
              onClick={() => onLike(comment)}
              aria-label="إعجاب"
            >
              <ThumbsUp className={cn('h-3.5 w-3.5', comment.likedByMe && 'fill-current')} />
              {comment.likeCount > 0 && <span className="tabular-nums">{comment.likeCount}</span>}
            </Button>
            {depth === 0 && (
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => onReply(comment)}>
                <CornerDownLeft className="h-3.5 w-3.5" /> رد
              </Button>
            )}
            {canModerate && (
              <Button
                size="sm"
                variant="ghost"
                className={cn('h-7 gap-1 text-xs', comment.isPinned ? 'text-primary' : 'text-muted-foreground')}
                onClick={() => onPin(comment)}
              >
                <Pin className="h-3.5 w-3.5" />
                {comment.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
                onClick={() => onDelete(comment)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((r) => (
            <CommentNode
              key={r.id}
              comment={r}
              user={user}
              depth={depth + 1}
              onLike={onLike}
              onReply={onReply}
              onPin={onPin}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
