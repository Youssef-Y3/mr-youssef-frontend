// ============================================================
// Student Dashboard + Courses + Course Detail + Lectures
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
    { href: "#/lectures", label: "المحاضرات", icon: Icon.Video, key: "lectures" },
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
            <h2 className="font-display font-black
