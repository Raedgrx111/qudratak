#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""اختبار حي لبوابة البريد الحقيقي عبر API التسجيل الفعلي (Task 13)"""
import sys
import time

import requests

BASE = "http://localhost:3000"
TS = int(time.time())
results = []


def check(name, cond, detail=""):
    results.append((name, bool(cond)))
    print(f"{'✅' if cond else '❌'} {name}" + (f" — {detail}" if detail else ""))


def reg(name, email, password="LiveTest@1234"):
    return requests.post(f"{BASE}/api/auth/register", json={
        "name": name, "email": email, "password": password, "grade": "السنة الثالثة ثانوي",
    }, timeout=60)


# 1) نمط عشوائي واضح (حروف بلا علة 15 حرفًا) → رفض فوري
r = reg("اختبار عشوائي", "xkqwrtyplkjmnbv@gmail.com")
check("بريد عشوائي بلا حروف علة → 422 رفض", r.status_code == 422 and "عشوائيًا" in r.json().get("error", ""),
      f"{r.status_code} {r.json().get('error', '')[:50]}")

# 2) حرف مكرر 5 مرات → رفض فوري
r = reg("اختبار مكرر", "aaaaa111@gmail.com")
check("بريد بحرف مكرر 5 مرات → 422 رفض", r.status_code == 422 and "عشوائيًا" in r.json().get("error", ""),
      f"{r.status_code} {r.json().get('error', '')[:50]}")

# 3) بريد حقيقي الشكل → يمر (الـ probe هنا fail-open لأن المنفذ 25 محجوب بالمعاينة)
good_email = f"abdullah.almutairi.{TS}@gmail.com"
r = reg("عبدالله المطيري (اختبار حي)", good_email)
check("بريد حقيقي الشكل → 200 تسجيل ناجح", r.status_code == 200, f"{r.status_code} {r.json().get('error', '')[:50]}")

# 4) المكرر الآن 409 (يعمل التسجيل الطبيعي كما هو)
r = reg("اختبار مكرر ثاني", good_email)
check("نفس البريد مجددًا → 409 مكرر", r.status_code == 409, f"{r.status_code}")

# تنظيف: حذف الحساب الحي عبر صلاحية المالك
ro = requests.post(f"{BASE}/api/auth/login", json={"email": "owner@example.com", "password": "OWNER_PASS_PLACEHOLDER"}, timeout=30)
otok = ro.json().get("token", "")
ru = requests.get(f"{BASE}/api/admin/users", headers={"Authorization": f"Bearer {otok}"}, timeout=30)
targets = [u for u in ru.json().get("users", []) if "abdullah.almutairi." in str(u.get("email", ""))]
ok_del = all(requests.delete(f"{BASE}/api/admin/users/{u['id']}", headers={"Authorization": f"Bearer {otok}"},
                            timeout=30).status_code == 200 for u in targets)
check("تنظيف الحساب التجريبي", ok_del and len(targets) >= 1, f"حُذف {len(targets)}")

passed = sum(1 for _, ok in results if ok)
print(f"\n{'=' * 44}\nالنتيجة: {passed}/{len(results)}")
sys.exit(0 if passed == len(results) else 1)
