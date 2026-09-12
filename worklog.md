
---
Task ID: deploy-github
Agent: Super Z (main)
Task: «الحين انا نشرت المستودع كيف اخليه رابط الموقع شغال» — تجهيز المستودع للنشر السحابي ورفعه

Work Log:
- تحقق أن المستودع منشور على GitHub بـ f7f04d0 (النسخة النظيفة)
- اكتشاف معوقات نشر: start يستخدم bun (غير متوفر على المنصات)، لا postinstall لـ prisma generate، زرع المالك يعتمد كلمة مرور placeholder
- package.json: start → prisma db push + node standalone، إضافة postinstall و seed:owner و engines node>=20
- scripts/seed-owner.cjs جديد: يقرأ OWNER_EMAIL/OWNER_NAME/OWNER_PASS من البيئة، غير مدمّر، رسائل عربية
- DEPLOY.md جديد: دليل Railway خطوة بخطوة + بديل VPS + جدول استكشاف أخطاء
- رفع commit 44dfd29 بالتوكن (رفع مؤقت بدون تخزين التوكن في أي ملف)

Stage Summary:
- origin/main = 44dfd29 — المستودع جاهز للنشر المباشر على Railway/Render/VPS
- التوكن gh...FKrlJ ظهر بالشات سابقًا — يجب على المستخدم تدويره من github.com/settings/tokens
- يتبقى قرار المستخدم: توثيق نطاق Resend لتفعيل أكواد الطلاب
