// ============================================================
// Plans / Payment flow / My Payments
// ============================================================
function PlansMePage() {
  const [info, setInfo] = React.useState(null);
  const [my, setMy] = React.useState(null);
  const [error, setError] = React.useState(null);
  React.useEffect(() => {
    Promise.allSettled([paymentApi.info(), paymentApi.my()]).then(([i,m])=>{
      if (i.status==="fulfilled") setInfo(i.value); else setError(i.reason.message);
      if (m.status==="fulfilled") setMy(Array.isArray(m.value)?m.value:(m.value?.payments||[]));
    });
  }, []);
  const plans = info?.plans || [
    { id: "monthly", label: "اشتراك شهر", price: 250, duration_days: 30 },
    { id: "term", label: "اشتراك ترم", price: 900, duration_days: 120 },
    { id: "yearly", label: "اشتراك سنة", price: 2400, duration_days: 365 },
  ];
  const active = my?.find(p => p.status === "confirmed" || p.status === "active");

  return (
    <StudentLayout page="plans">
      <FadeIn>
        <h1 className="font-display font-black text-3xl text-azhar-800 mb-2">الاشتراك</h1>
        <p className="text-ink/60 mb-6">اختر الخطة المناسبة وارفع إيصال التحويل</p>
      </FadeIn>

      {active && (
        <Card className="p-5 mb-6 bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center"><Icon.Check className="w-6 h-6"/></div>
            <div className="flex-1">
              <div className="font-display font-bold text-emerald-800">اشتراكك فعّال — {active.plan_label || active.plan || ""}</div>
              <div className="text-sm text-emerald-700">حتى: {fmt.date(active.expires_at || active.end_at)}</div>
            </div>
          </div>
        </Card>
      )}

      {error && <Card className="p-4 bg-red-50 border-red-200 text-red-700 mb-4">{error}</Card>}

      <div className="grid md:grid-cols-3 gap-5">
        {plans.map(p => {
          const featured = p.id === "term";
          return (
            <div key={p.id} className={`relative rounded-3xl p-8 border-2 ${featured ? "border-gold-500 bg-gradient-to-br from-gold-50 to-white shadow-lift" : "border-black/5 bg-white shadow-soft"} card-hover flex flex-col`}>
              {featured && <div className="absolute -top-3 right-6 bg-gold-500 text-azhar-900 font-display font-black text-xs px-3 py-1 rounded-full shadow-gold">الأكثر توفيراً</div>}
              <div className="font-display font-black text-2xl text-azhar-800">{p.label}</div>
              <div className="text-ink/60 text-sm mb-6">{p.duration_days} يوم</div>
              <div className="flex items-end gap-1 mb-6">
                <span className="font-display font-black text-5xl text-azhar-800 font-num">{p.price}</span>
                <span className="text-ink/60 mb-2 font-bold">ج.م</span>
              </div>
              <Button variant={featured ? "primary":"dark"} onClick={()=>nav(`/pay/${p.id}`)}>
                اشترك الآن <Icon.ArrowLeft className="w-4 h-4"/>
              </Button>
            </div>
          );
        })}
      </div>
    </StudentLayout>
  );
}

function PaymentPage() {
  const route = useRoute();
  const planId = route.parts[1];
  const toast = useToast();
  const [info, setInfo] = React.useState(null);
  const [step, setStep] = React.useState(1); // 1: transfer, 2: upload, 3: waiting
  const [method, setMethod] = React.useState("vodafone_cash");
  const [receipt, setReceipt] = React.useState(null);
  const [receiptPreview, setReceiptPreview] = React.useState(null);
  const [last4, setLast4] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [copiedText, setCopiedText] = React.useState("");

  React.useEffect(() => { paymentApi.info().then(setInfo).catch(()=>{}); }, []);
  const plan = info?.plans?.find(p => p.id === planId);
  const amount = plan?.price ?? (planId==="monthly"?250:planId==="term"?900:planId==="yearly"?2400:0);
  const label = plan?.label || (planId==="monthly"?"اشتراك شهر":planId==="term"?"اشتراك ترم":"اشتراك سنة");
  const vodafone = info?.vodafone_cash_number || "01060690384";
  const insta = info?.instapay_handle || "youssef@instapay";

  const copy = async (t, label) => {
    if (await copyToClipboard(t)) { setCopiedText(label); toast.push("تم النسخ ✓", { type: "success" }); setTimeout(()=>setCopiedText(""), 2000); }
  };
  const onFile = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setReceipt(f); setReceiptPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!receipt) { toast.push("ارفع صورة الإيصال أول", { type: "error" }); return; }
    if (!/^\d{4}$/.test(last4)) { toast.push("آخر 4 أرقام لازم تكون 4 أرقام", { type: "error" }); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("receipt", receipt);
      fd.append("method", method);
      fd.append("plan", planId);
      fd.append("amount", String(amount));
      fd.append("sender_last4", last4);
      await paymentApi.submit(fd);
      toast.push("تم إرسال الإيصال بنجاح!", { type: "success" });
      fireConfetti(1800);
      setStep(3);
    } catch (e) { toast.push(e.message, { type: "error" }); }
    finally { setSubmitting(false); }
  };

  return (
    <StudentLayout page="plans">
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <h1 className="font-display font-black text-3xl text-azhar-800 mb-1">إتمام الدفع</h1>
          <div className="text-gold-600 font-bold mb-6">{label} · <span className="font-num">{amount}</span> ج.م</div>
        </FadeIn>

        {/* Progress stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["حوّل","صوّر","ارفع","تأكيد"].map((t, i) => {
            const done = step > i;
            const active = step === i+1;
            return (
              <React.Fragment key={i}>
                <div className={`flex flex-col items-center gap-1 ${done||active?"":"opacity-40"}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-black font-num ${done ? "bg-emerald-600 text-white" : active ? "bg-gold-500 text-azhar-900" : "bg-azhar-50 text-azhar-800"}`}>
                    {done ? <Icon.Check className="w-4 h-4"/> : i+1}
                  </div>
                  <div className="text-xs font-bold text-azhar-800">{t}</div>
                </div>
                {i < 3 && <div className={`h-0.5 w-8 md:w-16 ${step > i+1 ? "bg-emerald-500" : "bg-azhar-100"}`}/>}
              </React.Fragment>
            );
          })}
        </div>

        {step === 1 && (
          <FadeIn>
            <Card className="p-6 mb-4">
              <h3 className="font-display font-black text-lg text-azhar-800 mb-4">١) اختار طريقة التحويل</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <MethodBtn active={method==="vodafone_cash"} onClick={()=>setMethod("vodafone_cash")} name="فودافون كاش" color="bg-red-500"/>
                <MethodBtn active={method==="instapay"} onClick={()=>setMethod("instapay")} name="إنستاباي" color="bg-purple-600"/>
              </div>

              <div className="bg-gradient-to-br from-azhar-800 to-azhar-900 text-white rounded-2xl p-6">
                <div className="text-gold-300 text-xs font-bold mb-2">حوّل مبلغ</div>
                <div className="font-display font-black text-4xl mb-4 font-num">{amount} <span className="text-lg text-gold-300">ج.م</span></div>
                <div className="text-gold-300 text-xs font-bold mb-2">
                  {method==="vodafone_cash" ? "على رقم فودافون كاش" : "على يوزر إنستاباي"}
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-4 backdrop-blur">
                  <div className="font-num font-display font-black text-2xl md:text-3xl flex-1 text-left" dir="ltr">
                    {method === "vodafone_cash" ? vodafone : insta}
                  </div>
                  <button onClick={()=>copy(method==="vodafone_cash"?vodafone:insta, "الرقم")} className="bg-gold-500 text-azhar-900 rounded-xl px-3 py-2 font-bold text-sm flex items-center gap-1 hover:bg-gold-400 transition">
                    <Icon.Copy className="w-4 h-4"/> {copiedText==="الرقم" ? "منسوخ ✓" : "نسخ"}
                  </button>
                </div>
              </div>
            </Card>
            <div className="text-center">
              <Button variant="primary" size="lg" onClick={()=>setStep(2)}>حوّلت وصوّرت الإيصال <Icon.ArrowLeft className="w-4 h-4"/></Button>
            </div>
          </FadeIn>
        )}

        {step === 2 && (
          <FadeIn>
            <Card className="p-6 mb-4">
              <h3 className="font-display font-black text-lg text-azhar-800 mb-4">٢) ارفع صورة الإيصال</h3>
              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${receipt ? "border-emerald-400 bg-emerald-50" : "border-azhar-200 hover:border-azhar-400 bg-azhar-50/30"}`}>
                  {receiptPreview ? (
                    <img src={receiptPreview} className="max-h-56 mx-auto rounded-xl shadow-soft"/>
                  ) : (
                    <>
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-azhar-800 text-gold-300 flex items-center justify-center"><Icon.Upload className="w-6 h-6"/></div>
                      <div className="font-display font-bold text-azhar-800">اضغط لرفع صورة الإيصال</div>
                      <div className="text-xs text-ink/60 mt-1">JPG أو PNG — حجم أقصى ٥ ميجا</div>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={onFile}/>
              </label>
              {receipt && <div className="text-sm text-emerald-700 font-bold mt-2 flex items-center gap-1"><Icon.Check className="w-4 h-4"/> {receipt.name}</div>}
            </Card>

            <Card className="p-6 mb-4">
              <h3 className="font-display font-black text-lg text-azhar-800 mb-4">٣) آخر 4 أرقام من الرقم اللي حوّلت منه</h3>
              <Input type="text" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} placeholder="مثال: 1234" value={last4}
                     onChange={e=>setLast4(e.target.value.replace(/\D/g,""))}/>
              <div className="text-xs text-ink/60 mt-2">دي بتساعد المعلم يتأكد من التحويل بتاعك بسرعة.</div>
            </Card>

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={()=>setStep(1)}><Icon.ArrowRight className="w-4 h-4"/> السابق</Button>
              <Button variant="primary" size="lg" onClick={submit} disabled={submitting || !receipt || last4.length !== 4}>
                {submitting ? "جارٍ الإرسال..." : "أرسل للمراجعة"}
              </Button>
            </div>
          </FadeIn>
        )}

        {step === 3 && (
          <FadeIn>
            <Card className="p-10 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Icon.Check className="w-10 h-10"/>
              </div>
              <h3 className="font-display font-black text-2xl text-azhar-800 mb-2">تم استلام إيصالك</h3>
              <p className="text-ink/70 mb-6">المعلم بيراجع خلال ٢٤ ساعة بحد أقصى، وبمجرد التأكيد اشتراكك هيتفعل تلقائي وهيوصل إيميل لولي الأمر.</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Button variant="dark" onClick={()=>nav("/my-payments")}>مدفوعاتي</Button>
                <Button variant="primary" onClick={()=>nav("/dashboard")}>الرئيسية</Button>
              </div>
            </Card>
          </FadeIn>
        )}
      </div>
    </StudentLayout>
  );
}

function MethodBtn({ active, onClick, name, color }) {
  return (
    <button onClick={onClick} className={`p-5 rounded-2xl border-2 transition flex items-center gap-3 ${active ? "border-azhar-800 bg-azhar-50 shadow-soft" : "border-black/10 bg-white hover:border-azhar-300"}`}>
      <div className={`w-10 h-10 rounded-xl ${color} text-white flex items-center justify-center font-black`}>
        {name==="فودافون كاش" ? "V" : "P"}
      </div>
      <div className="font-display font-bold text-azhar-800">{name}</div>
    </button>
  );
}

function MyPaymentsPage() {
  const [pays, setPays] = React.useState(null);
  React.useEffect(() => {
    paymentApi.my().then(r => setPays(Array.isArray(r)?r:(r?.payments||[]))).catch(()=>setPays([]));
  }, []);
  return (
    <StudentLayout page="payments">
      <FadeIn>
        <h1 className="font-display font-black text-3xl text-azhar-800 mb-6">مدفوعاتي</h1>
      </FadeIn>
      {!pays ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-20 rounded-2xl"/>)}</div>
      ) : pays.length ? (
        <Card className="overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-azhar-50 text-xs font-bold text-azhar-800 uppercase">
              <tr>
                <th className="px-4 py-3">التاريخ</th>
                <th className="px-4 py-3">الخطة</th>
                <th className="px-4 py-3">المبلغ</th>
                <th className="px-4 py-3">الطريقة</th>
                <th className="px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-sm">
              {pays.map((p,i)=>(
                <tr key={p.id||i} className="hover:bg-azhar-50/40">
                  <td className="px-4 py-3">{fmt.datetime(p.created_at || p.date)}</td>
                  <td className="px-4 py-3 font-bold">{p.plan_label || p.plan}</td>
                  <td className="px-4 py-3 font-num font-bold">{fmt.price(p.amount)}</td>
                  <td className="px-4 py-3">{p.method === "vodafone_cash" ? "فودافون كاش" : "إنستاباي"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card className="p-10 text-center text-ink/60">لا يوجد مدفوعات بعد</Card>
      )}
    </StudentLayout>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:   { c: "bg-amber-100 text-amber-800", t: "قيد المراجعة" },
    confirmed: { c: "bg-emerald-100 text-emerald-800", t: "مؤكد" },
    active:    { c: "bg-emerald-100 text-emerald-800", t: "فعّال" },
    rejected:  { c: "bg-red-100 text-red-800", t: "مرفوض" },
  };
  const m = map[status] || { c: "bg-slate-100 text-slate-700", t: status || "—" };
  return <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${m.c}`}>{m.t}</span>;
}

Object.assign(window, { PlansMePage, PaymentPage, MyPaymentsPage, StatusBadge });
