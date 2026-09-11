#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اختبارات الحماية من الهجمات السيبرانية وضغط السيرفر — منصة قدراتك (Task 12)
============================================================================
ترتيب الفحوص مقصود (الأخيرة تستهلك ميزانية الحدود):
  1-3 ترويسات الأمان + صحة الخدمة
  4   قفل الحساب بعد 5 محاولات دخول خاطئة (423) + استمرار القفل بالمرور الصحيح
  5   حد IP على تأكيد البريد (12/دقيقة → 429)
  6   حد المستخدم على المساعد الذكي (20/دقيقة → 429) بطلبات رخيصة 422 بلا استدعاء LLM
  7   حجب الأجسام الضخمة 11MB → 413
  8   حد التسجيل (10/ساعة → 429) بمحاولات بريد مكرر
  9   الطوفان العام (240/دقيقة → 429) — آخر فحص
  10  تنظيف الحساب التجريبي بصلاحية المالك
ملاحظة إعادة التشغيل: الحدود بالذاكرة — إعادة تشغيل خادم التطوير تصفّرها.
"""
import json
import os
import sys
import time

import requests

BASE = "http://localhost:3000"
TS = int(time.time())
LOCK_EMAIL = f"sec-t12-{TS}@gmail.com"
PASSWORD = "SecTest@1234"
OWNER_EMAIL, OWNER_PASSWORD = "owner@example.com", "OWNER_PASS_PLACEHOLDER"
# وضع خفيف: يتخطى الفحوص التي تستهلك ميزانية التسجيل (لإعادة التشغيل خلال ساعة)
LITE = "--lite" in sys.argv

results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond)))
    print(f"{'✅' if cond else '❌'} {name}" + (f" — {detail}" if detail else ""))


def login(email, password):
    r = requests.post(f"{BASE}/api/auth/login", json={"email": email, "password": password}, timeout=30)
    return r


# ---------- 1) ترويسات الأمان ----------
r = requests.get(BASE + "/", timeout=30)
hdrs = r.headers
check("CSP على الصفحات (frame-ancestors + object-src none)",
      "content-security-policy" in {k.lower() for k in hdrs}
      and "frame-ancestors 'self'" in hdrs.get("Content-Security-Policy", "")
      and "object-src 'none'" in hdrs.get("Content-Security-Policy", ""))
check("nosniff يمنع تخمين أنواع المحتوى", hdrs.get("X-Content-Type-Options", "").lower() == "nosniff")
check("Referrer-Policy لا يسرب المسارات الكاملة", hdrs.get("Referrer-Policy") == "strict-origin-when-cross-origin")
check("Permissions-Policy تقطع الكاميرا والميكروفون والموقع",
      "camera=()" in hdrs.get("Permissions-Policy", "") and "microphone=()" in hdrs.get("Permissions-Policy", ""))
check("HSTS مفعل", "max-age=" in hdrs.get("Strict-Transport-Security", ""))

r = requests.get(BASE + "/api/leaderboard", timeout=30)
check("CSP على استجابات API أيضًا", "content-security-policy" in {k.lower() for k in r.headers})

# ---------- 2) صحة الخدمة الطبيعية ----------
r = login("student@qudratak.sa", "Student@1234")
check("دخول الطالب التجريبي طبيعي 200", r.status_code == 200, f"got {r.status_code}")
student_token = r.json().get("token", "")

# ---------- 3) إنشاء حساب اختبار للقفل ----------
created = False
if not LITE:
    r = requests.post(f"{BASE}/api/auth/register", json={
        "name": "اختبار أمن سيبراني", "email": LOCK_EMAIL, "password": PASSWORD, "grade": "السنة الثالثة ثانوي",
    }, timeout=60)
    check("إنشاء حساب اختبار القفل", r.status_code == 200, f"got {r.status_code}")
    created = r.status_code == 200
else:
    print("⏭️ وضع خفيف: تخطي إنشاء حساب القفل")

# ---------- 4) قفل الحساب ضد تخمين كلمة المرور ----------
if not LITE:
    codes = []
    for i in range(1, 6):
        r = login(LOCK_EMAIL, "WrongPass@999")
        codes.append(r.status_code)
    check("المحاولات 1-4 خاطئة → 401 (بلا كشف حالة القفل)", codes[:4] == [401] * 4, str(codes[:4]))
    check("المحاولة الخامسة تفعّل القفل → 423", codes[4] == 423, str(codes))

    r = login(LOCK_EMAIL, PASSWORD)  # كلمة المرور الصحيحة لكن الحساب مقفول
    check("المرور الصحيح مرفوض أثناء القفل → 423", r.status_code == 423, f"got {r.status_code}")
    check("رسالة القفل تذكر المدة", "15" in r.json().get("error", "") or "مؤقتًا" in r.json().get("error", ""))

    r = login(LOCK_EMAIL, "WrongPass@999")
    check("بعد القفل كل المحاولات → 423 حتى الخاطئة", r.status_code == 423, f"got {r.status_code}")
else:
    print("⏭️ وضع خفيف: تخطي قفل الحساب")

# ---------- 5) حد IP على تأكيد البريد ----------
# بريدات متغيرة عشوائية — كي نقيس حد المصدر (12/دقيقة) لا حد محاولات الرمز (5)
codes = []
retry_after_seen = None
for i in range(13):
    r = requests.post(f"{BASE}/api/auth/verify", json={"email": f"no-user-{TS}-{i}@gmail.com", "code": "000000"}, timeout=30)
    codes.append(r.status_code)
    retry_after_seen = r.headers.get("Retry-After") or retry_after_seen
check("بريدات متغيرة → أول 12 طلب 400 (رمز خاطئ) والثالث عشر → 429 (حد المصدر)",
      codes[:12] == [400] * 12 and codes[12] == 429, str(codes))
check("429 يرفق ترويسة Retry-After", retry_after_seen is not None)

# ---------- 6) حد المستخدم على المساعد الذكي (بلا تكلفة LLM) ----------
codes = []
for i in range(21):
    r = requests.post(f"{BASE}/api/ai/chat", json={}, timeout=30,
                      headers={"Authorization": f"Bearer {student_token}"})
    codes.append(r.status_code)
check("أول 20 طلب AI فاضي → 422 (عدّاد الحد يعمل قبل التحقق)", codes[:20] == [422] * 20, str(codes))
check("الطلب 21 على المساعد → 429 حماية التكلفة", codes[20] == 429, str(codes[20]))

# ---------- 7) حجب الأجسام الضخمة ----------
r = requests.post(f"{BASE}/api/auth/login", data=b"x" * (11 * 1024 * 1024),
                  headers={"Content-Type": "application/json"}, timeout=60)
check("جسم ضخم 11MB → 413 رفض مبكر", r.status_code == 413, f"got {r.status_code}")

# ---------- 8) حد التسجيل الجماعي (10/ساعة) ----------
if not LITE:
    codes = []
    for i in range(10):  # 1 سابقة + 9 مكررة 409 ثم العاشرة+1 → 429
        r = requests.post(f"{BASE}/api/auth/register", json={
            "name": "اختبار حد التسجيل", "email": LOCK_EMAIL, "password": PASSWORD,
        }, timeout=30)
        codes.append(r.status_code)
    check("التسجيل المكرر يُرد 409 ضمن الحد", codes[:9] == [409] * 9, str(codes[:9]))
    check("الطلب 11 للتسجيل → 429 (10/ساعة/جهاز)", codes[9] == 429, str(codes[9]))
else:
    print("⏭️ وضع خفيف: تخطي حد التسجيل")

# ---------- 9) الطوفان العام على الـ APIs (آخر فحص — يستهلك ميزانية الدقيقة) ----------
flood_429 = 0
flood_ok = 0
for i in range(260):
    try:
        r = requests.get(BASE + "/api/leaderboard", timeout=10)
        if r.status_code == 429:
            flood_429 += 1
        elif r.status_code == 200:
            flood_ok += 1
    except Exception:
        pass
check("طوفان 260 طلب → صرحت 429 على المتجاوز", flood_429 >= 10, f"429×{flood_429} / 200×{flood_ok}")

# ---------- 10) تنظيف الحسابات التجريبية ----------
# اختبار الطوفان استنفد ميزانية الدقيقة — ننتظر رفع الحظر قبل تنظيف (الحد بالذاكرة)
print("⏳ انتظر 65 ثانية لانتهاء نافذة الطوفان قبل التنظيف...")
time.sleep(65)


def cleanup():
    ro = login(OWNER_EMAIL, OWNER_PASSWORD)
    if ro.status_code != 200:
        return False, f"دخول المالك فشل {ro.status_code}"
    otok = ro.json().get("token", "")
    ru = requests.get(f"{BASE}/api/admin/users", headers={"Authorization": f"Bearer {otok}"}, timeout=30)
    users = ru.json().get("users", [])
    # نحذف كل حسابات اختبار الأمن (هذه الجلسة وأي بقايا سابقة)
    targets = [u for u in users if str(u.get("email", "")).startswith("sec-t12-")]
    if not targets:
        return True, "لا حسابات اختبار"
    ok_all = True
    for u in targets:
        rd = requests.delete(f"{BASE}/api/admin/users/{u['id']}",
                             headers={"Authorization": f"Bearer {otok}"}, timeout=30)
        ok_all = ok_all and rd.status_code == 200
    return ok_all, f"حُذف {len(targets)} حساب"


ok_clean, msg = False, ""
for attempt in range(3):
    try:
        ok_clean, msg = cleanup()
        if ok_clean:
            break
    except Exception as e:
        msg = str(e)
    print(f"🔄 إعادة محاولة التنظيف بعد 65 ثانية ({attempt + 1}/3)...")
    time.sleep(65)
check("تنظيف حسابات اختبار الأمن", ok_clean, msg)

# ---------- النتيجة ----------
passed = sum(1 for _, ok in results if ok)
print(f"\n{'=' * 50}\nالنتيجة: {passed}/{len(results)}")
with open(os.path.join(os.path.dirname(__file__), "security-results.json"), "w", encoding="utf-8") as f:
    json.dump([{"name": n, "ok": ok} for n, ok in results], f, ensure_ascii=False, indent=2)
sys.exit(0 if passed == len(results) else 1)
