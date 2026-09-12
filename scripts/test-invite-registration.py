#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# ===== اختبار E2E: نظام رمز الدعوة + التسجيل المباشر بدون OTP =====
# يشغَّل والخادم يعمل على localhost:3000
import json, urllib.request, urllib.error, random, string, subprocess

BASE = 'http://localhost:3000'
passed = failed = 0

def req(method, path, body=None, token=None):
    r = urllib.request.Request(BASE + path, method=method)
    r.add_header('Content-Type', 'application/json')
    if token: r.add_header('Authorization', f'Bearer {token}')
    data = json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(r, data) as res:
            raw = res.read().decode() or '{}'
            try: return res.status, json.loads(raw)
            except Exception: return res.status, {'_raw': raw[:100]}
    except urllib.error.HTTPError as e:
        try: return e.code, json.loads(e.read().decode() or '{}')
        except Exception: return e.code, {}

def check(name, cond, extra=''):
    global passed, failed
    if cond: passed += 1; print(f'  ✅ {name}')
    else: failed += 1; print(f'  ❌ {name} {extra}')

def rnd(n=8):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=n))

EMAILS = []  # للتنظيف النهائي

# ---------- 0) تهيئة: مالك مؤقت للاختبار عبر قاعدة البيانات ----------
TMP_OWNER_EMAIL = f'test-owner-{rnd(6)}@example.com'
EMAILS.append(TMP_OWNER_EMAIL)
subprocess.run(['node', 'scripts/_invite-test-db.mjs', 'owner', TMP_OWNER_EMAIL], check=True, capture_output=True, cwd='/home/z/my-project')

print('== 1) إعدادات المالك ==')
s, d = req('POST', '/api/auth/login', {'email': TMP_OWNER_EMAIL, 'password': 'TestOwner@123'})
check('دخول المالك المؤقت', s == 200 and d.get('token'))
OWNER_TOKEN = d['token']
s, d = req('GET', '/api/admin/settings', token=OWNER_TOKEN)
check('GET إعدادات التسجيل (رمز + مفتوح)', s == 200 and 'inviteCode' in d and d.get('registrationOpen') is True)
ORIG_CODE = d.get('inviteCode')
print(f'     الرمز الحالي: {ORIG_CODE}')

s, d = req('GET', '/api/admin/settings')
check('GET الإعدادات بدون جلسة → مرفوض', s in (401, 403))

print('== 2) فحص رمز الدعوة (الخطوة الأولى) ==')
s, d = req('POST', '/api/auth/invite-check', {'code': 'XXX-WRONG-99'})
check('رمز خاطئ → مرفوض', s == 403)
s, d = req('POST', '/api/auth/invite-check', {'code': ''})
check('رمز فارغ → مرفوض', s == 422)
s, d = req('POST', '/api/auth/invite-check', {'code': ORIG_CODE.lower()})
check('الرمز الصحيح (حروف صغيرة) → مقبول', s == 200 and d.get('ok') is True)

print('== 3) التسجيل ==')
def newstudent(email):
    EMAILS.append(email)
    return email

s, d = req('POST', '/api/auth/register', {'name': 'طالب بلا رمز', 'email': newstudent(f'no-invite-{rnd(5)}@example.com'), 'password': 'Student@123', 'sectionNumber': '308'})
check('تسجيل بدون رمز دعوة → مرفوض', s == 422, str(d))
s, d = req('POST', '/api/auth/register', {'name': 'طالب رمز خاطئ', 'email': newstudent(f'bad-invite-{rnd(5)}@example.com'), 'password': 'Student@123', 'sectionNumber': '308', 'inviteCode': 'XXX-WRONG-99'})
check('تسجيل برمز خاطئ → مرفوض', s == 403, str(d))
s, d = req('POST', '/api/auth/register', {'name': 'طالب شعبة حروف', 'email': newstudent(f'sec-abc-{rnd(5)}@example.com'), 'password': 'Student@123', 'sectionNumber': 'abc', 'inviteCode': ORIG_CODE})
check('شعبة بحروف → مرفوض', s == 422, str(d))
s, d = req('POST', '/api/auth/register', {'name': 'طالب شعبة قصيرة', 'email': newstudent(f'sec-30-{rnd(5)}@example.com'), 'password': 'Student@123', 'sectionNumber': '30', 'inviteCode': ORIG_CODE})
check('شعبة رقمان → مرفوض', s == 422, str(d))
s, d = req('POST', '/api/auth/register', {'name': 'طالب شعبة طويلة', 'email': newstudent(f'sec-3088-{rnd(5)}@example.com'), 'password': 'Student@123', 'sectionNumber': '3088', 'inviteCode': ORIG_CODE})
check('شعبة 4 أرقام → مرفوض', s == 422, str(d))

STU_EMAIL = newstudent(f'student-{rnd(6)}@example.com')
s, d = req('POST', '/api/auth/register', {'name': 'طالب الاختبار', 'email': STU_EMAIL, 'confirmEmail': STU_EMAIL.upper(), 'password': 'Student@123', 'grade': 'السنة الثانية ثانوي', 'sectionNumber': '308', 'inviteCode': ORIG_CODE})
check('تسجيل صحيح كامل → نجح', s == 200 and d.get('token'), str(d))
check('الحساب موثق تلقائيًا (بدون OTP)', d.get('emailVerified') is True)
STU_TOKEN = d.get('token')

s, d = req('POST', '/api/auth/register', {'name': 'مكرر', 'email': STU_EMAIL, 'password': 'Student@123', 'sectionNumber': '208', 'inviteCode': ORIG_CODE})
check('نفس البريد مرة ثانية → مرفوض', s == 409)

s, d = req('GET', '/api/auth/me', token=STU_TOKEN)
check('جلسة الطالب تعمل مباشرة (me)', s == 200 and d.get('user', {}).get('email') == STU_EMAIL and d.get('user', {}).get('emailVerified') is True)

s, d = req('POST', '/api/auth/register', {'name': 'غير متطابق', 'email': newstudent(f'mismatch-{rnd(5)}@example.com'), 'confirmEmail': 'other@x.local', 'password': 'Student@123', 'sectionNumber': '109', 'inviteCode': ORIG_CODE})
check('تأكيد بريد غير مطابق → مرفوض برسالة التطابق', s == 422 and 'متطابق' in d.get('error', ''), str(d))

print('== 4) تغيير الرمز وإغلاق التسجيل (لوحة المالك) ==')
NEW_CODE = 'QDR-' + ''.join(random.choices(string.digits, k=6))
while NEW_CODE == ORIG_CODE:
    NEW_CODE = 'QDR-' + ''.join(random.choices(string.digits, k=6))
s, d = req('PATCH', '/api/admin/settings', {'inviteCode': NEW_CODE}, token=OWNER_TOKEN)
check('تغيير رمز الدعوة', s == 200 and d.get('inviteCode') == NEW_CODE)
s, d = req('POST', '/api/auth/invite-check', {'code': ORIG_CODE})
check('الرمز القديم لم يعد يعمل', s == 403)
s, d = req('POST', '/api/auth/invite-check', {'code': NEW_CODE.lower()})
check('الرمز الجديد يعمل', s == 200)

s, d = req('PATCH', '/api/admin/settings', {'registrationOpen': False}, token=OWNER_TOKEN)
check('إغلاق التسجيل', s == 200 and d.get('registrationOpen') is False)
s, d = req('POST', '/api/auth/invite-check', {'code': NEW_CODE})
check('حتى بالرمز الصحيح: التسجيل مغلق → مرفوض', s == 403 and 'مغلق' in d.get('error', ''))
s, d = req('POST', '/api/auth/register', {'name': 'بعد الإغلاق', 'email': newstudent(f'closed-{rnd(5)}@example.com'), 'password': 'Student@123', 'sectionNumber': '308', 'inviteCode': NEW_CODE})
check('تسجيل أثناء الإغلاق → مرفوض', s == 403)

s, d = req('PATCH', '/api/admin/settings', {'registrationOpen': True}, token=OWNER_TOKEN)
check('إعادة فتح التسجيل', s == 200 and d.get('registrationOpen') is True)
s, d = req('POST', '/api/auth/invite-check', {'code': NEW_CODE})
check('الفتح يعمل من جديد', s == 200)

print('== 5) الحفاظ على الميزات القائمة ==')
s, d = req('GET', '/api/auth/mail-status')
check('مسار حالة البريد يعمل كما هو', s == 200 and 'configured' in d)
s, d = req('GET', '/')
check('الصفحة الرئيسية تعمل', s == 200)

# ---------- تنظيف: حذف حسابات الاختبار وإرجاع الإعدادات ----------
subprocess.run(['node', 'scripts/_invite-test-db.mjs', 'cleanup', *EMAILS], check=True, capture_output=True, cwd='/home/z/my-project')
req('PATCH', '/api/admin/settings', {'inviteCode': ORIG_CODE}, token=OWNER_TOKEN)

print(f'\n===== النتيجة: {passed} نجح / {failed} فشل =====')
exit(1 if failed else 0)
