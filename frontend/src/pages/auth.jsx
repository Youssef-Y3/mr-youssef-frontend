// ============================================================
// Auth pages: Register, Login (student + admin)
// ============================================================
function AuthShell({ children, title, subtitle, side="teacher-thinking" }) {
  return (
    <div className="min-h-screen bg-paper grid lg:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden lg:block bg-arabesque overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-azhar-800/30 to-azhar-900/80"/>
        <img src={`public/images/${side}.jpg`} className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-70" />
        <div className="relative h-full flex flex-col justify-between p-10 text-white">
          <a href="#/"><Logo light size="md"/></a>
          <div>
            <h2 className="font-display font-black text-4xl mb-3">اللغة العربية تبدأ من هنا.</h2>
            <p className="text-white/70 max-w-md">انضم لأكتر من ٥٠٠ طالب أزهري بيتعلموا معانا كل يوم.</p>
          </div>
        </div>
      </div>
      {/* Right form */}
      <div className="flex items-center justify-center p-6 py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><a href="#/"><Logo size="md"/></a></div>
          <FadeIn>
            <h1 className="font-display font-black text-3xl text-azhar-800 mb-1">{title}</h1>
            <p className="text-ink/60 mb-8">{subtitle}</p>
            {children}
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

function RegisterPage() {
  const [form, setForm] = React.useState({ username:"", password:"", name:"", grade:"الصف الأول الإعدادي", parent_email:"" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const r = await authApi.register(form);
      if (r?.token) { setToken(r.token); setRole("student"); setStudent(r.student || null); }
      window.dispatchEvent(new Event("auth-changed"));
      toast.push("تم إنشاء حسابك بنجاح!", { type: "success" });
      nav("/dashboard");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="إنشاء حساب طالب" subtitle="خطواتك الأولى مع منصة مستر يوسف عصام" side="teacher-standing">
      <form onSubmit={submit} className="space-y-4">
        <Input label="الاسم بالكامل" required placeholder="محمد أحمد إبراهيم" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <Input label="اسم المستخدم (لتسجيل الدخول)" required placeholder="mohamed_2010" value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
        <Input label="كلمة السر" type="password" required minLength={6} placeholder="على الأقل ٦ حروف" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        <Select label="الصف الدراسي" value={form.grade} onChange={e=>setForm({...form, grade:e.target.value})}
          options={[
            "الصف الأول الإعدادي","الصف الثاني الإعدادي","الصف الثالث الإعدادي",
            "الصف الأول الثانوي","الصف الثاني الثانوي","الصف الثالث الثانوي"
          ]}/>
        <Input label="إيميل ولي الأمر" type="email" required placeholder="parent@example.com" value={form.parent_email} onChange={e=>setForm({...form, parent_email:e.target.value})}/>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? "جاري إنشاء الحساب..." : "إنشاء حسابي"}
        </Button>
        <div className="text-center text-sm text-ink/60">
          عندك حساب بالفعل؟ <a href="#/login" className="text-azhar-800 font-bold hover:underline">سجّل دخول</a>
        </div>
      </form>
    </AuthShell>
  );
}

function LoginPage() {
  const [form, setForm] = React.useState({ username:"", password:"" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const r = await authApi.login(form);
      if (r?.token) { setToken(r.token); setRole("student"); setStudent(r.student || null); }
      window.dispatchEvent(new Event("auth-changed"));
      toast.push("أهلاً بيك تاني!", { type: "success" });
      nav("/dashboard");
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <AuthShell title="تسجيل الدخول" subtitle="ادخل بيانات حسابك للمتابعة" side="teacher-book">
      <form onSubmit={submit} className="space-y-4">
        <Input label="اسم المستخدم" required autoFocus value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
        <Input label="كلمة السر" type="password" required value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>{loading ? "..." : "دخول"}</Button>
        <div className="flex items-center justify-between text-sm">
          <a href="#/register" className="text-azhar-800 font-bold hover:underline">حساب جديد</a>
          <a href="#/admin-login" className="text-ink/60 hover:text-azhar-800">دخول المعلم</a>
        </div>
      </form>
    </AuthShell>
  );
}

function AdminLoginPage() {
  const [form, setForm] = React.useState({ username:"", password:"" });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const submit = async (e) => {
    e.preventDefault(); setError(null); setLoading(true);
    try {
      const r = await authApi.adminLogin(form);
      if (r?.token) { setToken(r.token); setRole("admin"); }
      window.dispatchEvent(new Event("auth-changed"));
      nav("/admin");
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  return (
    <AuthShell title="لوحة المعلم" subtitle="دخول خاص بالإدارة" side="teacher-writing">
      <form onSubmit={submit} className="space-y-4">
        <Input label="اسم المستخدم" required value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
        <Input label="كلمة السر" type="password" required value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
        <Button type="submit" variant="dark" size="lg" className="w-full" disabled={loading}>{loading ? "..." : "دخول لوحة المعلم"}</Button>
        <div className="text-center text-sm"><a href="#/login" className="text-ink/60 hover:text-azhar-800">دخول الطالب</a></div>
      </form>
    </AuthShell>
  );
}

Object.assign(window, { RegisterPage, LoginPage, AdminLoginPage, AuthShell });
