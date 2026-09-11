# -*- coding: utf-8 -*-
# فحص سريع: جوال 390px + صفحة مشاهدة مقطع يوتيوب (علامة مائية فوق التضمين)
import json, time, urllib.request, sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
def api(method, path, body=None, token=None):
    req = urllib.request.Request(BASE + path, method=method)
    req.add_header("Content-Type", "application/json")
    if token: req.add_header("Authorization", "Bearer " + token)
    data = json.dumps(body).encode() if body is not None else None
    with urllib.request.urlopen(req, data=data) as r:
        return json.loads(r.read().decode())

ts = int(time.time())
stu = api("POST", "/api/auth/register", {"name": "طالب الجوال", "email": f"mob-{ts}@qudratak.sa", "password": "Test@12345", "grade": "السنة الثالثة ثانوي"})
TOKEN = stu["token"]
yt = api("GET", "/api/clips?category=QUANTITATIVE")["clips"][0]

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.add_init_script(f"localStorage.setItem('qudratak_token', '{TOKEN}')")

    # صفحة مشاهدة مقطع يوتيوب — العلامة المائية فوق التضمين + زر النسخ
    page.goto(f"{BASE}/clips/{yt['id']}", wait_until="networkidle")
    page.locator("iframe").first.wait_for(state="attached", timeout=15000)
    wm = page.evaluate("document.querySelectorAll('div[aria-hidden] span').length")
    btn = page.get_by_role("button", name="نسخ رابط المقطع")
    note = page.get_by_text("مقطع مضمّن من يوتيوب مع علامة مائية")
    print("✓ علامة مائية فوق يوتيوب" if wm >= 6 else f"✗ علامة مائية ({wm})")
    print("✓ زر النسخ ظاهر" if btn.is_visible() else "✗ زر النسخ")
    print("✓ شريط حماية يوتيوب" if note.is_visible() else "✗ شريط حماية يوتيوب")
    page.screenshot(path="scripts/clip-protect-yt-mobile.png", full_page=True)

    # جوال: صفحة المشاهدة لملف محمي عبر مكتبة عامة
    page.goto(f"{BASE}/clips", wait_until="networkidle")
    page.screenshot(path="scripts/clip-protect-mobile-library.png", full_page=True)
    b.close()
print("done")
