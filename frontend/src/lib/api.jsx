// ============================================================
// API Layer — يتحدث مع Cloudflare Worker
// ============================================================
const API_BASE = "https://mr-youssef-essam-platform.tafra-y3.workers.dev";
const TOKEN_KEY = "token";
const ROLE_KEY = "role"; // "student" | "admin"

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (t) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);
const getRole = () => localStorage.getItem(ROLE_KEY);
const setRole = (r) => r ? localStorage.setItem(ROLE_KEY, r) : localStorage.removeItem(ROLE_KEY);

const setStudent = (s) => s ? localStorage.setItem("student", JSON.stringify(s)) : localStorage.removeItem("student");
const getStudent = () => { try { return JSON.parse(localStorage.getItem("student") || "null"); } catch { return null; } };

async function apiFetch(path, opts = {}) {
  const { method = "GET", body, headers = {}, isForm = false, auth = true, raw = false } = opts;
  const h = { ...headers };
  if (auth && getToken()) h["Authorization"] = `Bearer ${getToken()}`;
  if (!isForm && body && !(body instanceof FormData)) {
    h["Content-Type"] = "application/json";
  }
  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers: h,
      body: body ? (body instanceof FormData ? body : (typeof body === "string" ? body : JSON.stringify(body))) : undefined,
    });
  } catch (e) {
    throw new ApiError("تعذّر الاتصال بالخادم", 0);
  }

  if (raw) return res;

  if (res.status === 401) {
    // Not authenticated
    setToken(null); setRole(null); setStudent(null);
    if (!location.hash.startsWith("#/login") && !location.hash.startsWith("#/")) {
      location.hash = "#/login";
    }
    throw new ApiError("انتهت جلستك، الرجاء تسجيل الدخول", 401);
  }
  if (res.status === 402) {
    // Payment required
    window.dispatchEvent(new CustomEvent("subscription-required"));
    throw new ApiError("اشتراكك منتهي، برجاء الاشتراك للمتابعة", 402);
  }

  const ct = res.headers.get("content-type") || "";
  let data = null;
  if (ct.includes("application/json")) {
    try { data = await res.json(); } catch { data = null; }
  } else {
    try { data = await res.text(); } catch { data = null; }
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `خطأ ${res.status}`;
    throw new ApiError(msg, res.status, data);
  }
  return data;
}

class ApiError extends Error {
  constructor(message, status, data) { super(message); this.status = status; this.data = data; }
}

// ---------- Auth ----------
const authApi = {
  register: (payload) => apiFetch("/api/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => apiFetch("/api/auth/login", { method: "POST", body: payload, auth: false }),
  adminLogin: (payload) => apiFetch("/api/auth/admin-login", { method: "POST", body: payload, auth: false }),
  logout: () => { setToken(null); setRole(null); setStudent(null); location.hash = "#/"; },
};

// ---------- Student ----------
// NOTE: videoUrl / fileUrl no longer carry ?token=... — the backend only
// accepts the token via the Authorization header, and a plain <video src>
// or <a href> can't send that header. lesson.jsx now fetches these with
// fetch()+Authorization and plays/opens them as a blob URL instead of
// using these raw URLs directly. They're kept here (token-less) only in
// case something needs the bare endpoint path.
const studentApi = {
  courses: () => apiFetch("/api/courses"),
  course: (id) => apiFetch(`/api/courses/${id}`),
  lesson: (id) => apiFetch(`/api/lessons/${id}`),
  videoUrl: (id) => `${API_BASE}/api/stream/video/${id}`,
  fileUrl: (id) => `${API_BASE}/api/stream/file/${id}`,
  saveProgress: (id, position_seconds, completed = false) =>
    apiFetch(`/api/lessons/${id}/progress`, { method: "POST", body: { position_seconds, completed } }),
};

// ---------- Quizzes ----------
const quizApi = {
  get: (id) => apiFetch(`/api/quizzes/${id}`),
  submit: (id, answers) => apiFetch(`/api/quizzes/${id}/attempt`, { method: "POST", body: { answers } }),
};

// ---------- Live ----------
const liveApi = {
  upcoming: () => apiFetch("/api/live/upcoming"),
  book: (id) => apiFetch(`/api/live/${id}/book`, { method: "POST" }),
  join: (id) => apiFetch(`/api/live/${id}/join`),
};

// ---------- Payment ----------
const paymentApi = {
  info: () => apiFetch("/api/payment/info"),
  submit: (fd) => apiFetch("/api/payment/submit", { method: "POST", body: fd, isForm: true }),
  my: () => apiFetch("/api/payment/my"),
};

// ---------- Parent ----------
const parentApi = {
  get: (token) => apiFetch(`/api/parent/${token}`, { auth: false }),
};

// ---------- Admin ----------
const adminApi = {
  // courses
  createCourse: (b) => apiFetch("/api/admin/courses", { method: "POST", body: b }),
  courses: () => apiFetch("/api/admin/courses"),
  publishCourse: (id) => apiFetch(`/api/admin/courses/${id}/publish`, { method: "POST" }),
  deleteCourse: (id) => apiFetch(`/api/admin/courses/${id}`, { method: "DELETE" }),
  createUnit: (b) => apiFetch("/api/admin/units", { method: "POST", body: b }),
  createLesson: (b) => apiFetch("/api/admin/lessons", { method: "POST", body: b }),
  uploadVideo: (id, fd) => apiFetch(`/api/admin/lessons/${id}/video`, { method: "POST", body: fd, isForm: true }),
  publishLesson: (id) => apiFetch(`/api/admin/lessons/${id}/publish`, { method: "POST" }),
  uploadFile: (id, fd) => apiFetch(`/api/admin/lessons/${id}/file`, { method: "POST", body: fd, isForm: true }),
  // quizzes / live
  createQuiz: (b) => apiFetch("/api/admin/quizzes", { method: "POST", body: b }),
  createLive: (b) => apiFetch("/api/admin/live", { method: "POST", body: b }),
  // students / payments
  students: () => apiFetch("/api/admin/students"),
  pendingPayments: () => apiFetch("/api/admin/payments/pending"),
  allPayments: () => apiFetch("/api/admin/payments"),
  receiptUrl: (id) => `${API_BASE}/api/admin/payments/${id}/receipt`, // needs auth header — used via <img> with auth-blob loader
  confirmPayment: (id) => apiFetch(`/api/admin/payments/${id}/confirm`, { method: "POST" }),
  rejectPayment: (id, note) => apiFetch(`/api/admin/payments/${id}/reject`, { method: "POST", body: { note } }),
  // settings / report
  settings: () => apiFetch("/api/admin/settings"),
  updateSettings: (b) => apiFetch("/api/admin/settings", { method: "PUT", body: b }),
  financial: () => apiFetch("/api/admin/report/financial"),
};

// Helper: load an authenticated image into a blob URL (for receipts, etc.)
async function loadAuthImage(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error("فشل تحميل الصورة");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

Object.assign(window, {
  API_BASE, ApiError,
  getToken, setToken, getRole, setRole, getStudent, setStudent,
  apiFetch, authApi, studentApi, quizApi, liveApi, paymentApi, parentApi, adminApi,
  loadAuthImage,
});