import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header.jsx";
import { api } from "../api";
import { CATEGORIES, categoryForIndustry } from "../categories";

const PAGE = 9;

export default function Catalog() {
  const [courses, setCourses] = useState([]);
  const [active, setActive] = useState("all");
  const [sort, setSort] = useState("popular");
  const [limit, setLimit] = useState(PAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/courses").then(setCourses).catch(() => setCourses([])).finally(() => setLoading(false));
  }, []);

  const list = useMemo(() => {
    let l = courses.map((c) => ({ ...c, cat: categoryForIndustry(c.industry) }));
    if (active !== "all") l = l.filter((c) => c.cat?.slug === active);
    if (sort === "price") l = [...l].sort((a, b) => a.price - b.price);
    else if (sort === "new") l = [...l].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    else l = [...l].sort((a, b) => b.students - a.students);
    return l;
  }, [courses, active, sort]);

  const shown = list.slice(0, limit);

  return (
    <div className="bold bs-page">
      <Header />
      <section className="bs bs-navy cat-page">
        <div className="bw">
          <h1 className="cat-title">
            <span className="line filled">CA<span className="cat-hyphen">-</span>TA<span className="cat-hyphen">-</span>LOG</span>
            <span className="line outline">COURSES</span>
          </h1>
          <p className="cat-sub">500+ courses from top teachers · {courses.length} available now</p>

          <div className="cat-bar">
            <div className="cat-filters">
              <button className={active === "all" ? "bs-filter on" : "bs-filter"} onClick={() => { setActive("all"); setLimit(PAGE); }} data-cursor="PICK">ALL</button>
              {CATEGORIES.map((c) => (
                <button key={c.slug} className={active === c.slug ? "bs-filter on" : "bs-filter"} onClick={() => { setActive(c.slug); setLimit(PAGE); }} data-cursor="PICK">
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
            <select className="cat-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="popular">Popular</option>
              <option value="price">Price ↑</option>
              <option value="new">Newest</option>
            </select>
          </div>

          {loading ? (
            <p className="mono" style={{ opacity: 0.6 }}>Loading…</p>
          ) : shown.length === 0 ? (
            <div className="cat-empty">
              <p className="bs-h2 light">NOTHING YET</p>
              <p className="mono" style={{ opacity: 0.6 }}>No courses in this category yet.</p>
            </div>
          ) : (
            <motion.div layout className="cat-grid">
              {shown.map((c, i) => {
                const cat = c.cat || { color: "#0038FF", text: "#fff", name: c.industry.toUpperCase() };
                return (
                  <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <Link to={`/course/${c.id}`} className="bs-card" style={{ background: cat.color, color: cat.text }} data-cursor="BUY">
                      <div className="bs-card-top">
                        <span className="bs-card-tag">[{cat.name}]</span>
                        <span className="bs-card-rate">★ {c.rating || "—"}</span>
                      </div>
                      <h3 className="bs-card-title">{c.title}</h3>
                      <div className="bs-card-meta">
                        <span>{c.teacher?.name}</span><span>{c.lessonCount} lessons</span>
                      </div>
                      <div className="bs-card-foot">
                        <span className="bs-card-price">${c.price}</span>
                        <span className="bs-card-buy">ENROLL →</span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {limit < list.length && (
            <button className="cat-more" onClick={() => setLimit(limit + PAGE)} data-cursor="MORE">LOAD MORE →</button>
          )}
        </div>
      </section>
    </div>
  );
}
