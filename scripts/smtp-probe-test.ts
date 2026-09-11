// اختبار: هل يمكن فتح اتصال SMTP صادر (منفذ 25) من هذه البيئة؟
import dns from 'node:dns/promises'
import net from 'node:net'

async function probe(mxHost: string, email: string): Promise<string> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: mxHost, port: 25, timeout: 8000 })
    let stage = 'banner'
    const fail = (msg: string) => { try { socket.destroy() } catch {} ; resolve(msg) }
    socket.on('timeout', () => fail('TIMEOUT'))
    socket.on('error', (e) => fail('ERROR:' + e.message))
    socket.on('data', (buf) => {
      const text = buf.toString()
      if (stage === 'banner') {
        if (!text.startsWith('220')) return fail('BANNER:' + text.slice(0, 60))
        stage = 'ehlo'
        socket.write('EHLO qudratak.sa\r\n')
      } else if (stage === 'ehlo') {
        if (text.includes('250 ')) { stage = 'mailfrom'; socket.write('MAIL FROM:<no-reply@qudratak.sa>\r\n') }
      } else if (stage === 'mailfrom') {
        if (text.startsWith('250')) { stage = 'rcpt'; socket.write(`RCPT TO:<${email}>\r\n`) }
        else return fail('MAILFROM:' + text.slice(0, 60))
      } else if (stage === 'rcpt') {
        const code = text.slice(0, 3)
        socket.write('QUIT\r\n')
        socket.end()
        fail(`RCPT:${code} ${text.slice(4, 90).trim()}`)
      }
    })
  })
}

const mx = await dns.resolveMx('gmail.com')
console.log('gmail MX:', mx.slice(0, 2).map((m) => m.exchange).join(', '))
const target = mx.sort((a, b) => a.priority - b.priority)[0].exchange
const t0 = Date.now()
const r1 = await probe(target, 'qudratak-nonexistent-test-9931@gmail.com')
console.log(`عشوائي غير موجود → ${r1} (${Date.now() - t0}ms)`)
const t1 = Date.now()
const r2 = await probe(target, 'owner@example.com')
console.log(`صندوق حقيقي → ${r2} (${Date.now() - t1}ms)`)
