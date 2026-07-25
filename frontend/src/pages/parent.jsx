// ============================================================
// Parent dashboard (single screen — public via secret link)
// ============================================================
function ParentPage() {
  const route = useRoute();
  const token = route.parts[1];
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const R = window.Recharts || {};

  React.useEffect(() => {
    parentApi.get(token).then(setData).catch(e => setError(e.message));
  }, [token]);

  if (error) return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <Card className="p-8 max-w-md text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3"><Icon.X className="w-8 h-8"/></div>
        <h3 className="font-display font-black text-xl text-azhar-800 mb-2">رابط غير صالح</h3>
        <p className="text-ink/70">{error}</p>
      </Card>
    </div>
  );
  if (!data) return (
    <div className="min-h-screen bg-paper p-6"><Skeleton className="h-96 rounded-3xl max-w-5xl mx-auto"/></div>
  );

  const student = data.student || data;
  const subscription = data.subscription || {};
  const quizzes = data.quizzes || data.recent_quizzes || [];
  const live = data.live || data.recent_live || [];
  const payments = data.payments || data.recent_payments || [];
  const avg = data.average_score ?? (quizzes.length ? quizzes.reduce((a,b)=>a+(b.score||0),0)/quizzes.length : 0);

  const donutData = [
    { name: "المتوسط", value: avg },
    { name: "متبقي", value: Math.max(0, 100-avg) },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-arabesque text-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Logo light size="md"/>
          <div className="mt-6">
            <div className="text-gold-300 text-sm font-bold">لوحة ولي الأمر</div>
            <h1 className="font-display font-black text-3xl md:text-4xl mt-1">{student.name}</h1>
            <div className="text-white/70 mt-1">{student.grade || ""}</div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 pb-14">
        {/* Top stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-5">
            <div className="text-xs text-ink/60 font-bold">حالة الاشتراك</div>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={subscription.status || "pending"}/>
              <span className="text-sm text-ink/70">{subscription.plan_label || subscription.plan || ""}</span>
            </div>
            {subscription.expires_at && <div className="text-xs text-ink/60 mt-1">حتى: {fmt.date(subscription.expires_at)}</div>}
          </Card>
          <Card className="p-5">
            <div className="text-xs text-ink/60 font-bold">متوسط الدرجات</div>
            <div className="flex items-center gap-4 mt-2">
              <div className="w-16 h-16 relative">
                {R.PieChart && (
                  <R.ResponsiveContainer><R.PieChart>
                    <R.Pie data={donutData} innerRadius={20} outerRadius={30} startAngle={90} endAngle={-270} dataKey="value" paddingAngle={2}>
                      <R.Cell fill="#c9a227"/><R.Cell fill="#e8e2d4"/>
                    </R.Pie>
                  </R.PieChart></R.ResponsiveContainer>
                )}
                <div className="absolute inset-0 flex items-center justify-center font-display font-black text-azhar-800 font-num text-sm">{Math.round(avg)}%</div>
              </div>
              <div>
                <div className="font-display font-black text-2xl text-azhar-800 font-num">{quizzes.length}</div>
                <div className="text-xs text-ink/60">اختبار</div>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-ink/60 font-bold">آخر ٥ مدفوعات</div>
            <div className="font-display font-black text-3xl text-azhar-800 mt-1 font-num">
              {fmt.price(payments.reduce((a,b)=>a+Number(b.amount||0),0))}
            </div>
            <div className="text-xs text-ink/60">إجمالي</div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-display font-bold text-azhar-800 mb-4">آخر ١٠ اختبارات</h3>
            {quizzes.length ? (
              <div className="space-y-2">
                {quizzes.slice(0,10).map((q,i)=>(
                  <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-azhar-50/50">
                    <div>
                      <div className="font-bold text-azhar-800 text-sm">{q.title || q.quiz_title || "اختبار"}</div>
                      <div className="text-xs text-ink/60">{fmt.date(q.created_at || q.date)}</div>
                    </div>
                    <div className={`font-display font-black font-num ${q.score>=80?"text-emerald-600":q.score>=60?"text-amber-600":"text-red-600"}`}>{Math.round(q.score||0)}%</div>
                  </div>
                ))}
              </div>
            ) : <div className="text-center text-ink/60 py-4 text-sm">لا يوجد اختبارات بعد</div>}
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-bold text-azhar-800 mb-4">آخر ١٠ حصص</h3>
            {live.length ? (
              <div className="space-y-2">
                {live.slice(0,10).map((l,i)=>(
                  <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-azhar-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-azhar-800 text-gold-300 flex items-center justify-center"><Icon.Video className="w-4 h-4"/></div>
                      <div>
                        <div className="font-bold text-azhar-800 text-sm">{l.title || "حصة"}</div>
                        <div className="text-xs text-ink/60">{fmt.date(l.datetime || l.date)}</div>
                      </div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${l.attended ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                      {l.attended ? "حضر" : "غاب"}
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="text-center text-ink/60 py-4 text-sm">لا يوجد حصص بعد</div>}
          </Card>
        </div>

        <Card className="p-6 mt-6">
          <h3 className="font-display font-bold text-azhar-800 mb-4">آخر ٥ مدفوعات</h3>
          {payments.length ? (
            <div className="overflow-auto">
              <table className="w-full text-right text-sm">
                <thead className="text-xs font-bold text-azhar-800 border-b border-black/5"><tr>
                  <th className="py-2">التاريخ</th><th className="py-2">الخطة</th><th className="py-2">المبلغ</th><th className="py-2">الحالة</th>
                </tr></thead>
                <tbody className="divide-y divide-black/5">
                  {payments.slice(0,5).map((p,i)=>(
                    <tr key={i}>
                      <td className="py-3">{fmt.date(p.created_at || p.date)}</td>
                      <td className="py-3 font-bold">{p.plan_label || p.plan}</td>
                      <td className="py-3 font-num font-bold">{fmt.price(p.amount)}</td>
                      <td className="py-3"><StatusBadge status={p.status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="text-center text-ink/60 py-4 text-sm">لا يوجد مدفوعات</div>}
        </Card>
      </main>
    </div>
  );
}

Object.assign(window, { ParentPage });
