// ============================================================
// Public pages: Home, Courses (public), Layout Nav/Footer
// ============================================================

// ---------- Public Layout (Nav + Footer) ----------
function PublicLayout({ children }) {
  const auth = useAuth();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const route = useRoute();

  React.useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on(); window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  React.useEffect(() => setOpen(false), [route.hash]);

  const links = [
    { href: "#/", label: "الرئيسية" },
    { href: "#/courses", label: "الكورسات" },
    { href: "#/about", label: "عن المعلم" },
    { href: "#/live-info", label: "الحصص المباشرة" },
    { href: "#/plans", label: "الاشتراكات" },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className={`sticky top-0 z-40 transition-all ${scrolled ? "bg-white/85 backdrop-blur-xl shadow-soft" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <a href="#/" className="flex-shrink-0"><Logo size="md" /></a>
          <nav className="hidden lg:flex items-center gap-1">
            {links.map(l => (
              <a key={l.href} href={l.href} className={`px-4 py-2 rounded-xl font-bold text-sm transition ${route.hash === l.href || (l.href === "#/" && route.path === "/") ? "text-azhar-800 bg-azhar-50" : "text-ink/70 hover:text-azhar-800 hover:bg-azhar-50/60"}`}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {auth.token ? (
              <Button variant="dark" size="sm" onClick={() => nav(auth.role === "admin" ? "/admin" : "/dashboard")}>
                لوحتي
              </Button>
            ) : (
              <>
                <a href="#/login" className="hidden sm:inline-block px-4 py-2 text-sm font-bold text-azhar-800 hover:bg-azhar-50 rounded-xl transition">تسجيل الدخول</a>
                <Button variant="primary" size="sm" onClick={() => nav("/register")}>سجّل الآن</Button>
              </>
            )}
            <button className="lg:hidden w-10 h-10 rounded-xl bg-azhar-800 text-white flex items-center justify-center" onClick={()=>setOpen(o=>!o)}>
              <Icon.Menu className="w-5 h-5"/>
            </button>
          </div>
        </div>
        {open && (
          <div className="lg:hidden bg-white border-t border-black/5 shadow-soft">
            <div className="px-4 py-3 flex flex-col gap-1">
              {links.map(l => <a key={l.href} href={l.href} className="px-4 py-3 rounded-xl font-bold text-ink/80 hover:bg-azhar-50">{l.label}</a>)}
              {!auth.token && <a href="#/login" className="px-4 py-3 rounded-xl font-bold text-azhar-800 hover:bg-azhar-50">تسجيل الدخول</a>}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <PublicFooter />
    </div>
  );
}

function PublicFooter() {
  return (
    <footer className="bg-arabesque text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo light size="md" />
            <p className="mt-4 text-white/70 leading-relaxed max-w-md">
              منصة تعليمية متخصصة في اللغة العربية للأزهر الشريف — إعدادي وثانوي. دروس مسجّلة، حصص مباشرة، اختبارات، ومتابعة أولياء الأمور.
            </p>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4 text-gold-300">روابط سريعة</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li><a href="#/" className="hover:text-gold-300">الرئيسية</a></li>
              <li><a href="#/courses" className="hover:text-gold-300">الكورسات</a></li>
              <li><a href="#/plans" className="hover:text-gold-300">خطط الاشتراك</a></li>
              <li><a href="#/register" className="hover:text-gold-300">إنشاء حساب طالب</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4 text-gold-300">تواصل</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>واتساب: <span className="font-num" dir="ltr">01060690384</span></li>
              <li>فودافون كاش: <span className="font-num" dir="ltr">01060690384</span></li>
              <li>إنستاباي: <span className="font-num" dir="ltr">youssef@instapay</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-white/50 text-sm">
          <div>© {new Date().getFullYear()} مستر يوسف عصام — جميع الحقوق محفوظة</div>
          <div className="flex gap-4">
            <a href="#/login" className="hover:text-gold-300">دخول المعلم</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------- HOME ----------
function HomePage() {
  const gallery = [
    "public/images/classroom-selfie.jpg",
    "public/images/teacher-book.jpg",
    "public/images/teacher-desk.jpg",
    "public/images/teacher-library.jpg",
    "public/images/teacher-standing.jpg",
    "public/images/teacher-writing.jpg",
  ];
  const features = [
    { icon: Icon.Video, title: "دروس فيديو مسجّلة", desc: "شرح مفصّل لكل درس تقدر تراجعه في أي وقت من الموبايل أو الكمبيوتر", color: "from-emerald-500 to-emerald-700" },
    { icon: Icon.Calendar, title: "حصص مباشرة أونلاين", desc: "لايف أسبوعي للمناقشة وحل الأسئلة، محجوز مسبقاً وبتنبيه قبل الحصة", color: "from-amber-500 to-amber-700" },
    { icon: Icon.Trophy, title: "اختبارات تفاعلية", desc: "بعد كل درس اختبار قصير مع تحليل الأخطاء بالموضوع (نحو / صرف / بلاغة)", color: "from-rose-500 to-rose-700" },
    { icon: Icon.Users, title: "متابعة ولي الأمر", desc: "رابط سري لولي الأمر يشوف فيه تقدّم ابنه ومدفوعاته أول بأول", color: "from-blue-500 to-blue-700" },
    { icon: Icon.File, title: "ملفات ومذكرات PDF", desc: "مذكرة كاملة مع كل درس قابلة للتحميل أو العرض داخل الموقع", color: "from-purple-500 to-purple-700" },
    { icon: Icon.CreditCard, title: "دفع مرن وآمن", desc: "فودافون كاش أو إنستاباي — ترفع الإيصال والاشتراك يفعّل خلال ساعات", color: "from-cyan-500 to-cyan-700" },
  ];
  const testimonials = [
    { name: "أحمد إبراهيم", grade: "الصف الثالث الثانوي أزهري", text: "الشرح واضح ومرتب جداً، والاختبارات ساعدتني أعرف أخطائي في النحو. نتيجتي اتحسنت كتير." },
    { name: "منّة الله سيد", grade: "الصف الثاني الثانوي", text: "المذكرات منظمة والفيديو بيرن على الموبايل من غير مشاكل. الأستاذ يوسف بيرد على أسئلتنا بسرعة." },
    { name: "عمر خالد", grade: "الصف الثالث الإعدادي", text: "الحصة اللايف بتفرق جداً، بحس إني في فصل حقيقي والأسئلة بتترد عليها لحظة بلحظة." },
  ];
  const stages = [
    { icon: "١", title: "الإعدادي الأزهري", desc: "الصف الأول، الثاني، والثالث الإعدادي", color: "bg-azhar-800", grades: ["الأول الإعدادي", "الثاني الإعدادي", "الثالث الإعدادي"] },
    { icon: "٢", title: "الثانوي الأزهري", desc: "الصف الأول، الثاني، والثالث الثانوي", color: "bg-gold-500", grades: ["الأول الثانوي", "الثاني الثانوي", "الثالث الثانوي"] },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-24 md:pt-20 md:pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-400/40 rounded-full px-4 py-1.5 mb-6">
                <Icon.Sparkle className="w-4 h-4 text-gold-300" />
                <span className="text-sm font-bold text-gold-200">منصة متخصصة للأزهر الشريف</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4">
                اللغة العربية <span className="text-gold-300">بأسلوب</span> يفهم الطالب الأزهري
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg text-white/80 max-w-xl leading-relaxed mb-8">
                مع الأستاذ <b className="text-white">يوسف عصام</b> — دروس مسجّلة ومنهجية، حصص لايف أسبوعية، ومذكرات كاملة لمرحلتي الإعدادي والثانوي.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" size="lg" onClick={() => nav("/register")}>
                  ابدأ الآن مجاناً <Icon.ArrowLeft className="w-4 h-4"/>
                </Button>
                <Button variant="ghost" size="lg" onClick={() => nav("/courses")}>
                  <Icon.Play className="w-4 h-4"/> شاهد الكورسات
                </Button>
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div className="mt-10 grid grid-cols-3 max-w-md gap-6 pt-6 border-t border-white/10">
                <div><div className="font-display font-black text-3xl text-gold-300 font-num">+٥٠٠</div><div className="text-xs text-white/60 mt-1">طالب مشترك</div></div>
                <div><div className="font-display font-black text-3xl text-gold-300 font-num">+١٢٠</div><div className="text-xs text-white/60 mt-1">درس مسجّل</div></div>
                <div><div className="font-display font-black text-3xl text-gold-300 font-num">٩٨٪</div><div className="text-xs text-white/60 mt-1">رضا الطلاب</div></div>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.15}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gold-400/20 rounded-3xl blur-3xl" />
              <div className="relative rounded-3xl overflow-hidden shadow-lift border-4 border-gold-400/40 aspect-[3/4] max-w-md mx-auto lg:mx-0 lg:mr-auto">
                <img src="public/images/teacher-portrait.jpg" alt="مستر يوسف عصام" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="text-white font-display font-black text-xl">أ / يوسف عصام</div>
                  <div className="text-gold-300 text-sm">معلم اللغة العربية · الأزهر الشريف</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lift p-4 flex items-center gap-3 hidden sm:flex">
                <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center text-gold-600"><Icon.Star className="w-5 h-5"/></div>
                <div>
                  <div className="font-display font-bold text-azhar-800 text-sm">تقييم ٤.٩ / ٥</div>
                  <div className="text-xs text-ink/60">من +٥٠٠ طالب</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
        {/* Marquee bar */}
        <div className="relative bg-gold-500/95 border-y border-gold-600/30 py-3 overflow-hidden">
          <div className="marquee-track flex gap-14 whitespace-nowrap font-display font-bold text-azhar-900">
            {Array.from({length:2}).map((_,i)=>(
              <React.Fragment key={i}>
                <span>✦ اشترك الآن واحصل على أول حصة لايف مجاناً</span>
                <span>✦ منهج الأزهر ٢٠٢٦ محدّث بالكامل</span>
                <span>✦ +١٢٠ درس فيديو HD</span>
                <span>✦ اختبارات بعد كل درس</span>
                <span>✦ مذكرات PDF مع كل وحدة</span>
                <span>✦ حصص لايف أسبوعية</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          <FadeIn className="lg:col-span-2">
            <div className="relative">
              <div className="grid grid-cols-2 gap-3">
                <img src="public/images/teacher-book.jpg" className="rounded-2xl shadow-soft aspect-[3/4] object-cover"/>
                <img src="public/images/teacher-writing.jpg" className="rounded-2xl shadow-soft aspect-[3/4] object-cover mt-8"/>
              </div>
            </div>
          </FadeIn>
          <div className="lg:col-span-3">
            <FadeIn>
              <div className="divider-gold mb-4"></div>
              <h2 className="font-display font-black text-3xl md:text-4xl text-azhar-800 mb-4">
                عن <span className="text-gold-600">مستر يوسف عصام</span>
              </h2>
              <p className="text-ink/75 text-lg leading-relaxed mb-6">
                معلم لغة عربية متخصص في مناهج الأزهر الشريف بخبرة تربوية طويلة. أسلوب واضح ومبسّط،
                يعتمد على الفهم قبل الحفظ، ومتابعة فردية لكل طالب من خلال الاختبارات وتحليل الأخطاء
                في النحو والصرف والبلاغة.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-azhar-50 rounded-2xl p-4">
                  <div className="text-3xl font-display font-black text-azhar-800 font-num">+١٠</div>
                  <div className="text-sm text-ink/70 mt-1">سنوات خبرة</div>
                </div>
                <div className="bg-gold-50 rounded-2xl p-4">
                  <div className="text-3xl font-display font-black text-gold-700 font-num">+٥٠٠</div>
                  <div className="text-sm text-ink/70 mt-1">طالب مشترك</div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4">
                  <div className="text-3xl font-display font-black text-emerald-700 font-num">٦</div>
                  <div className="text-sm text-ink/70 mt-1">صفوف دراسية</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-cream/60 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="divider-gold mx-auto mb-4"></div>
              <h2 className="font-display font-black text-3xl md:text-4xl text-azhar-800 mb-3">إيه اللي هتلاقيه في المنصة؟</h2>
              <p className="text-ink/70">كل ما تحتاجه لتفوّقك في اللغة العربية للأزهر — منظّم، متتابع، ومتاح ٢٤/٧.</p>
            </div>
          </FadeIn>
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <StaggerItem key={i}>
                <div className="bg-white rounded-3xl p-6 shadow-soft border border-black/5 card-hover h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-4 shadow-soft`}>
                    <f.icon className="w-7 h-7"/>
                  </div>
                  <h3 className="font-display font-bold text-xl text-azhar-800 mb-2">{f.title}</h3>
                  <p className="text-ink/70 leading-relaxed">{f.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* STAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="divider-gold mx-auto mb-4"></div>
            <h2 className="font-display font-black text-3xl md:text-4xl text-azhar-800 mb-3">المراحل الدراسية</h2>
            <p className="text-ink/70">اختر مرحلتك وابدأ الرحلة</p>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-6">
          {stages.map((s,i)=>(
            <FadeIn key={i} delay={i*.1}>
              <div className={`relative overflow-hidden rounded-3xl p-8 text-white shadow-lift card-hover ${s.color === "bg-gold-500" ? "bg-gradient-to-br from-gold-500 to-gold-700" : "bg-gradient-to-br from-azhar-700 to-azhar-900"}`}>
                <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-white/10 blur-2xl"/>
                <div className="relative">
                  <div className="text-6xl font-display font-black opacity-30 font-num">{s.icon}</div>
                  <h3 className="font-display font-black text-3xl mt-2">{s.title}</h3>
                  <p className="mt-2 opacity-90">{s.desc}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {s.grades.map(g => <span key={g} className="bg-white/15 border border-white/20 rounded-full px-3 py-1 text-sm font-bold">{g}</span>)}
                  </div>
                  <button onClick={()=>nav("/courses")} className="mt-6 inline-flex items-center gap-2 bg-white text-azhar-800 font-display font-bold px-5 py-3 rounded-2xl hover:-translate-y-0.5 transition">
                    شاهد الكورسات <Icon.ArrowLeft className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="bg-arabesque py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="divider-gold mx-auto mb-4"></div>
              <h2 className="font-display font-black text-3xl md:text-4xl text-white mb-3">من داخل الفصل</h2>
              <p className="text-white/70">لحظات مع الطلاب داخل وخارج المنصة</p>
            </div>
          </FadeIn>
          <Stagger className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((src, i) => (
              <StaggerItem key={i}>
                <div className="relative overflow-hidden rounded-2xl aspect-square card-hover">
                  <img src={src} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-azhar-900/80 via-transparent to-transparent" />
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="divider-gold mx-auto mb-4"></div>
            <h2 className="font-display font-black text-3xl md:text-4xl text-azhar-800 mb-3">آراء الطلاب</h2>
            <p className="text-ink/70">اسمع اللي بيقولوه اللي جربوا المنصة</p>
          </div>
        </FadeIn>
        <Stagger className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <StaggerItem key={i}>
              <div className="bg-white rounded-3xl p-6 shadow-soft border border-black/5 h-full flex flex-col">
                <div className="flex gap-1 text-gold-500 mb-4">{Array.from({length:5}).map((_,j)=><Icon.Star key={j} className="w-4 h-4"/>)}</div>
                <p className="text-ink/80 leading-relaxed flex-1">"{t.text}"</p>
                <div className="mt-5 pt-5 border-t border-black/5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-azhar-700 to-azhar-900 text-white flex items-center justify-center font-display font-black">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-display font-bold text-azhar-800">{t.name}</div>
                    <div className="text-xs text-ink/60">{t.grade}</div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[2rem] p-8 md:p-14 bg-gradient-to-br from-azhar-800 to-azhar-900 text-white text-center">
            <div className="absolute inset-0 bg-arabesque opacity-40" />
            <div className="relative">
              <h2 className="font-display font-black text-3xl md:text-5xl mb-3">جاهز تبدأ رحلتك؟</h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">سجّل الآن مجاناً وشوف الدروس التمهيدية قبل أي التزام.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="primary" size="lg" onClick={() => nav("/register")}>سجّل الآن <Icon.ArrowLeft className="w-4 h-4"/></Button>
                <Button variant="ghost" size="lg" onClick={() => nav("/plans")}>شوف الأسعار</Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
}

// ---------- COURSES PUBLIC ----------
function CoursesPublicPage() {
  const [loading, setLoading] = React.useState(true);
  const [courses, setCourses] = React.useState([]);
  const [error, setError] = React.useState(null);
  const auth = useAuth();

  React.useEffect(() => {
    if (!auth.token) {
      // Show mock/browsing (unauth) — API needs student token
      setLoading(false);
      setCourses([]);
      return;
    }
    (async () => {
      try {
        const r = await studentApi.courses();
        setCourses(Array.isArray(r) ? r : (r?.courses || r?.data || []));
      } catch (e) { setError(e.message); } finally { setLoading(false); }
    })();
  }, [auth.token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <FadeIn>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="divider-gold mx-auto mb-4"></div>
          <h1 className="font-display font-black text-4xl text-azhar-800 mb-3">الكورسات المتاحة</h1>
          <p className="text-ink/70">كل الكورسات مقسمة على وحدات ودروس مرتبة</p>
        </div>
      </FadeIn>

      {!auth.token && (
        <div className="bg-gold-50 border-2 border-gold-200 rounded-2xl p-6 mb-8 text-center">
          <p className="text-azhar-800 font-bold mb-3">سجّل دخولك عشان تشوف الكورسات المتاحة لصفك.</p>
          <Button variant="primary" onClick={()=>nav("/register")}>سجّل حساب طالب</Button>
        </div>
      )}

      {loading && auth.token && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-64 rounded-3xl"/>)}
        </div>
      )}
      {error && <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 text-center">{error}</div>}
      {!loading && !error && auth.token && courses.length === 0 && (
        <div className="text-center py-16 text-ink/60">لا توجد كورسات متاحة حالياً لصفك.</div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map(c => <CourseCard key={c.id} c={c} />)}
      </div>
    </div>
  );
}

function CourseCard({ c }) {
  const gradient = React.useMemo(() => {
    const gs = [
      "from-azhar-600 to-azhar-800",
      "from-gold-600 to-gold-800",
      "from-emerald-600 to-emerald-800",
      "from-rose-600 to-rose-800",
      "from-blue-600 to-blue-800",
    ];
    let h = 0; for (const ch of (c.id || c.title || "")) h = (h + ch.charCodeAt(0)) % gs.length;
    return gs[h];
  }, [c.id]);
  return (
    <div className="rounded-3xl bg-white shadow-soft overflow-hidden card-hover cursor-pointer" onClick={()=>nav(`/course/${c.id}`)}>
      <div className={`h-40 bg-gradient-to-br ${gradient} relative`}>
        <div className="absolute inset-0 bg-arabesque opacity-30"/>
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-white text-xs font-bold">{c.grade || "—"}</div>
        <div className="absolute bottom-4 right-4 text-white">
          <div className="font-display font-black text-2xl">{c.title || "كورس"}</div>
          <div className="text-white/80 text-sm">{c.term || ""}</div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-sm text-ink/70 mb-4">
          <div className="flex items-center gap-1"><Icon.Book className="w-4 h-4"/> <span>{c.units_count || c.units?.length || 0} وحدة</span></div>
          <div className="flex items-center gap-1"><Icon.Video className="w-4 h-4"/> <span>{c.lessons_count || 0} درس</span></div>
        </div>
        <Button variant="dark" size="sm" className="w-full">افتح الكورس <Icon.ArrowLeft className="w-4 h-4"/></Button>
      </div>
    </div>
  );
}

// ---------- ABOUT / PLANS / LIVE INFO (secondary) ----------
function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      <FadeIn>
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <img src="public/images/teacher-suit.jpg" className="w-full rounded-3xl shadow-lift"/>
          <div>
            <div className="divider-gold mb-4"></div>
            <h1 className="font-display font-black text-4xl text-azhar-800 mb-3">أ / يوسف عصام</h1>
            <div className="text-gold-600 font-bold mb-6">معلم اللغة العربية · الأزهر الشريف</div>
            <p className="text-ink/75 leading-relaxed mb-4">
              معلم متخصص في مناهج اللغة العربية للأزهر بخبرة تعليمية طويلة. اهتمامي الأساسي إن الطالب يفهم قبل ما يحفظ،
              وإن يكون عنده متابعة حقيقية على كل درس عن طريق الاختبارات والتقييم المستمر.
            </p>
            <p className="text-ink/75 leading-relaxed mb-4">
              المنصة دي مبنية عشان الطالب يقدر يذاكر في أي وقت من الموبايل، ويرجع للدرس اللي فاته، ويعرف نقط ضعفه بالظبط
              — سواء في النحو أو الصرف أو البلاغة أو النصوص.
            </p>
            <Button variant="primary" onClick={()=>nav("/register")}>ابدأ التعلم معي</Button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

function LiveInfoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      <FadeIn>
        <div className="text-center mb-10">
          <div className="divider-gold mx-auto mb-4"></div>
          <h1 className="font-display font-black text-4xl text-azhar-800 mb-3">الحصص المباشرة</h1>
          <p className="text-ink/70">لايف أسبوعي على منصة Jitsi، بجودة عالية ومباشرة من الموبايل أو الكمبيوتر</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Icon.Video, t: "بث مباشر HD", d: "جودة عالية وبدون تقطيع" },
            { icon: Icon.Users, t: "تفاعل حي", d: "أسئلة وأجوبة أثناء الحصة" },
            { icon: Icon.Calendar, t: "جدول ثابت", d: "حصص أسبوعية بتنبيهات" },
          ].map((x,i)=>(
            <Card key={i} className="p-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-azhar-800 text-gold-300 flex items-center justify-center mb-3"><x.icon className="w-7 h-7"/></div>
              <div className="font-display font-bold text-azhar-800 text-lg">{x.t}</div>
              <div className="text-sm text-ink/70 mt-1">{x.d}</div>
            </Card>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}

function PlansPublicPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      <FadeIn>
        <div className="text-center mb-10">
          <div className="divider-gold mx-auto mb-4"></div>
          <h1 className="font-display font-black text-4xl text-azhar-800 mb-3">خطط الاشتراك</h1>
          <p className="text-ink/70">اختر الخطة المناسبة لك — كلها بتفتح كل الكورسات</p>
        </div>
      </FadeIn>
      <PlansGrid />
    </div>
  );
}

// Reusable plans grid (uses default prices, matches API defaults)
function PlansGrid({ onSelect, current=null }) {
  const plans = [
    { id: "monthly", label: "اشتراك شهر", price: 250, duration: "٣٠ يوم", features: ["كل الكورسات المتاحة","اختبارات + مذكرات","حصص لايف أسبوعية"] },
    { id: "term",    label: "اشتراك ترم", price: 900, duration: "٤ شهور", popular: true, features: ["كل مميزات الشهري","توفير ١٥٠ ج.م","أولوية الرد على الأسئلة"] },
    { id: "yearly",  label: "اشتراك سنة", price: 2400, duration: "١٢ شهر", features: ["كل مميزات الترم","توفير ٦٠٠ ج.م","حصة مراجعة نهائية مجاناً"] },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-5">
      {plans.map(p => (
        <div key={p.id} className={`relative rounded-3xl p-8 border-2 ${p.popular ? "border-gold-500 bg-gradient-to-br from-gold-50 to-white shadow-lift" : "border-black/5 bg-white shadow-soft"} card-hover flex flex-col`}>
          {p.popular && <div className="absolute -top-3 right-6 bg-gold-500 text-azhar-900 font-display font-black text-xs px-3 py-1 rounded-full shadow-gold">الأكثر طلباً</div>}
          <div className="font-display font-black text-2xl text-azhar-800">{p.label}</div>
          <div className="text-ink/60 text-sm mb-6">{p.duration}</div>
          <div className="flex items-end gap-1 mb-6">
            <span className="font-display font-black text-5xl text-azhar-800 font-num">{p.price}</span>
            <span className="text-ink/60 mb-2 font-bold">ج.م</span>
          </div>
          <ul className="space-y-2 flex-1 mb-6">
            {p.features.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-ink/75">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0 flex items-center justify-center"><Icon.Check className="w-3 h-3"/></div>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button variant={p.popular ? "primary" : "dark"} onClick={() => onSelect ? onSelect(p) : nav("/register")}>
            {current === p.id ? "اشتراكك الحالي" : "اختر هذه الخطة"}
          </Button>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { PublicLayout, HomePage, CoursesPublicPage, CourseCard, AboutPage, LiveInfoPage, PlansPublicPage, PlansGrid });
