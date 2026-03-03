import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:5000" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  return config;
});

export default api;

// ── Semesters / Subjects / Units / Topics ────────────────────────────
export const getSemesters          = ()    => api.get("/semesters");
export const getSubjects           = ()    => api.get("/subjects");
export const getSubjectsBySemester = (id)  => api.get(`/subjects/semester/${id}`);
export const getUnits              = (id)  => api.get(`/units/${id}`);
export const getTopicsByUnit       = (id)  => api.get(`/topics/${id}`);
export const getTopicsBySubject    = (id)  => api.get(`/topics/subject/${id}`);

// ── Notes ─────────────────────────────────────────────────────────────
export const getNotes    = ()   => api.get("/notes");
export const deleteNote  = (id) => api.delete(`/notes/${id}`);
export const generateNote = (subject_id, topic_id) =>
  api.post("/ai/generate-note", { subject_id, topic_id });

// ── Quizzes ───────────────────────────────────────────────────────────
export const getQuizzes  = ()   => api.get("/quizzes");
export const deleteQuiz  = (id) => api.delete(`/quizzes/${id}`);
export const submitQuiz  = (id, score, total_marks) =>
  api.post(`/quizzes/${id}/submit`, { score, total_marks });

export const generateQuiz = (subject, topic, difficulty = "medium", num_questions = 5) => {
  if (subject && topic && !isNaN(subject) && !isNaN(topic)) {
    return api.post("/ai/generate-quiz", {
      subject_id: Number(subject),
      topic_id: Number(topic),
      difficulty,
      num_questions,
    });
  }
  return api.post("/ai/generate-quiz", {
    subject_name: subject,
    topic_name: topic,
    difficulty,
    num_questions,
  });
};

export const generateTopics = (subjectName) =>
  api.post("/ai/generate-topics", { subject_name: subjectName });

// ── Progress / Analytics ──────────────────────────────────────────────
export const getSubjectProgress   = ()  => api.get("/progress/subjects");
export const getPersonalDashboard = ()  => api.get("/dashboard/personal");
export const getPersonalAnalytics = ()  => api.get("/analytics/personal");
export const getDashboardStats    = ()  => api.get("/dashboard/stats");

// ── FYP Guide ────────────────────────────────────────────────────────
export const generateFYPGuide = (domain, interest, team_size) =>
  api.post("/ai/fyp-guide", { domain, interest, team_size });

// ── Resume Builder ────────────────────────────────────────────────────
export const generateResume  = (formData)   => api.post("/ai/resume/generate", formData);
export const improveResume   = (resume_text, target_role) =>
  api.post("/ai/resume/improve", { resume_text, target_role });
export const compileResume   = (latex)      => api.post("/ai/resume/compile", { latex });
