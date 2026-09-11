#!/usr/bin/env python3
"""اختبار شامل لرحلة تسجيل الطلاب — API level"""
import json
import time
import urllib.request
import urllib.error

BASE = 'http://localhost:3000'
STAMP = str(int(time.time()))
EMAIL_A = f'test.reg.a.{STAMP}@qudratak-test.sa'
EMAIL_B = f'test.reg.b.{STAMP}@qudratak-test.sa'
PASS = 'RegTest@2026'

results = []


def call(method, path, body=None, token=None):
    req = urllib.request.Request(BASE + path, method=method)
    req.add_header('Content-Type', 'application/json')
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    data = json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(req, data=data, timeout=20) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode())
        except Exception:
            return e.code, {}


def check(name, cond, detail=''):
    results.append((name, bool(cond), detail))
    print(f"{'PASS' if cond else 'FAIL'} | {name}" + (f" | {detail}" if detail and not cond else ''))


print('===== 1) تسجيل صحيح كامل (باسم عربي + مرحلة) =====')
st, d = call('POST', '/api/auth/register', {
    'name': 'عبدالعزيز الشمري التجريبي',
    'email': EMAIL_A,
    'password': PASS,
    'grade': 'السنة الثالثة ثانوي',
})
check('التسجيل يعمل 200/201', st in (200, 201), f'status={st} {d}')
check('الدور STUDENT', d.get('user', {}).get('role') == 'STUDENT', str(d.get('user')))
check('البريد مُطبّع لحروف صغيرة', d.get('user', {}).get('email') == EMAIL_A.lower(), str(d.get('user', {}).get('email')))
token_a = d.get('token', '')
check('أُعيد توكن جلسة', bool(token_a))

print('===== 2) حقن الدور عبر الطلب (محاولةOWNER) =====')
st, d2 = call('POST', '/api/auth/register', {
    'name': 'مخترق وهمي', 'email': EMAIL_B, 'password': PASS, 'role': 'OWNER', 'grade': 'خريج',
})
check('التسجيل نجح لكن الدور مفروض STUDENT', st in (200, 201) and d2.get('user', {}).get('role') == 'STUDENT', f'{st} {d2.get("user")}')
token_b = d2.get('token', '')

print('===== 3) تكرار البريد =====')
st, d3 = call('POST', '/api/auth/register', {'name': 'مكرر', 'email': EMAIL_A, 'password': PASS})
check('البريد المكرر مرفوض 409', st == 409, f'status={st} body={d3}')

print('===== 4) البريد بحالة مختلفة (Case-insensitive) =====')
st, _ = call('POST', '/api/auth/register', {'name': 'مكرر كبير', 'email': EMAIL_A.upper(), 'password': PASS})
check('البريد المكرر بحروف كبيرة مرفوض 409', st == 409, f'status={st}')

print('===== 5) تحقق الحقول =====')
cases = [
    ('اسم قصير (حرف واحد)', {'name': 'ا', 'email': f'x{STAMP}@t.sa', 'password': PASS}, 422),
    ('اسم فارغ', {'name': '', 'email': f'y{STAMP}@t.sa', 'password': PASS}, 422),
    ('بريد بدون @', {'name': 'طالب تجريبي', 'email': f'bad{STAMP}', 'password': PASS}, 422),
    ('بريد بدون نطاق', {'name': 'طالب تجريبي', 'email': f'z{STAMP}@', 'password': PASS}, 422),
    ('مرور قصير (7 حروف)', {'name': 'طالب تجريبي', 'email': f'p{STAMP}@t.sa', 'password': 'Aa1@xyz'}, 422),
    ('مرور فارغ', {'name': 'طالب تجريبي', 'email': f'q{STAMP}@t.sa', 'password': ''}, 422),
    ('كل الحقول ناقصة', {}, 422),
]
for label, body, want in cases:
    st, d4 = call('POST', '/api/auth/register', body)
    check(f'{label} → {want}', st == want, f'got {st} {d4}')

print('===== 6) الجلسة: /me بالتوكن الجديد =====')
st, me = call('GET', '/api/auth/me', token=token_a)
check('جلسة الطالب الجديد تعمل', st == 200 and me.get('user', {}).get('email') == EMAIL_A, f'{st} {me}')
check('اسم الطالب صحيح', me.get('user', {}).get('name') == 'عبدالعزيز الشمري التجريبي', str(me.get('user', {}).get('name')))

print('===== 7) دخول بالحساب الجديد =====')
st, lg = call('POST', '/api/auth/login', {'email': EMAIL_A.upper(), 'password': PASS})
check('دخول بالحساب الجديد (بريد بحروف كبيرة) يعمل', st == 200 and lg.get('user', {}).get('role') == 'STUDENT', f'{st} {lg}')
st, bad = call('POST', '/api/auth/login', {'email': EMAIL_A, 'password': 'WrongPass@1'})
check('مرور خاطئ مرفوض 401', st in (401, 403), f'status={st}')

print('===== 8) صلاحيات الطالب الجديد: لا يمكنه الوصول للوظائف الإدارية =====')
st, _ = call('POST', '/api/questions', {'text': 'محاولة', 'options': []}, token=token_a)
check('إضافة سؤال ممنوعة على الطالب (401/403)', st in (401, 403), f'status={st}')
st, _ = call('POST', '/api/clips', {'title': 'محاولة', 'url': 'https://youtu.be/x'[:8], 'category': 'كمي'}, token=token_a)
check('إضافة مقطع ممنوعة على الطالب (401/403)', st in (401, 403), f'status={st}')
st, _ = call('GET', '/api/users', token=token_a)
check('تتبع الحسابات ممنوع على الطالب (401/403)', st in (401, 403), f'status={st}')

print('===== 9) الصفحة العمومية للطالب: قوائم تعمل بأول دخول =====')
st, clips = call('GET', '/api/clips')
check('قائمة المقاطع تُقرأ (عام)', st == 200, f'status={st}')
st, lb = call('GET', '/api/leaderboard')
check('لوحة الصدارة تُقرأ (عام)', st == 200, f'status={st}')
st, qs = call('GET', '/api/questions')
check('بنك الأسئلة يُقرأ (عام)', st == 200, f'status={st}')

print()
fails = [r for r in results if not r[1]]
print(f'===== النتيجة: {len(results) - len(fails)}/{len(results)} =====')
for name, ok, detail in fails:
    print(f'  FAILED: {name} | {detail}')

# حفظ بيانات الحسابات للتنظيف لاحقًا
with open('/home/z/my-project/scripts/.reg-test-accounts.json', 'w') as f:
    json.dump({'emails': [EMAIL_A, EMAIL_B], 'password': PASS, 'tokens': [token_a, token_b], 'stamp': STAMP}, f)
print('تم حفظ بيانات الحسابات التجريبية للتنظيف')
