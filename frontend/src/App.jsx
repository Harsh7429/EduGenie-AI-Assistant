import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
 * isTokenValid — decodes the JWT payload (no library needed, just base64)
 * and checks the expiry claim. Returns false for missing, malformed,
 * or expired tokens so we never silently pass an invalid session.
 */
function isTokenValid() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is Unix epoch in seconds; Date.now() is ms
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

/**
 * PrivateRoute — wraps a page in the app Layout and validates the JWT.
 * Redirects to /login if unauthenticated or token is expired, and
 * preserves the intended destination so Login can redirect back after auth.
 */
function PrivateRoute({ page }) {
  const location = useLocation();
  if (!isTokenValid()) {
    // Clean up any stale/expired token before redirecting
    localStorage.removeItem("token");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        {page}
      </Suspense>
    </Layout>
  );
}

/**
 * PublicRoute — wraps Login and Signup.
 * If the user already has a valid session, skip the auth pages and go
 * straight to the dashboard (avoids the "back button to login" problem).
 */
function PublicRoute({ element }) {
  if (isTokenValid()) {
    return <Navigate to="/dashboard" replace />;
  }
  return element;
}

/**
 * RootRedirect — handles the bare "/" path.
 * Logged-in users → dashboard. Everyone else → login.
 * Single hop, no intermediate /dashboard bounce.
 */
function RootRedirect() {
  return <Navigate to={isTokenValid() ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Root — auth-aware single-hop redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes — redirect to dashboard if already logged in */}
        <Route path="/login"  element={<PublicRoute element={<Login />} />} />
        <Route path="/signup" element={<PublicRoute element={<Signup />} />} />

        {/* Protected routes */}
        <Route path="/dashboard"           element={<PrivateRoute page={<Dashboard />} />} />
        <Route path="/subjects"            element={<PrivateRoute page={<Subjects />} />} />
        <Route path="/subjects/:subjectId/units" element={<PrivateRoute page={<Units />} />} />
        <Route path="/topics/:unitId"      element={<PrivateRoute page={<Topics />} />} />
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
