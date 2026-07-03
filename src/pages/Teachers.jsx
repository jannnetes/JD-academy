import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import { api } from "../api";
import { categoryForIndustry } from "../categories";

export default function Teachers() {
  const [courses, setCourses] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => { api("/courses").then(setCourses).catch(() => {}); }, []);

  const teachers = useMemo(() => {
    const map = courses.reduce((acc, c) => {
      const t = c.teacher; if (!t) return acc;
      if (!acc[t.id]) acc[t.id] = { ...t, count: 0, students: 0, fields: new Set(), rsum: 0, rn: 0 };
      acc[t.id].count++; acc[t.id].students += c.students || 0; acc[t.id].fields.add(c.industry);
      if (c.rating) { acc[t.id].rsum += c.rating; acc[t.id].rn++; }
      return acc;
    }, {});
    let l = Object.values(map);
    if (q) l = l.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()) || [...t.fields].some((f) => f.toLowerCase().includes(q.toLowerCase())));
    return l;
  }, [courses, q]);

  const initials = (n) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="bold bs-page">
      <Header />
      <section className="bs bs-blue">
        <div className="bw">
          <h1 className="bs-hero-title" style={{ fontSize: "clamp(80px,16vw,200px)" }}>
            <span className="line" style={{ color: "#C8FF00" }}>200+</span>
            <span className="line filled">EXPERTS</span>
          </h1>
          <input className="edu-search" placeholder="Search by name or field…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="bs-teach-grid" style={{ marginTop: 40 }}>
            {teachers.map((t) => {
              const cat = categoryForIndustry([...t.fields][0]);
              return (
                <div className="bs-teach" key={t.id} data-cursor="VIEW">
                  <span className="bs-teach-init">{initials(t.name)}</span>
                  <strong>{t.name}</strong>
                  <span className="bs-teach-field">{cat?.icon} {[...t.fields].join(" · ").toUpperCase()}</span>
                  <span className="bs-teach-meta mono">{t.count} {t.count === 1 ? "course" : "courses"} · ★ {t.rn ? (t.rsum / t.rn).toFixed(1) : "—"}</span>
                  <span className="bs-teach-meta mono">{t.students} students</span>
                  <Link to="/catalog" className="bs-teach-link">VIEW COURSES →</Link>
                </div>
              );
            })}
            {teachers.length === 0 && <p className="mono">No one found.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
