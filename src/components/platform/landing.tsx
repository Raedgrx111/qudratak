'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useSession, navigate } from '@/lib/client'
import {
  GraduationCap,
  Timer,
  BarChart3,
  MessageCircle,
  Bot,
  Upload,
  Target,
  TrendingUp,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  BookOpenCheck,
  Users,
} from 'lucide-react'
import { motion } from 'framer-motion'

const FEATURES = [
  {
    icon: BookOpenCheck,
    title: 'بنك أسئلة ضخم',
    desc: 'أكثر من 1,300 سؤال كمي ولفظي مصنفة بعناية حسب الموضوع ومستوى الصعوبة، مع شرح تفصيلي لكل حل.',
  },
  {
    icon: Timer,
    title: 'اختبارات محاكاة واقعية',
    desc: 'اختبارات بمؤقت حقيقي وأسئلة عشوائية بأسلوب قياس، مع تصحيح آلي فوري وتحليل شامل للنتيجة.',
  },
  {
    icon: BarChart3,
    title: 'تحليل أداء ذكي',
    desc: 'رسوم تقدم أسبوعية، كشف نقاط الضعف بالمواضيع، وتوصيات تدريب مخصصة لرفع درجتك.',
  },
  {
    icon: MessageCircle,
    title: 'نقاشات أسفل كل سؤال',
    desc: 'اسأل، ناقش، وأعجب بالشروحات المفيدة — والمعلمون يثبتون أهم الملاحظات لك.',
  },
  {
    icon: Bot,
    title: 'مساعد ذكي 24/7',
    desc: 'مدرّب بالذكاء الاصطناعي يشرح الحلول، يقترح استراتيجيات سريعة، ويساعدك على فهم أخطائك.',
  },
  {
    icon: Upload,
    title: 'استيراد آلاف الأسئلة',
    desc: 'للمعلمين: ارفع ملف Excel/CSV بأي عدد من الأسئلة فتُضاف للبنك فورًا مع تحقق كامل من البيانات.',
  },
]

const STEPS = [
  { n: '1', title: 'أنشئ حسابك', desc: 'تسجيل مجاني في أقل من دقيقة' },
  { n: '2', title: 'حدد مستواك', desc: 'ابدأ باختبار محاكاة شامل لكشف نقاط بدايتك' },
  { n: '3', title: 'تدرّب بذكاء', desc: 'تدريب حر مركّز على نقاط ضعفك + اختبارات دورية' },
  { n: '4', title: 'تابع تقدمك', desc: 'لوحة تحليلية حية حتى تصل لدرجتك المستهدفة' },
]

export function Landing() {
  const { user } = useSession()

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[400px] rounded-full bg-primary/10 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-right"
            >
              <Badge variant="secondary" className="mb-5 gap-1.5 px-3 py-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                منصة سعودية متخصصة في اختبار القدرات العامة
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.15] mb-6">
                درجتك في <span className="brand-gradient">القدرات</span>
                <br />
                تبدأ من هنا
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                تدرّب على آلاف الأسئلة الحقيقية، خُض اختبارات محاكاة بمؤقت، وحلّل أداءك
                بدقة — ثم اترك لنا الباقي: نقاط ضعفك تُكشف تلقائيًا وتُقترح لك خطة تدريب.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                {user ? (
                  <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate('/dashboard')}>
                    <LayoutDashboardIcon /> لوحتي التعليمية
                  </Button>
                ) : (
                  <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate('/register')}>
                    <GraduationCap className="h-5 w-5" />
                    ابدأ مجانًا الآن
                  </Button>
                )}
                <Button size="lg" variant="outline" className="h-12 px-8 text-base" onClick={() => navigate('/exams')}>
                  استعرض الاختبارات
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> تسجيل مجاني
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> بدون بطاقة ائتمانية
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> محتوى عربي كامل
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative"
            >
              <Card className="border-2 shadow-xl">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">نموذج من لوحة الطالب</p>
                      <p className="font-bold text-lg">عبدالله الم.</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-0">
                      دقة 91%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: Target, label: 'حللت', value: '192' },
                      { icon: TrendingUp, label: 'دقتك', value: '91%' },
                      { icon: ClipboardIcon, label: 'اختبارات', value: '4' },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl border p-3 text-center bg-background">
                        <s.icon className="h-4 w-4 mx-auto text-primary mb-1.5" />
                        <p className="text-xl font-extrabold tabular-nums">{s.value}</p>
                        <p className="text-[11px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border p-4 bg-background">
                    <p className="text-xs font-medium text-muted-foreground mb-3">دقتك خلال 14 يومًا</p>
                    <div className="flex items-end gap-1.5 h-20">
                      {[55, 62, 58, 70, 66, 74, 71, 79, 82, 78, 85, 88, 90, 91].map((v, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-primary/80 hover:bg-primary transition-colors"
                          style={{ height: `${v}%` }}
                          title={`${v}%`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900 p-3.5">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">📍 توصية اليوم</p>
                    <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      دقتك في «المقارنات الكمية» 58% — خُض تدريب مكثف من 15 سؤالًا اليوم.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y bg-card">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '+1,300', label: 'سؤال تدريبي' },
            { value: '6', label: 'اختبارات محاكاة' },
            { value: '16', label: 'موضوعًا متخصصًا' },
            { value: '24/7', label: 'مساعد ذكي' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-primary tabular-nums">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">كل ما تحتاجه للتفوق في مكان واحد</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            بنينا قدراتك لتكون رفيقك اليومي في رحلة الاستعداد — من أول سؤال تحله حتى يوم الاختبار الحقيقي.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border">
                <CardContent className="p-6">
                  <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4">
                    <f.icon className="h-5.5 w-5.5 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/50 border-y">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">رحلتك في 4 خطوات</h2>
            <p className="text-muted-foreground">من التسجيل إلى الدرجة التي تستحقها</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="relative bg-card rounded-2xl border p-6 text-center">
                <span className="absolute -top-3.5 right-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-sm shadow">
                  {s.n}
                </span>
                <h3 className="font-bold mt-3 mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-primary to-emerald-700 text-primary-foreground p-10 md:p-16 text-center">
          <Users className="absolute -bottom-8 -left-8 h-48 w-48 opacity-10" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">جاهز لبدء رحلتك نحو الجامعة التي تحلم بها؟</h2>
          <p className="text-primary-foreground/85 max-w-xl mx-auto mb-8 leading-relaxed">
            انضم الآن مجانًا وخُض أول اختبار محاكاة اليوم. حسابك يمنحك بنك الأسئلة الكامل،
            النقاشات، والمساعد الذكي — بلا حدود.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="h-12 px-10 text-base font-bold bg-white text-emerald-800 hover:bg-emerald-50"
            onClick={() => navigate(user ? '/dashboard' : '/register')}
          >
            {user ? 'الذهاب إلى لوحتي' : 'إنشاء حسابي المجاني'}
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  )
}

function LayoutDashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 ml-1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  )
}
