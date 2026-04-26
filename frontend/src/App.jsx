import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Units from "./pages/Units";
import Topics from "./pages/Topics";
import Notes from "./pages/Notes";
import GenerateNote from "./pages/GenerateNote";
import GenerateQuiz from "./pages/GenerateQuiz";
import MyQuizzes from "./pages/MyQuizzes";
import Analytics from "./pages/Analytics";
import FYPGuide from "./pages/FYPGuide";
import ResumeBuilder from "./pages/ResumeBuilder";
import ChatTutor from "./pages/ChatTutor";
import Layout from "./components/Layout";
import { ToastContainer } from "./components/Toast";

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Without this, any user can visit /dashboard, /notes, etc. directly
 * via the address bar. The UI would render but every API call would
 * silently fail with a 401.
 */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function P({ page }) {
  return <ProtectedRoute><Layout>{page}</Layout></ProtectedRoute>;
}

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public routes */}
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route path="/dashboard"      element={<P page={<Dashboard />} />} />
        <Route path="/subjects"       element={<P page={<Subjects />} />} />
        <Route path="/subjects/:subjectId" element={<P page={<Units />} />} />
        <Route path="/units/:unitId"  element={<P page={<Topics />} />} />
        <Route path="/notes"          element={<P page={<Notes />} />} />
        <Route path="/generate-note"  element={<P page={<GenerateNote />} />} />
        <Route path="/generate-quiz"  element={<P page={<GenerateQuiz />} />} />
        <Route path="/my-quizzes"     element={<P page={<MyQuizzes />} />} />
        <Route path="/analytics"      element={<P page={<Analytics />} />} />
        <Route path="/fyp-guide"      element={<P page={<FYPGuide />} />} />
        <Route path="/resume-builder" element={<P page={<ResumeBuilder />} />} />
        <Route path="/chat"           element={<P page={<ChatTutor />} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
