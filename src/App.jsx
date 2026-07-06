import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AuroraBackground from "./components/AuroraBackground.jsx";
import Reveal from "./components/Reveal.jsx";
import CookieConsent from "./components/CookieConsent.jsx";

// Lazy-loaded: everything past the landing/auth pages, so the first paint
// for ad-driven traffic (Home, Login, Register) doesn't pay for the JS of
// pages most visitors won't touch on their first visit.
const Questions = lazy(() => import("./pages/Questions.jsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/Legal.jsx").then((m) => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import("./pages/Legal.jsx").then((m) => ({ default: m.TermsOfService })));
const Impressum = lazy(() => import("./pages/Legal.jsx").then((m) => ({ default: m.Impressum })));
const Catalog = lazy(() => import("./pages/Catalog.jsx"));
const CourseDetail = lazy(() => import("./pages/CourseDetail.jsx"));
const Teachers = lazy(() => import("./pages/Teachers.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Live = lazy(() => import("./pages/Live.jsx"));
const Learn = lazy(() => import("./pages/Learn.jsx"));
const Builder = lazy(() => import("./pages/Builder.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));

export default function App() {
  const location = useLocation();
  return (
    <>
      <AuroraBackground />
      <Reveal />
      <CookieConsent />
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
          <Suspense fallback={null}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/questions" element={<Questions />} />
              <Route path="/login" element={<Auth initialMode="login" />} />
              <Route path="/register" element={<Auth initialMode="register" />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/impressum" element={<Impressum />} />
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
          </Suspense>
      </motion.div>
    </>
  );
}
