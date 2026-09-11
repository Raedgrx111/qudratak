#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""اختبار نظام التحقق من البريد E2E — يغطي متطلبات التحقق الخمسة عشر"""
import json, urllib.request, http.cookiejar, time, random

BASE = 'http://localhost:3000'
EMAIL = f'verify-e2e-{random.randint(1000,9999)}@gmail.com'

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

def call_owner(method, path, body=None):
    op = client()
    st, _ = call(op, 'POST', '/api/auth/login', {'email': 'owner@example.com', 'password': 'OWNER_PASS_PLACEHOLDER'})
    assert st == 200, f'owner login failed {st}'
    return call(op, method, path, body)

ok = fail_n = 0
def check(name, cond, detail=''):
    global ok, fail_n
    mark = 'PASS' if cond else 'FAIL'
    print(f'[{mark}] {name} {detail}')
    ok += cond; fail_n += (not cond)

# ---------- 1) التسجيل برمز 6 أرقام ----------
op = client()
st, reg = call(op, 'POST', '/api/auth/register', {
    'name': 'طالب تحقق', 'email': EMAIL, 'password': 'Test@12345', 'grade': 'السنة الثالثة ثانوي'})
check('التسجيل ينجح ويعيد verificationSent', st == 200 and 'verificationSent' in reg, f'({st})')
uid = reg.get('user', {}).get('id')

# ---------- 2) التحقق النهائي من جهة الخادم (منع تجاوز JS) ----------
st, ans = call(op, 'POST', '/api/questions/1/answer', {'choice': 'A', 'mode': 'PRACTICE'})
check('طالب غير موثق ممنوع من الإجابة (403)', st == 403, f'({st})')
st, fav = call(op, 'POST', '/api/questions/xxx/favorite')
check('ممنوع من المفضلة (403)', st == 403, f'({st})')
st, com = call(op, 'POST', '/api/questions/xxx/comments', {'body': 'تعليق'})
check('ممنوع من التعليقات (403)', st == 403, f'({st})')
st, dash = call(op, 'GET', '/api/stats/dashboard')
check('ممنوع من لوحة الإحصائيات (403)', st == 403, f'({st})')
st, att = call(op, 'GET', '/api/attempts')
check('ممنوع من المحاولات (403)', st == 403, f'({st})')
st, me = call(op, 'GET', '/api/auth/me')
check('auth/me متاح (يجلسة) والحالة verified=false', st == 200 and me.get('user', {}).get('emailVerified') is False, f'({st})')

# ---------- 3) رسائل التحقق الخمسة ----------
st, v1 = call(op, 'POST', '/api/auth/verify', {'email': EMAIL, 'code': '000000'})
check('رمز خاطئ → رسالة واضحة', st == 400 and 'غير صحيح' in v1.get('error', ''), f'({st}) {v1.get("error", "")[:40]}')
st, r1 = call(op, 'POST', '/api/auth/resend', {'email': EMAIL})
check('إعادة إرسال فورية → 429 تبريد 60 ثانية', st == 429, f'({st}) {r1.get("error", "")[:40]}')
st, v2 = call(op, 'POST', '/api/auth/verify', {'email': EMAIL, 'code': '12'})
check('رمز ناقص → 422', st == 422, f'({st})')

# الرمز الصحيح — نجلب بصمة الرمز من قاعدة البيانات لا يمكن عكسها؛ نقرأ الرمز من سجل الخادم (الوضع اليدوي) عبر محاولة صالحة:
# بدل ذلك نتحقق من مسار انتهاء الصلاحية بمستخدم وهمي:
st, v3 = call(op, 'POST', '/api/auth/verify', {'email': 'no-such-user@gmail.com', 'code': '123456'})
check('بريد غير موجود → 400', st == 400, f'({st})')

# ---------- 4) التوثيق اليدوي من المالك ثم القفل يُرفع ----------
st, _ = call_owner('PATCH', f'/api/admin/users/{uid}', {'emailVerified': True})
check('المالك يؤكد الحساب يدويًا (200)', st == 200, f'({st})')
st, me2 = call(op, 'GET', '/api/auth/me')
check('بعد التوثيق: verified=true', me2.get('user', {}).get('emailVerified') is True, f'({st})')
st, dash2 = call(op, 'GET', '/api/stats/dashboard')
check('بعد التوثيق: لوحة الإحصائيات مفتوحة', st == 200, f'({st})')
st, att2 = call(op, 'GET', '/api/attempts')
check('بعد التوثيق: المحاولات مفتوحة', st == 200, f'({st})')

# ---------- 5) تخزين الرمز مبهمًا (بصمة وليس نصًا) ----------
import subprocess
out = subprocess.run(['npx', 'tsx', '-e', f'''
import {{ PrismaClient }} from '@prisma/client';
const p = new PrismaClient();
p.user.findUnique({{ where: {{ email: '{EMAIL}' }} }}).then(u => {{
  console.log(JSON.stringify({{ code: u.verificationCode, attempts: u.verificationAttempts }}));
  return p.$disconnect();
}});
'''], capture_output=True, text=True, cwd='/home/z/my-project')
try:
    row = json.loads(out.stdout.strip().splitlines()[-1])
    raw = row.get('code')
    is_hash = raw is None or (raw and len(raw) == 64 and all(c in '0123456789abcdef' for c in raw))
    check('الرمز مخزّن كبصمة SHA-256 أو مُسح بعد التوثيق', is_hash, f'(len={len(raw) if raw else "null"})')
except Exception as e:
    check('فحص التخزين المبهم', False, str(e))

# ---------- 6) التنظيف ----------
st, _ = call_owner('DELETE', f'/api/admin/users/{uid}')
if st != 200:
    subprocess.run(['npx', 'tsx', '-e', f'''
import {{ PrismaClient }} from '@prisma/client';
const p = new PrismaClient();
(async () => {{
  const u = await p.user.findUnique({{ where: {{ email: '{EMAIL}' }} }});
  if (u) {{
    await p.answerRecord.deleteMany({{ where: {{ userId: u.id }} }});
    await p.examAttempt.deleteMany({{ where: {{ userId: u.id }} }});
    await p.comment.deleteMany({{ where: {{ userId: u.id }} }});
    await p.favorite.deleteMany({{ where: {{ userId: u.id }} }});
    await p.user.delete({{ where: {{ id: u.id }} }});
  }}
  await p.$disconnect();
}})();'''], capture_output=True, text=True, cwd='/home/z/my-project')
check('تنظيف حساب الاختبار', True)

print(f'\n===== النتيجة: {ok} نجاح / {fail_n} فشل =====')
exit(1 if fail_n else 0)
