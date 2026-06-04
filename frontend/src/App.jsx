import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Login     from "./pages/Login";
import Signup    from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound  from "./pages/NotFound";
import Layout    from "./components/Layout";
import { ToastContainer } from "./components/Toast";

// Lazy-loaded pages — code-split per route for faster initial load
const GenerateNote  = lazy(() => import("./pages/GenerateNote"));
const GenerateQuiz  = lazy(() => import("./pages/GenerateQuiz"));
const MyQuizzes     = lazy(() => import("./pages/MyQuizzes"));
const Analytics     = lazy(() => import("./pages/Analytics"));
const Notes         = lazy(() => import("./pages/Notes"));
const ChatTutor     = lazy(() => import("./pages/ChatTutor"));
const Subjects      = lazy(() => import("./pages/Subjects"));
const FYPGuide      = lazy(() => import("./pages/FYPGuide"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const Units         = lazy(() => import("./pages/Units"));   // Bug-fix #10: wired route
const Topics        = lazy(() => import("./pages/Topics"));  // Bug-fix #10: wired route

// Loading fallback shown while lazy chunks are being fetched
function PageLoader() {
  return (
    <div style={{ padding: 52, textAlign: "center" }}>
      <div className="loader" />
    </div>
  );
}

/**
 * PrivateRoute — wraps a page in the app Layout and checks for an active
 * JWT token. Redirects to /login if the user is not authenticated.
 */
function PrivateRoute({ page }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        {page}
      </Suspense>
    </Layout>
  );
}

export default function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public routes */}
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected routes */}
        <Route path="/dashboard"           element={<PrivateRoute page={<Dashboard />} />} />
        <Route path="/subjects"            element={<PrivateRoute page={<Subjects />} />} />
        <Route path="/subjects/:subjectId/units" element={<PrivateRoute page={<Units />} />} /> {/* Bug-fix #10 */}
        <Route path="/topics/:unitId"      element={<PrivateRoute page={<Topics />} />} />      {/* Bug-fix #10 */}
        <Route path="/generate-note"       element={<PrivateRoute page={<GenerateNote />} />} />
        <Route path="/generate-quiz"       element={<PrivateRoute page={<GenerateQuiz />} />} />
        <Route path="/my-quizzes"          element={<PrivateRoute page={<MyQuizzes />} />} />
        <Route path="/analytics"           element={<PrivateRoute page={<Analytics />} />} />
        <Route path="/notes"               element={<PrivateRoute page={<Notes />} />} />
        <Route path="/chat"                element={<PrivateRoute page={<ChatTutor />} />} />
        <Route path="/fyp-guide"           element={<PrivateRoute page={<FYPGuide />} />} />
        <Route path="/resume-builder"      element={<PrivateRoute page={<ResumeBuilder />} />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
