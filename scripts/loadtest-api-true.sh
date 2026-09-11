#!/bin/bash
# قياس القدرة الحقيقية للـ API بدون حد المعدل (بيئة قياس فقط) — استدعاء واحد
set -u
cd /home/z/my-project
PORT=3100
BASE="http://127.0.0.1:$PORT"

PORT=$PORT HOSTNAME=127.0.0.1 NODE_ENV=production GLOBAL_API_RPM=999999 setsid nohup bun .next/standalone/server.js > /tmp/loadtest2.log 2>&1 < /dev/null &
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$BASE/" 2>/dev/null)
  [ "$code" = "200" ] && break
  sleep 1
done
echo "server ready (code=$code)"

rm -f /tmp/lt2-cookies.txt
lcode=$(curl -s -o /dev/null -w "%{http_code}" -c /tmp/lt2-cookies.txt -X POST "$BASE/api/auth/login" -H "Content-Type: application/json" -d '{"email":"owner@example.com","password":"OWNER_PASS_PLACEHOLDER"}')
TOKEN=$(awk -F'\t' '$6=="qudratak_session" {print $7}' /tmp/lt2-cookies.txt)
echo "login → $lcode"
AUTHH="Cookie: qudratak_session=$TOKEN"

run_phase() {
  local name="$1" url="$2" conns="$3" dur="$4"; shift 4
  echo "--- $name (${conns} متزامن، ${dur}ث) ---"
  npx --yes autocannon -c "$conns" -d "$dur" --latency "$@" -j "$url" 2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin)
s=d.get('latency',{}); r=d.get('requests',{}); e=d.get('errors',None); nrd=d.get('non2xx',0); sc=d.get('statusCodeStats',{})
print(f\"  {r.get('average',0):.0f} req/s | p50: {s.get('p50')}ms | p90: {s.get('p90')}ms | p99: {s.get('p99')}ms | non2xx: {nrd} | errors: {e}\")"
}

run_phase "API الأسئلة (مصادق)" "$BASE/api/questions?page=1&limit=10&category=QUANTITATIVE" 150 12 -H "$AUTHH"
run_phase "API المتصدرين (تجميع ثقيل)" "$BASE/api/leaderboard?period=all" 150 12 -H "$AUTHH"
run_phase "API لوحة الطالب" "$BASE/api/stats/dashboard" 100 12 -H "$AUTHH"
run_phase "API المقاطع" "$BASE/api/clips" 100 10 -H "$AUTHH"

pkill -f "server.js" 2>/dev/null; sleep 1
echo "=== انتهى القياس الحقيقي ==="
