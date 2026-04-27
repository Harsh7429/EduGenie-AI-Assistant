import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import GenerateNote from "./pages/GenerateNote";
import GenerateQuiz from "./pages/GenerateQuiz";
import MyQuizzes from "./pages/MyQuizzes";
import Analytics from "./pages/Analytics";
import Notes from "./pages/Notes";
import ChatTutor from "./pages/ChatTutor";
import Layout from "./components/Layout";
import { ToastContainer } from "./components/Toast";

// Lazy-load heavier pages
import { lazy, Suspense } from "react";
const Subjects    = lazy(() => import("./pages/Subjects"));
const FYPGuide    = lazy(() => import("./pages/FYPGuide"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function P({ page }) {
  return (
    <ProtectedRoute>
      <Layout>
        <Suspense fallback={<div style={{ padding:40, textAlign:"center" }}><div className="loader"/></div>}>
          {page}
        </Suspense>
      </Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login"          element={<Login />} />
        <Route path="/signup"         element={<Signup />} />
        <Route path="/dashboard"      element={<P page={<Dashboard />} />} />
        <Route path="/subjects"       element={<P page={<Subjects />} />} />
        <Route path="/generate-note"  element={<P page={<GenerateNote />} />} />
        <Route path="/generate-quiz"  element={<P page={<GenerateQuiz />} />} />
        <Route path="/my-quizzes"     element={<P page={<MyQuizzes />} />} />
        <Route path="/analytics"      element={<P page={<Analytics />} />} />
        <Route path="/notes"          element={<P page={<Notes />} />} />
        <Route path="/chat"           element={<P page={<ChatTutor />} />} />
        <Route path="/fyp-guide"      element={<P page={<FYPGuide />} />} />
        <Route path="/resume-builder" element={<P page={<ResumeBuilder />} />} />
        <Route path="*"               element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}