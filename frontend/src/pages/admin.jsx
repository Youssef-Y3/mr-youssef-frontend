// ============================================================
// Admin Dashboard: overview, courses, quiz builder, live schedule,
// pending payments review, all students, financial, settings
// ============================================================

function AdminLayout({ children, page }) {
  const [openMenu, setOpenMenu] = React.useState(false);
  const links = [
    { href: "#/admin", key: "dashboard", label: "لوحة القيادة", icon: Icon.Home },
    { href: "#/admin/pending", key: "pending", label: "الإيصالات المعلقة", icon: Icon.CreditCard },
    { href: "#/admin/courses", key: "courses", label: "إدارة الكورسات", icon: Icon.Book },
    { href: "#/admin/quiz", key: "quiz", label: "إنشاء اختبار", icon: Icon.Trophy },
    { href: "#/admin/live", key: "live", label: "الحصص المباشرة", icon: Icon.Video },
    { href: "#/admin/students", key: "students", label: "الطلاب", icon: Icon.Users },
    { href: "#/admin/finance", key: "finance", label: "التقارير المالية", icon: Icon.Chart },
    { href: "#/admin/settings", key: "settings", label: "الإعدادات", icon: Icon.Settings },
  ];
  const logout = () => { authApi.logout(); window.dispatchEvent(new Event("auth-changed")); nav("/"); };

  return (
    <div className="min-h-screen bg-paper flex">
      <aside className={`fixed lg:sticky top-0 h-screen w-72 bg-azhar-900 border-l border-azhar-800 z-40 transition-transform ${openMenu ? "translate-x-0" : "translate-x-full lg:translate-x-0"} overflow-auto`}>
        <div className="p-5 border-b border-white/10"><a href="#/"><Logo light size="sm" /></a></div>
        <div className="p-4">
          <div className="bg-gold-500 text-azhar-900 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-azhar-900 text-gold-300 flex items-center justify-center"><Icon.Sparkle className="w-5 h-5" /></div>
              <div>
                <div className="font-display font-black">لوحة المعلم</div>
                <div className="text-xs text-azhar-800 font-bold">أ / يوسف عصام</div>
              </div>
            </div>
          </div>
          <nav className="space-y-1">
            {links.map(l => (
              <a key={l.href} href={l.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${page === l.key ? "bg-gold-500 text-azhar-900 shadow-gold" : "text-white/80 hover:bg-white/10"}`}>
                <l.icon className="w-5 h-5" />
                <span>{l.label}</span>
              </a>
            ))}
          </nav>
          <button onClick={logout} className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-300 hover:bg-red-500/20 transition w-full">
            <Icon.LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-black/5 flex items-center justify-between p-4 lg:hidden">
          <a href="#/"><Logo size="sm" /></a>
          <button onClick={() => setOpenMenu(o => !o)} className="w-10 h-10 rounded-xl bg-azhar-900 text-white flex items-center justify-center">
            <Icon.Menu className="w-5 h-5" />
          </button>
        </header>
        {openMenu && <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpenMenu(false)} />}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

// ---------- Dashboard ----------
function AdminDashboard() {
  const [fin, setFin] = React.useState(null);
  const [pending, setPending] = React.useState(null);
  const [students, setStudents] = React.useState(null);
  const R = window.Recharts || {};

  React.useEffect(() => {
    adminApi.financial().then(setFin).catch(() => setFin({}));
    adminApi.pendingPayments().then(r => setPending(Array.isArray(r) ? r : (r?.payments || []))).catch(() => setPending([]));
    adminApi.students().then(r => setStudents(Array.isArray(r) ? r : (r?.students || []))).catch(() => setStudents([]));
  }, []);

  const today = fin?.today ?? 0, week = fin?.week ?? 0, month = fin?.month ?? 0;
  const dist = fin?.distribution || fin?.by_method || {};
  const distData = Object.entries(dist).map(([k, v]) => ({ name: k === "vodafone_cash" ? "فودافون كاش" : "إنستاباي", value: v }));

  return (
    <AdminLayout page="dashboard">
      <FadeIn>
        <h1 className="font-display font-black text-3xl text-azhar-800 mb-6">لوحة القيادة</h1>
      </FadeIn>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Icon.CreditCard} label="إيرادات اليوم" value={fin ? fmt.price(today) : "..."} tone="gold" />
        <StatCard icon={Icon.CreditCard} label="إيرادات الأسبوع" value={fin ? fmt.price(week) : "..."} tone="azhar" />
        <StatCard icon={Icon.CreditCard} label="إيرادات الشهر" value={fin ? fmt.price(month) : "..."} tone="emerald" />
        <StatCard icon={Icon.Users} label="الطلاب المسجلين" value={students ? fmt.int(students.length) : "..."} tone="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-azhar-800 mb-4">الإيصالات المعلقة ({pending?.length ?? 0})</h3>
          {!pending ? <Skeleton className="h-40 rounded-xl" /> :
            pending.length ? (
              <div className="space-y-2">
                {pending.slice(0, 5).map((p, i) => (
                  <div key={p.id || i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center"><Icon.Clock className="w-4 h-4" /></div>
                      <div>
                        <div className="font-bold text-azhar-800">{p.student_name || p.name}</div>
                        <div className="text-xs text-ink/60">{p.plan_label || p.plan} · {fmt.price(p.amount)}</div>
                      </div>
                    </div>
                    <Button variant="dark" size="sm" onClick={() => nav("/admin/pending")}>راجع</Button>
                  </div>
                ))}
                <div className="text-center pt-2"><a href="#/admin/pending" className="text-sm text-azhar-800 font-bold hover:underline">شوف الكل</a></div>
              </div>
            ) : <div className="text-center py-6 text-emerald-600 font-bold"><Icon.Check className="w-10 h-10 mx-auto mb-2" /> مفيش إيصالات معلقة! 🎉</div>
          }
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-bold text-azhar-800 mb-4">توزيع طرق الدفع</h3>
          {distData.length && R.PieChart ? (
            <div className="h-56">
              <R.ResponsiveContainer><R.PieChart>
                <R.Pie data={distData} innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={4}>
                  <R.Cell fill="#e11d48" /><R.Cell fill="#7c3aed" />
                </R.Pie>
                <R.Tooltip />
                <R.Legend verticalAlign="bottom" />
              </R.PieChart></R.ResponsiveContainer>
            </div>
          ) : <div className="text-center py-6 text-ink/60 text-sm">لا توجد بيانات</div>}
        </Card>
      </div>
    </AdminLayout>
  );
}

// ---------- Pending Payments (highest priority screen) ----------
function AdminPendingPage() {
  const [rows, setRows] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [lightbox, setLightbox] = React.useState(null); // {url, name}
  const [rejectFor, setRejectFor] = React.useState(null);
  const [rejectNote, setRejectNote] = React.useState("");
  const toast = useToast();

  const load = () => {
    adminApi.pendingPayments().then(r => setRows(Array.isArray(r) ? r : (r?.payments || []))).catch(e => setError(e.message));
  };
  React.useEffect(load, []);

  const openReceipt = async (p) => {
    try {
      const url = await loadAuthImage(adminApi.receiptUrl(p.id));
      setLightbox({ url, name: p.student_name || "إيصال" });
    } catch (e) { toast.push("تعذر تحميل الإيصال", { type: "error" }); }
  };
  const confirm = async (p) => {
    try { await adminApi.confirmPayment(p.id); toast.push(`تم تأكيد اشتراك ${p.student_name}`, { type: "success" }); load(); }
    catch (e) { toast.push(e.message, { type: "error" }); }
  };
  const reject = async () => {
    if (!rejectFor) return;
    try { await adminApi.rejectPayment(rejectFor.id, rejectNote || "المبلغ غير مطابق"); toast.push("تم الرفض", { type: "warning" }); setRejectFor(null); setRejectNote(""); load(); }
    catch (e) { toast.push(e.message, { type: "error" }); }
  };

  return (
    <AdminLayout page="pending">
      <FadeIn>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display font-black text-3xl text-azhar-800">الإيصالات المعلقة</h1>
            <p className="text-ink/60">راجع الإيصالات وأكد أو ارفض</p>
          </div>
          <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-2xl font-bold">
            {rows?.length ?? 0} إيصال منتظر
          </div>
        </div>
      </FadeIn>

      {error && <Card className="p-4 bg-red-50 border-red-200 text-red-700 mb-4">{error}</Card>}
      {!rows ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      ) : rows.length ? (
        <div className="space-y-4">
          {rows.map((p, i) => (
            <Card key={p.id || i} className="p-5">
              <div className="grid md:grid-cols-[auto,1fr,auto] gap-4 items-center">
                <button onClick={() => openReceipt(p)} className="w-24 h-24 rounded-2xl bg-azhar-50 border-2 border-dashed border-azhar-300 flex items-center justify-center text-azhar-800 hover:bg-azhar-100 transition">
                  <div className="text-center">
                    <Icon.Eye className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-xs font-bold">عرض الإيصال</div>
                  </div>
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-display font-black text-azhar-800 text-lg">{p.student_name || p.name || "طالب"}</div>
                    <span className="text-xs bg-azhar-100 text-azhar-800 px-2 py-0.5 rounded-full font-bold">{p.grade || ""}</span>
                  </div>
                  <div className="text-sm text-ink/70 grid sm:grid-cols-2 gap-1">
                    <div>ولي الأمر: <span className="font-bold">{p.parent_email || "—"}</span></div>
                    <div>الخطة: <span className="font-bold text-azhar-800">{p.plan_label || p.plan}</span></div>
                    <div>المبلغ: <span className="font-bold text-gold-700 font-num">{fmt.price(p.amount)}</span></div>
                    <div>الطريقة: <span className="font-bold">{p.method === "vodafone_cash" ? "فودافون كاش" : "إنستاباي"}</span></div>
                    <div>آخر 4 أرقام: <span className="font-num font-bold" dir="ltr">{p.sender_last4 || "—"}</span></div>
                    <div>التاريخ: <span className="font-bold">{fmt.datetime(p.created_at)}</span></div>
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 flex-wrap">
                  <Button variant="success" onClick={() => confirm(p)}><Icon.Check className="w-4 h-4" /> تأكيد</Button>
                  <Button variant="danger" onClick={() => setRejectFor(p)}><Icon.X className="w-4 h-4" /> رفض</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-14 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3"><Icon.Check className="w-10 h-10" /></div>
          <div className="font-display font-black text-xl text-azhar-800">مفيش إيصالات معلقة</div>
          <div className="text-ink/60 mt-1 text-sm">كل حاجة تحت السيطرة! 🎉</div>
        </Card>
      )}

      {/* Lightbox */}
      <Modal open={!!lightbox} onClose={() => setLightbox(null)} wide>
        {lightbox && (
          <div className="p-6">
            <div className="font-display font-black text-lg text-azhar-800 mb-4">إيصال {lightbox.name}</div>
            <img src={lightbox.url} className="w-full rounded-2xl shadow-soft" />
          </div>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal open={!!rejectFor} onClose={() => setRejectFor(null)}>
        <div className="p-6">
          <h3 className="font-display font-black text-lg text-azhar-800 mb-4">سبب الرفض</h3>
          <Textarea placeholder="مثال: المبلغ ناقص، أو الإيصال غير واضح" value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectFor(null)}>إلغاء</Button>
            <Button variant="danger" onClick={reject}>تأكيد الرفض</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

// ---------- Courses management ----------
function AdminCoursesPage() {
  const [courses, setCourses] = React.useState(null);
  const [newCourse, setNewCourse] = React.useState({ title: "", grade: "الصف الأول الإعدادي", term: "الترم الأول" });
  const [openCreate, setOpenCreate] = React.useState(false);
  const [expandedCourse, setExpandedCourse] = React.useState(null);
  const [expandedUnit, setExpandedUnit] = React.useState(null);
  const [uploadModal, setUploadModal] = React.useState(null); // {lesson}
  const toast = useToast();

  const load = () => {
    adminApi.courses().then(r => setCourses(Array.isArray(r) ? r : (r?.courses || []))).catch(() => setCourses([]));
  };
  React.useEffect(load, []);

  const createCourse = async () => {
    try { await adminApi.createCourse(newCourse); toast.push("تم إنشاء الكورس", { type: "success" }); setOpenCreate(false); load(); }
    catch (e) { toast.push(e.message, { type: "error" }); }
  };
  const publish = async (id) => { try { await adminApi.publishCourse(id); toast.push("تم النشر", { type: "success" }); load(); } catch (e) { toast.push(e.message, { type: "error" }); } };
  const del = async (id) => { if (!confirm("حذف الكورس؟")) return; try { await adminApi.deleteCourse(id); toast.push("تم الحذف", { type: "success" }); load(); } catch (e) { toast.push(e.message, { type: "error" }); } };

  const addUnit = async (course_id) => {
    const title = prompt("عنوان الوحدة:"); if (!title) return;
    try { await adminApi.createUnit({ course_id, title, order_num: 0 }); load(); } catch (e) { toast.push(e.message, { type: "error" }); }
  };
  const addLesson = async (unit_id) => {
    const title = prompt("عنوان الدرس:"); if (!title) return;
    try { await adminApi.createLesson({ unit_id, title, order_num: 0 }); load(); } catch (e) { toast.push(e.message, { type: "error" }); }
  };

  return (
    <AdminLayout page="courses">
      <FadeIn>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display font-black text-3xl text-azhar-800">إدارة الكورسات</h1>
            <p className="text-ink/60">أنشئ الكورسات، ورتّب الوحدات والدروس</p>
          </div>
          <Button variant="primary" onClick={() => setOpenCreate(true)}>+ كورس جديد</Button>
        </div>
      </FadeIn>

      {!courses ? <Skeleton className="h-40 rounded-2xl" /> : courses.length ? (
        <div className="space-y-3">
          {courses.map(c => (
            <Card key={c.id} className="overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <button className="flex items-center gap-3 flex-1 text-right" onClick={() => setExpandedCourse(expandedCourse === c.id ? null : c.id)}>
                  <div className={`w-10 h-10 rounded-xl bg-azhar-800 text-gold-300 flex items-center justify-center transition ${expandedCourse === c.id ? "rotate-90" : ""}`}><Icon.ArrowLeft className="w-4 h-4" /></div>
                  <div>
                    <div className="font-display font-bold text-azhar-800">{c.title}</div>
                    <div className="text-xs text-ink/60">{c.grade} · {c.term} · {c.units?.length || 0} وحدة</div>
                  </div>
                </button>
                <div className="flex gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{c.published ? "منشور" : "مسودة"}</span>
                  {!c.published && <Button size="sm" variant="dark" onClick={() => publish(c.id)}>نشر</Button>}
                  <Button size="sm" variant="danger" onClick={() => del(c.id)}><Icon.Trash className="w-4 h-4" /></Button>
                </div>
              </div>
              {expandedCourse === c.id && (
                <div className="border-t border-black/5 p-4 bg-azhar-50/30">
                  {(c.units || []).map(u => (
                    <div key={u.id} className="mb-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-soft">
                        <button className="flex items-center gap-2" onClick={() => setExpandedUnit(expandedUnit === u.id ? null : u.id)}>
                          <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center"><Icon.Book className="w-4 h-4" /></div>
                          <div className="font-bold text-azhar-800">{u.title}</div>
                          <div className="text-xs text-ink/60">({u.lessons?.length || 0} دروس)</div>
                        </button>
                        <Button size="sm" variant="outline" onClick={() => addLesson(u.id)}>+ درس</Button>
                      </div>
                      {expandedUnit === u.id && (
                        <div className="mt-2 pr-6 space-y-1">
                          {(u.lessons || []).map(l => (
                            <div key={l.id} className="flex items-center justify-between p-3 bg-white rounded-lg text-sm">
                              <div className="flex items-center gap-2">
                                <Icon.Video className="w-4 h-4 text-azhar-800" />
                                <span className="font-bold">{l.title}</span>
                                {l.published && <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">منشور</span>}
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onClick={() => setUploadModal({ lesson: l })}><Icon.Upload className="w-4 h-4" /></Button>
                                {!l.published && <Button size="sm" variant="dark" onClick={async () => { try { await adminApi.publishLesson(l.id); toast.push("تم نشر الدرس", { type: "success" }); load(); } catch (e) { toast.push(e.message, { type: "error" }); } }}>نشر</Button>}
                              </div>
                            </div>
                          ))}
                          {(u.lessons || []).length === 0 && <div className="text-xs text-ink/50 p-2">لا يوجد دروس</div>}
                        </div>
                      )}
                    </div>
                  ))}
                  <Button size="sm" variant="dark" onClick={() => addUnit(c.id)}>+ إضافة وحدة</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-14 text-center">
          <div className="font-display font-bold text-azhar-800 text-lg">لا يوجد كورسات بعد</div>
          <Button variant="primary" className="mt-4" onClick={() => setOpenCreate(true)}>ابدأ بإنشاء كورس</Button>
        </Card>
      )}

      {/* Create course modal */}
      <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
        <div className="p-6">
          <h3 className="font-display font-black text-xl text-azhar-800 mb-4">كورس جديد</h3>
          <div className="space-y-3">
            <Input label="عنوان الكورس" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} />
            <Select label="الصف" value={newCourse.grade} onChange={e => setNewCourse({ ...newCourse, grade: e.target.value })}
              options={["الصف الأول الإعدادي", "الصف الثاني الإعدادي", "الصف الثالث الإعدادي", "الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي"]} />
            <Select label="الترم" value={newCourse.term} onChange={e => setNewCourse({ ...newCourse, term: e.target.value })}
              options={["الترم الأول", "الترم الثاني", "العام كامل"]} />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenCreate(false)}>إلغاء</Button>
            <Button variant="primary" onClick={createCourse} disabled={!newCourse.title}>إنشاء</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!uploadModal} onClose={() => setUploadModal(null)}>
        {uploadModal && <UploadLessonForm lesson={uploadModal.lesson} onDone={() => { setUploadModal(null); load(); }} />}
      </Modal>
    </AdminLayout>
  );
}

function UploadLessonForm({ lesson, onDone }) {
  const [video, setVideo] = React.useState(null);
  const [duration, setDuration] = React.useState(0);
  const [pdf, setPdf] = React.useState(null);
  const [pdfName, setPdfName] = React.useState("");
  const [accessType, setAccessType] = React.useState("view_only");
  const [progress, setProgress] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const toast = useToast();

  const onVideoChange = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setVideo(f);
    const v = document.createElement("video"); v.preload = "metadata";
    v.onloadedmetadata = () => { setDuration(Math.floor(v.duration || 0)); URL.revokeObjectURL(v.src); };
    v.src = URL.createObjectURL(f);
  };
  const uploadVideo = async () => {
    if (!video) return; setBusy(true); setProgress(0);
    try {
      const fd = new FormData(); fd.append("video", video); fd.append("duration_seconds", String(duration));
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", API_BASE + `/api/admin/lessons/${lesson.id}/video`);
        xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);
        xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 100)); };
        xhr.onload = () => xhr.status < 400 ? resolve() : reject(new Error(`خطأ ${xhr.status}`));
        xhr.onerror = () => reject(new Error("فشل الرفع"));
        xhr.send(fd);
      });
      toast.push("تم رفع الفيديو", { type: "success" });
    } catch (e) { toast.push(e.message, { type: "error" }); }
    finally { setBusy(false); }
  };
  const uploadFile = async () => {
    if (!pdf) return;
    try {
      const fd = new FormData(); fd.append("file", pdf); fd.append("display_name", pdfName || pdf.name); fd.append("access_type", accessType);
      await adminApi.uploadFile(lesson.id, fd);
      toast.push("تم رفع الملف", { type: "success" });
      setPdf(null); setPdfName("");
    } catch (e) { toast.push(e.message, { type: "error" }); }
  };

  return (
    <div className="p-6">
      <h3 className="font-display font-black text-lg text-azhar-800 mb-1">رفع محتوى الدرس</h3>
      <div className="text-sm text-ink/60 mb-4">{lesson.title}</div>

      <div className="bg-azhar-50/40 rounded-2xl p-4 mb-4">
        <div className="font-display font-bold text-azhar-800 mb-2">فيديو الدرس</div>
        <label className="cursor-pointer block">
          <div className={`border-2 border-dashed rounded-xl p-6 text-center ${video ? "border-emerald-400 bg-emerald-50" : "border-azhar-300 hover:border-azhar-500"}`}>
            {video ? (
              <div>
                <Icon.Check className="w-8 h-8 mx-auto text-emerald-600" />
                <div className="font-bold text-emerald-800 mt-2">{video.name}</div>
                <div className="text-xs text-ink/60">مدة: {fmt.time(duration)}</div>
              </div>
            ) : (
              <div>
                <Icon.Upload className="w-8 h-8 mx-auto text-azhar-800" />
                <div className="font-bold text-azhar-800 mt-2">اسحب أو اختر فيديو</div>
              </div>
            )}
          </div>
          <input type="file" accept="video/*" className="hidden" onChange={onVideoChange} />
        </label>
        {busy && (
          <div className="mt-3">
            <div className="h-2 bg-azhar-100 rounded-full overflow-hidden"><div className="h-full bg-gold-500 transition-all" style={{ width: `${progress}%` }} /></div>
            <div className="text-xs text-ink/60 mt-1 font-num">{progress}%</div>
          </div>
        )}
        {video && <Button variant="primary" className="mt-3" onClick={uploadVideo} disabled={busy}>{busy ? "جاري الرفع..." : "ارفع الفيديو"}</Button>}
      </div>

      <div className="bg-azhar-50/40 rounded-2xl p-4">
        <div className="font-display font-bold text-azhar-800 mb-2">ملف PDF مرفق</div>
        <Input label="اسم الملف" value={pdfName} onChange={e => setPdfName(e.target.value)} placeholder="مذكرة الدرس" />
        <div className="mt-2">
          <Select label="نوع الوصول" value={accessType} onChange={e => setAccessType(e.target.value)} options={[{ value: "view_only", label: "عرض فقط" }, { value: "download", label: "عرض وتحميل" }]} />
        </div>
        <input type="file" accept="application/pdf" onChange={e => setPdf(e.target.files?.[0])} className="mt-2 block w-full text-sm" />
        {pdf && <Button variant="dark" className="mt-3" onClick={uploadFile}>ارفع الملف</Button>}
      </div>

      <div className="mt-4 text-right">
        <Button variant="outline" onClick={onDone}>إغلاق</Button>
      </div>
    </div>
  );
}

// ---------- Quiz Builder ----------
function AdminQuizPage() {
  const [form, setForm] = React.useState({ lesson_id: "", title: "", type: "lesson_quiz" });
  const [questions, setQuestions] = React.useState([blankQ()]);
  const toast = useToast();

  function blankQ() { return { text: "", type: "mcq", options: ["", "", "", ""], correct_answer: "", topic: "نحو" }; }

  const updateQ = (i, patch) => setQuestions(qs => qs.map((q, j) => j === i ? { ...q, ...patch } : q));
  const updateOpt = (i, k, v) => setQuestions(qs => qs.map((q, j) => { if (j !== i) return q; const opts = [...q.options]; opts[k] = v; return { ...q, options: opts }; }));

  const submit = async () => {
    try {
      await adminApi.createQuiz({ ...form, questions });
      toast.push("تم إنشاء الاختبار", { type: "success" });
      setQuestions([blankQ()]);
      setForm({ ...form, title: "" });
    } catch (e) { toast.push(e.message, { type: "error" }); }
  };

  return (
    <AdminLayout page="quiz">
      <FadeIn>
        <h1 className="font-display font-black text-3xl text-azhar-800 mb-6">إنشاء اختبار</h1>
      </FadeIn>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1 h-fit sticky top-6">
          <h3 className="font-display font-bold text-azhar-800 mb-4">بيانات الاختبار</h3>
          <div className="space-y-3">
            <Input label="عنوان الاختبار" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input label="معرّف الدرس (lesson_id)" value={form.lesson_id} onChange={e => setForm({ ...form, lesson_id: e.target.value })} />
            <Select label="نوع الاختبار" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              options={[{ value: "lesson_quiz", label: "اختبار درس" }, { value: "unit_quiz", label: "اختبار وحدة" }, { value: "final", label: "نهائي" }]} />
          </div>
          <div className="mt-4 text-sm text-ink/60">إجمالي الأسئلة: <b className="font-num">{questions.length}</b></div>
          <Button variant="primary" className="w-full mt-4" onClick={submit} disabled={!form.title || !form.lesson_id}>احفظ الاختبار</Button>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {questions.map((q, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-display font-bold text-azhar-800">السؤال <span className="font-num">{i + 1}</span></div>
                <button onClick={() => setQuestions(qs => qs.filter((_, j) => j !== i))} className="text-red-600 hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center" disabled={questions.length === 1}><Icon.Trash className="w-4 h-4" /></button>
              </div>
              <Textarea placeholder="نص السؤال" value={q.text} onChange={e => updateQ(i, { text: e.target.value })} />
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <Select label="نوع السؤال" value={q.type} onChange={e => updateQ(i, { type: e.target.value })} options={[{ value: "mcq", label: "اختيار من متعدد" }, { value: "true_false", label: "صح / خطأ" }]} />
                <Select label="الموضوع" value={q.topic} onChange={e => updateQ(i, { topic: e.target.value })} options={["نحو", "صرف", "بلاغة", "نصوص", "إملاء"]} />
              </div>
              {q.type === "mcq" ? (
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, k) => (
                    <div key={k} className="flex gap-2 items-center">
                      <button onClick={() => updateQ(i, { correct_answer: opt || ["أ", "ب", "ج", "د"][k] })}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${q.correct_answer === opt || q.correct_answer === ["أ", "ب", "ج", "د"][k] ? "bg-emerald-500 text-white" : "bg-azhar-50 text-azhar-800"}`}>
                        {["أ", "ب", "ج", "د"][k]}
                      </button>
                      <input className="flex-1 px-3 py-2 rounded-lg border-2 border-black/10 focus:border-azhar-600" placeholder={`الاختيار ${["الأول", "الثاني", "الثالث", "الرابع"][k]}`} value={opt} onChange={e => updateOpt(i, k, e.target.value)} />
                    </div>
                  ))}
                  <div className="text-xs text-ink/60">اضغط على الحرف عشان تحدد الإجابة الصحيحة (تختار بالنص)</div>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  {["صح", "خطأ"].map(v => (
                    <button key={v} onClick={() => updateQ(i, { correct_answer: v })} className={`flex-1 p-3 rounded-xl border-2 font-bold ${q.correct_answer === v ? "bg-emerald-500 text-white border-emerald-500" : "border-black/10"}`}>{v}</button>
                  ))}
                </div>
              )}
            </Card>
          ))}
          <Button variant="dark" onClick={() => setQuestions(qs => [...qs, blankQ()])}>+ إضافة سؤال</Button>
        </div>
      </div>
    </AdminLayout>
  );
}

// ---------- Live schedule ----------
function AdminLivePage() {
  const [form, setForm] = React.useState({ title: "", datetime: "", duration_minutes: 60, capacity: 100, meet_url: "" });
  const [list, setList] = React.useState(null);
  const toast = useToast();
  React.useEffect(() => { liveApi.upcoming().then(r => setList(Array.isArray(r) ? r : (r?.sessions || []))).catch(() => setList([])); }, []);
  const create = async () => {
    try { await adminApi.createLive(form); toast.push("تم جدولة الحصة", { type: "success" }); setForm({ title: "", datetime: "", duration_minutes: 60, capacity: 100, meet_url: "" }); const r = await liveApi.upcoming(); setList(Array.isArray(r) ? r : (r?.sessions || [])); }
    catch (e) { toast.push(e.message, { type: "error" }); }
  };
  return (
    <AdminLayout page="live">
      <FadeIn><h1 className="font-display font-black text-3xl text-azhar-800 mb-6">الحصص المباشرة</h1></FadeIn>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1 h-fit">
          <h3 className="font-display font-bold text-azhar-800 mb-4">جدولة حصة جديدة</h3>
          <div className="space-y-3">
            <Input label="عنوان الحصة" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input type="datetime-local" label="التاريخ والوقت" value={form.datetime} onChange={e => setForm({ ...form, datetime: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" label="المدة (دقيقة)" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
              <Input type="number" label="السعة" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} />
            </div>
            <Input label="رابط Jitsi (اختياري)" value={form.meet_url} onChange={e => setForm({ ...form, meet_url: e.target.value })} placeholder="اتركه فارغاً لإنشاء تلقائي" />
          </div>
          <Button variant="primary" className="w-full mt-4" onClick={create} disabled={!form.title || !form.datetime}>جدولة</Button>
        </Card>
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-display font-bold text-azhar-800">الحصص القادمة</h3>
          {!list ? <Skeleton className="h-32 rounded-2xl" /> : list.length ? list.map((s, i) => (
            <Card key={s.id || i} className="p-4 flex justify-between items-center gap-3">
              <div>
                <div className="font-display font-bold text-azhar-800">{s.title}</div>
                <div className="text-xs text-ink/60">{fmt.datetime(s.datetime || s.starts_at)} · {s.duration_minutes} دقيقة</div>
              </div>
              <a href={s.meet_url} target="_blank" rel="noopener" className="text-azhar-800 font-bold text-sm hover:underline">افتح الرابط</a>
            </Card>
          )) : <div className="text-ink/60 text-center py-6">لا يوجد حصص قادمة</div>}
        </div>
      </div>
    </AdminLayout>
  );
}

// ---------- Students list ----------
function AdminStudentsPage() {
  const [students, setStudents] = React.useState(null);
  const toast = useToast();
  const del = async (id, name) => {
    if (!confirm(`متأكد عايز تمسح الطالب ${name}؟ هيتمسح كل بياناته (مدفوعات، تقدم، حجوزات).`)) return;
    try { await adminApi.deleteStudent(id); toast.push("تم حذف الطالب", { type: "success" }); load(); }
    catch (e) { toast.push(e.message, { type: "error" }); }
  };
  const [q, setQ] = React.useState("");
  const [grade, setGrade] = React.useState("");
  React.useEffect(() => { adminApi.students().then(r => setStudents(Array.isArray(r) ? r : (r?.students || []))).catch(() => setStudents([])); }, []);

  const filtered = (students || []).filter(s => {
    if (grade && s.grade !== grade) return false;
    if (q && !((s.name || "").includes(q) || (s.username || "").includes(q))) return false;
    return true;
  });

  return (
    <AdminLayout page="students">
      <FadeIn><h1 className="font-display font-black text-3xl text-azhar-800 mb-6">الطلاب</h1></FadeIn>
      <Card className="p-4 mb-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Icon.Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <input className="w-full pr-10 pl-4 py-3 rounded-xl border-2 border-black/10 focus:border-azhar-600 bg-white" placeholder="ابحث بالاسم أو المستخدم" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className="px-4 py-3 rounded-xl border-2 border-black/10 focus:border-azhar-600 bg-white font-bold" value={grade} onChange={e => setGrade(e.target.value)}>
          <option value="">كل الصفوف</option>
          {["الصف الأول الإعدادي", "الصف الثاني الإعدادي", "الصف الثالث الإعدادي", "الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي"].map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </Card>
      {!students ? <Skeleton className="h-40 rounded-2xl" /> : (
        <Card className="overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-azhar-50 text-xs font-bold text-azhar-800"><tr>
                <th className="px-4 py-3">الاسم</th><th className="px-4 py-3">المستخدم</th><th className="px-4 py-3">الصف</th><th className="px-4 py-3">إيميل ولي الأمر</th><th className="px-4 py-3">حالة الاشتراك</th><th className="px-4 py-3">تاريخ التسجيل</th>
                <th className="px-4 py-3">حذف</th>
              </tr></thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map((s, i) => (
                  <tr key={s.id || i} className="hover:bg-azhar-50/30">
                    <td className="px-4 py-3 font-bold text-azhar-800">{s.name}</td>
                    <td className="px-4 py-3 font-num" dir="ltr">{s.username}</td>
                    <td className="px-4 py-3">{s.grade}</td>
                    <td className="px-4 py-3 text-xs" dir="ltr">{s.parent_email}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.subscription_status || (s.active ? "active" : "pending")} /></td>
                    <td className="px-4 py-3 text-xs">{fmt.date(s.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => del(s.id, s.name)} className="text-red-600 hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center"><Icon.Trash className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-ink/60">لا يوجد نتائج</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AdminLayout>
  );
}

// ---------- Financial reports ----------
function AdminFinancePage() {
  const [fin, setFin] = React.useState(null);
  const [all, setAll] = React.useState(null);
  const R = window.Recharts || {};
  React.useEffect(() => {
    adminApi.financial().then(setFin).catch(() => setFin({}));
    adminApi.allPayments().then(r => setAll(Array.isArray(r) ? r : (r?.payments || []))).catch(() => setAll([]));
  }, []);

  const line = React.useMemo(() => {
    if (!all) return [];
    const days = {};
    for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = d.toISOString().slice(0, 10); days[k] = 0; }
    all.forEach(p => { if (p.status !== "confirmed" && p.status !== "active") return; const k = (p.created_at || "").slice(0, 10); if (k in days) days[k] += Number(p.amount || 0); });
    return Object.entries(days).map(([date, val]) => ({ date: date.slice(5), val }));
  }, [all]);

  const dist = fin?.distribution || fin?.by_method || {};
  const distData = Object.entries(dist).map(([k, v]) => ({ name: k === "vodafone_cash" ? "فودافون كاش" : "إنستاباي", value: v }));

  return (
    <AdminLayout page="finance">
      <FadeIn><h1 className="font-display font-black text-3xl text-azhar-800 mb-6">التقارير المالية</h1></FadeIn>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Icon.CreditCard} label="اليوم" value={fmt.price(fin?.today ?? 0)} tone="gold" />
        <StatCard icon={Icon.CreditCard} label="الأسبوع" value={fmt.price(fin?.week ?? 0)} tone="azhar" />
        <StatCard icon={Icon.CreditCard} label="الشهر" value={fmt.price(fin?.month ?? 0)} tone="emerald" />
        <StatCard icon={Icon.Users} label="عدد المدفوعات" value={fmt.int(all?.length || 0)} tone="rose" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display font-bold text-azhar-800 mb-4">الإيرادات اليومية (آخر ٣٠ يوم)</h3>
          <div className="h-64" dir="ltr">
            {R.LineChart && line.length ? (
              <R.ResponsiveContainer>
                <R.LineChart data={line}>
                  <R.CartesianGrid stroke="#f0ebd8" strokeDasharray="4 4" />
                  <R.XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <R.YAxis tick={{ fontSize: 10 }} />
                  <R.Tooltip />
                  <R.Line type="monotone" dataKey="val" stroke="#c9a227" strokeWidth={3} dot={{ fill: "#0f5132" }} />
                </R.LineChart>
              </R.ResponsiveContainer>
            ) : <Skeleton className="h-full" />}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-display font-bold text-azhar-800 mb-4">توزيع طرق الدفع</h3>
          <div className="h-64">
            {R.PieChart && distData.length ? (
              <R.ResponsiveContainer><R.PieChart>
                <R.Pie data={distData} innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={4} label>
                  <R.Cell fill="#e11d48" /><R.Cell fill="#7c3aed" />
                </R.Pie>
                <R.Tooltip />
                <R.Legend />
              </R.PieChart></R.ResponsiveContainer>
            ) : <div className="text-center text-ink/60 py-10">لا توجد بيانات</div>}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

// ---------- Settings ----------
function AdminSettingsPage() {
  const [settings, setSettings] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const toast = useToast();
  React.useEffect(() => { adminApi.settings().then(setSettings).catch(e => { setError(e.message); setSettings({}); }); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        vodafone_cash_number: settings.vodafone_cash_number,
        instapay_handle: settings.instapay_handle,
        price_monthly: String(settings.price_monthly || ""),
        price_term: String(settings.price_term || ""),
        price_yearly: String(settings.price_yearly || ""),
      };
      await adminApi.updateSettings(payload);
      toast.push("تم الحفظ", { type: "success" });
    } catch (e) { toast.push(e.message, { type: "error" }); }
    finally { setSaving(false); }
  };
  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  if (!settings) return <AdminLayout page="settings"><Skeleton className="h-96 rounded-2xl" /></AdminLayout>;

  return (
    <AdminLayout page="settings">
      <FadeIn><h1 className="font-display font-black text-3xl text-azhar-800 mb-6">الإعدادات والمظهر</h1></FadeIn>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-display font-bold text-azhar-800 mb-4">طرق الدفع</h3>
          <div className="space-y-3">
            <Input label="رقم فودافون كاش" value={settings.vodafone_cash_number || ""} onChange={e => set("vodafone_cash_number", e.target.value)} placeholder="01060690384" />
            <Input label="يوزر إنستاباي" value={settings.instapay_handle || ""} onChange={e => set("instapay_handle", e.target.value)} placeholder="youssef@instapay" />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-display font-bold text-azhar-800 mb-4">الأسعار</h3>
          <div className="space-y-3">
            <Input label="سعر الشهر (ج.م)" type="number" value={settings.price_monthly || ""} onChange={e => set("price_monthly", e.target.value)} />
            <Input label="سعر الترم (ج.م)" type="number" value={settings.price_term || ""} onChange={e => set("price_term", e.target.value)} />
            <Input label="سعر السنة (ج.م)" type="number" value={settings.price_yearly || ""} onChange={e => set("price_yearly", e.target.value)} />
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-6">
        <h3 className="font-display font-bold text-azhar-800 mb-2">صور ومحتوى الموقع</h3>
        <p className="text-sm text-ink/60 mb-4">صورة المعلم، بانر الرئيسية، معرض الصور، آراء الطلاب، والنصوص التسويقية تُحفظ محلياً في المتصفح — لتفعيل الرفع للسيرفر يلزم تعديل الـ Backend لإضافة endpoints لهذه العناصر.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <b>ملحوظة:</b> الـ API الحالي يدعم صور الإيصالات وفيديو الدروس فقط. لإضافة صور معرض/تيستيمونيالز/بانر مرن، اطلب من مطور الباك إند إضافة endpoints:
          <div className="font-num mt-2 space-y-1 text-xs">
            <div dir="ltr" className="bg-white rounded px-2 py-1 inline-block">POST /api/admin/media/upload</div>
            <div dir="ltr" className="bg-white rounded px-2 py-1 inline-block">PUT /api/admin/settings/content</div>
          </div>
        </div>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button variant="primary" size="lg" onClick={save} disabled={saving}>{saving ? "جاري الحفظ..." : "احفظ الإعدادات"}</Button>
      </div>
    </AdminLayout>
  );
}

Object.assign(window, {
  AdminLayout, AdminDashboard, AdminPendingPage, AdminCoursesPage, UploadLessonForm,
  AdminQuizPage, AdminLivePage, AdminStudentsPage, AdminFinancePage, AdminSettingsPage,
});
