import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Login     from "./pages/Login";
import Signup    from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound  from "./pages/NotFound";
import Layout    from "./components/Layout";
import { ToastContainer } from "./components/Toast";

const GenerateNote  = lazy(() => import("./pages/GenerateNote"));
const GenerateQuiz  = lazy(() => import("./pages/GenerateQuiz"));
const MyQuizzes     = lazy(() => import("./pages/MyQuizzes"));
const Analytics     = lazy(() => import("./pages/Analytics"));
const Notes         = lazy(() => import("./pages/Notes"));
const ChatTutor     = lazy(() => import("./pages/ChatTutor"));
const Subjects      = lazy(() => import("./pages/Subjects"));
const FYPGuide      = lazy(() => import("./pages/FYPGuide"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));

function ProtectedRoute({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace/>;
}
const Spin = () => (
  <div style={{ padding:60, textAlign:"center" }}><div className="loader"/></div>
);
function P({ page }) {
  return (
    <ProtectedRoute>
      <Layout>
        <Suspense fallback={<Spin/>}>{page}</Suspense>
      </Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <>
      <ToastContainer/>
      <Routes>
        <Route path="/login"          element={<Login/>}/>
        <Route path="/signup"         element={<Signup/>}/>
        <Route path="/"               element={<Navigate to="/dashboard" replace/>}/>
        <Route path="/dashboard"      element={<P page={<Dashboard/>}/>}/>
        <Route path="/subjects"       element={<P page={<Subjects/>}/>}/>
        <Route path="/generate-note"  element={<P page={<GenerateNote/>}/>}/>
        <Route path="/generate-quiz"  element={<P page={<GenerateQuiz/>}/>}/>
        <Route path="/my-quizzes"     element={<P page={<MyQuizzes/>}/>}/>
        <Route path="/analytics"      element={<P page={<Analytics/>}/>}/>
        <Route path="/notes"          element={<P page={<Notes/>}/>}/>
        <Route path="/chat"           element={<P page={<ChatTutor/>}/>}/>
        <Route path="/fyp-guide"      element={<P page={<FYPGuide/>}/>}/>
        <Route path="/resume-builder" element={<P page={<ResumeBuilder/>}/>}/>
        <Route path="*"               element={<NotFound/>}/>
      </Routes>
    </>
  );
}