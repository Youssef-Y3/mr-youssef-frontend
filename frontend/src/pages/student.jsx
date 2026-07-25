// ============================================================
// Student Dashboard + Courses + Course Detail
// ============================================================

function StudentLayout({ children, page }) {
  const auth = useAuth();
  const [openMenu, setOpenMenu] = React.useState(false);
  const [subModal, setSubModal] = React.useState(false);

  React.useEffect(() => {
    const on = () => setSubModal(true);
    window.addEventListener("subscription-required", on);
    return () => window.removeEventListener("subscription-required", on);
  }, []);

  const links = [
    { href: "#/dashboard", label: "الرئيسية", icon: Icon.Home, key: "dashboard" },
    { href: "#/courses-me", label: "الكورسات", icon: Icon.Book, key: "courses" },
    { href: "#/live", label: "الحصص المباشرة", icon: Icon.Video, key: "live" },
    { href: "#/plans-me", label: "الاشتراك", icon: Icon.CreditCard, key: "plans" },
    { href: "#/my-payments", label: "مدفوعاتي", icon: Icon.Clock, key: "payments" },
  ];

  const logout = () => { authApi.logout(); window.dispatchEvent(new Event("auth-changed")); nav("/"); };

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 h-screen w-72 bg-white shadow-soft border-l border-black/5 z-40 transition-transform ${openMenu ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 border-b border-black/5"><a href="#/"><Logo size="sm"/></a></div>
        <div className="p-4">
          {auth.student && (
            <div className="bg-gradient-to-br from-azhar-800 to-azhar-900 rounded-2xl p-4 text-white mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gold-500 text-azhar-900 flex items-center justify-center font-display font-black">
                  {(auth.student.name || "ط").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold truncate">{auth.student.name || "طالب"}</div>
                  <div className="text-xs text-gold-300 truncate">{auth.student.grade || "—"}</div>
                </div>
              </div>
            </div>
          )}
          <nav className="space-y-1">
            {links.map(l => (
              <a key={l.href} href={l.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${page===l.key ? "bg-azhar-800 text-white shadow-soft" : "text-ink/70 hover:bg-azhar-50"}`}>
                <l.icon className="w-5 h-5"/>
                <span>{l.label}</span>
              </a>
            ))}
          </nav>
          <button onClick={logout} className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition w-full">
            <Icon.LogOut className="w-5 h-5"/>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-black/5 flex items-center justify-between p-4 lg:hidden">
          <a href="#/"><Logo size="sm"/></a>
          <button onClick={()=>setOpenMenu(o=>!o)} className="w-10 h-10 rounded-xl bg-azhar-800 text-white flex items-center justify-center">
            <Icon.Menu className="w-5 h-5"/>
          </button>
        </header>
        {openMenu && <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={()=>setOpenMenu(false)}/>}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>

      {/* Subscription modal */}
      <Modal open={subModal} onClose={()=>setSubModal(false)}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gold-100 text-gold-600 flex items-center justify-center mb-4"><Icon.CreditCard className="w-8 h-8"/></div>
          <h3 className="font-display font-black text-2xl text-azhar-800 mb-2">اشتراكك منتهي</h3>
          <p className="text-ink/70 mb-6">للاستمرار في مشاهدة الدروس، برجاء تفعيل الاشتراك.</p>
          <Button variant="primary" onClick={()=>{setSubModal(false); nav("/plans-me");}}>اشترك الآن</Button>
        </div>
      </Modal>
    </div>
  );
}

function StudentDashboard() {
  const auth = useAuth();
  const [data, setData] = React.useState({ courses: null, upcoming: null, payments: null });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const [courses, upcoming, payments] = await Promise.allSettled([
          studentApi.courses(),
          liveApi.upcoming(),
          paymentApi.my(),
        ]);
        setData({
          courses: courses.status==="fulfilled" ? (Array.isArray(courses.value) ? courses.value : (courses.value?.courses || [])) : [],
          upcoming: upcoming.status==="fulfilled" ? (Array.isArray(upcoming.value) ? upcoming.value : (upcoming.value?.sessions || [])) : [],
          payments: payments.status==="fulfilled" ? (Array.isArray(payments.value) ? payments.value : (payments.value?.payments || [])) : [],
        });
      } finally { setLoading(false); }
    })();
  }, []);

  const nextLive = data.upcoming?.[0];
  const activePay = data.payments?.find(p => p.status === "confirmed" || p.status === "active");

  return (
    <StudentLayout page="dashboard">
      <FadeIn>
        <div className="mb-8">
          <div className="text-sm text-ink/60">أهلاً بك 👋</div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-azhar-800 mt-1">{auth.student?.name || "طالبنا العزيز"}</h1>
        </div>
      </FadeIn>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Icon.Book} label="كورساتك" value={loading ? "..." : fmt.int(data.courses?.length || 0)} tone="azhar"/>
        <StatCard icon={Icon.Video} label="الحصة القادمة" value={loading ? "..." : (nextLive ? fmt.datetime(nextLive.datetime || nextLive.starts_at) : "—")} tone="gold" small/>
        <StatCard icon={Icon.Trophy} label="آخر اختبار" value="—" tone="emerald" hint="حل اختبار عشان يظهر هنا"/>
        <StatCard icon={Icon.CreditCard} label="حالة الاشتراك" value={activePay ? "فعّال" : "غير مفعّل"} tone={activePay ? "emerald":"rose"}/>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-black text-xl text-azhar-800">كورساتك</h2>
            <a href="#/courses-me" className="text-sm text-azhar-800 font-bold hover:underline">شوف الكل</a>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-40 rounded-2xl"/>)}</div>
          ) : data.courses?.length ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {data.courses.slice(0,4).map(c => <CourseCard key={c.id} c={c}/>)}
            </div>
          ) : (
            <Card className="p-8 text-center text-ink/60">لسه ما فيش كورسات — اشترك أول</Card>
          )}
        </div>

        {/* Live sidebar */}
        <div>
          <h2 className="font-display font-black text-xl text-azhar-800 mb-4">الحصص القادمة</h2>
          {loading ? <Skeleton className="h-40 rounded-2xl"/> :
            data.upcoming?.length ? (
              <div className="space-y-3">
                {data.upcoming.slice(0,3).map((l,i) => (
                  <Card key={l.id||i} className="p-4">
                    <div className="text-xs text-gold-600 font-bold mb-1">{fmt.datetime(l.datetime || l.starts_at)}</div>
                    <div className="font-display font-bold text-azhar-800">{l.title || "حصة مباشرة"}</div>
                    <div className="text-xs text-ink/60 mt-1">مدة: {l.duration_minutes || 60} دقيقة</div>
                  </Card>
                ))}
                <a href="#/live" className="block text-center text-sm text-azhar-800 font-bold hover:underline mt-2">شوف جدول الحصص</a>
              </div>
            ) : (
              <Card className="p-6 text-center text-ink/60 text-sm">لا توجد حصص قادمة</Card>
            )
          }
        </div>
      </div>
    </StudentLayout>
  );
}

function StatCard({ icon: I, label, value, tone="azhar", hint, small=false }) {
  const tones = {
    azhar: "bg-azhar-800 text-white",
    gold: "bg-gradient-to-br from-gold-400 to-gold-600 text-azhar-900",
    emerald: "bg-emerald-600 text-white",
    rose: "bg-rose-500 text-white",
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/5 card-hover">
      <div className={`w-11 h-11 rounded-xl ${tones[tone]} flex items-center justify-center mb-3`}><I className="w-5 h-5"/></div>
      <div className="text-xs text-ink/60 font-bold">{label}</div>
      <div className={`font-display font-black text-azhar-800 mt-1 ${small ? "text-base":"text-2xl"}`}>{value}</div>
      {hint && <div className="text-xs text-ink/50 mt-1">{hint}</div>}
    </div>
  );
}

// ---------- Student Courses page ----------
function StudentCoursesPage() {
  const [courses, setCourses] = React.useState(null);
  const [error, setError] = React.useState(null);
  React.useEffect(() => {
    (async () => {
      try { const r = await studentApi.courses(); setCourses(Array.isArray(r)?r:(r?.courses||[])); }
      catch (e) { setError(e.message); setCourses([]); }
    })();
  }, []);
  return (
    <StudentLayout page="courses">
      <FadeIn>
        <h1 className="font-display font-black text-3xl text-azhar-800 mb-2">كورساتك</h1>
        <p className="text-ink/60 mb-6">كل الكورسات المتاحة لصفك</p>
      </FadeIn>
      {error && <Card className="p-4 bg-red-50 border-red-200 text-red-700">{error}</Card>}
      {!courses ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-60 rounded-2xl"/>)}</div>
      ) : courses.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(c => <CourseWithProgress key={c.id} c={c}/>)}
        </div>
      ) : (
        <Card className="p-10 text-center text-ink/60">لا توجد كورسات متاحة حالياً</Card>
      )}
    </StudentLayout>
  );
}

function CourseWithProgress({ c }) {
  const progress = Math.round((c.progress ?? c.percent ?? Math.random()*0.7 + 0.1) * (c.progress > 1 ? 1 : 100)) / (c.progress > 1 ? 1 : 1);
  const p = Math.min(100, Math.max(0, c.progress > 1 ? c.progress : (c.progress ?? 0)*100));
  return (
    <div className="bg-white rounded-3xl shadow-soft overflow-hidden card-hover cursor-pointer" onClick={()=>nav(`/course/${c.id}`)}>
      <div className="h-32 bg-gradient-to-br from-azhar-700 to-azhar-900 relative">
        <div className="absolute inset-0 bg-arabesque opacity-30"/>
        <div className="absolute inset-0 flex items-end p-5">
          <div className="text-white">
            <div className="text-gold-300 text-xs font-bold">{c.grade || c.term || ""}</div>
            <div className="font-display font-black text-xl">{c.title}</div>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-sm text-ink/60 mb-2">
          <span>التقدم</span>
          <span className="font-bold text-azhar-800 font-num">{Math.round(p)}%</span>
        </div>
        <div className="h-2 bg-azhar-50 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-l from-gold-500 to-gold-400 rounded-full transition-all" style={{width:`${p}%`}}/>
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm text-ink/70">
          <span className="flex items-center gap-1"><Icon.Book className="w-4 h-4"/> {c.units_count || 0} وحدة</span>
          <span className="flex items-center gap-1"><Icon.Video className="w-4 h-4"/> {c.lessons_count || 0} درس</span>
        </div>
      </div>
    </div>
  );
}

// ---------- Course Detail ----------
function CourseDetailPage() {
  const route = useRoute();
  const id = route.parts[1];
  const [course, setCourse] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try { setCourse(await studentApi.course(id)); }
      catch (e) { setError(e.message); }
    })();
  }, [id]);

  const units = course?.units || course?.data?.units || [];

  return (
    <StudentLayout page="courses">
      {error && <Card className="p-4 bg-red-50 border-red-200 text-red-700 mb-4">{error}</Card>}
      {!course ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-3xl"/>
          <Skeleton className="h-20 rounded-2xl"/>
          <Skeleton className="h-20 rounded-2xl"/>
        </div>
      ) : (
        <>
          <div className="relative rounded-3xl overflow-hidden mb-6 shadow-lift">
            <div className="h-52 bg-gradient-to-br from-azhar-700 to-azhar-900">
              <div className="absolute inset-0 bg-arabesque opacity-40"/>
            </div>
            <div className="absolute inset-0 flex items-end p-6">
              <div className="text-white">
                <div className="text-gold-300 font-bold text-sm mb-1">{course.grade || course.term || ""}</div>
                <h1 className="font-display font-black text-3xl">{course.title}</h1>
                {course.description && <p className="mt-2 text-white/80 max-w-xl">{course.description}</p>}
              </div>
            </div>
          </div>

          {units.length ? (
            <div className="space-y-4">
              {units.map((u, i) => <UnitAccordion key={u.id || i} unit={u} index={i}/>)}
            </div>
          ) : (
            <Card className="p-8 text-center text-ink/60">لا توجد وحدات بعد في هذا الكورس</Card>
          )}
        </>
      )}
    </StudentLayout>
  );
}

function UnitAccordion({ unit, index }) {
  const [open, setOpen] = React.useState(index === 0);
  const lessons = unit.lessons || [];
  return (
    <Card className="overflow-hidden">
      <button className="w-full flex items-center justify-between p-5 hover:bg-azhar-50/50 transition" onClick={()=>setOpen(o=>!o)}>
        <div className="flex items-center gap-4 text-right">
          <div className="w-10 h-10 rounded-xl bg-azhar-800 text-gold-300 flex items-center justify-center font-display font-black font-num">{index+1}</div>
          <div>
            <div className="font-display font-bold text-azhar-800 text-lg">{unit.title || `الوحدة ${index+1}`}</div>
            <div className="text-xs text-ink/60 mt-0.5">{lessons.length} دروس</div>
          </div>
        </div>
        <div className={`w-8 h-8 rounded-lg bg-azhar-50 text-azhar-800 flex items-center justify-center transition ${open ? "rotate-180":""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </button>
      {open && (
        <div className="border-t border-black/5 divide-y divide-black/5">
          {lessons.map((l, li) => (
            l.locked ? (
              <div key={l.id||li} className="flex items-center justify-between p-4 opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">🔒</div>
                  <div>
                    <div className="font-display font-bold text-ink/60">{l.title || `درس ${li+1}`}</div>
                    <div className="text-xs text-ink/40">اشترك عشان تفتح الدرس ده</div>
                  </div>
                </div>
              </div>
            ) : (
              <a key={l.id||li} href={`#/lesson/${l.id}`} className="flex items-center justify-between p-4 hover:bg-azhar-50/30 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center"><Icon.Play className="w-4 h-4"/></div>
                  <div>
                    <div className="font-display font-bold text-azhar-800">{l.title || `درس ${li+1}`}</div>
                    <div className="text-xs text-ink/60">{l.duration_minutes ? `${l.duration_minutes} دقيقة` : ""}</div>
                  </div>
                </div>
                <Icon.ArrowLeft className="w-4 h-4 text-azhar-800"/>
              </a>
            )
          ))}
          {!lessons.length && <div className="p-4 text-center text-ink/50 text-sm">لا توجد دروس بعد</div>}
        </div>
      )}
    </Card>
  );
}

// ---------- Live sessions page ----------
function LivePage() {
  const [sessions, setSessions] = React.useState(null);
  const [error, setError] = React.useState(null);
  const toast = useToast();

  const load = () => {
    liveApi.upcoming().then(r => setSessions(Array.isArray(r)?r:(r?.sessions||[]))).catch(e => setError(e.message));
  };
  React.useEffect(load, []);

  const book = async (id) => {
    try { await liveApi.book(id); toast.push("تم حجز الحصة!", { type: "success" }); load(); }
    catch (e) { toast.push(e.message, { type: "error" }); }
  };
  const join = async (id) => {
    try { const r = await liveApi.join(id); const url = r?.meet_url || r?.url; if (url) window.open(url, "_blank"); }
    catch (e) { toast.push(e.message, { type: "error" }); }
  };

  return (
    <StudentLayout page="live">
      <FadeIn>
        <h1 className="font-display font-black text-3xl text-azhar-800 mb-2">الحصص المباشرة</h1>
        <p className="text-ink/60 mb-6">جدول الحصص القادمة على Jitsi</p>
      </FadeIn>
      {error && <Card className="p-4 bg-red-50 border-red-200 text-red-700 mb-4">{error}</Card>}
      {!sessions ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-24 rounded-2xl"/>)}</div>
      ) : sessions.length ? (
        <div className="space-y-3">
          {sessions.map((s,i) => (
            <Card key={s.id||i} className="p-5 flex items-center gap-5 flex-wrap">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-azhar-800 to-azhar-900 text-gold-300 flex flex-col items-center justify-center">
                <div className="text-xs font-bold">{new Date(s.datetime||s.starts_at||Date.now()).toLocaleDateString("ar-EG",{month:"short"})}</div>
                <div className="font-display font-black text-xl font-num">{new Date(s.datetime||s.starts_at||Date.now()).getDate()}</div>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="font-display font-bold text-azhar-800 text-lg">{s.title || "حصة مباشرة"}</div>
                <div className="text-sm text-ink/60 mt-1 flex gap-4 flex-wrap">
                  <span className="flex items-center gap-1"><Icon.Clock className="w-4 h-4"/> {fmt.datetime(s.datetime||s.starts_at)}</span>
                  <span>{s.duration_minutes || 60} دقيقة</span>
                </div>
              </div>
              <div className="flex gap-2">
                {s.booked ? (
                  <Button variant="success" size="sm" onClick={()=>join(s.id)}><Icon.Video className="w-4 h-4"/> ادخل الحصة</Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={()=>book(s.id)}>احجز</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center text-ink/60">لا توجد حصص قادمة حالياً</Card>
      )}
    </StudentLayout>
  );
}

Object.assign(window, { StudentLayout, StudentDashboard, StatCard, StudentCoursesPage, CourseWithProgress, CourseDetailPage, UnitAccordion, LivePage });
