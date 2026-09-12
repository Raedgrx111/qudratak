#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""التدفق الكامل للتسجيل والتحقق: إنشاء حساب → إرسال رمز → إدخال الرمز → التحقق → تفعيل الحساب.
الرمز يُجلب من سجل الخادم (الوضع اليدوي لغياب RESEND_API_KEY) — نفس المسار الذي سيمر به
الرمز عبر Resend عند وضع المفتاح، فكل ما بعده متطابق تمامًا."""
import json, urllib.request, http.cookiejar, random, re, subprocess, time

BASE = 'http://localhost:3000'
DEVLOG = '/home/z/my-project/dev.log'
EMAIL = f'resend-flow-{random.randint(1000, 9999)}@gmail.com'
LOG_BEFORE = _ = sum(1 for _ in open(DEVLOG, errors='ignore')) if __import__('os').path.exists(DEVLOG) else 0

def client():
    cj = http.cookiejar.CookieJar()
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def call(op, method, path, body=None):
    req = urllib.request.Request(BASE + path, method=method)
    req.add_header('Content-Type', 'application/json')
    data = json.dumps(body).encode() if body is not None else None
    try:
        with op.open(req, data, timeout=20) as r:
            return r.status, json.loads(r.read().decode() or '{}')
    except urllib.error.HTTPError as e:
        try: return e.code, json.loads(e.read().decode() or '{}')
        except Exception: return e.code, {}

ok = bad = 0
def check(name, cond, detail=''):
    global ok, bad
    print(f'[{ "PASS" if cond else "FAIL"}] {name} {detail}')
    ok += cond; bad += (not cond)

# ---------- 1) إنشاء الحساب (إرسال الرمز يحدث تلقائيًا داخليًا) ----------
op = client()
st, reg = call(op, 'POST', '/api/auth/register', {
    'name': 'طالب التدفق الكامل', 'email': EMAIL, 'password': 'Test@12345', 'grade': 'السنة الثالثة ثانوي'})
check('1) إنشاء الحساب 200', st == 200, f'({st})')
uid = reg.get('user', {}).get('id', '')

# ---------- 2) الرمز "أُرسل" — نجلبه من سجل الخادم (محاكاة وصوله بالبريد) ----------
code = None
for _ in range(10):
    time.sleep(1)
    try:
        with open(DEVLOG, errors='ignore') as f:
            lines = f.readlines()
        for line in reversed(lines[LOG_BEFORE:] if LOG_BEFORE <= len(lines) else []):
            m = re.search(r'\[verification\].*رمز ' + re.escape(EMAIL) + r': (\d{6})', line)
            if m: code = m.group(1); break
        if code: break
    except FileNotFoundError:
        pass
check('2) رمز 6 أرقام صدر وأُرسل (من سجل الخادم)', code is not None and len(code or '') == 6, f'code={code}')

# ---------- 3) إدخال رمز خاطئ أولًا ----------
st, v1 = call(op, 'POST', '/api/auth/verify', {'email': EMAIL, 'code': '111111' if code != '111111' else '222222'})
check('3) رمز خاطئ → 400 برسالة عربية', st == 400 and 'غير صحيح' in v1.get('error', ''), f'({st})')

# ---------- 4) إدخال الرمز الصحيح → التفعيل ----------
st, v2 = call(op, 'POST', '/api/auth/verify', {'email': EMAIL, 'code': code})
check('4) الرمز الصحيح → 200 مع جلسة', st == 200 and v2.get('user', {}).get('emailVerified') is True, f'({st})')

# ---------- 5) الحساب مفعّل بقاعدة البيانات (verified) ----------
out = subprocess.run(['npx', 'tsx', '-e', f'''
import {{ PrismaClient }} from '@prisma/client';
const p = new PrismaClient();
p.user.findUnique({{ where: {{ email: '{EMAIL}' }} }}).then(u => {{
  console.log(JSON.stringify({{ v: u.emailVerified, codeLeft: u.verificationCode, expLeft: u.verificationExpires }}));
  return p.$disconnect();
}});'''], capture_output=True, text=True, cwd='/home/z/my-project')
row = json.loads(out.stdout.strip().splitlines()[-1])
check('5) قاعدة البيانات: emailVerified=true', row['v'] is True)
check('5) بصمة الرمز مُسحت بعد النجاح', row['codeLeft'] is None and row['expLeft'] is None)

# ---------- 6) الحساب المفعّل يستخدم المنصة ----------
st, dash = call(op, 'GET', '/api/stats/dashboard')
check('6) الطالب المفعّل يفتح لوحته (200)', st == 200, f'({st})')
st, me = call(op, 'GET', '/api/auth/me')
check('6) الجلسة تظهر verified=true', me.get('user', {}).get('emailVerified') is True)

# ---------- التنظيف ----------
op2 = client()
call(op2, 'POST', '/api/auth/login', {'email': 'owner@example.com', 'password': 'OWNER_PASS_PLACEHOLDER'})
call(op2, 'DELETE', f'/api/admin/users/{uid}')
check('تنظيف حساب الاختبار', True)

print(f'\n===== التدفق الكامل: {ok} نجاح / {bad} فشل =====')
exit(1 if bad else 0)
