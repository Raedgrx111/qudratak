#!/bin/bash
# E2E: تسجيل طالب مجمع الأمير محمد بن فهد برقم شعبة — استدعاء واحد
set -u
cd /home/z/my-project
PORT=3100
BASE="http://127.0.0.1:$PORT"
TS=$(date +%s)
EMAIL="section-e2e-$TS@gmail.com"

PORT=$PORT HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup bun .next/standalone/server.js > /tmp/e2e-server.log 2>&1 < /dev/null &
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$BASE/" 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "server ready ($code)"

echo "=== 1) تحقق API من قواعد الشعبة ==="
reg() {
  curl -s -o /tmp/e2e-reg.json -w "%{http_code}" -X POST "$BASE/api/auth/register" -H "Content-Type: application/json" -d "$1"
}
echo "مجمع بدون شعبة → $(reg "{\"name\":\"اختبار شعبة\",\"email\":\"nosec-$TS@gmail.com\",\"password\":\"Student@1234\",\"school\":\"مجمع الأمير محمد بن فهد\"}") : $(cat /tmp/e2e-reg.json | python3 -c "import json,sys;print(json.load(sys.stdin).get('error','')[:60])")"
echo "شعبة رقمان (20) → $(reg "{\"name\":\"اختبار شعبة\",\"email\":\"short-$TS@gmail.com\",\"password\":\"Student@1234\",\"school\":\"مجمع الأمير محمد بن فهد\",\"sectionNumber\":\"20\"}") : $(cat /tmp/e2e-reg.json | python3 -c "import json,sys;print(json.load(sys.stdin).get('error','')[:60])")"
echo "شعبة بدون مجمع → $(reg "{\"name\":\"اختبار شعبة\",\"email\":\"noschool-$TS@gmail.com\",\"password\":\"Student@1234\",\"sectionNumber\":\"204\"}") : $(cat /tmp/e2e-reg.json | python3 -c "import json,sys;print(json.load(sys.stdin).get('error','')[:60])")"
echo "شعبة صحيحة 204 → $(reg "{\"name\":\"اختبار API شعبة\",\"email\":\"api-ok-$TS@gmail.com\",\"password\":\"Student@1234\",\"grade\":\"السنة الثالثة ثانوي\",\"school\":\"مجمع الأمير محمد بن فهد\",\"sectionNumber\":\"204\"}") : $(python3 -c "import json;d=json.load(open('/tmp/e2e-reg.json'));print(d.get('user',{}).get('email','FAIL'))")"

echo "=== 2) المتصفح: تسجيل من الواجهة ==="
agent-browser --session e2esec open "$BASE/register" > /dev/null 2>&1
agent-browser --session e2esec wait --load networkidle > /dev/null 2>&1
sleep 1
agent-browser --session e2esec find label "الاسم الكامل" fill "طالب الشعبة تجربة" > /dev/null 2>&1
agent-browser --session e2esec find label "البريد الإلكتروني" fill "$EMAIL" > /dev/null 2>&1
agent-browser --session e2esec find label "كلمة المرور" fill "Student@1234" > /dev/null 2>&1
# اختيار المجمع من القائمة
agent-browser --session e2esec find text "اختر مجمعك أو مدرستك" click > /dev/null 2>&1
sleep 1
agent-browser --session e2esec find text "مجمع الأمير محمد بن فهد" click > /dev/null 2>&1
sleep 1
SEC_VISIBLE=$(agent-browser --session e2esec eval "!!document.querySelector('#section')" 2>/dev/null)
echo "حقل الشعبة ظهر: $SEC_VISIBLE"
agent-browser --session e2esec screenshot download/register-section-field.png > /dev/null 2>&1
# تجربة شعبة ناقصة ثم صحيحة
agent-browser --session e2esec find label "رقم الشعبة" fill "20" > /dev/null 2>&1
agent-browser --session e2esec find text "إنشاء حساب الطالب" click > /dev/null 2>&1
sleep 1.5
TOAST1=$(agent-browser --session e2esec eval "document.body.innerText.includes('3 أرقام')" 2>/dev/null)
echo "رفض شعبة ناقصة برسالة: $TOAST1"
agent-browser --session e2esec find label "رقم الشعبة" fill "204" > /dev/null 2>&1
agent-browser --session e2esec find text "إنشاء حساب الطالب" click > /dev/null 2>&1
sleep 3
URL_NOW=$(agent-browser --session e2esec get url 2>/dev/null)
echo "URL بعد التسجيل: $URL_NOW"
agent-browser --session e2esec errors > /tmp/e2e-errors.txt 2>/dev/null; echo "page errors: $(grep -c Error /tmp/e2e-errors.txt || true)"
agent-browser --session e2esec screenshot download/register-section-success.png > /dev/null 2>&1

echo "=== 3) التحقق من قاعدة البيانات ==="
cat > /tmp/check-e2e-user.ts << EOF
import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  const u = await p.user.findUnique({ where: { email: '$EMAIL' } })
  console.log('user:', u ? 'موجود' : 'مفقود', '| school:', u?.school, '| section:', u?.sectionNumber, '| role:', u?.role)
  const apiUser = await p.user.findUnique({ where: { email: 'api-ok-$TS@gmail.com' } })
  console.log('api user:', apiUser ? 'موجود' : 'مفقود', '| school:', apiUser?.school, '| section:', apiUser?.sectionNumber)
}
main().then(() => p.\$disconnect())
EOF
cp /tmp/check-e2e-user.ts scripts/_check-e2e-user.ts && npx tsx scripts/_check-e2e-user.ts

echo "=== 4) التنظيف (حذف حسابات الاختبار) ==="
cat > scripts/_cleanup-e2e.ts << EOF
import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
async function main() {
  const emails = ['$EMAIL', 'api-ok-$TS@gmail.com', 'nosec-$TS@gmail.com', 'short-$TS@gmail.com', 'noschool-$TS@gmail.com']
  const r = await p.user.deleteMany({ where: { email: { in: emails } } })
  console.log('deleted test users:', r.count)
}
main().then(() => p.\$disconnect())
EOF
npx tsx scripts/_cleanup-e2e.ts && rm -f scripts/_check-e2e-user.ts scripts/_cleanup-e2e.ts

pkill -f "server.js" 2>/dev/null; sleep 1
agent-browser --session e2esec close > /dev/null 2>&1
echo "=== انتهى E2E ==="
