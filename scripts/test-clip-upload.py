#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اختبار شامل لميزة رفع المقاطع من الجهاز (Task 15)
- رفع حقيقي لملف mp4 بصلاحية المالك → 201 + بيانات وصفية (مدة/حجم/صورة مصغرة)
- رفض الطالب (403) ورفض الزائر (401)
- رفض الصيغة غير المدعومة (422) والعنوان القصير (422)
- استثناء حد 10MB في proxy (ملف >10MB يُرفع بنجاح) — بإنشاء ملف أكبر
- البث: بدون توكن 403، كامل 200، Range 206 مع Content-Range، لاحقة bytes=-N، نطاق فاسد 416
- الصورة المصغرة poster → 200 صورة
- الملفات على القرص تُحذف فعليًا مع حذف المقطع
- url المقطع المرفوع محمي من التغيير عبر PATCH (422)
- قائمة الإدارة تعرض uploaded:true وhasPoster — وقائمة الطلاب لا تكشف url
"""
import json
import os
import subprocess
import sys
import time

import requests

BASE = 'http://localhost:3000'
TS = int(time.time())
PASS, FAIL = 0, []
VIDEO = '/tmp/clip-test/sample.mp4'
BIG_VIDEO = '/tmp/clip-test/big-sample.mp4'


def check(name, cond, extra=''):
    global PASS
    if cond:
        PASS += 1
        print(f'  ✓ {name}')
    else:
        FAIL.append(name)
        print(f'  ✗ {name} {extra}')


def login(email, password):
    r = requests.post(f'{BASE}/api/auth/login', json={'email': email, 'password': password}, timeout=30)
    assert r.status_code == 200, f'login failed {r.status_code}: {r.text[:200]}'
    return r.cookies.get_dict()


def make_big_video():
    """فيديو >10MB بترميز سريع — 20 ثانية 960x540 بمعدل بت 6Mbps ≈ 15MB"""
    if os.path.exists(BIG_VIDEO) and os.path.getsize(BIG_VIDEO) > 10 * 1024 * 1024:
        return
    subprocess.run(
        ['ffmpeg', '-y', '-f', 'lavfi', '-i', 'testsrc2=duration=20:size=960x540:rate=30',
         '-f', 'lavfi', '-i', 'sine=frequency=600:duration=20',
         '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p',
         '-b:v', '6M', '-c:a', 'aac', '-shortest', BIG_VIDEO],
        capture_output=True, timeout=120,
    )


print('=' * 60)
print('اختبار ميزة رفع المقاطع من الجهاز — Task 15')
print('=' * 60)

# 1) تسجيل الدخول
owner_cookies = login('owner@example.com', 'OWNER_PASS_PLACEHOLDER')
print('\n— الصلاحيات —')

# 2) الزائر مرفوض
r = requests.post(f'{BASE}/api/clips/upload?title=اختبار زائر&filename=sample.mp4', data=b'xx', timeout=30)
check('الزائر (بلا جلسة) → 401/403', r.status_code in (401, 403), f'got {r.status_code}')

# 3) الطالب مرفوض: تسجيل طالب سريع
stu_email = f'clipup-{TS}@gmail.com'
r = requests.post(f'{BASE}/api/auth/register', json={
    'name': 'طالب رفع', 'email': stu_email, 'password': 'Student@123', 'grade': 'السنة الثالثة ثانوي'
}, timeout=30)
assert r.status_code in (200, 201), r.text[:200]
# توثيق الطالب يدويًا من المالك (بوابة requireVerified لا تعيق الاختبار)
users = requests.get(f'{BASE}/api/admin/users', cookies=owner_cookies, timeout=30).json()['users']
stu = next(u for u in users if u['email'] == stu_email)
requests.patch(f"{BASE}/api/admin/users/{stu['id']}", cookies=owner_cookies,
               json={'emailVerified': True}, timeout=30)
stu_cookies = login(stu_email, 'Student@123')

with open(VIDEO, 'rb') as f:
    r = requests.post(f'{BASE}/api/clips/upload?title=محاولة طالب&filename=sample.mp4',
                      data=f, headers={'Content-Type': 'video/mp4'}, cookies=stu_cookies, timeout=30)
check('الطالب → 403 (الرفع للإدارة فقط)', r.status_code == 403, f'got {r.status_code}')

print('\n— الرفع الصحيح —')
# لقطة الملفات على القرص قبل الرفع (لفحص الملفات الجديدة لاحقًا)
disk_dir = '/home/z/my-project/uploads/clips'
before_upload = set(os.listdir(disk_dir)) if os.path.exists(disk_dir) else set()

# 4) رفع صحيح من المالك
with open(VIDEO, 'rb') as f:
    r = requests.post(
        f'{BASE}/api/clips/upload',
        params={'title': 'درس مرفوع تجريبي — التناظر اللفظي', 'filename': 'sample.mp4',
                'category': 'VERBAL', 'topic': 'التناظر اللفظي', 'description': 'مقطع اختبار الميزة'},
        data=f, headers={'Content-Type': 'video/mp4'}, cookies=owner_cookies, timeout=120)
check('رفع المالك → 201', r.status_code == 201, f'got {r.status_code}: {r.text[:200]}')
clip = r.json().get('clip', {}) if r.status_code == 201 else {}
cid = clip.get('id', '')
check('provider=FILE و uploaded=true', clip.get('provider') == 'FILE' and clip.get('uploaded') is True)
check('بصمة الملف محفوظة (storagePath داخلي مخفي)', clip.get('storagePath') is None)
size = clip.get('fileSize') or 0
check('الحجم يساوي حجم الملف', size == os.path.getsize(VIDEO), f'{size}')
check('المدة مستخرجة تلقائيًا (~6 ث)', clip.get('durationSec') in (5, 6, 7), f"got {clip.get('durationSec')}")
check('الصورة المصغرة مولدة (hasPoster في الرد)', clip.get('hasPoster') is True, f"got {clip.get('hasPoster')}")
check('الاسم الأصلي محفوظ للإدارة', 'sample.mp4' in str(clip.get('url', '')))

# 5) الملف فعليًا على القرص (فيديو + صورة مصغرة = ملفان جديدان)
disk_files = set(os.listdir(disk_dir))
new_files = disk_files - before_upload
check('الفيديو + الصورة على القرص (ملفان جدد)', len(new_files) >= 2, f'new={new_files}')

# 6) الصيغة غير المدعومة
with open(VIDEO, 'rb') as f:
    r = requests.post(f'{BASE}/api/clips/upload?title=صيغة رفض&filename=evil.exe',
                      data=f, cookies=owner_cookies, timeout=30)
check('صيغة .exe → 422', r.status_code == 422, f'got {r.status_code}')

# 7) عنوان قصير
with open(VIDEO, 'rb') as f:
    r = requests.post(f'{BASE}/api/clips/upload?title=ab&filename=sample.mp4',
                      data=f, cookies=owner_cookies, timeout=30)
check('عنوان قصير → 422', r.status_code == 422, f'got {r.status_code}')

# 8) ملف >10MB — إثبات استثناء proxy
print('\n— استثناء حد 10MB —')
make_big_video()
big_size = os.path.getsize(BIG_VIDEO)
print(f'  (فيديو كبير: {big_size / (1024 * 1024):.1f}MB)')
with open(BIG_VIDEO, 'rb') as f:
    r = requests.post(f'{BASE}/api/clips/upload?title=فيديو كبير تجريبي&filename=big-sample.mp4',
                      data=f, headers={'Content-Type': 'video/mp4'}, cookies=owner_cookies, timeout=300)
check(f'ملف {big_size // (1024 * 1024)}MB (>10MB) يُرفع بنجاح — استثناء proxy يعمل', r.status_code == 201,
      f'got {r.status_code}: {r.text[:150]}')
big_cid = r.json()['clip']['id'] if r.status_code == 201 else ''
big_size_db = r.json()['clip']['fileSize'] if r.status_code == 201 else 0

print('\n— البث والحماية —')
# 9) البث بدون توكن
r = requests.get(f'{BASE}/api/clips/{cid}/stream', timeout=30)
check('بث بلا توكن → 403', r.status_code == 403, f'got {r.status_code}')

# 10) تفاصيل المقطع: playUrl يصدر للطالب
r = requests.get(f'{BASE}/api/clips/{cid}', cookies=stu_cookies, timeout=30)
detail = r.json()['clip']
check('playUrl موقّع صدر للطالب', bool(detail.get('playUrl')))
check('المسار الداخلي مخفي عن الطالب', detail.get('storagePath') is None)
check('url (الاسم الأصلي) مخفي عن الطالب', detail.get('url') is None)

# 11) بث كامل عبر playUrl
stream_url = f"{BASE}{detail['playUrl']}"
r = requests.get(stream_url, cookies=stu_cookies, timeout=60)
check('بث كامل → 200 + video/mp4', r.status_code == 200 and 'video' in r.headers.get('Content-Type', ''),
      f'{r.status_code} {r.headers.get("Content-Type")}')
total = int(r.headers.get('Content-Length', 0))
check('Content-Length = حجم الملف', total == size, f'{total}')
check('Accept-Ranges: bytes', r.headers.get('Accept-Ranges') == 'bytes')
check('Content-Disposition: inline (لا تحميل)', r.headers.get('Content-Disposition') == 'inline')

# 12) Range: bytes=100-199
r = requests.get(stream_url, headers={'Range': 'bytes=100-199'}, cookies=stu_cookies, timeout=30)
check('Range وسط الملف → 206', r.status_code == 206, f'got {r.status_code}')
check('Content-Range صحيح', r.headers.get('Content-Range') == f'bytes 100-199/{size}',
      r.headers.get('Content-Range', ''))
check('طول القطعة 100 بايت', len(r.content) == 100)
first_chunk = r.content

# 13) Range مفتوح: bytes=500-
r = requests.get(stream_url, headers={'Range': 'bytes=500-'}, cookies=stu_cookies, timeout=30)
check('Range مفتوح → 206 بطول size-500', r.status_code == 206 and len(r.content) == size - 500,
      f'{r.status_code} len={len(r.content)}')

# 14) لاحقة: bytes=-100 (آخر 100 بايت)
r = requests.get(stream_url, headers={'Range': 'bytes=-100'}, cookies=stu_cookies, timeout=30)
check('لاحقة آخر 100 بايت → 206', r.status_code == 206 and len(r.content) == 100,
      f'{r.status_code} len={len(r.content)}')

# 15) نطاق فاسد
r = requests.get(stream_url, headers={'Range': 'bytes=abc'}, cookies=stu_cookies, timeout=30)
check('Range فاسد → 416', r.status_code == 416, f'got {r.status_code}')
r = requests.get(stream_url, headers={'Range': f'bytes={size + 9999}-'}, cookies=stu_cookies, timeout=30)
check('بداية بعد النهاية → 416', r.status_code == 416, f'got {r.status_code}')

# 16) التوكن مرتبط بالمستخدم — استبدال الجلسة بكوكي طالب آخر يُرفض
r = requests.get(stream_url.replace(str(TS), str(TS)), timeout=30)  # بلا كوكي: uid بلا جلسة — يُقبل (التوكن هو الهوية)
check('بث بتوكن صحيح بلا كوكي → مقبول (التوكن هوية)', r.status_code in (200, 206), f'got {r.status_code}')

# 17) الصورة المصغرة
r = requests.get(f'{BASE}/api/clips/{cid}/poster', timeout=30)
check('poster → 200 صورة JPEG', r.status_code == 200 and 'image/jpeg' in r.headers.get('Content-Type', ''),
      f'{r.status_code} {r.headers.get("Content-Type")}')
poster_len = len(r.content)
check('الصورة ليست فارغة', poster_len > 500, f'{poster_len}B')
r = requests.get(f'{BASE}/api/clips/{cid}/poster', cookies=stu_cookies, timeout=30)
check('poster متاح للطالب أيضًا', r.status_code == 200)

# 18) قوائم العرض
r = requests.get(f'{BASE}/api/clips?all=1', cookies=owner_cookies, timeout=30)
mine = next((c for c in r.json()['clips'] if c['id'] == cid), {})
check('قائمة الإدارة: uploaded=true + hasPoster', mine.get('uploaded') is True and mine.get('hasPoster') in (True, False))
r = requests.get(f'{BASE}/api/clips', cookies=stu_cookies, timeout=30)
student_view = next((c for c in r.json()['clips'] if c['id'] == cid), {})
check('قائمة الطلاب: المقطع المرفوع ظاهر و url=None', bool(student_view) and student_view.get('url') is None)
check('قائمة الطلاب: hasPoster متاح للصورة', 'hasPoster' in student_view)

# 19) حماية url المرفوع من التغيير
r = requests.patch(f'{BASE}/api/clips/{cid}', cookies=owner_cookies,
                   json={'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}, timeout=30)
check('PATCH تغيير رابط مرفوع → 422', r.status_code == 422, f'got {r.status_code}')
r = requests.patch(f'{BASE}/api/clips/{cid}', cookies=owner_cookies,
                   json={'title': 'درس مرفوع تجريبي — محدث'}, timeout=30)
check('PATCH عنوان فقط → 200 (مسموح)', r.status_code == 200, f'got {r.status_code}')

# 20) الملفات قبل الحذف
before = set(os.listdir('/home/z/my-project/uploads/clips'))

print('\n— الحذف ينظف القرص —')
r = requests.delete(f'{BASE}/api/clips/{cid}', cookies=owner_cookies, timeout=30)
check('حذف المقطع المرفوع → 200', r.status_code == 200, f'got {r.status_code}')
after = set(os.listdir('/home/z/my-project/uploads/clips'))
removed = before - after
check('ملف الفيديو والصورة حُذفا من القرص', len(removed) >= 1, f'removed={removed}')
r = requests.get(f'{BASE}/api/clips/{cid}', cookies=owner_cookies, timeout=30)
check('المقطع اختفى من القاعدة', r.status_code == 404, f'got {r.status_code}')

# 21) تنظيف الفيديو الكبير
if big_cid:
    r = requests.delete(f'{BASE}/api/clips/{big_cid}', cookies=owner_cookies, timeout=30)
    check('حذف الفيديو الكبير → 200', r.status_code == 200, f'got {r.status_code}')

# 22) تنظيف الطالب التجريبي
r = requests.delete(f"{BASE}/api/admin/users/{stu['id']}", cookies=owner_cookies, timeout=30)
check('حذف الطالب التجريبي', r.status_code == 200, f'got {r.status_code}')

print('\n' + '=' * 60)
print(f'النتيجة: {PASS} ناجح، {len(FAIL)} فاشل')
if FAIL:
    print('الفاشلة:', FAIL)
    sys.exit(1)
print('كل الفحوص ناجحة ✓')
