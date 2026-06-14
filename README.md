# Nomoo Virtual Try-On Presentation
## المعاينة الافتراضية — عرض تفاعلي + PowerPoint

عرض احترافي ثنائي اللغة (عربي + إنجليزي) لشركة **نمو** عن المعاينة الافتراضية.

---

## الملفات

| الملف | الوصف |
|-------|--------|
| `index.html` | العرض التفاعلي (موقع ويب) |
| `app.js` | منطق الشرائح والأنيميشن والتجربة التفاعلية |
| `content.json` | النصوص — عدّل هنا لتغيير المحتوى |
| `content.js` | نسخة للعمل بدون سيرفر (يُحدَّث من content.json) |
| `Nomoo_Virtual_TryOn_AR_EN.pptx` | ملف PowerPoint جاهز |
| `generate-pptx.js` | سكربت إعادة توليد الـ PPTX |

---

## عرض HTML (موصى به)

### الطريقة 1 — فتح مباشر
1. افتح `index.html` في Chrome أو Edge
2. اضغط **F11** لملء الشاشة
3. استخدم **↑ ↓** أو النقاط في الأعلى للتنقل
4. اضغط **EN** لتبديل اللغة

### الطريقة 2 — سيرفر محلي
```bash
cd presentation
npx serve .
```
ثم افتح `http://localhost:3000`

---

## عرض PowerPoint

1. افتح `Nomoo_Virtual_TryOn_AR_EN.pptx` في Microsoft PowerPoint
2. كل شريحة تحتوي نصاً **عربي + إنجليزي**
3. لون العلامة: `#1D1D1F` (أسود) مع لمسة `#9A7B4F` (ذهبي)

---

## تعديل المحتوى

1. عدّل `content.json`
2. حدّث `content.js`:
   ```bash
   node -e "const c=require('./content.json'); require('fs').writeFileSync('content.js','window.PRESENTATION_CONTENT='+JSON.stringify(c,null,2)+';');"
   ```
3. أعد توليد PowerPoint:
   ```bash
   node generate-pptx.js
   ```

---

## الشرائح (6)

1. **Try It First** — ما هو الحل + معاينة حية
2. **لماذا تحتاجه؟** — المشكلة والتحديات + الحل
3. **كيف يعمل** — صفحة المنتج + 4 خطوات
4. **معاينة حية** — تجربة تفاعلية (شال يمني)
5. **القيمة** — للمتجر + للعميل + القطاعات
6. **ابدأ مع نمو** — تواصل + **© جميع الحقوق محفوظة لشركة نمو**

---

## التواصل (من PDF)

- **الموقع:** www.nomoo.ai
- **البريد:** info@nomoo.ai
- **الهاتف:** +966 500 000 000
