#!/bin/bash
# اختبار حمل بمستوى مدرسة 1200 طالب — يعمل ضمن استدعاء واحد (خادم مؤقت على :3100)
set -u
cd /home/z/my-project
PORT=3100
BASE="http://127.0.0.1:$PORT"

echo "=== 1) تشغيل خادم الإنتاج المؤقت على :$PORT ==="
PORT=$PORT HOSTNAME=127.0.0.1 NODE_ENV=production setsid nohup bun .next/standalone/server.js > /tmp/loadtest-server.log 2>&1 < /dev/null &
SRV=$!
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$BASE/" 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "server ready (code=$code, pid=$SRV)"

echo "=== 2) جلسة مصادقة للاختبارات المحمية ==="
rm -f /tmp/lt-cookies.txt
lcode=$(curl -s -o /dev/null -w "%{http_code}" -c /tmp/lt-cookies.txt -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d '{"email":"owner@example.com","password":"OWNER_PASS_PLACEHOLDER"}')
TOKEN=$(awk -F'\t' '$6=="qudratak_session" {print $7}' /tmp/lt-cookies.txt)
echo "login → $lcode"
AUTHH="Cookie: qudratak_session=$TOKEN"

run_phase() {
  local name="$1" url="$2" conns="$3" dur="$4"; shift 4
  echo "--- $name (${conns} متزامن، ${dur}ث) ---"
  npx --yes autocannon -c "$conns" -d "$dur" --latency "$@" -j "$url" 2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin)
s=d.get('latency',{}); r=d.get('requests',{}); e=d.get('errors',None); nrd=d.get('non2xx',0)
print(f\"  requests: {r.get('average',0):.0f}/s (total ~{r.get('total',0)}) | p50: {s.get('p50')}ms | p90: {s.get('p90')}ms | p99: {s.get('p99')}ms | max: {s.get('max')}ms | non2xx: {nrd} | errors: {e}\")"
}

echo "=== 3) phases ==="
run_phase "الصفحة الرئيسية" "$BASE/" 200 15
run_phase "صفحة المتصدرين" "$BASE/leaderboard" 200 10
run_phase "API الأسئلة (مصادق)" "$BASE/api/questions?page=1&limit=10&category=QUANTITATIVE" 150 10 -H "$AUTHH"
run_phase "API المتصدرين (تجميع ثقيل)" "$BASE/api/leaderboard?period=all" 150 10 -H "$AUTHH"
run_phase "API لوحة الطالب" "$BASE/api/stats/dashboard" 100 10 -H "$AUTHH"

echo "=== 4) اندفاع دخول جماعي (50 متزامن × 3 جولات — bcrypt مقصود البطء) ==="
python3 - << 'PYEOF'
import concurrent.futures, urllib.request, json, time
URL='http://127.0.0.1:3100/api/auth/login'
def attempt(i):
    body=json.dumps({'email':'owner@example.com','password':'OWNER_PASS_PLACEHOLDER'}).encode()
    req=urllib.request.Request(URL,data=body,headers={'Content-Type':'application/json'})
    t=time.time()
    try:
        with urllib.request.urlopen(req,timeout=30) as r: st=r.status
    except Exception as ex: st=getattr(ex,'code',0)
    return st,(time.time()-t)*1000
for rnd in range(3):
    t0=time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as ex:
        res=list(ex.map(attempt,range(50)))
    ok=sum(1 for s,_ in res if s==200); times=sorted(ms for _,ms in res)
    print(f"  جولة {rnd+1}: نجح {ok}/50 | p50={times[25]:.0f}ms | p95={times[47]:.0f}ms | إجمالي {time.time()-t0:.1f}s")
PYEOF

echo "=== 5) إيقاف الخادم المؤقت ==="
pkill -f "server.js" 2>/dev/null; sleep 1
ps aux | grep server.js | grep -v grep | wc -l
echo "=== انتهى اختبار الحمل ==="
