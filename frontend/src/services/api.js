import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000",
});

// Attach JWT on every request if present
api.interceptors.request.use(config => {
  const t = localStorage.getItem("token");
  if (t) config.headers = { ...config.headers, Authorization: `Bearer ${t}` };
  return config;
});

/**
 * 401 interceptor — last-resort safety net for server-side token rejection
 * (e.g. secret key rotation, manual revocation, or extreme clock drift).
 * Normal expiry is caught client-side in PrivateRoute's isTokenValid() check
 * before any API call is made, so this handler fires rarely.
 */
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      const onAuthPage = ["/login", "/signup"].includes(window.location.pathname);
      if (!onAuthPage) {
        // Full reload to /login so React re-initialises cleanly with no token
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Named API helpers ─────────────────────────────────────────────────────────
export const getSemesters          = ()          => api.get("/semesters");
export const getSubjects           = ()          => api.get("/subjects");
export const getSubjectsBySemester = id          => api.get(`/subjects/semester/${id}`);
export const getUnits              = id          => api.get(`/units/${id}`);
export const getTopicsByUnit       = id          => api.get(`/topics/${id}`);
export const getTopicsBySubject    = id          => api.get(`/topics/subject/${id}`);
export const getNotes              = ()          => api.get("/notes");
export const deleteNote            = id          => api.delete(`/notes/${id}`);
export const generateNote          = (s, t)      => api.post("/ai/generate-note", { subject_id: s, topic_id: t });
export const getQuizzes            = ()          => api.get("/quizzes");
export const deleteQuiz            = id          => api.delete(`/quizzes/${id}`);
export const submitQuiz            = (id, score, total_marks) =>
  api.post(`/quizzes/${id}/submit`, { score, total_marks });
export const submitQuizWithAnswers = (id, score, total_marks, user_answers) =>
  api.post(`/quizzes/${id}/submit`, { score, total_marks, user_answers });
export const generateQuiz          = (s, t, d = "medium", n = 5) => {
  if (s && t && !isNaN(s) && !isNaN(t))
    return api.post("/ai/generate-quiz", { subject_id: Number(s), topic_id: Number(t), difficulty: d, num_questions: n });
  return api.post("/ai/generate-quiz", { subject_name: s, topic_name: t, difficulty: d, num_questions: n });
};
export const generateTopics        = name        => api.post("/ai/generate-topics", { subject_name: name });
export const getSubjectProgress    = ()          => api.get("/progress/subjects");
export const getPersonalDashboard  = ()          => api.get("/dashboard/personal");
export const getPersonalAnalytics  = ()          => api.get("/analytics/personal");
export const getDashboardStats     = ()          => api.get("/dashboard/stats");
export const generateFYPGuide      = (d, i, t)   => api.post("/ai/fyp-guide", { domain: d, interest: i, team_size: t });
export const generateResume        = data        => api.post("/ai/resume/generate", data);
export const improveResume         = (r, t)      => api.post("/ai/resume/improve", { resume_text: r, target_role: t });
export const compileResume         = latex       => api.post("/ai/resume/compile", { latex });
