# مرجع API — لإعطائه لـ Genspark أو أي مبرمج فرونت إند

كل الطلبات (إلا المسجلة كـ "بدون توكن") تحتاج Header:
`Authorization: Bearer <token>`

الـ base URL هو رابط الـ Worker بعد النشر، مثلاً:
`https://mr-youssef-essam-platform.YOUR-SUBDOMAIN.workers.dev`

---

## 1) تسجيل ودخول

### `POST /api/auth/register` — بدون توكن
تسجيل طالب جديد بنفسه.
```json
// Request
{ "username": "ahmed_2010", "password": "123456", "name": "أحمد محمد",
  "grade": "الصف الثالث الثانوي", "parent_email": "parent@example.com" }
// Response 201
{ "token": "...", "student": {...}, "parent_link": "https://.../parent/abc123" }
```

### `POST /api/auth/login` — بدون توكن
```json
{ "username": "ahmed_2010", "password": "123456" }
```

### `POST /api/auth/admin-login` — بدون توكن
```json
{ "username": "youssef", "password": "..." }
```

---

## 2) الطالب — كورسات ودروس

- `GET /api/courses` — الكورسات المنشورة لصف الطالب
- `GET /api/courses/:id` — تفاصيل كورس بالوحدات والدروس
- `GET /api/lessons/:id` — تفاصيل درس (فيديو + ملفات + آخر نقطة توقف)
- `GET /api/stream/video/:id` — تشغيل الفيديو (بيتحقق من الاشتراك)
- `GET /api/stream/file/:id` — عرض/تحميل ملف PDF
- `POST /api/lessons/:id/progress` — حفظ آخر نقطة توقف
  ```json
  { "position_seconds": 320, "completed": false }
  ```

---

## 3) الاختبارات

- `GET /api/quizzes/:id` — أسئلة الاختبار
- `POST /api/quizzes/:id/attempt` — إرسال الإجابات
  ```json
  { "answers": { "qst_xxx1": "أ", "qst_xxx2": "صح" } }
  // Response
  { "score": 85.5, "correct": 17, "total": 20,
    "wrong_topics": { "نحو": 2, "بلاغة": 1 } }
  ```

---

## 4) الحصص المباشرة (Jitsi Meet — مجاني)

- `GET /api/live/upcoming` — الحصص القادمة
- `POST /api/live/:id/book` — حجز حصة
- `GET /api/live/:id/join` — دخول الحصة (يرجع رابط Jitsi وبيسجل الحضور)

---

## 5) الدفع (فودافون كاش + انستاباي فقط)

### `GET /api/payment/info`
بيرجع رقم فودافون كاش ويوزر انستاباي + الخطط الثلاثة (شهر / ترم / سنة) + تعليمات.
```json
{
  "vodafone_cash_number": "01060690384",
  "instapay_handle": "youssef@instapay",
  "plans": [
    { "id": "monthly", "label": "اشتراك شهر", "price": 250, "duration_days": 30 },
    { "id": "term",    "label": "اشتراك ترم دراسي (4 شهور)", "price": 900, "duration_days": 120 },
    { "id": "yearly",  "label": "اشتراك سنة كاملة", "price": 2400, "duration_days": 365 }
  ],
  "instructions": ["..."]
}
```

### `POST /api/payment/submit` — multipart/form-data
حقول الفورم:
- `receipt` (ملف صورة الإيصال)
- `method` = `vodafone_cash` أو `instapay`
- `plan` = `monthly` أو `term` أو `yearly`
- `amount` = المبلغ (مثلاً 250)
- `sender_last4` = آخر 4 أرقام من الرقم اللي حوّل منه الطالب

### `GET /api/payment/my` — تاريخ مدفوعات الطالب

---

## 6) ولي الأمر (بدون توكن — برابط سري)

### `GET /api/parent/:token`
شاشة واحدة فيها كل حاجة: حالة الاشتراك، آخر 10 اختبارات، آخر 10 حصص، آخر 5 مدفوعات، متوسط الدرجات.

---

## 7) لوحة المعلم (تحتاج توكن Admin)

### الكورسات والدروس
- `POST /api/admin/courses` → `{ "title", "grade", "term" }`
- `GET /api/admin/courses`
- `POST /api/admin/courses/:id/publish`
- `DELETE /api/admin/courses/:id`
- `POST /api/admin/units` → `{ "course_id", "title", "order_num" }`
- `POST /api/admin/lessons` → `{ "unit_id", "title", "order_num" }`
- `POST /api/admin/lessons/:id/video` (multipart: `video`, `duration_seconds`)
- `POST /api/admin/lessons/:id/publish`
- `POST /api/admin/lessons/:id/file` (multipart: `file`, `display_name`, `access_type`)

### الاختبارات والحصص
- `POST /api/admin/quizzes`
  ```json
  {
    "lesson_id": "lsn_xxx",
    "title": "اختبار الدرس الأول",
    "type": "lesson_quiz",
    "questions": [
      { "text": "ما هو الفاعل في...", "type": "mcq",
        "options": ["أ","ب","ج","د"], "correct_answer": "أ", "topic": "نحو" }
    ]
  }
  ```
- `POST /api/admin/live` → `{ "title", "datetime", "duration_minutes", "capacity", "meet_url" (اختياري) }`
  لو ما بعتش `meet_url` النظام هيولّد رابط Jitsi تلقائي.

### الطلاب والمدفوعات
- `GET /api/admin/students`
- `GET /api/admin/payments/pending` — الإيصالات المعلقة (تراجعها وتأكد)
- `GET /api/admin/payments` — كل المدفوعات
- `GET /api/admin/payments/:id/receipt` — يرجع صورة الإيصال
- `POST /api/admin/payments/:id/confirm` — تأكيد الدفع (بيفعّل الاشتراك حسب الخطة)
- `POST /api/admin/payments/:id/reject` → `{ "note": "المبلغ ناقص" }`

### الإعدادات والتقارير
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
  ```json
  {
    "vodafone_cash_number": "01060690384",
    "instapay_handle": "youssef@instapay",
    "price_monthly": "250",
    "price_term": "900",
    "price_yearly": "2400"
  }
  ```
- `GET /api/admin/report/financial` — إحصائيات إيرادات اليوم/الأسبوع/الشهر + توزيع بين فودافون كاش وانستاباي

---

## ملاحظات مهمة للفرونت إند

1. **حماية الفيديو الأساسية:** ضع الفيديو داخل `<video>` مع `controlsList="nodownload"` و `oncontextmenu="return false"`، وضع طبقة watermark فوقه فيها اسم الطالب ورقمه (شفافية 30%).

2. **صفحة الدفع للطالب:**
   - في الأول نادي `GET /api/payment/info` لعرض الأسعار ورقم فودافون كاش ويوزر انستاباي.
   - الطالب يختار الخطة → يشوف المبلغ → يحول → يرفع الإيصال بـ `POST /api/payment/submit`.

3. **صفحة مراجعة الإيصالات (المعلم):**
   - `GET /api/admin/payments/pending` تعرض كل الإيصالات المعلقة.
   - كل إيصال بيعرض: اسم الطالب، الصف، إيميل ولي الأمر، المبلغ، طريقة التحويل، آخر 4 أرقام من رقم الطالب.
   - زرار "عرض الإيصال" → `GET /api/admin/payments/:id/receipt` (بيرجع الصورة مباشرة).
   - زرار "تأكيد" → `POST /api/admin/payments/:id/confirm` → الاشتراك يتفعل + إيميل تلقائي لولي الأمر.
   - زرار "رفض" → `POST /api/admin/payments/:id/reject` مع سبب.

4. **CORS مفتوح** لكل الأصول، فتقدر تربط الفرونت إند من أي دومين.

5. **رموز الحالة:**
   - `401` → مش مسجل دخول (وجّه لصفحة الدخول)
   - `402` → اشتراك منتهي (وجّه لصفحة الدفع)
   - `403` → مش مصرح بالإجراء
   - `404` → المورد غير موجود
