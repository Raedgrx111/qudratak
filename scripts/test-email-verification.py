#!/usr/bin/env python3
"""اختبار شامل لنظام تأكيد البريد — يمنع البريد الوهمي ويتطلب رمز تأكيد"""
import hashlib
import json
import sqlite3
import time
import urllib.request
import urllib.error

BASE = 'http://localhost:3000'
STAMP = str(int(time.time()))
DB = '/home/z/my-project/db/custom.db'
SECRET = 'qudratak-dev-secret-change-in-production-2024'
PASS = 'Verify@2026'
OWNER = ('owner@example.com', 'OWNER_PASS_PLACEHOLDER')

results = []


def call(method, path, body=None, token=None, cookie=None):
    req = urllib.request.Request(BASE + path, method=method)
    req.add_header('Content-Type', 'application/json')
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    if cookie:
        req.add_header('Cookie', cookie)
    data = json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(req, data=data, timeout=30) as r:
            setc = r.headers.get('Set-Cookie', '')
            return r.status, json.loads(r.read().decode()), setc.split(';')[0] if setc else None
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode()), None
        except Exception:
            return e.code, {}, None


def check(name, cond, detail=''):
    results.append((name, bool(cond), detail))
    print(f"{'PASS' if cond else 'FAIL'} | {name}" + (f" | {detail}" if detail and not cond else ''))


def set_known_code(email, code):
    h = hashlib.sha256(f'{code}:{SECRET}'.encode()).hexdigest()
    conn = sqlite3.connect(DB)
    conn.execute(
        'UPDATE User SET verificationCode=?, verificationExpires=datetime("now","+10 minutes"), verificationAttempts=0, emailVerified=0 WHERE email=?',
        (h, email),
    )
    conn.commit()
    conn.close()


EMAIL_OK = f'verify.ok.{STAMP}@gmail.com'       # نطاق حقيقي بـ MX
EMAIL_TEMP = f'verify.tmp.{STAMP}@mailinator.com'  # نطاق مؤقت معروف
EMAIL_NOMX = f'verify.nomx.{STAMP}@qudratak.sa'    # نطاق بلا MX

print('===== 1) حظر البريد الوهمي =====')
st, d, _ = call('POST', '/api/auth/register', {'name': 'طالب مؤقت', 'email': EMAIL_TEMP, 'password': PASS})
check('نطاق mailinator مرفوض 422', st == 422 and ('وهمي' in d.get('error', '') or 'مؤقت' in d.get('error', '')), f'{st} {d}')

st, d, _ = call('POST', '/api/auth/register', {'name': 'طالب بلا MX', 'email': EMAIL_NOMX, 'password': PASS})
check('نطاق بلا MX مرفوض 422', st == 422, f'{st} {d}')

print('===== 2) تسجيل صحيح + إصدار رمز =====')
st, d, _ = call('POST', '/api/auth/register', {'name': 'طالب التوثيق', 'email': EMAIL_OK, 'password': PASS, 'grade': 'السنة الأولى ثانوي'})
check('التسجيل يعمل', st in (200, 201), f'{st} {d}')
check('emailVerified=false', d.get('emailVerified') is False, str(d))
check('حقل verificationSent موجود', 'verificationSent' in d, str(d))
token = d.get('token', '')
uid = d.get('user', {}).get('id', '')

st, me, _ = call('GET', '/api/auth/me', token=token)
check('الجلسة تعرض emailVerified=false', me.get('user', {}).get('emailVerified') is False, str(me.get('user')))

print('===== 3) بوابة المحتوى: طالب غير موثق =====')
st, qs, _ = call('GET', '/api/questions?limit=1')
qid = (qs.get('questions') or [{}])[0].get('id', '')
st, d, _ = call('POST', f'/api/questions/{qid}/answer', {'selectedKey': 'أ'}, token=token)
check('تسجيل إجابة تدريب مرفوض 403', st == 403, f'{st} {d}')

st, ex, _ = call('GET', '/api/exams')
eid = (ex.get('exams') or [{}])[0].get('id', '')
st, d, _ = call('POST', f'/api/exams/{eid}/start', token=token)
check('بدء اختبار مرفوض 403', st == 403, f'{st} {d}')

st, d, _ = call('POST', '/api/ai/chat', {'message': 'مرحبا'}, token=token)
check('المساعد الذكي مرفوض 403', st == 403, f'{st} {d}')

print('===== 4) رمز التأكيد: أخطاء =====')
set_known_code(EMAIL_OK, '135790')

st, d, _ = call('POST', '/api/auth/verify', {'email': EMAIL_OK, 'code': '12'})
check('رمز ناقص مرفوض 422', st == 422, f'{st} {d}')

for wrong in ('000001', '000002', '000003'):
    st, d, _ = call('POST', '/api/auth/verify', {'email': EMAIL_OK, 'code': wrong})
    check(f'رمز خاطئ {wrong} مرفوض 400', st == 400, f'{st} {d}')

st, d, _ = call('POST', '/api/auth/verify', {'email': 'not-exist@x.com', 'code': '123456'})
check('بريد غير مسجل مرفوض', st in (400, 422), f'{st} {d}')

print('===== 5) إعادة الإرسال (تبريد) =====')
st, d, _ = call('POST', '/api/auth/resend', {'email': EMAIL_OK})
check('إعادة إرسال تعمل أو تبريد 429', st in (200, 429), f'{st} {d}')
st, d, _ = call('POST', '/api/auth/resend', {'email': EMAIL_OK})
check('التبريد يمنع التكرار 429', st == 429, f'{st} {d}')
st, d, _ = call('POST', '/api/auth/resend', {'email': f'ghost.{STAMP}@gmail.com'})
check('بريد غير مسجل: رد عام بلا تسريب', st == 200, f'{st} {d}')

print('===== 6) الرمز الصحيح يوثق =====')
set_known_code(EMAIL_OK, '246810')  # نعيد ضبطه (المحاولات 3/5)
st, d, cookie = call('POST', '/api/auth/verify', {'email': EMAIL_OK, 'code': '246810'})
check('التوثيق نجح', st == 200 and d.get('user', {}).get('emailVerified') is True, f'{st} {d}')
check('أعيد توكن جديد', bool(d.get('token')))
check('كوكي جلسة معاد تعيينها', cookie is not None and 'qudratak_session=' in cookie, str(cookie))

st, me, _ = call('GET', '/api/auth/me', token=d.get('token', ''))
check('الجلسة تعرض emailVerified=true', me.get('user', {}).get('emailVerified') is True, str(me.get('user')))

print('===== 7) بعد التوثيق: المحتوى يفتح =====')
tok2 = d.get('token', '')
st, d2, _ = call('POST', f'/api/questions/{qid}/answer', {'selectedKey': 'أ'}, token=tok2)
check('تسجيل إجابة تدريب يعمل بعد التوثيق', st in (200, 201), f'{st} {d2}')

st, d2, _ = call('POST', f'/api/exams/{eid}/start', token=tok2)
check('بدء اختبار يعمل بعد التوثيق', st in (200, 201), f'{st} {d2}')
if st in (200, 201) and d2.get('attemptId'):
    st, d3, _ = call('POST', f"/api/attempts/{d2['attemptId']}/submit", {'answers': {}}, token=tok2)
    check('تسليم اختبار يعمل بعد التوثيق', st in (200, 201), f'{st} {d3}')

print('===== 8) دخول طالب غير موثق: العلم يُعاد =====')
EMAIL_OK2 = f'verify.ok2.{STAMP}@gmail.com'
st, d, _ = call('POST', '/api/auth/register', {'name': 'طالب ثانٍ', 'email': EMAIL_OK2, 'password': PASS})
check('تسجيل ثانٍ يعمل', st in (200, 201), f'{st} {d}')
st, d, _ = call('POST', '/api/auth/login', {'email': EMAIL_OK2, 'password': PASS})
check('الدخول يعمل مع emailVerified=false', st == 200 and d.get('user', {}).get('emailVerified') is False, f'{st} {d}')

print('===== 9) توثيق يدوي من المالك =====')
st, lg, _ = call('POST', '/api/auth/login', {'email': OWNER[0], 'password': OWNER[1]})
check('دخول المالك', st == 200, f'{st}')
otok = lg.get('token', '')
st, users, _ = call('GET', '/api/admin/users?search=' + EMAIL_OK2, token=otok)
target = (users.get('users') or [{}])[0]
st, d, _ = call('PATCH', f"/api/admin/users/{target.get('id')}", {'emailVerified': True}, token=otok)
check('توثيق يدوي من المالك يعمل', st == 200 and d.get('user', {}).get('emailVerified') is True, f'{st} {d}')

st, d, _ = call('GET', '/api/auth/me', token=lg.get('token', ''))
# مالك — لا يتأثر

print()
fails = [r for r in results if not r[1]]
print(f'===== النتيجة: {len(results) - len(fails)}/{len(results)} =====')
for name, ok, detail in fails:
    print(f'  FAILED: {name} | {detail}')

with open('/home/z/my-project/scripts/.verify-test-accounts.json', 'w') as f:
    json.dump({'emails': [EMAIL_OK, EMAIL_OK2], 'stamp': STAMP}, f)
