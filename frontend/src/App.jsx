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
import Layout from "./components/Layout";
import { ToastContainer } from "./components/Toast";

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login"   element={<Login />} />
        <Route path="/signup"  element={<Signup />} />
        <Route path="/dashboard"      element={<Layout><Dashboard /></Layout>} />
        <Route path="/subjects"       element={<Layout><Subjects /></Layout>} />
        <Route path="/subjects/:subjectId" element={<Layout><Units /></Layout>} />
        <Route path="/units/:unitId"  element={<Layout><Topics /></Layout>} />
        <Route path="/notes"          element={<Layout><Notes /></Layout>} />
        <Route path="/generate-note"  element={<Layout><GenerateNote /></Layout>} />
        <Route path="/generate-quiz"  element={<Layout><GenerateQuiz /></Layout>} />
        <Route path="/my-quizzes"     element={<Layout><MyQuizzes /></Layout>} />
        <Route path="/analytics"      element={<Layout><Analytics /></Layout>} />
        <Route path="/fyp-guide"      element={<Layout><FYPGuide /></Layout>} />
        <Route path="/resume-builder" element={<Layout><ResumeBuilder /></Layout>} />
        <Route path="*"               element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default App;
