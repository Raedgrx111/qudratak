'use client'

import { useEffect, useState } from 'react'
import { useSession, navigate, parseRoute } from '@/lib/client'
import { Landing } from '@/components/platform/landing'
import { AuthView } from '@/components/platform/auth'
import { VerifyEmailPage } from '@/components/platform/verify'
import { Dashboard } from '@/components/platform/dashboard'
import { Practice } from '@/components/platform/practice'
import { QuestionDetail } from '@/components/platform/question-detail'
import { ExamsList } from '@/components/platform/exams'
import { ExamRunner } from '@/components/platform/exam-runner'
import { ExamResult } from '@/components/platform/exam-result'
import { HistoryView } from '@/components/platform/history'
import { AITutor } from '@/components/platform/ai-tutor'
import { Favorites } from '@/components/platform/favorites'
import { ProfileView } from '@/components/platform/profile'
import { AdminView } from '@/components/platform/admin'
import { Leaderboard } from '@/components/platform/leaderboard'
import { EventsPage } from '@/components/platform/events'
import { ClipsPage, ClipWatchPage } from '@/components/platform/clips'
import { Navbar, Footer, MobileNav } from '@/components/platform/layout'
import { Loader2 } from 'lucide-react'

export function App() {
  const [route, setRoute] = useState(() => (typeof window === 'undefined' ? { path: '/', segments: [], query: new URLSearchParams() } : parseRoute()))
  const { user, loading, refresh } = useSession()

  useEffect(() => {
    const onRoute = () => {
      setRoute(parseRoute())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('popstate', onRoute)
    refresh()
    return () => window.removeEventListener('popstate', onRoute)
  }, [refresh])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <Loader2 className="h-7 w-7 text-primary-foreground animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">جارٍ تحميل قدراتك...</p>
        </div>
      </div>
    )
  }

  const render = () => {
    const seg = route.segments
    if (seg.length === 0) return <Landing />
    switch (seg[0]) {
      case 'login':
        return <AuthView key="auth-login" mode="login" />
      case 'register':
        return <AuthView key="auth-register" mode="register" />
      case 'verify':
        return user ? <VerifyEmailPage /> : <AuthView key="auth-verify" mode="login" redirect="/verify" />
      case 'dashboard':
        return user ? <Dashboard /> : <AuthView key="auth-dashboard" mode="login" redirect="/dashboard" />
      case 'practice':
        return <Practice />
      case 'q':
        return seg[1] ? <QuestionDetail id={seg[1]} /> : <Practice />
      case 'exams':
        return <ExamsList />
      case 'run':
        return seg[1] ? <ExamRunner attemptId={seg[1]} /> : <ExamsList />
      case 'result':
        return seg[1] ? <ExamResult attemptId={seg[1]} /> : <ExamsList />
      case 'results':
        return user ? <HistoryView /> : <AuthView key="auth-results" mode="login" redirect="/results" />
      case 'ai':
        return user ? <AITutor /> : <AuthView key="auth-ai" mode="login" redirect="/ai" />
      case 'leaderboard':
        return <Leaderboard />
      case 'events':
        return <EventsPage />
      case 'clips':
        return seg[1] ? <ClipWatchPage key={seg[1]} id={seg[1]} /> : <ClipsPage />
      case 'favorites':
        return user ? <Favorites /> : <AuthView key="auth-favorites" mode="login" redirect="/favorites" />
      case 'profile':
        return user ? <ProfileView /> : <AuthView key="auth-profile" mode="login" redirect="/profile" />
      case 'admin': {
        const isStaff = user?.role === 'TEACHER' || user?.role === 'OWNER'
        // مرادفات الروابط: tracking = تتبع الحسابات، users = الطلاب
        const tabAlias = seg[1] === 'tracking' ? 'accounts' : seg[1] === 'users' ? 'students' : seg[1]
        return isStaff ? <AdminView tab={tabAlias} /> : <AuthView key="auth-admin" mode="login" redirect="/admin" />
      }
      default:
        return <Landing />
    }
  }

  const isLanding = route.segments.length === 0
  const isAuth = route.segments[0] === 'login' || route.segments[0] === 'register'
  const isExamRun = route.segments[0] === 'run'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {isExamRun ? (
        render()
      ) : (
        <>
          <Navbar />
          <main className="flex-1">{render()}</main>
          {!isLanding && <MobileNav />}
          <Footer compact={!isLanding && !isAuth} />
        </>
      )}
    </div>
  )
}

export function EmptyState({ icon, title, subtitle, action }: { icon?: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
      {icon && <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-bold">{title}</h3>
      {subtitle && <p className="text-sm text-muted-foreground max-w-md">{subtitle}</p>}
      {action}
    </div>
  )
}
