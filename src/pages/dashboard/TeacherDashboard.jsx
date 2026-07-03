import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashShell from "../../components/DashShell.jsx";
import { api } from "../../api";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "Course Builder" },
  { id: "create", label: "New Course" },
  { id: "live", label: "Live Sessions" },
];

const industries = ["Languages", "Test Prep", "Programming", "Design", "Business"];
const levels = ["Beginner", "Intermediate", "Advanced"];

export default function TeacherDashboard() {
  const [active, setActive] = useState("overview");
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const [courseForm, setCourseForm] = useState({
    title: "", description: "", industry: "Languages", topics: "", basePrice: 1500, level: "Beginner",
  });
  const [createMsg, setCreateMsg] = useState("");
  const [liveForm, setLiveForm] = useState({ title: "", startsAt: "", price: 0, capacity: 20 });
  const [hwTarget, setHwTarget] = useState(null);
  const [hwForm, setHwForm] = useState({ title: "", description: "" });

  function reload() {
    api("/teacher/analytics").then(setAnalytics).catch(() => {});
    api("/teacher/courses").then(setCourses).catch(() => {});
    api("/live").then(setSessions).catch(() => {});
  }
  useEffect(reload, []);

  async function createCourse(e) {
    e.preventDefault();
    setCreateMsg("");
    try {
      await api("/courses", { method: "POST", body: courseForm });
      setCreateMsg("✓ Course created as a draft. Add modules and lessons in the Builder.");
      setCourseForm({ title: "", description: "", industry: "Languages", topics: "", basePrice: 1500, level: "Beginner" });
      reload();
      setActive("courses");
    } catch (err) {
      setCreateMsg(err.message);
    }
  }

  async function togglePublish(c) {
    await api(`/courses/${c.id}`, { method: "PATCH", body: { status: c.status === "published" ? "draft" : "published" } });
    reload();
  }
  async function addModule(courseId) {
    const title = prompt("Module title:");
    if (!title) return;
    await api(`/courses/${courseId}/modules`, { method: "POST", body: { title } });
    reload();
  }
  async function addLesson(courseId, moduleId) {
    const title = prompt("Lesson title:");
    if (!title) return;
    const durationMin = prompt("Duration (min):", "30");
    await api(`/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: "POST",
      body: { title, durationMin, videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" },
    });
    reload();
  }
  async function addHomework(lessonId) {
    if (!hwForm.title) return;
    await api(`/courses/lessons/${lessonId}/homework`, { method: "POST", body: hwForm });
    setHwTarget(null);
    setHwForm({ title: "", description: "" });
    reload();
  }
  async function createLive(e) {
    e.preventDefault();
    await api("/live", { method: "POST", body: liveForm });
    setLiveForm({ title: "", startsAt: "", price: 0, capacity: 20 });
    reload();
  }

  return (
    <DashShell tabs={tabs} active={active} onTab={setActive}>
      {active === "overview" && analytics && (
        <>
          <section className="stat-grid">
            <div className="stat-card glass"><span className="stat-num">{analytics.students}</span><span className="muted">Students</span></div>
            <div className="stat-card glass accent"><span className="stat-num">${analytics.revenue}</span><span className="muted">Revenue</span></div>
            <div className="stat-card glass"><span className="stat-num">{analytics.courseCount}</span><span className="muted">Courses</span></div>
            <div className="stat-card glass"><span className="stat-num">⭐ {analytics.avgRating}</span><span className="muted">Rating</span></div>
          </section>
          <section className="info-card glass">
            <p className="small muted">Platform fee on your sales: <strong>${analytics.platformPaid}</strong> · Sales: {analytics.salesCount}</p>
          </section>
          {analytics.recentReviews?.length > 0 && (
            <section className="reviews-grid">
              {analytics.recentReviews.map((r) => (
                <article key={r.id} className="review-card">
                  <p className="review-text">“{r.text}”</p>
                  <span className="review-name">{r.student.name} · {r.course.title} · ⭐ {r.rating}</span>
                </article>
              ))}
            </section>
          )}
        </>
      )}

      {active === "courses" && (
        <section className="builder-list">
          {courses.length === 0 && <div className="empty-card glass"><p>No courses yet. Create your first one in the New Course tab.</p></div>}
          {courses.map((c) => (
            <article key={c.id} className="builder-card glass">
              <header className="builder-head">
                <div className="builder-cover" style={{ background: c.cover }} />
                <div className="builder-info">
                  <span className={c.status === "published" ? "badge ok" : "badge"}>{c.status}</span>
                  <h3>{c.title}</h3>
                  <p className="muted small">{c.students} students · {c.modules.length} modules · {c.lessonCount} lessons · ${c.basePrice}</p>
                </div>
                <div className="builder-actions">
                  <Link to={`/builder/${c.id}`} className="secondary-btn">Open builder →</Link>
                  <button className="secondary-btn" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                    {expanded === c.id ? "Collapse" : "Quick edit"}
                  </button>
                  <button className="primary-btn" onClick={() => togglePublish(c)}>
                    {c.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </header>

              {expanded === c.id && (
                <div className="builder-body">
                  {c.modules.map((m) => (
                    <div key={m.id} className="builder-module">
                      <p className="module-head"><span>📦 {m.title}</span></p>
                      {m.lessons.map((l) => (
                        <div key={l.id} className="builder-lesson">
                          <span>▶ {l.title} <span className="muted small">({l.durationMin}хв)</span></span>
                          {l.homework?.length ? (
                            <span className="badge ok">HW ✓</span>
                          ) : hwTarget === l.id ? (
                            <div className="inline-hw">
                              <input placeholder="HW title" value={hwForm.title} onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })} />
                              <input placeholder="Description" value={hwForm.description} onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })} />
                              <button className="chip active" onClick={() => addHomework(l.id)}>Add</button>
                            </div>
                          ) : (
                            <button className="chip" onClick={() => setHwTarget(l.id)}>+ HW</button>
                          )}
                        </div>
                      ))}
                      <button className="chip" onClick={() => addLesson(c.id, m.id)}>+ Lesson</button>
                    </div>
                  ))}
                  <button className="secondary-btn" onClick={() => addModule(c.id)}>+ Add module</button>
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      {active === "create" && (
        <section className="form-card glass">
          <h2>New Course</h2>
          <form onSubmit={createCourse} className="auth-form">
            <label>Title<input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required /></label>
            <label>Description<textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} /></label>
            <label>Category
              <select value={courseForm.industry} onChange={(e) => setCourseForm({ ...courseForm, industry: e.target.value })}>
                {industries.map((i) => <option key={i}>{i}</option>)}
              </select>
            </label>
            <label>Level
              <select value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}>
                {levels.map((i) => <option key={i}>{i}</option>)}
              </select>
            </label>
            <label>Topics (comma-separated)<input value={courseForm.topics} onChange={(e) => setCourseForm({ ...courseForm, topics: e.target.value })} placeholder="React, JavaScript" /></label>
            <label>Your price ($)<input type="number" value={courseForm.basePrice} onChange={(e) => setCourseForm({ ...courseForm, basePrice: e.target.value })} required /></label>
            <div className="info-card subtle">
              <p className="small muted">Student pays ~<strong>${Math.round(courseForm.basePrice * 1.15)}</strong> (15% fee). You receive <strong>${courseForm.basePrice}</strong>.</p>
            </div>
            <button className="primary-btn full">Create course</button>
            {createMsg && <p className="form-message">{createMsg}</p>}
          </form>
        </section>
      )}

      {active === "live" && (
        <div className="split-cols">
          <section className="form-card glass">
            <h2>Schedule a session</h2>
            <form onSubmit={createLive} className="auth-form">
              <label>Topic<input value={liveForm.title} onChange={(e) => setLiveForm({ ...liveForm, title: e.target.value })} required /></label>
              <label>Date & time<input type="datetime-local" value={liveForm.startsAt} onChange={(e) => setLiveForm({ ...liveForm, startsAt: e.target.value })} required /></label>
              <label>Price (0 = free)<input type="number" value={liveForm.price} onChange={(e) => setLiveForm({ ...liveForm, price: e.target.value })} /></label>
              <button className="primary-btn full">Create session</button>
            </form>
          </section>
          <section className="dash-grid">
            {sessions.map((s) => (
              <article key={s.id} className="dash-card glass">
                <span className="badge">{s.provider} · {s.status}</span>
                <h3>{s.title}</h3>
                <p className="small">🕐 {new Date(s.startsAt).toLocaleString("en-US")}</p>
                <p className="small muted">👥 {s.booked} booked</p>
                <a href={s.roomUrl} target="_blank" rel="noreferrer" className="secondary-btn full">Lesson room</a>
              </article>
            ))}
          </section>
        </div>
      )}
    </DashShell>
  );
}
