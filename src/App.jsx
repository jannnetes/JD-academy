import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home.jsx";
import Questions from "./pages/Questions.jsx";
import Auth from "./pages/Auth.jsx";
import Catalog from "./pages/Catalog.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import Teachers from "./pages/Teachers.jsx";
import About from "./pages/About.jsx";
import Live from "./pages/Live.jsx";
import Learn from "./pages/Learn.jsx";
import Builder from "./pages/Builder.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AuroraBackground from "./components/AuroraBackground.jsx";
import Reveal from "./components/Reveal.jsx";

export default function App() {
  const location = useLocation();
  return (
    <>
      <AuroraBackground />
      <Reveal />
      <AnimatePresence>
        <motion.div
          key={`sweep-${location.pathname}`}
          className="page-sweep"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        />
      </AnimatePresence>
      {/* keyed wrapper animates in on each navigation; no mode="wait"
          (a nested AnimatePresence on a page can deadlock the exit) */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/login" element={<Auth initialMode="login" />} />
            <Route path="/register" element={<Auth initialMode="register" />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/about" element={<About />} />
            <Route path="/live" element={<Live />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn/:courseId"
              element={
                <ProtectedRoute>
                  <Learn />
                </ProtectedRoute>
              }
            />
            <Route
              path="/builder/:courseId"
              element={
                <ProtectedRoute roles={["teacher", "admin"]}>
                  <Builder />
                </ProtectedRoute>
              }
            />
          </Routes>
      </motion.div>
    </>
  );
}
