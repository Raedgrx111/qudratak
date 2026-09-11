#!/bin/bash
# ===== اختبار شامل لجميع تدفقات منصة قدراتك =====
BASE="http://localhost:3000/api"
PASS=0
FAIL=0

check() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  if echo "$actual" | grep -q "$expected"; then
    PASS=$((PASS+1))
    echo "✓ $name"
  else
    FAIL=$((FAIL+1))
    echo "✗ $name — Expected: [$expected] Got: $(echo $actual | head -c 200)"
  fi
}

# ---------- 1) تسجيل طالب جديد ----------
UNIQ=$(date +%s)
R=$(curl -s -X POST $BASE/auth/register -H 'Content-Type: application/json' -d "{\"name\":\"طالب اختبار\",\"email\":\"test-$UNIQ@gmail.com\",\"password\":\"Test@12345\",\"grade\":\"السنة الثالثة ثانوي\"}" -c /tmp/stu.txt)
check "تسجيل طالب جديد" '"role":"STUDENT"' "$R"

# إعادة تسجيل نفس البريد (يجب أن يفشل)
R=$(curl -s -X POST $BASE/auth/register -H 'Content-Type: application/json' -d "{\"name\":\"مكرر\",\"email\":\"test-$UNIQ@gmail.com\",\"password\":\"Test@12345\"}")
check "منع تكرار البريد" 'مسجل مسبقًا' "$R"

# ---------- 1-ب) حماية البريد الوهمي + تأكيد البريد ----------
R=$(curl -s -X POST $BASE/auth/register -H 'Content-Type: application/json' -d "{\"name\":\"وهمي\",\"email\":\"tmp-$UNIQ@mailinator.com\",\"password\":\"Test@12345\"}")
check "رفض بريد مؤقت (mailinator)" 'وهمي' "$R"

R=$(curl -s -X POST $BASE/auth/register -H 'Content-Type: application/json' -d "{\"name\":\"وهمي\",\"email\":\"nomx-$UNIQ@qudratak.sa\",\"password\":\"Test@12345\"}")
check "رفض نطاق بلا سجلات MX" 'لا يقبل الرسائل' "$R"

# الطالب غير الموثق: المحتوى مقفل
R=$(curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"test-$UNIQ@gmail.com\",\"password\":\"Test@12345\"}" | python3 -c "import sys,json;u=json.load(sys.stdin)['user'];print(u['emailVerified'])" 2>/dev/null)
check "الحساب الجديد غير موثق" 'False' "$R"

python3 scripts/set-verify-code.py test-$UNIQ@gmail.com 468091 > /dev/null
R=$(curl -s -X POST $BASE/auth/verify -H 'Content-Type: application/json' -d "{\"email\":\"test-$UNIQ@gmail.com\",\"code\":\"999111\"}")
check "رفض رمز خاطئ" 'غير صحيح' "$R"

R=$(curl -s -X POST $BASE/auth/verify -H 'Content-Type: application/json' -d "{\"email\":\"test-$UNIQ@gmail.com\",\"code\":\"468091\"}" -c /tmp/stu.txt)
check "التوثيق بالرمز الصحيح" '"emailVerified":true' "$R"

# ---------- 2) الدخول ----------
R=$(curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"test-$UNIQ@gmail.com\",\"password\":\"Test@12345\"}" -c /tmp/stu.txt)
check "دخول الطالب" 'طالب اختبار' "$R"

# دخول خاطئ
R=$(curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"test-$UNIQ@gmail.com\",\"password\":\"wrong\"}")
check "رفض كلمة مرور خاطئة" 'غير صحيحة' "$R"

# ---------- 2-ب) توكن Bearer (بديل الكوكيز داخل iframes) ----------
BT=$(echo "$R" | head -c 0; curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"test-$UNIQ@gmail.com\",\"password\":\"Test@12345\"}" | python3 -c "import sys,json;print(json.load(sys.stdin).get('token',''))" 2>/dev/null)
check "إرجاع توكن عند الدخول" 'eyJ' "$BT"
R=$(curl -s $BASE/auth/me -H "Authorization: Bearer $BT")
check "الجلسة عبر Bearer بدون كوكي" '"role":"STUDENT"' "$R"
R=$(curl -s $BASE/stats/dashboard -H "Authorization: Bearer $BT")
check "واجهة محمية عبر Bearer" '"totals"' "$R"
R=$(curl -s $BASE/auth/me -H "Authorization: Bearer invalid-token-xyz")
check "رفض توكن غير صالح" '"user":null' "$R"

# ---------- 3) الملف الشخصي ----------
R=$(curl -s -b /tmp/stu.txt $BASE/auth/me)
check "جلب الجلسة" "test-$UNIQ@gmail.com" "$R"

R=$(curl -s -b /tmp/stu.txt -X PATCH $BASE/auth/me -H 'Content-Type: application/json' -d '{"name":"طالب محدث","grade":"خريج"}')
check "تحديث الملف الشخصي" 'محدث' "$R"

# ---------- 4) الأسئلة ----------
R=$(curl -s "$BASE/questions?limit=5&random=1")
check "قائمة أسئلة عشوائية" '"total"' "$R"
# تأكد أن الإجابات مخفية عن الطالب
if echo "$R" | grep -q "correctAnswer"; then
  FAIL=$((FAIL+1)); echo "✗ إخفاء الإجابة عن الزائر (تسرب!)"
else
  PASS=$((PASS+1)); echo "✓ إخفاء الإجابة عن الزائر"
fi

R=$(curl -s "$BASE/questions?category=VERBAL&difficulty=HARD&limit=2")
check "فلترة لفظي صعب" '"category":"VERBAL"' "$R"

R=$(curl -s "$BASE/questions?search=%D9%81%D9%8A%D8%AB%D8%A7%D8%BA%D9%88%D8%B1%D8%B3&limit=3")
check "البحث النصي" '"total"' "$R"

QID=$(echo "$R" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['questions'][0]['id'] if d['questions'] else '')" 2>/dev/null)
if [ -z "$QID" ]; then
  R=$(curl -s "$BASE/questions?limit=1")
  QID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['questions'][0]['id'])")
fi

# ---------- 5) الإجابة والتدريب ----------
R=$(curl -s -b /tmp/stu.txt -X POST $BASE/questions/$QID/answer -H 'Content-Type: application/json' -d '{"selectedKey":"أ"}')
check "تسجيل إجابة (أ)" '"explanation"' "$R"

# ---------- 6) المفضلة ----------
R=$(curl -s -b /tmp/stu.txt -X POST $BASE/questions/$QID/favorite)
check "إضافة للمفضلة" '"favorite":true' "$R"
R=$(curl -s -b /tmp/stu.txt $BASE/favorites)
check "قائمة المفضلة" "$QID" "$R"
R=$(curl -s -b /tmp/stu.txt -X POST $BASE/questions/$QID/favorite)
check "إزالة من المفضلة" '"favorite":false' "$R"

# ---------- 7) التعليقات ----------
R=$(curl -s -b /tmp/stu.txt -X POST $BASE/questions/$QID/comments -H 'Content-Type: application/json' -d '{"text":"سؤال ممتاز، هل يمكن شرح الطريقة الثانية؟"}')
check "إضافة تعليق" 'ممتاز' "$R"
CID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['comment']['id'])")

R=$(curl -s -b /tmp/stu.txt -X POST $BASE/questions/$QID/comments -H 'Content-Type: application/json' -d "{\"text\":\"شكرًا على التوضيح\",\"parentId\":\"$CID\"}")
check "الرد على تعليق" 'شكرًا' "$R"

R=$(curl -s -b /tmp/stu.txt -X POST $BASE/comments/$CID/like)
check "إعجاب بتعليق" '"liked":true' "$R"
R=$(curl -s -b /tmp/stu.txt -X POST $BASE/comments/$CID/like)
check "إلغاء الإعجاب" '"liked":false' "$R"

R=$(curl -s "$BASE/questions/$QID/comments")
check "جلب سلسلة النقاش" 'ممتاز' "$R"

# ---------- 8) الاختبارات ----------
R=$(curl -s -b /tmp/stu.txt $BASE/exams)
check "قائمة الاختبارات" 'محاكاة' "$R"
EXID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['exams'][0]['id'])")

R=$(curl -s -b /tmp/stu.txt -X POST $BASE/exams/$EXID/start)
check "بدء محاولة" '"attemptId"' "$R"
AID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['attemptId'])")

R=$(curl -s -b /tmp/stu.txt $BASE/attempts/$AID)
check "جلب حالة المحاولة" '"remainingSeconds"' "$R"
# تأكد من عدم تسرب الإجابات الصحيحة
if echo "$R" | grep -q "correctAnswer"; then
  FAIL=$((FAIL+1)); echo "✗ عدم تسرب الإجابات أثناء الاختبار (تسرب!)"
else
  PASS=$((PASS+1)); echo "✓ عدم تسرب الإجابات أثناء الاختبار"
fi
Q1=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['questions'][0]['id'])")
Q2=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['questions'][1]['id'])")

R=$(curl -s -b /tmp/stu.txt -X PATCH $BASE/attempts/$AID -H 'Content-Type: application/json' -d "{\"questionId\":\"$Q1\",\"selectedKey\":\"أ\"}")
check "حفظ إجابة مؤقتة" '"ok":true' "$R"

R=$(curl -s -b /tmp/stu.txt -X POST $BASE/attempts/$AID/submit)
check "تسليم وتصحيح آلي" '"score"' "$R"
check "تحليل المواضيع" '"topicsAnalysis"' "$R"

R=$(curl -s -b /tmp/stu.txt $BASE/attempts)
check "سجل المحاولات" "$EXID" "$R"

# ---------- 9) إحصائيات الطالب ----------
R=$(curl -s -b /tmp/stu.txt $BASE/stats/dashboard)
check "لوحة الطالب — إجماليات" '"accuracy"' "$R"
check "لوحة الطالب — منحنى التقدم" '"progressSeries"' "$R"

# ---------- 10) تدفقات المعلم ----------
R=$(curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' -d '{"email":"teacher@qudratak.sa","password":"Teacher@1234"}' -c /tmp/tea.txt)
check "دخول المعلم" 'خالد' "$R"

# منع الطالب من صلاحيات المعلم
R=$(curl -s -b /tmp/stu.txt -X POST $BASE/questions -H 'Content-Type: application/json' -d '{}')
check "منع الطالب من إنشاء أسئلة" 'متاحة' "$R"

R=$(curl -s -b /tmp/tea.txt $BASE/stats/admin)
check "إحصائيات الإدارة" '"students"' "$R"

# إنشاء سؤال
R=$(curl -s -b /tmp/tea.txt -X POST $BASE/questions -H 'Content-Type: application/json' -d '{"category":"QUANTITATIVE","topic":"الحساب والنسبة المئوية","difficulty":"EASY","text":"ما ناتج 15 + 27؟","choices":[{"key":"أ","text":"42"},{"key":"ب","text":"40"},{"key":"ج","text":"44"},{"key":"د","text":"32"}],"correctAnswer":"أ","explanation":"15 + 27 = 42"}')
check "إنشاء سؤال جديد" '"correctAnswer":"أ"' "$R"
NQID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['question']['id'])")

# تعديل السؤال
R=$(curl -s -b /tmp/tea.txt -X PUT $BASE/questions/$NQID -H 'Content-Type: application/json' -d '{"category":"QUANTITATIVE","topic":"الحساب والنسبة المئوية","difficulty":"MEDIUM","text":"ما ناتج 15 + 28؟","choices":[{"key":"أ","text":"42"},{"key":"ب","text":"43"},{"key":"ج","text":"44"},{"key":"د","text":"45"}],"correctAnswer":"ب","explanation":"15 + 28 = 43"}')
check "تعديل السؤال" '15 + 28' "$R"

# تثبيت تعليق
R=$(curl -s -b /tmp/tea.txt -X PATCH $BASE/comments/$CID -H 'Content-Type: application/json' -d '{"isPinned":true}')
check "تثبيت تعليق (معلم)" '"isPinned":true' "$R"

R=$(curl -s -b /tmp/tea.txt $BASE/admin/comments)
check "قائمة إشراف التعليقات" '"comments"' "$R"

R=$(curl -s -b /tmp/tea.txt $BASE/admin/students)
check "قائمة الطلاب" 'test-e2e' "$R"

# إنشاء اختبار تلقائي
R=$(curl -s -b /tmp/tea.txt -X POST $BASE/exams -H 'Content-Type: application/json' -d '{"title":"اختبار curl التجريبي","mode":"auto","count":8,"durationMinutes":12,"category":"QUANTITATIVE"}')
check "إنشاء اختبار تلقائي" '"questionCount":8' "$R"
NEXID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['exam']['id'])")

R=$(curl -s -b /tmp/tea.txt -X DELETE $BASE/exams/$NEXID)
check "حذف اختبار تجريبي" '"ok":true' "$R"

# حذف السؤال التجريبي
R=$(curl -s -b /tmp/tea.txt -X DELETE $BASE/questions/$NQID)
check "حذف سؤال تجريبي" '"ok":true' "$R"

# قالب الاستيراد
R=$(curl -s -b /tmp/tea.txt -o /tmp/template.xlsx -w "%{http_code}" $BASE/questions/template)
check "تنزيل قالب الاستيراد" '200' "$R"
FILE_TYPE=$(file /tmp/template.xlsx | grep -c "Excel\|Zip\|Microsoft")
check "القالب ملف Excel صحيح" '1' "$FILE_TYPE"

# استيراد فعلي: توليد CSV من القالب
python3 -c "
import csv
rows = [
  {'القسم':'كمي','الموضوع':'الجبر والمعادلات','الصعوبة':'سهل','السؤال':'إذا كان 2س + 3 = 11 فما قيمة س؟','الخيار أ':'4','الخيار ب':'5','الخيار ج':'6','الخيار د':'7','الإجابة':'أ','الشرح':'2س = 8 إذن س = 4'},
  {'القسم':'لفظي','الموضوع':'التناظر اللفظي','الصعوبة':'متوسط','السؤال':'طبيب : مستشفى','الخيار أ':'قلم : ورقة','الخيار ب':'قاض : محكمة','الخيار ج':'كتاب : مكتبة','الخيار د':'طالب : مدرسة','الإجابة':'ب','الشرح':'مهنة ومكان العمل'},
  {'القسم':'خطأ','الموضوع':'x','الصعوبة':'سهل','السؤال':'سؤال فاشل','الخيار أ':'1','الخيار ب':'2','الخيار ج':'3','الخيار د':'4','الإجابة':'أ','الشرح':'x'},
]
with open('/tmp/import-test.csv','w',newline='',encoding='utf-8-sig') as f:
  w = csv.DictWriter(f, fieldnames=rows[0].keys())
  w.writeheader(); w.writerows(rows)
"
R=$(curl -s -b /tmp/tea.txt -X POST $BASE/questions/import -F "file=@/tmp/import-test.csv")
check "استيراد CSV (2 ناجح من 3)" '"successCount":2' "$R"
check "تقرير خطأ الصف الفاشل" 'القسم غير صحيح' "$R"

# ---------- 10.ب) المقاطع التعليمية ----------
# طالب لا يستطيع إضافة مقطع
R=$(curl -s -b /tmp/stu.txt -X POST $BASE/clips -H 'Content-Type: application/json' -d '{"title":"محاولة طالب","url":"https://www.youtube.com/watch?v=dK8xtPy0cMU"}')
check "رفض إضافة مقطع من طالب" 'لفريق الإدارة' "$R"
# رابط فاسد يُرفض
R=$(curl -s -b /tmp/tea.txt -X POST $BASE/clips -H 'Content-Type: application/json' -d '{"title":"رابط فاسد","url":"not-a-url"}')
check "رفض رابط فيديو غير صحيح" 'غير صحيح' "$R"
# معلم يضيف مقطعًا (رابط youtu.be قصير) — يستخرج معرف يوتيوب
R=$(curl -s -b /tmp/tea.txt -X POST $BASE/clips -H 'Content-Type: application/json' -d '{"title":"مقطع الاختبار الآلي","url":"https://youtu.be/KEglO1513G4","category":"QUANTITATIVE","description":"اختبار"}')
check "إضافة مقطع من المعلم" '"provider":"YOUTUBE"' "$R"
check "استخراج معرف يوتيوب من youtu.be" '"videoId":"KEglO1513G4"' "$R"
TESTCLIP=$(echo "$R" | python3 -c "import json,sys; print(json.load(sys.stdin)['clip']['id'])")
# عد المشاهدة
R=$(curl -s "$BASE/clips/$TESTCLIP?view=1")
check "تسجيل مشاهدة المقطع" '"views":1' "$R"
# إخفاء المقطع
R=$(curl -s -b /tmp/tea.txt -X PATCH $BASE/clips/$TESTCLIP -H 'Content-Type: application/json' -d '{"isActive":false}')
check "إخفاء المقطع" '"isActive":false' "$R"
# لا يظهر في القائمة العامة
R=$(curl -s $BASE/clips)
check "المخفي يختفي من القائمة العامة" '0' "$(echo "$R" | python3 -c "import json,sys; print(sum(1 for c in json.load(sys.stdin)['clips'] if c['id']=='$TESTCLIP'))")"
# طالب لا يفتح مقطعًا مخفيًا
R=$(curl -s -b /tmp/stu.txt $BASE/clips/$TESTCLIP)
check "رفض فتح مقطع مخفي للطالب" 'غير موجود' "$R"
# الإدارة تراه مع all=1
R=$(curl -s -b /tmp/tea.txt "$BASE/clips?all=1")
check "الإدارة ترى المخفي مع all=1" "$TESTCLIP" "$R"
# حذف المقطع
R=$(curl -s -b /tmp/tea.txt -X DELETE $BASE/clips/$TESTCLIP)
check "حذف المقطع" '"ok":true' "$R"
# فلترة القسم
R=$(curl -s "$BASE/clips?category=VERBAL")
check "فلترة مقاطع القسم اللفظي" '"category":"VERBAL"' "$R"
# قائمة المقاطع العامة تعمل
R=$(curl -s $BASE/clips)
check "قائمة المقاطع العامة" '"views":' "$R"

# ---------- 10.ج) حماية المقاطع من التحميل + رابط البث الموقّع ----------
# معلم يضيف مقطع ملف مباشر (فيديو اختبار محلي على الخادم نفسه)
R=$(curl -s -b /tmp/tea.txt -X POST $BASE/clips -H 'Content-Type: application/json' -d '{"title":"درس محمي تجريبي","url":"http://127.0.0.1:3000/test-clip.mp4","category":"GENERAL"}')
check "إضافة مقطع ملف مباشر" '"provider":"FILE"' "$R"
FILECLIP=$(echo "$R" | python3 -c "import json,sys; print(json.load(sys.stdin)['clip']['id'])")

# الطالب لا يرى رابط المصدر لكن يحصل على رابط بث موقّع
R=$(curl -s -b /tmp/stu.txt $BASE/clips/$FILECLIP)
check "الطالب لا يرى رابط مصدر الملف" '"url":null' "$R"
check "الطالب يحصل على رابط بث موقّع" '/stream?uid=' "$R"
PLAYURL=$(echo "$R" | python3 -c "import json,sys; print(json.load(sys.stdin)['clip'].get('playUrl') or '')")

# الزائر غير المسجل لا يحصل على رابط بث
R=$(curl -s $BASE/clips/$FILECLIP)
check "الزائر غير المسجل بلا رابط بث" '"playUrl":null' "$R"

# القائمة العامة تخفي المصدر أيضًا
R=$(curl -s "$BASE/clips?category=GENERAL")
check "القائمة العامة تخفي مصدر الملفات" '"url":null' "$R"

# الإدارة ترى المصدر كما هو (لأجل التحرير)
R=$(curl -s -b /tmp/tea.txt $BASE/clips/$FILECLIP)
check "الإدارة ترى رابط المصدر" 'test-clip.mp4' "$R"

# البث بدون توكن صالح مرفوض
CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/clips/$FILECLIP/stream?uid=x&tk=y")
check "رفض البث بدون توكن صالح" '403' "$CODE"

# توكن عبث به مرفوض
BADURL=$(echo "$PLAYURL" | sed 's/\(tk=.\)/X\1/')
CODE=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:3000$BADURL")
check "رفض توكن بث عبث به" '403' "$CODE"

# البث بالتوكن الصحيح يعمل
CODE=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:3000$PLAYURL")
check "البث بالتوكن الصحيح يعمل" '200' "$CODE"

# دعم Range (تقديم/تأخير) + ترويسات الحماية
HDRS=$(curl -s -D- -o /dev/null -H 'Range: bytes=0-99' "http://localhost:3000$PLAYURL")
check "دعم Range (206)" '206' "$HDRS"
check "ترويسة content-range" 'content-range' "$HDRS"
check "منع التخزين المؤقت no-store" 'no-store' "$HDRS"

# مقطع يوتيوب لا يقبل البث المباشر (التوكن يُفحص أولًا فالرفض 403)
YTID=$(curl -s "$BASE/clips?category=VERBAL" | python3 -c "import json,sys; print(json.load(sys.stdin)['clips'][0]['id'])")
CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/clips/$YTID/stream?uid=x&tk=y")
check "رفض بث مقطع يوتيوب (لا توكن صالح)" '403' "$CODE"

# رابط بث مرتبط بحساب آخر (جلسة المعلم + توكن الطالب)
CODE=$(curl -s -b /tmp/tea.txt -o /dev/null -w '%{http_code}' "http://localhost:3000$PLAYURL")
check "رفض رابط بث لحساب آخر" '403' "$CODE"

# حذف المقطع المحمي (تنظيف)
R=$(curl -s -b /tmp/tea.txt -X DELETE $BASE/clips/$FILECLIP)
check "حذف المقطع المحمي" '"ok":true' "$R"

# ---------- 11) الخروج ----------
R=$(curl -s -b /tmp/stu.txt -c /tmp/stu.txt -X POST $BASE/auth/logout)
check "تسجيل الخروج" '"ok":true' "$R"
R=$(curl -s -b /tmp/stu.txt $BASE/auth/me)
check "الجلسة ملغاة" '"user":null' "$R"

# ---------- النتيجة ----------
echo ""
echo "=========================================="
echo "النتيجة: $PASS ناجح / $FAIL فاشل"
echo "=========================================="
[ $FAIL -eq 0 ] && echo "🎉 جميع الاختبارات نجحت!" || echo "⚠️ يوجد اختبارات فاشلة"
