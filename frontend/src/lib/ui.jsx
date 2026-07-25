// ============================================================
// UI primitives - buttons, cards, toasts, skeletons, icons, confetti
// ============================================================
const { motion, AnimatePresence } = window.Motion || window.framerMotion || window.FramerMotion || {};
// framer-motion UMD exposes on window.Motion? Actually UMD name is "Motion" but may vary. Fallback:
const MotionLib = window.Motion || window.FramerMotion || window.framerMotion || {};
const M = MotionLib.motion || {};
const AP = MotionLib.AnimatePresence || (({children}) => children);

// ---------- ICONS (inline svg, currentColor) ----------
const Icon = {
  Book:      (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>,
  Play:      (p)=><svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7z"/></svg>,
  Pause:     (p)=><svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>,
  Check:     (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  X:         (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  User:      (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Users:     (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-3-3.87M9 21v-2a4 4 0 0 1 3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Home:      (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z"/></svg>,
  Calendar:  (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  CreditCard:(p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Chart:     (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="3" y1="21" x2="21" y2="21"/><path d="M6 17V9M11 17V5M16 17v-6M20 17v-3"/></svg>,
  Settings:  (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
  Upload:    (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  LogOut:    (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Award:     (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="6"/><polyline points="8.21 13.89 7 22 12 19 17 22 15.79 13.88"/></svg>,
  Sparkle:   (p)=><svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/></svg>,
  Clock:     (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  ArrowLeft: (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  ArrowRight:(p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Menu:      (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Copy:      (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Pen:       (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  Trash:     (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Eye:       (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Search:    (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Video:     (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  File:      (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  Star:      (p)=><svg viewBox="0 0 24 24" fill="currentColor" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Trophy:    (p)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 4H4a2 2 0 0 0 2 5M17 4h3a2 2 0 0 1-2 5"/></svg>,
  Flame:     (p)=><svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2s3 4 3 8a3 3 0 0 1-6 0c0-1 .5-2 1-3-2 1-4 4-4 7a6 6 0 0 0 12 0c0-5-6-8-6-12z"/></svg>,
};

// ---------- Logo ----------
function Logo({ light=false, size="md" }) {
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-3xl", xl: "text-4xl" };
  return (
    <div className="flex items-center gap-3">
      <div className={`relative flex items-center justify-center rounded-2xl ${light ? "bg-white/10 border border-white/20" : "bg-azhar-800 shadow-gold"}`}
           style={{ width: size==="lg"||size==="xl" ? 56:44, height: size==="lg"||size==="xl" ? 56:44 }}>
        <svg viewBox="0 0 40 40" className="w-6 h-6 text-gold-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 30V10a2 2 0 0 1 2-2h20a4 4 0 0 1 4 4v20a2 2 0 0 1-2 2H10a4 4 0 0 1-4-4z"/>
          <path d="M6 30a4 4 0 0 1 4-4h22"/>
          <path d="M14 14h10M14 18h8" strokeOpacity="0.6"/>
        </svg>
      </div>
      <div className="leading-tight whitespace-nowrap">
        <div className={`font-display font-black ${sizes[size]} ${light ? "text-white" : "text-azhar-800"}`}>مستر يوسف عصام</div>
        <div className={`text-[11px] font-semibold tracking-wide ${light ? "text-gold-300" : "text-gold-600"}`}>اللغة العربية · الأزهر</div>
      </div>
    </div>
  );
}

// ---------- Buttons ----------
function Button({ children, variant="primary", size="md", className="", ...p }) {
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" };
  const variants = {
    primary: "btn-primary rounded-2xl",
    dark: "bg-azhar-800 hover:bg-azhar-900 text-white rounded-2xl shadow-soft transition-all hover:-translate-y-0.5",
    outline: "border-2 border-azhar-800 text-azhar-800 hover:bg-azhar-800 hover:text-white rounded-2xl transition-all",
    ghost: "btn-ghost rounded-2xl",
    light: "bg-white text-azhar-800 hover:bg-cream rounded-2xl shadow-soft transition-all hover:-translate-y-0.5 font-bold",
    danger: "bg-red-500 hover:bg-red-600 text-white rounded-2xl transition",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition",
  };
  return <button className={`${variants[variant]} ${sizes[size]} font-display font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`} {...p}>{children}</button>;
}

// ---------- Card ----------
function Card({ children, className="", hover=false, ...p }) {
  return <div className={`bg-white rounded-2xl shadow-soft border border-black/5 ${hover ? "card-hover" : ""} ${className}`} {...p}>{children}</div>;
}

// ---------- Input ----------
function Input({ label, error, className="", type="text", ...p }) {
  return (
    <label className="block">
      {label && <div className="text-sm font-bold text-azhar-800 mb-1.5">{label}</div>}
      <input type={type} className={`w-full px-4 py-3 rounded-xl border-2 border-black/10 focus:border-azhar-600 bg-white transition ${error ? "border-red-400":""} ${className}`} {...p} />
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </label>
  );
}
function Textarea({ label, error, className="", ...p }) {
  return (
    <label className="block">
      {label && <div className="text-sm font-bold text-azhar-800 mb-1.5">{label}</div>}
      <textarea className={`w-full px-4 py-3 rounded-xl border-2 border-black/10 focus:border-azhar-600 bg-white transition min-h-[100px] ${error ? "border-red-400":""} ${className}`} {...p} />
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </label>
  );
}
function Select({ label, options=[], className="", ...p }) {
  return (
    <label className="block">
      {label && <div className="text-sm font-bold text-azhar-800 mb-1.5">{label}</div>}
      <select className={`w-full px-4 py-3 rounded-xl border-2 border-black/10 focus:border-azhar-600 bg-white transition ${className}`} {...p}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    </label>
  );
}

// ---------- Skeleton ----------
function Skeleton({ className="h-4 w-full" }) {
  return <div className={`skeleton ${className}`} />;
}

// ---------- Toast system ----------
const ToastContext = React.createContext({ push: () => {} });
function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const push = React.useCallback((msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    const t = { id, msg, type: opts.type || "info", ttl: opts.ttl ?? 3500 };
    setToasts(s => [...s, t]);
    setTimeout(() => setToasts(s => s.filter(x => x.id !== id)), t.ttl);
  }, []);
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`toast-in pointer-events-auto rounded-2xl px-5 py-3 shadow-lift font-bold text-sm flex items-center gap-2
            ${t.type==="success" ? "bg-emerald-600 text-white" :
              t.type==="error"   ? "bg-red-600 text-white" :
              t.type==="warning" ? "bg-amber-500 text-white" :
                                   "bg-azhar-800 text-white"}`}>
            {t.type==="success" && <Icon.Check className="w-4 h-4"/>}
            {t.type==="error"   && <Icon.X className="w-4 h-4"/>}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
const useToast = () => React.useContext(ToastContext);

// ---------- Modal ----------
function Modal({ open, onClose, children, wide=false }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative bg-white rounded-3xl shadow-lift w-full ${wide ? "max-w-4xl":"max-w-md"} max-h-[90vh] overflow-auto`} onClick={e=>e.stopPropagation()}>
        <button className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-azhar-800" onClick={onClose}><Icon.X className="w-4 h-4"/></button>
        {children}
      </div>
    </div>
  );
}

// ---------- Confetti ----------
function fireConfetti(duration=2400) {
  const cv = document.getElementById("confetti-canvas");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  const colors = ["#c9a227","#0f5132","#eec853","#194a35","#f8f5ee"];
  const parts = Array.from({length: 160}).map(() => ({
    x: cv.width/2 + (Math.random()-0.5)*200,
    y: cv.height/2 - 50,
    vx: (Math.random()-0.5)*10,
    vy: -Math.random()*10 - 6,
    g: 0.28,
    r: 4 + Math.random()*6,
    a: Math.random()*Math.PI,
    va: (Math.random()-0.5)*0.3,
    color: colors[Math.floor(Math.random()*colors.length)],
    life: 0,
  }));
  const start = performance.now();
  function frame(t) {
    const elapsed = t - start;
    ctx.clearRect(0,0,cv.width,cv.height);
    parts.forEach(p => {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.a += p.va; p.life++;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
      ctx.fillStyle = p.color; ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*0.6);
      ctx.restore();
    });
    if (elapsed < duration) requestAnimationFrame(frame);
    else ctx.clearRect(0,0,cv.width,cv.height);
  }
  requestAnimationFrame(frame);
}

// ---------- Copy to clipboard ----------
async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

// ---------- Utils ----------
const fmt = {
  price: (n) => `${Number(n||0).toLocaleString("ar-EG")} ج.م`,
  int: (n) => Number(n||0).toLocaleString("ar-EG"),
  date: (d) => { try { return new Date(d).toLocaleDateString("ar-EG",{day:"numeric",month:"long",year:"numeric"}); } catch { return String(d||"—"); } },
  datetime: (d) => { try { return new Date(d).toLocaleString("ar-EG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}); } catch { return String(d||"—"); } },
  time: (s) => {
    s = Math.max(0, Math.floor(Number(s)||0));
    const m = Math.floor(s/60), sec = s%60;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  },
};

// ---------- Auth guard ----------
function useAuth() {
  const [state, setState] = React.useState(() => ({ token: getToken(), role: getRole(), student: getStudent() }));
  React.useEffect(() => {
    const on = () => setState({ token: getToken(), role: getRole(), student: getStudent() });
    window.addEventListener("storage", on);
    window.addEventListener("auth-changed", on);
    return () => { window.removeEventListener("storage", on); window.removeEventListener("auth-changed", on); };
  }, []);
  return state;
}

// ---------- Motion wrappers (fallback if framer missing) ----------
const MDiv = M.div || (p => React.createElement("div", p));
const MButton = M.button || (p => React.createElement("button", p));
function FadeIn({ children, delay=0, y=12, className="", ...p }) {
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => { const t = setTimeout(() => setShown(true), 20 + delay*1000); return () => clearTimeout(t); }, [delay]);
  return (
    <div {...p} className={className} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? "translateY(0)" : `translateY(${y}px)`,
      transition: "opacity .55s cubic-bezier(.2,.8,.2,1), transform .55s cubic-bezier(.2,.8,.2,1)",
      ...(p.style||{})
    }}>{children}</div>
  );
}
// Intersection-observer based fallback that ALWAYS shows content even if framer-motion isn't loaded.
function Stagger({ children, gap=.08, className="" }) {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(true); // visible by default
  React.useEffect(() => {
    if (!ref.current) return;
    // Re-trigger animation when it enters viewport for the first time
    setVisible(false);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { rootMargin: "-30px" });
    io.observe(ref.current);
    // Fallback: force visible after 400ms in case observer fails
    const t = setTimeout(() => setVisible(true), 400);
    return () => { io.disconnect(); clearTimeout(t); };
  }, []);
  return (
    <div ref={ref} className={className} data-stagger={visible ? "in" : "out"}>
      {children}
    </div>
  );
}
function StaggerItem({ children, className="", index=0 }) {
  // uses CSS animation triggered by parent [data-stagger=in]
  return <div className={`stagger-item ${className}`} style={{"--i": index}}>{children}</div>;
}

Object.assign(window, {
  MotionLib, M, AP, MDiv, MButton, FadeIn, Stagger, StaggerItem,
  Icon, Logo, Button, Card, Input, Textarea, Select, Skeleton,
  ToastProvider, useToast, Modal, fireConfetti, copyToClipboard, fmt, useAuth,
});
