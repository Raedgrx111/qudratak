# -*- coding: utf-8 -*-
# E2E: حماية المقاطع من التحميل + نسخ الرابط + العلامة المائية
import json, sys, time
import urllib.request
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
RESULTS = []

def check(name, cond, extra=""):
    RESULTS.append((name, bool(cond), extra))
    print(("✓ " if cond else "✗ ") + name + (f" — {extra}" if (extra and not cond) else ""))

def api(method, path, body=None, token=None, cookies=None):
    req = urllib.request.Request(BASE + path, method=method)
    req.add_header("Content-Type", "application/json")
    if token: req.add_header("Authorization", "Bearer " + token)
    data = json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(req, data=data) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode())

CLICK_JS = """
(el) => {
  const r = el.getBoundingClientRect();
  const o = { bubbles: true, cancelable: true, view: window,
              clientX: r.x + r.width/2, clientY: r.y + r.height/2 };
  el.dispatchEvent(new PointerEvent('pointerdown', o));
  el.dispatchEvent(new MouseEvent('mousedown', o));
  el.dispatchEvent(new PointerEvent('pointerup', o));
  el.dispatchEvent(new MouseEvent('mouseup', o));
  el.dispatchEvent(new MouseEvent('click', o));
}
"""

# ---------- تجهيز البيانات عبر API ----------
ts = int(time.time())
stu = api("POST", "/api/auth/register", {
    "name": "طالب الحماية", "email": f"prot-{ts}@qudratak.sa",
    "password": "Test@12345", "grade": "السنة الأولى ثانوي"})
STU_TOKEN = stu.get("token")
check("تسجيل طالب الحماية", bool(STU_TOKEN), str(stu)[:120])

own = api("POST", "/api/auth/login", {"email": "owner@example.com", "password": "OWNER_PASS_PLACEHOLDER"})
OWN_TOKEN = own.get("token")
check("دخول المالك", bool(OWN_TOKEN))

clip = api("POST", "/api/clips", {
    "title": "درس الحماية التجريبي — بث محمي",
    "url": "http://127.0.0.1:3000/test-clip.mp4",
    "category": "GENERAL",
    "description": "مقطع تجريبي للتحقق من منع التحميل وزر نسخ الرابط."}, OWN_TOKEN)
CLIP_ID = clip.get("clip", {}).get("id")
check("إنشاء مقطع ملفي للتجربة", bool(CLIP_ID), str(clip)[:120])

detail = api("GET", f"/api/clips/{CLIP_ID}", token=STU_TOKEN)
check("API: الطالب يحصل playUrl بلا url", detail.get("clip", {}).get("url") is None and "/stream?" in (detail.get("clip", {}).get("playUrl") or ""))

with sync_playwright() as p:
    browser = p.chromium.launch()

    # ===== سياق الطالب =====
    ctx = browser.new_context(viewport={"width": 1280, "height": 800})
    ctx.grant_permissions(["clipboard-read", "clipboard-write"], origin=BASE)
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.add_init_script(f"localStorage.setItem('qudratak_token', '{STU_TOKEN}')")

    stream_hits = []
    page.on("response", lambda r: stream_hits.append(r.status) if "/stream?" in r.url else None)

    # 1) مكتبة المقاطع
    page.goto(f"{BASE}/clips", wait_until="networkidle")
    card = page.locator(f'[aria-label="فتح المقطع: درس الحماية التجريبي — بث محمي"]')
    card.wait_for(state="visible", timeout=15000)
    check("المكتبة تعرض بطاقة المقطع الملفي", card.is_visible())

    # 2) زر نسخ الرابط على البطاقة + التحقق من الحافظة
    share = page.locator('[aria-label^="نسخ رابط المقطع: درس الحماية التجريبي"]')
    share.dispatch_event("click") if False else page.evaluate(CLICK_JS, share.element_handle())
    page.wait_for_selector("[data-sonner-toast]", timeout=8000)
    toast_txt = page.inner_text("[data-sonner-toast]")
    check("ظهور تأكيد النسخ", "نُسخ رابط المقطع" in toast_txt, toast_txt)
    time.sleep(0.4)
    cb = page.evaluate("navigator.clipboard.readText()")
    check("الحافظة تحوي رابط المقطع النظيف", cb == f"{BASE}/clips/{CLIP_ID}", cb or "(فارغة)")
    page.screenshot(path="scripts/clip-protect-library.png")

    # 3) فتح الرابط المنسوخ — صفحة المشاهدة
    page.goto(cb, wait_until="networkidle")
    video = page.locator("video")
    video.wait_for(state="attached", timeout=15000)
    vsrc = video.get_attribute("src") or ""
    check("مشغل الفيديو يستهلك رابط البث الموقّع", "/stream?" in vsrc and "uid=" in vsrc and "tk=" in vsrc, vsrc[:80])
    check("رابط المصدر غير موجود في src", "test-clip.mp4" not in vsrc)
    body_html = page.content()
    check("رابط المصدر غير موجود في صفحة المشاهدة إطلاقًا", "test-clip.mp4" not in body_html)
    csl = video.get_attribute("controlslist") or ""
    check("زر التحميل معطل في المشغل", "nodownload" in csl, csl)
    check("PiP معطل", video.get_attribute("disablepictureinpicture") is not None)
    wm = page.evaluate("document.querySelectorAll('div[aria-hidden] span').length")
    check("العلامة المائية معروضة (6 مواضع)", wm >= 6, str(wm))

    # 4) البث الفعلي عبر المسار المحمي + تشغيل حقيقي
    page.evaluate("""() => { const v = document.querySelector('video'); v.muted = true; return v.play().then(() => true).catch(() => false); }""")
    ok_play = page.wait_for_function("() => { const v = document.querySelector('video'); return v && v.currentTime > 0.4; }", timeout=15000)
    check("الفيديو يشغّل فعليًا عبر البث المحمي", bool(ok_play))
    check("طلب البث عبر /stream نجح (200/206)", stream_hits and all(s in (200, 206) for s in stream_hits), str(stream_hits))
    page.screenshot(path="scripts/clip-protect-playing.png")

    # 5) منع قائمة الزر الأيمن على المشغل
    prevented = page.evaluate("""() => {
      const v = document.querySelector('video');
      const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      v.dispatchEvent(ev);
      return ev.defaultPrevented;
    }""")
    check("الزر الأيمن ممنوع على المشغل", prevented)

    # 6) زر نسخ الرابط داخل صفحة المشاهدة
    btn = page.get_by_role("button", name="نسخ رابط المقطع")
    page.evaluate(CLICK_JS, btn.element_handle())
    page.wait_for_selector("[data-sonner-toast]", timeout=8000)
    time.sleep(0.4)
    cb2 = page.evaluate("navigator.clipboard.readText()")
    check("نسخ الرابط من صفحة المشاهدة", cb2 == f"{BASE}/clips/{CLIP_ID}", cb2 or "(فارغة)")

    # 7) مقاطع ذات صلة + زر العودة
    check("قسم مقاطع ذات صلة ظاهر", page.get_by_role("heading", name="مقاطع ذات صلة").is_visible())
    page.get_by_role("button", name="كل المقاطع").dispatch_event("click")
    page.wait_for_url(f"{BASE}/clips", timeout=8000)
    check("زر العودة يعمل إلى المكتبة", page.url.rstrip("/") == f"{BASE}/clips")

    # ===== سياق الزائر (بدون حساب) =====
    gctx = browser.new_context(viewport={"width": 1280, "height": 800})
    gpage = gctx.new_page()
    gpage.goto(f"{BASE}/clips/{CLIP_ID}", wait_until="networkidle")
    lock = gpage.get_by_text("مشاهدة المقاطع متاحة لأعضاء المنصة فقط")
    lock.wait_for(state="visible", timeout=15000)
    check("الزائر يرى بوابة تسجيل الدخول بدل المشغل", lock.is_visible())
    check("لا يوجد عنصر فيديو للزائر", gpage.locator("video").count() == 0)
    check("لا تسرب لرابط البث في صفحة الزائر", "/stream?" not in gpage.content())
    gpage.screenshot(path="scripts/clip-protect-guest.png")

    # ===== سياق المالك — لوحة الإدارة =====
    octx = browser.new_context(viewport={"width": 1280, "height": 800})
    opage = octx.new_page()
    opage.add_init_script(f"localStorage.setItem('qudratak_token', '{OWN_TOKEN}')")
    opage.goto(f"{BASE}/admin/clips", wait_until="networkidle")
    badge = opage.get_by_text("محمي من التحميل").first
    badge.wait_for(state="visible", timeout=15000)
    check("لوحة الإدارة تعرض شارة الحماية", badge.is_visible())
    opage.screenshot(path="scripts/clip-protect-admin.png", full_page=True)

    check("صفر أخطاء كونسول", len(errors) == 0, "; ".join(errors[:3]))
    browser.close()

# ---------- تنظيف ----------
d = api("DELETE", f"/api/clips/{CLIP_ID}", token=OWN_TOKEN)
check("حذف المقطع التجريبي (تنظيف)", d.get("ok") is True)

fails = [r for r in RESULTS if not r[1]]
print(f"\n==== النتيجة: {len(RESULTS)-len(fails)}/{len(RESULTS)} ====")
sys.exit(1 if fails else 0)
