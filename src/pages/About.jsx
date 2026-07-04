import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useInView } from "framer-motion";
import Header from "../components/Header.jsx";
import { api } from "../api";

function Num({ to, suffix, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const s = performance.now(); let raf;
    const tick = (now) => { const p = Math.min((now - s) / 1500, 1); setN((1 - Math.pow(1 - p, 3)) * to); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <div ref={ref} className="bs-num">
      <span className="bs-num-val">{Math.floor(n)}{suffix}</span>
      <span className="bs-num-line" /><span className="bs-num-label">{label}</span>
    </div>
  );
}

const values = [
  { t: "ACCESS", d: "Quality education from anywhere, at your own pace." },
  { t: "PRACTICE", d: "Practitioner teachers, real projects and feedback." },
  { t: "RESULTS", d: "Measurable progress, certificates and new opportunities." },
];

export default function About() {
  const [stats, setStats] = useState({ students: 0, courses: 0, teachers: 0 });

  useEffect(() => {
    api("/courses").then((courses) => {
      const teacherIds = new Set(courses.map((c) => c.teacher?.id).filter(Boolean));
      const students = courses.reduce((s, c) => s + (c.students || 0), 0);
      setStats({ students, courses: courses.length, teachers: teacherIds.size });
    }).catch(() => {});
  }, []);

  return (
    <div className="bold bs-page">
      <Header />
      <section className="bs bs-lime" data-sec="1">
        <div className="bw">
          <h1 className="bs-cta-title">
            <span className="line filled-d">WE</span>
            <span className="line outline-d">RESHAPE</span>
            <span className="line filled-d" style={{ fontSize: "clamp(54px,11vw,130px)" }}>EDUCATION</span>
          </h1>
        </div>
      </section>

      <section className="bs bs-navy">
        <div className="bw">
          <p className="bs-manifesto-text" style={{ color: "#fff", fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,3.6vw,40px)", lineHeight: 1.3, maxWidth: 900 }}>
            Our mission is to make modern education <em style={{ color: "#C8FF00", fontStyle: "italic" }}>bold, accessible and beautiful</em>. The platform blends recorded courses, live lessons and gamification.
          </p>
          <div className="bs-manifesto-cols" style={{ marginTop: 50 }}>
            {values.map((v) => (
              <div key={v.t}>
                <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 56, color: "#fff", margin: "0 0 10px" }}>{v.t}</h3>
                <p style={{ color: "rgba(255,255,255,0.7)" }}>{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bs bs-cream">
        <div className="bw bs-numbers-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          <Num to={stats.students} suffix="" label="students" />
          <Num to={stats.courses} suffix="" label="courses" />
          <Num to={stats.teachers} suffix="" label="teachers" />
          <Num to={18} suffix="" label="categories" />
        </div>
      </section>

      <section className="bs bs-coral">
        <div className="bw bs-cta-inner">
          <h2 className="bs-cta-title" style={{ color: "#fff" }}>
            <span className="line" style={{ color: "#fff" }}>JOIN US</span>
          </h2>
          <div className="bs-cta-actions">
            <Link to="/register" className="bs-btn white-coral" data-cursor="GO">I'M A STUDENT →</Link>
            <Link to="/register" className="bs-btn black" data-cursor="GO">I'M A TEACHER →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
