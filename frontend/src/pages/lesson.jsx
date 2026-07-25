// ============================================================
// Lesson viewer (custom protected video player + PDF list)
// ============================================================
function LessonPage() {
  const route = useRoute();
  const id = route.parts[1];
  const [lesson, setLesson] = React.useState(null);
  const [error, setError] = React.useState(null);
  const auth = useAuth();

  React.useEffect(() => {
    (async () => {
      try { setLesson(await studentApi.lesson(id)); }
      catch (e) { setError(e.message); }
    })();
  }, [id]);

  const files = lesson?.files || [];
  const quizId = lesson?.quiz_id || lesson?.quiz?.id;

  return (
    <StudentLayout page="courses">
      <button onClick={()=>history.back()} className="mb-4 inline-flex items-center gap-2 text-azhar-800 font-bold hover:underline">
        <Icon.ArrowRight className="w-4 h-4"/> رجوع
      </button>
      {error && <Card className="p-4 bg-red-50 border-red-200 text-red-700">{error}</Card>}
      {!lesson ? (
        <div className="space-y-4">
          <Skeleton className="aspect-video rounded-3xl"/>
          <Skeleton className="h-10 w-1/2"/>
          <Skeleton className="h-20 rounded-2xl"/>
        </div>
      ) : (
        <>
          <FadeIn>
            <div className="mb-4">
              <div className="text-sm text-gold-600 font-bold">{lesson.course_title || ""} · {lesson.unit_title || ""}</div>
              <h1 className="font-display font-black text-3xl text-azhar-800 mt-1">{lesson.title}</h1>
            </div>
          </FadeIn>

          <ProtectedVideoPlayer
            lesson={lesson}
            lessonId={id}
            studentName={auth.student?.name || "طالب"}
            studentUsername={auth.student?.username || auth.student?.id || ""}
          />

          <div className="grid lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              {lesson.description && (
                <Card className="p-6 mb-4">
                  <h3 className="font-display font-bold text-azhar-800 mb-2">وصف الدرس</h3>
                  <p className="text-ink/75 leading-relaxed whitespace-pre-line">{lesson.description}</p>
                </Card>
              )}

              {quizId && (
                <Card className="p-6 bg-gradient-to-br from-gold-50 to-white border-2 border-gold-200">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-14 h-14 rounded-2xl bg-gold-500 text-azhar-900 flex items-center justify-center"><Icon.Trophy className="w-7 h-7"/></div>
                    <div className="flex-1">
                      <div className="font-display font-black text-lg text-azhar-800">اختبار الدرس</div>
                      <div className="text-sm text-ink/70">اختبر فهمك بعد ما تخلص الدرس</div>
                    </div>
                    <Button variant="primary" onClick={()=>nav(`/quiz/${quizId}`)}>ابدأ الاختبار</Button>
                  </div>
                </Card>
              )}
            </div>

            <div>
              <h3 className="font-display font-bold text-azhar-800 mb-3">الملفات المرفقة</h3>
              {files.length ? (
                <div className="space-y-2">
                  {files.map((f, i) => <FileRow key={f.id||i} f={f}/>)}
                </div>
              ) : (
                <Card className="p-6 text-center text-ink/60 text-sm">لا توجد ملفات مرفقة</Card>
              )}
            </div>
          </div>
        </>
      )}
    </StudentLayout>
  );
}

// ---------- Helper: fetch a protected resource with the Authorization
// header (required by the backend), reporting download progress, with a
// hard timeout so a stalled connection fails fast instead of hanging
// forever, and returns a blob URL on success. ----------
async function fetchProtectedBlob(url, { onProgress, timeoutMs = 45000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
      signal: controller.signal,
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error("انتهت جلستك، سجل دخول تاني");
      if (res.status === 404) throw new Error("الملف غير موجود");
      throw new Error("تعذر تحميل الملف من السيرفر");
    }
    const total = Number(res.headers.get("content-length")) || 0;
    if (!res.body || !res.body.getReader) {
      // Fallback for browsers without streaming body support
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (onProgress && total) onProgress(Math.min(99, Math.round((received / total) * 100)));
    }
    if (onProgress) onProgress(100);
    const blob = new Blob(chunks);
    return URL.createObjectURL(blob);
  } catch (e) {
    if (e.name === "AbortError") throw new Error("انتهت مهلة التحميل — تأكد من سرعة الإنترنت وحاول تاني");
    throw new Error(e.message === "Failed to fetch" ? "تعذر الاتصال بالسيرفر — تأكد من اتصال الإنترنت وحاول تاني" : (e.message || "حصل خطأ غير متوقع"));
  } finally {
    clearTimeout(timer);
  }
}

// Attached files are opened as an authenticated blob (view or download)
// instead of a plain <a href> link, since the API requires the
// Authorization header which a normal link can't send.
function FileRow({ f }) {
  const [busy, setBusy] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState(null);
  const isDownload = f.access_type === "download";

  const openFile = async () => {
    setBusy(true); setErrMsg(null);
    try {
      const blobUrl = await fetchProtectedBlob(`${API_BASE}/api/stream/file/${f.id}`);
      if (isDownload) {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = f.display_name || f.name || "ملف.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        window.open(blobUrl, "_blank");
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (e) {
      setErrMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button onClick={openFile} disabled={busy}
              className="w-full flex items-center gap-3 p-3 bg-white rounded-xl shadow-soft border border-black/5 hover:border-azhar-300 transition text-right disabled:opacity-60">
        <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0"><Icon.File className="w-5 h-5"/></div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-azhar-800 truncate text-sm">{f.display_name || f.name || "ملف"}</div>
          <div className="text-xs text-ink/60">{busy ? "جارٍ الفتح..." : (isDownload ? "تحميل" : "عرض فقط")}</div>
        </div>
        <Icon.ArrowLeft className="w-4 h-4 text-azhar-800 flex-shrink-0"/>
      </button>
      {errMsg && (
        <div className="mt-1 flex items-center justify-between gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">
          <span>{errMsg}</span>
          <button onClick={openFile} className="font-bold underline flex-shrink-0">إعادة المحاولة</button>
        </div>
      )}
    </div>
  );
}

function ProtectedVideoPlayer({ lesson, lessonId, studentName, studentUsername }) {
  // Prefer the id from the route (always correct, since it's what we used
  // to fetch the lesson) over lesson.id, whose field name/presence in the
  // API response isn't guaranteed.
  const realId = lessonId || lesson?.id;

  const videoRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [current, setCurrent] = React.useState(lesson.last_position_seconds || 0);
  const [showControls, setShowControls] = React.useState(true);
  const [speed, setSpeed] = React.useState(1);
  const [muted, setMuted] = React.useState(false);
  const hideRef = React.useRef(null);
  const savedRef = React.useRef(0);

  // Video is fetched with the Authorization header (a <video src> can't
  // send custom headers), turned into a blob, and that blob URL is what we
  // actually play. This fixes the 401 Unauthorized error. Download
  // progress and a retry button handle slow/unstable connections.
  const [videoSrc, setVideoSrc] = React.useState(null);
  const [videoError, setVideoError] = React.useState(null);
  const [progress, setProgress] = React.useState(0);
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    let blobUrl;
    let cancelled = false;
    setVideoSrc(null);
    setVideoError(null);
    setProgress(0);
    (async () => {
      try {
        if (!realId) throw new Error("رقم الدرس غير صحيح");
        blobUrl = await fetchProtectedBlob(`${API_BASE}/api/stream/video/${realId}`, {
          onProgress: (pct) => { if (!cancelled) setProgress(pct); },
        });
        if (cancelled) { URL.revokeObjectURL(blobUrl); return; }
        setVideoSrc(blobUrl);
      } catch (e) {
        if (!cancelled) setVideoError(e.message);
      }
    })();
    return () => { cancelled = true; if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [realId, retryCount]);

  React.useEffect(() => {
    const v = videoRef.current;
    if (!v || !videoSrc) return;
    v.currentTime = lesson.last_position_seconds || 0;
  }, [realId, videoSrc]);

  // block right click / drag
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const noop = e => { e.preventDefault(); return false; };
    el.addEventListener("contextmenu", noop);
    el.addEventListener("dragstart", noop);
    return () => { el.removeEventListener("contextmenu", noop); el.removeEventListener("dragstart", noop); };
  }, []);

  // periodic progress save
  React.useEffect(() => {
    const id = setInterval(() => {
      const v = videoRef.current;
      if (!v || !v.currentTime) return;
      if (Math.abs(v.currentTime - savedRef.current) > 15) {
        savedRef.current = v.currentTime;
        studentApi.saveProgress(realId, Math.floor(v.currentTime), v.currentTime/v.duration > 0.95).catch(()=>{});
      }
    }, 8000);
    return () => clearInterval(id);
  }, [realId]);

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); } else { v.pause(); }
  };
  const seek = (e) => {
    const v = videoRef.current; if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const p = x / rect.width;
    v.currentTime = p * duration;
  };
  const fullscreen = () => {
    const el = containerRef.current;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => playing && setShowControls(false), 2500);
  };

  const p = duration ? (current / duration) * 100 : 0;
  const wm = `${studentName} · ${studentUsername}`.trim();

  return (
    <div ref={containerRef}
         className="relative bg-black rounded-3xl overflow-hidden shadow-lift aspect-video no-select"
         onMouseMove={handleMouseMove}
         onMouseLeave={()=>{ if (playing) setShowControls(false); }}>

      {videoError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 p-6 text-center">
          <Icon.X className="w-10 h-10 text-red-400"/>
          <div className="font-bold">{videoError}</div>
          <button onClick={()=>setRetryCount(c=>c+1)} className="bg-gold-500 text-azhar-900 font-bold px-5 py-2.5 rounded-xl hover:bg-gold-400 transition">
            إعادة المحاولة
          </button>
        </div>
      )}

      {!videoError && !videoSrc && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 px-10">
          <div className="w-10 h-10 border-4 border-white/20 border-t-gold-400 rounded-full animate-spin"/>
          <div className="text-sm text-white/70">جارٍ تحميل الفيديو{progress > 0 ? ` — ${progress}%` : "..."}</div>
          {progress > 0 && (
            <div className="w-full max-w-xs h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gold-400 transition-all" style={{width:`${progress}%`}}/>
            </div>
          )}
        </div>
      )}

      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full"
          controlsList="nodownload noremoteplayback noplaybackrate"
          disablePictureInPicture
          onPlay={()=>setPlaying(true)}
          onPause={()=>setPlaying(false)}
          onLoadedMetadata={e=>setDuration(e.currentTarget.duration||0)}
          onTimeUpdate={e=>setCurrent(e.currentTarget.currentTime||0)}
          onError={()=>setVideoError("تعذر تشغيل هذا الفيديو")}
          onClick={togglePlay}
          playsInline
        />
      )}

      {/* Watermark */}
      {videoSrc && (
        <div className="watermark">
          <span>{wm} · مستر يوسف عصام</span>
        </div>
      )}

      {/* Center play button */}
      {videoSrc && !playing && (
        <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/40 group">
          <div className="w-20 h-20 rounded-full bg-gold-500 text-azhar-900 flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
            <Icon.Play className="w-8 h-8 mr-1"/>
          </div>
        </button>
      )}

      {/* Controls */}
      {videoSrc && (
        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity ${showControls ? "opacity-100":"opacity-0 pointer-events-none"}`} dir="ltr">
          <div className="h-1.5 rounded-full bg-white/20 mb-3 cursor-pointer relative" onClick={seek}>
            <div className="absolute inset-y-0 left-0 rounded-full bg-gold-400" style={{width:`${p}%`}}/>
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-gold" style={{left:`calc(${p}% - 6px)`}}/>
          </div>
          <div className="flex items-center justify-between text-white gap-3">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center">
                {playing ? <Icon.Pause className="w-5 h-5"/> : <Icon.Play className="w-5 h-5"/>}
              </button>
              <button onClick={()=>{ const v=videoRef.current; if (v) { v.muted=!v.muted; setMuted(v.muted); } }} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center">
                {muted ? "🔇" : "🔊"}
              </button>
              <div className="font-num text-sm">{fmt.time(current)} / {fmt.time(duration)}</div>
            </div>
            <div className="flex items-center gap-2">
              <select value={speed} onChange={e=>{ const s=Number(e.target.value); setSpeed(s); if (videoRef.current) videoRef.current.playbackRate = s; }}
                      className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 border border-white/20">
                {[0.75,1,1.25,1.5,2].map(s => <option key={s} value={s} className="text-black">{s}x</option>)}
              </select>
              <button onClick={fullscreen} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center" title="ملء الشاشة">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { LessonPage, ProtectedVideoPlayer, FileRow });
