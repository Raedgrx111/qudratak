// فحص وجود صندوق البريد فعليًا على خادم البريد (SMTP Mailbox Probe)
// ------------------------------------------------------------------
// الفكرة: نتصل بخادم MX للنطاق ونحاكي إرسال رسالة حتى مرحلة RCPT TO —
// إن رد الخادم "550 user unknown" فهذا البريد غير موجود أصلًا (عشوائي).
// هذا أقوى فحص ممكن قبل الإرسال الفعلي، ويعمل مع Gmail وOutlook ومعظم
// الخوادم الحقيقية (خوادم Accept-All قليلة وستمر fail-open).
//
// ملاحظات تشغيلية:
// - يعتمد على المنفذ 25 الصادر — بعض بيئات الاستضافة تحجبه، لذا:
//   fail-open دائم عند الفشل (لا نحجب بريدًا حقيقيًا بسبب شبكتنا)
// - قاطع دائرة: 3 فشلات اتصال متتالية → تعطيل الفحص 10 دقائق (تجنب بطء التسجيل بلا فائدة)
// - كاش النتائج 24 ساعة (والغموض 5 دقائق) حتى لا نُثقل خوادم البريد
// - يمكن تعطيله كليًا بمتغير البيئة MAILBOX_PROBE=off
import dns from 'dns'
import net from 'net'

export type ProbeResult = 'exists' | 'not-found' | 'unknown'

const HELO_DOMAIN = process.env.MAIL_HELO_DOMAIN || 'qudratak.sa'
const MAIL_FROM = `no-reply@${HELO_DOMAIN}`
const CONNECT_TIMEOUT_MS = 3_000 // لكل خادم MX
const OVERALL_BUDGET_MS = 7_000 // سقف الفحص كاملًا حتى لا يبطئ التسجيل
const MAX_MX_HOSTS = 2

// ---- كاش النتائج (منع إثقال خوادم البريد وتسريع التكرارات) ----
const cache = new Map<string, { result: ProbeResult; at: number }>()
const CACHE_OK_TTL = 24 * 3_600_000 // نتيجة حاسمة تُعتبر صالحة 24 ساعة
const CACHE_UNKNOWN_TTL = 5 * 60_000 // الغموض يعاد فحصه بعد 5 دقائق
const MAX_CACHE = 20_000
let lastCacheSweep = 0

function cacheSet(key: string, result: ProbeResult) {
  const now = Date.now()
  if (now - lastCacheSweep > 60_000) {
    lastCacheSweep = now
    for (const [k, v] of cache) {
      const ttl = v.result === 'unknown' ? CACHE_UNKNOWN_TTL : CACHE_OK_TTL
      if (now - v.at > ttl) cache.delete(k)
    }
    if (cache.size > MAX_CACHE) for (const k of [...cache.keys()].slice(0, 5_000)) cache.delete(k)
  }
  cache.set(key, { result, at: now })
}

// ---- قاطع الدائرة: بيئة تحجب المنفذ 25 → توقف المحاولات مؤقتًا ----
let consecutiveNetworkFails = 0
let probeDisabledUntil = 0
const BREAKER_THRESHOLD = 3
const BREAKER_COOLDOWN_MS = 10 * 60_000

/** تفسير رد الخادم على RCPT TO */
export function interpretRcpt(line: string): ProbeResult {
  const code = line.slice(0, 3)
  const low = line.toLowerCase()
  if (code === '250' || code === '251') return 'exists'
  if (code.startsWith('5')) {
    // استثناءات: الرفض بسبب سياستنا نحن (HELO/SPF/Relay) لا بسبب عدم وجود الصندوق
    if (
      low.includes('relay access denied') ||
      low.includes('authentication required') ||
      low.includes('helo') ||
      low.includes('list of allowed') ||
      low.includes('blacklist') ||
      low.includes('spam')
    ) {
      return 'unknown'
    }
    if (
      ['550', '551', '553'].includes(code) ||
      low.includes('5.1.1') ||
      low.includes('5.1.6') ||
      low.includes('5.1.10') ||
      low.includes('user unknown') ||
      low.includes('unknown user') ||
      low.includes('does not exist') ||
      low.includes('no such') ||
      low.includes('invalid mailbox') ||
      low.includes('recipient not found') ||
      low.includes('recipient rejected')
    ) {
      return 'not-found'
    }
  }
  return 'unknown'
}

/** محاولة واحدة مع خادم MX محدد — تعيد النتيجة أو unknown عند عجز الاتصال */
function tryHost(host: string, email: string, deadline: number): Promise<ProbeResult> {
  return new Promise((resolve) => {
    let stage: 'banner' | 'ehlo' | 'mailfrom' | 'rcpt' = 'banner'
    let buf = ''
    let settled = false

    const socket = net.createConnection({ host, port: 25 })
    const finish = (r: ProbeResult) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try {
        if (!socket.destroyed) socket.write('QUIT\r\n')
      } catch {}
      socket.destroy()
      resolve(r)
    }
    const timer = setTimeout(() => finish('unknown'), Math.max(500, deadline - Date.now()))

    socket.setTimeout(CONNECT_TIMEOUT_MS, () => finish('unknown'))
    socket.on('error', () => finish('unknown'))
    socket.on('data', (chunk: Buffer) => {
      if (settled) return
      buf += chunk.toString()
      let idx: number
      while ((idx = buf.indexOf('\r\n')) !== -1 && !settled) {
        const line = buf.slice(0, idx)
        buf = buf.slice(idx + 2)
        const code = line.slice(0, 3)
        const isFinalLine = line[3] === ' ' || line.length === 3

        if (stage === 'banner') {
          if (code === '220' && isFinalLine) {
            stage = 'ehlo'
            socket.write(`EHLO ${HELO_DOMAIN}\r\n`)
          } else if (isFinalLine) return finish('unknown')
        } else if (stage === 'ehlo') {
          if (isFinalLine && code === '250') {
            stage = 'mailfrom'
            socket.write(`MAIL FROM:<${MAIL_FROM}>\r\n`)
          } else if (isFinalLine) return finish('unknown')
        } else if (stage === 'mailfrom') {
          if (isFinalLine && code === '250') {
            stage = 'rcpt'
            socket.write(`RCPT TO:<${email}>\r\n`)
          } else if (isFinalLine) return finish('unknown')
        } else if (stage === 'rcpt') {
          return finish(interpretRcpt(line))
        }
      }
    })
  })
}

/**
 * هل صندوق البريد موجود فعلًا؟
 * exists/not-found = إجابة حاسمة من خادم البريد — unknown = تعذر الفحص (نمرّر)
 */
export async function probeMailbox(email: string): Promise<ProbeResult> {
  if (process.env.MAILBOX_PROBE === 'off') return 'unknown'

  const now = Date.now()
  if (now < probeDisabledUntil) return 'unknown' // قاطع الدائرة مفعل — المنفذ محجوب

  const hit = cache.get(email)
  if (hit) {
    const ttl = hit.result === 'unknown' ? CACHE_UNKNOWN_TTL : CACHE_OK_TTL
    if (now - hit.at <= ttl) return hit.result
    cache.delete(email)
  }

  // نطاقات المتصفحات الكبرى ترفض الصناديق المجهولة — أي فحص لغيرها أقل فائدة لكنه آمن
  let mxHosts: string[] = []
  try {
    const records = await dns.promises.resolveMx(email.split('@')[1] || '')
    mxHosts = records.sort((a, b) => a.priority - b.priority).slice(0, MAX_MX_HOSTS).map((r) => r.exchange)
  } catch {
    return 'unknown' // لا MX — يُعالج في فحص النطاق قبلنا
  }
  if (mxHosts.length === 0) return 'unknown'

  const deadline = now + OVERALL_BUDGET_MS
  let result: ProbeResult = 'unknown'
  for (const host of mxHosts) {
    result = await tryHost(host, email, deadline)
    if (result !== 'unknown') break
  }

  if (result === 'unknown') {
    // فشل اتصال شبكي — نعدّه دليل حجب المنفذ وندفع قاطع الدائرة
    consecutiveNetworkFails++
    if (consecutiveNetworkFails >= BREAKER_THRESHOLD) {
      probeDisabledUntil = Date.now() + BREAKER_COOLDOWN_MS
      console.warn('[mailbox-probe] المنفذ 25 غير متاح — تعطيل مؤقت للفحص 10 دقائق (fail-open)')
    }
  } else {
    consecutiveNetworkFails = 0
    cacheSet(email, result)
  }
  return result
}
