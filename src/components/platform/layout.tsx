'use client'

import { useSession, navigate } from '@/lib/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GraduationCap, LayoutDashboard, BookOpen, ClipboardList, Bot, Heart, History, User as UserIcon, ShieldCheck, LogOut, Trophy, Crown, CalendarDays, MonitorPlay } from 'lucide-react'
import { cn } from '@/lib/utils'

// رابط داخلي يتنقل عبر الراوتر بدون إعادة تحميل الصفحة (مع دعم فتح بتبويب جديد بالموديفايرز)
function Link({ href, className, children, ariaLabel }: { href: string; className?: string; children: React.ReactNode; ariaLabel?: string }) {
  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
        e.preventDefault()
        navigate(href)
      }}
    >
      {children}
    </a>
  )
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 select-none"
      ariaLabel="قدراتك - الصفحة الرئيسية"
    >
      <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
        <GraduationCap className="h-5 w-5 text-primary-foreground" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-lg font-extrabold text-foreground">قدراتك</span>
          <span className="block text-[10px] font-medium text-muted-foreground tracking-wide">QUDRATAK · تدريب قدرات</span>
        </span>
      )}
    </Link>
  )
}

const STUDENT_NAV = [
  { href: '/dashboard', label: 'لوحتي', icon: LayoutDashboard },
  { href: '/practice', label: 'تدريب', icon: BookOpen },
  { href: '/exams', label: 'اختبارات', icon: ClipboardList },
  { href: '/leaderboard', label: 'المتصدرون', icon: Trophy },
  { href: '/ai', label: 'المساعد', icon: Bot },
]

const MOBILE_NAV = [
  { href: '/dashboard', label: 'لوحتي', icon: LayoutDashboard },
  { href: '/practice', label: 'تدريب', icon: BookOpen },
  { href: '/leaderboard', label: 'المتصدرون', icon: Trophy },
  { href: '/exams', label: 'اختبارات', icon: ClipboardList },
  { href: '/ai', label: 'المساعد', icon: Bot },
]

export function Navbar() {
  const { user, logout } = useSession()
  const current = typeof window !== 'undefined' ? window.location.pathname : '/'

  const isActive = (href: string) => current.startsWith(href)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Logo />
          {user && (
            <nav className="hidden md:flex items-center gap-1" aria-label="التنقل الرئيسي">
              {STUDENT_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              {(user.role === 'TEACHER' || user.role === 'OWNER') && (
                <Link
                  href="/admin"
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors',
                    isActive('/admin')
                      ? user.role === 'OWNER'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-secondary text-secondary-foreground'
                      : user.role === 'OWNER'
                        ? 'text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/50'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {user.role === 'OWNER' ? (
                    <>
                      <Crown className="h-4 w-4" />
                      لوحة المالك
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      لوحة المعلم
                    </>
                  )}
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                دخول
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                ابدأ مجانًا
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-muted transition-colors" aria-label="قائمة المستخدم">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium max-w-28 truncate">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>
                  <div className="font-bold">{user.name}</div>
                  <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                  <div className="text-[10px] font-normal mt-1 inline-block px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                    {user.role === 'OWNER' ? '👑 مالك المنصة' : user.role === 'TEACHER' ? 'معلم' : 'طالب'}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserIcon className="h-4 w-4 ml-2" /> الملف الشخصي
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/results')}>
                  <History className="h-4 w-4 ml-2" /> سجل المحاولات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/favorites')}>
                  <Heart className="h-4 w-4 ml-2" /> الأسئلة المفضلة
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/events')}>
                  <CalendarDays className="h-4 w-4 ml-2" /> الأحداث والنشاطات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/clips')}>
                  <MonitorPlay className="h-4 w-4 ml-2" /> المقاطع التعليمية
                </DropdownMenuItem>
                {(user.role === 'TEACHER' || user.role === 'OWNER') && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    {user.role === 'OWNER' ? (
                      <Crown className="h-4 w-4 ml-2 text-amber-500" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 ml-2" />
                    )}
                    {user.role === 'OWNER' ? 'لوحة المالك' : 'لوحة المعلم'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout()
                    navigate('/')
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 ml-2" /> تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}

export function MobileNav() {
  const { user } = useSession()
  if (!user) return null
  const current = typeof window !== 'undefined' ? window.location.pathname : '/'
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      aria-label="التنقل السفلي"
    >
      <div className="grid grid-cols-5">
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
              current.startsWith(item.href) ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className={cn('mx-auto px-4', compact ? 'max-w-7xl py-5' : 'max-w-7xl py-10')}>
        {!compact && (
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <Logo />
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
                منصة سعودية لتدريب الطلاب على اختبار القدرات العامة (قياس) بأدوات ذكية وتحليل دقيق للأداء.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">روابط سريعة</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/practice" className="hover:text-foreground">تدريب حر</Link></li>
                <li><Link href="/exams" className="hover:text-foreground">اختبارات المحاكاة</Link></li>
                <li><Link href="/leaderboard" className="hover:text-foreground">قائمة المتصدرين</Link></li>
                <li><Link href="/events" className="hover:text-foreground">الأحداث والنشاطات</Link></li>
                <li><Link href="/clips" className="hover:text-foreground">المقاطع التعليمية</Link></li>
                <li><Link href="/ai" className="hover:text-foreground">المساعد الذكي</Link></li>
                <li><Link href="/register" className="hover:text-foreground">إنشاء حساب</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-3">لماذا قدراتك؟</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>+1,300 سؤال مصنف بالمواضيع والمستويات</li>
                <li>اختبارات محاكاة بمؤقت واقعي</li>
                <li>تحليل فوري لنقاط الضعف</li>
                <li>قائمة صدارة حقيقية بالنتائج الفعلية</li>
              </ul>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} قدراتك — جميع الحقوق محفوظة</p>
          <p>صُنعت بشغف لدعم طلاب المملكة 🇸🇦</p>
        </div>
      </div>
    </footer>
  )
}
