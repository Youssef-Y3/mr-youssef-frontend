// ============================================================
// Main App - route dispatch
// ============================================================
function App() {
  const route = useRoute();
  const auth = useAuth();
  const p = route.parts;
  // Guard helpers
  const needStudent = (comp) => (auth.token && auth.role !== "admin") ? comp : (auth.token && auth.role === "admin" ? <AdminDashboard/> : <LoginPage/>);
  const needAdmin   = (comp) => (auth.token && auth.role === "admin") ? comp : <AdminLoginPage/>;
  // Router
  const page = (() => {
    // Public
    if (route.path === "/" || route.path === "") return <PublicLayout><HomePage/></PublicLayout>;
    if (p[0] === "about") return <PublicLayout><AboutPage/></PublicLayout>;
    if (p[0] === "live-info") return <PublicLayout><LiveInfoPage/></PublicLayout>;
    if (p[0] === "plans") return <PublicLayout><PlansPublicPage/></PublicLayout>;
    if (p[0] === "courses") return <PublicLayout><CoursesPublicPage/></PublicLayout>;
    // Auth
    if (p[0] === "register") return <RegisterPage/>;
    if (p[0] === "login") return <LoginPage/>;
    if (p[0] === "admin-login") return <AdminLoginPage/>;
    // Parent (public link)
    if (p[0] === "parent") return <ParentPage/>;
    // Student
    if (p[0] === "dashboard") return needStudent(<StudentDashboard/>);
    if (p[0] === "courses-me") return needStudent(<StudentCoursesPage/>);
    if (p[0] === "course") return needStudent(<CourseDetailPage/>);
    if (p[0] === "lesson") return needStudent(<LessonPage/>);
    if (p[0] === "quiz") return needStudent(<QuizPage/>);
    if (p[0] === "live") return needStudent(<LivePage/>);
    if (p[0] === "lectures") return needStudent(<StudentLecturesPage/>);
    if (p[0] === "lecture") return needStudent(<LectureDetailPage/>);
    if (p[0] === "plans-me") return needStudent(<PlansMePage/>);
    if (p[0] === "pay") return needStudent(<PaymentPage/>);
    if (p[0] === "my-payments") return needStudent(<MyPaymentsPage/>);
    // Admin
    if (p[0] === "admin") {
      if (!p[1]) return needAdmin(<AdminDashboard/>);
      if (p[1] === "pending") return needAdmin(<AdminPendingPage/>);
      if (p[1] === "courses") return needAdmin(<AdminCoursesPage/>);
      if (p[1] === "lectures") return needAdmin(<AdminLecturesPage/>);
      if (p[1] === "quiz") return needAdmin(<AdminQuizPage/>);
      if (p[1] === "live") return needAdmin(<AdminLivePage/>);
      if (p[1] === "students") return needAdmin(<AdminStudentsPage/>);
      if (p[1] === "finance") return needAdmin(<AdminFinancePage/>);
      if (p[1] === "settings") return needAdmin(<AdminSettingsPage/>);
      return needAdmin(<AdminDashboard/>);
    }
    // Fallback
    return <PublicLayout><NotFound/></PublicLayout>;
  })();
  // Scroll to top on route change
  React.useEffect(() => { window.scrollTo(0,0); }, [route.hash]);
  return <ToastProvider>{page}</ToastProvider>;
}
function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="font-display font-black text-8xl text-azhar-800/20 font-num">404</div>
      <h1 className="font-display font-black text-3xl text-azhar-800 mt-4">الصفحة غير موجودة</h1>
      <p className="text-ink/70 mt-2 mb-6">الرابط اللي فتحته مش موجود.</p>
      <Button variant="primary" onClick={()=>nav("/")}>الرجوع للرئيسية</Button>
    </div>
  );
}
// Mount
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
