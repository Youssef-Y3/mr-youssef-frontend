// ============================================================
// Quiz page (question-by-question) + Result with charts
// ============================================================
function QuizPage() {
  const route = useRoute();
  const id = route.parts[1];
  const [quiz, setQuiz] = React.useState(null);
  const [current, setCurrent] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [result, setResult] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const toast = useToast();

  React.useEffect(() => {
    (async () => {
      try { setQuiz(await quizApi.get(id)); }
      catch (e) { setError(e.message); }
    })();
  }, [id]);

  if (error) return <StudentLayout><Card className="p-6 bg-red-50 text-red-700 border-red-200">{error}</Card></StudentLayout>;
  if (!quiz) return <StudentLayout><Skeleton className="h-96 rounded-3xl"/></StudentLayout>;

  if (result) return <StudentLayout page="courses"><QuizResult result={result} quiz={quiz}/></StudentLayout>;

  const questions = quiz.questions || [];
  const q = questions[current];
  const total = questions.length;
  const progress = ((current + (q && answers[q.id] ? 1 : 0)) / total) * 100;

  const setAnswer = (val) => setAnswers({ ...answers, [q.id]: val });
  const next = () => setCurrent(c => Math.min(c+1, total-1));
  const prev = () => setCurrent(c => Math.max(c-1, 0));

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await quizApi.submit(id, answers);
      setResult(r);
      if ((r?.score||0) >= 80) fireConfetti(2600);
      toast.push(`نتيجتك: ${Math.round(r?.score||0)}%`, { type: (r?.score||0)>=60 ? "success":"warning" });
    } catch (e) { toast.push(e.message, { type: "error" }); }
    finally { setSubmitting(false); }
  };

  const isLast = current === total - 1;
  const allAnswered = questions.every(qq => answers[qq.id] != null && answers[qq.id] !== "");

  return (
    <StudentLayout page="courses">
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <div className="text-center mb-6">
            <div className="text-sm text-gold-600 font-bold">اختبار</div>
            <h1 className="font-display font-black text-2xl md:text-3xl text-azhar-800 mt-1">{quiz.title || "اختبار الدرس"}</h1>
          </div>
        </FadeIn>

        <Card className="p-6 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-ink/60">السؤال <span className="font-bold text-azhar-800 font-num">{current+1}</span> من <span className="font-num">{total}</span></span>
            <span className="text-azhar-800 font-bold font-num">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-azhar-50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-l from-gold-500 to-gold-400 transition-all duration-500" style={{width:`${progress}%`}}/>
          </div>
        </Card>

        {q && (
          <FadeIn key={q.id}>
            <Card className="p-8">
              <div className="text-xs font-bold text-gold-600 mb-2">{q.topic || ""}</div>
              <div className="font-display font-bold text-xl text-azhar-800 leading-relaxed mb-6">
                {q.text || q.question}
              </div>

              {q.type === "true_false" ? (
                <div className="grid grid-cols-2 gap-3">
                  {["صح","خطأ"].map(v => (
                    <button key={v} onClick={()=>setAnswer(v)}
                            className={`p-5 rounded-2xl font-display font-bold text-lg border-2 transition ${answers[q.id]===v ? "bg-azhar-800 text-white border-azhar-800 shadow-soft" : "bg-white border-black/10 hover:border-azhar-400"}`}>
                      {v}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(q.options || []).map((opt, i) => {
                    const val = q.option_values ? q.option_values[i] : opt;
                    const active = answers[q.id] === val || answers[q.id] === opt;
                    return (
                      <button key={i} onClick={()=>setAnswer(val)}
                              className={`w-full text-right p-4 rounded-2xl border-2 flex items-center gap-4 transition ${active ? "bg-azhar-800 text-white border-azhar-800 shadow-soft" : "bg-white border-black/10 hover:border-azhar-400"}`}>
                        <div className={`w-9 h-9 rounded-xl font-display font-black flex items-center justify-center ${active ? "bg-gold-500 text-azhar-900" : "bg-azhar-50 text-azhar-800"}`}>
                          {["أ","ب","ج","د","هـ"][i] || (i+1)}
                        </div>
                        <span className="flex-1 font-bold">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </FadeIn>
        )}

        <div className="mt-6 flex justify-between gap-3">
          <Button variant="outline" onClick={prev} disabled={current === 0}>
            <Icon.ArrowRight className="w-4 h-4"/> السابق
          </Button>
          {isLast ? (
            <Button variant="primary" onClick={submit} disabled={!allAnswered || submitting}>
              {submitting ? "جارٍ الإرسال..." : "أرسل الإجابات"}
            </Button>
          ) : (
            <Button variant="dark" onClick={next} disabled={!answers[q?.id]}>
              التالي <Icon.ArrowLeft className="w-4 h-4"/>
            </Button>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

function QuizResult({ result, quiz }) {
  const R = window.Recharts || {};
  const score = Math.round(result?.score ?? 0);
  const correct = result?.correct ?? 0;
  const total = result?.total ?? (quiz?.questions?.length || 0);
  const topicsRaw = result?.wrong_topics || {};
  const topics = Object.entries(topicsRaw).map(([name, val]) => ({ name, value: val }));
  const good = score >= 80, ok = score >= 60;
  const colors = ["#c9a227","#0f5132","#e2b02b","#194a35","#5b9678"];

  const donutData = [
    { name: "صحيحة", value: correct },
    { name: "خاطئة", value: Math.max(0, total - correct) },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <FadeIn>
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-3 ${good ? "bg-emerald-100 text-emerald-800" : ok ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
            {good ? <Icon.Trophy className="w-4 h-4"/> : <Icon.Award className="w-4 h-4"/>}
            <span className="font-bold text-sm">{good ? "أداء ممتاز 🎉" : ok ? "أداء جيد" : "محتاج مراجعة"}</span>
          </div>
          <h2 className="font-display font-black text-3xl md:text-4xl text-azhar-800">نتيجتك في {quiz.title || "الاختبار"}</h2>
        </div>
      </FadeIn>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 text-center">
          <div className="font-display font-bold text-azhar-800 mb-4">درجتك النهائية</div>
          <div className="relative w-56 h-56 mx-auto">
            {R.PieChart ? (
              <R.ResponsiveContainer width="100%" height="100%">
                <R.PieChart>
                  <R.Pie data={donutData} innerRadius={70} outerRadius={100} startAngle={90} endAngle={-270} paddingAngle={2} dataKey="value">
                    <R.Cell fill="#c9a227"/>
                    <R.Cell fill="#e8e2d4"/>
                  </R.Pie>
                </R.PieChart>
              </R.ResponsiveContainer>
            ) : null}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display font-black text-5xl text-azhar-800 font-num">{score}%</div>
              <div className="text-sm text-ink/60 mt-1"><span className="font-num">{correct}</span> من <span className="font-num">{total}</span></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-display font-bold text-azhar-800 mb-4">تحليل الأخطاء بالموضوع</div>
          {topics.length ? (
            <div className="h-56">
              {R.BarChart ? (
                <R.ResponsiveContainer width="100%" height="100%">
                  <R.BarChart data={topics} layout="vertical" margin={{top:5,right:10,left:20,bottom:5}}>
                    <R.XAxis type="number" allowDecimals={false} tick={{fill:"#0b1712",fontSize:12}}/>
                    <R.YAxis type="category" dataKey="name" tick={{fill:"#0b1712",fontSize:12,fontWeight:700}} width={70}/>
                    <R.Tooltip cursor={{fill:"#f8f5ee"}}/>
                    <R.Bar dataKey="value" radius={[8,0,0,8]}>
                      {topics.map((_,i)=><R.Cell key={i} fill={colors[i%colors.length]}/>)}
                    </R.Bar>
                  </R.BarChart>
                </R.ResponsiveContainer>
              ) : null}
            </div>
          ) : (
            <div className="text-center py-8 text-emerald-600 font-bold">
              <Icon.Check className="w-10 h-10 mx-auto mb-2"/> ما فيش أخطاء! أداء رائع.
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Button variant="dark" onClick={()=>history.back()}>العودة للدرس</Button>
        <Button variant="primary" onClick={()=>nav("/dashboard")}>لوحتي</Button>
      </div>
    </div>
  );
}

Object.assign(window, { QuizPage, QuizResult });
