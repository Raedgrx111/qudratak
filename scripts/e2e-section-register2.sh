#!/bin/bash
# E2E v2: تسجيل المجمع عبر snapshot refs — استدعاء واحد
set -u
cd /home/z/my-project
PORT=3100
BASE="http://127.0.0.1:$PORT"
TS=$(date +%s)
EMAIL="sec2-e2e-$TS@gmail.com"

PORT=$PORT HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup bun .next/standalone/server.js > /tmp/e2e2-server.log 2>&1 < /dev/null &
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$BASE/" 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "server ready ($code)"

agent-browser --session e2e2 open "$BASE/register" > /dev/null 2>&1
agent-browser --session e2e2 wait --load networkidle > /dev/null 2>&1
sleep 1
agent-browser --session e2e2 find label "الاسم الكامل" fill "طالب الشعبة تجربة٢" > /dev/null 2>&1
agent-browser --session e2e2 find label "البريد الإلكتروني" fill "$EMAIL" > /dev/null 2>&1
agent-browser --session e2e2 find label "كلمة المرور" fill "Student@1234" > /dev/null 2>&1

echo "=== snapshot: إيجاد قائمة المجمع ==="
SNAP=$(agent-browser --session e2e2 snapshot -i 2>/dev/null)
COMBO_REF=$(echo "$SNAP" | grep "اختر مجمعك" | grep -oE "ref=e[0-9]+" | head -1 | sed 's/ref=/@/')
echo "combobox ref: $COMBO_REF"
agent-browser --session e2e2 click "$COMBO_REF" 2>/dev/null
sleep 1
SNAP2=$(agent-browser --session e2e2 snapshot -i 2>/dev/null)
OPT_REF=$(echo "$SNAP2" | grep "مجمع الأمير محمد بن فهد" | grep -oE "ref=e[0-9]+" | head -1 | sed 's/ref=/@/')
echo "option ref: $OPT_REF"
agent-browser --session e2e2 click "$OPT_REF" 2>/dev/null
sleep 1
SEC_VISIBLE=$(agent-browser --session e2e2 eval "!!document.querySelector('#section')" 2>/dev/null)
echo "حقل الشعبة ظهر: $SEC_VISIBLE"
if [ "$SEC_VISIBLE" = "true" ]; then
  agent-browser --session e2e2 screenshot download/register-section-field.png > /dev/null 2>&1
  agent-browser --session e2e2 find label "رقم الشعبة" fill "20" > /dev/null 2>&1
  agent-browser --session e2e2 find text "إنشاء حساب الطالب" click > /dev/null 2>&1
  sleep 2
  TOAST1=$(agent-browser --session e2e2 eval "document.body.innerText.includes('3 أرقام')" 2>/dev/null)
  echo "رفض شعبة ناقصة: $TOAST1"
  agent-browser --session e2e2 find label "رقم الشعبة" fill "308" > /dev/null 2>&1
  agent-browser --session e2e2 find text "إنشاء حساب الطالب" click > /dev/null 2>&1
  sleep 3
  echo "URL: $(agent-browser --session e2e2 get url 2>/dev/null)"
  agent-browser --session e2e2 errors > /tmp/e2e2-errors.txt 2>/dev/null; echo "page errors: $(grep -c Error /tmp/e2e2-errors.txt || true)"
  agent-browser --session e2e2 screenshot download/register-section-success.png > /dev/null 2>&1
fi

cat > scripts/_check2.ts << EOF
import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  const u = await p.user.findUnique({ where: { email: '$EMAIL' } })
  console.log('DB:', u ? 'موجود' : 'مفقود', '| school:', u?.school, '| section:', u?.sectionNumber)
  if (u) await p.user.delete({ where: { id: u.id } })
  console.log('cleanup:', u ? 'حُذف حساب الاختبار' : 'لا شيء')
}
main().then(() => p.\$disconnect())
EOF
npx tsx scripts/_check2.ts && rm -f scripts/_check2.ts

pkill -f "server.js" 2>/dev/null; sleep 1
agent-browser --session e2e2 close > /dev/null 2>&1
echo "=== انتهى E2E v2 ==="
