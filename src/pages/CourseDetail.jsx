import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header.jsx";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext.jsx";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState("");
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    api(`/courses/${id}`).then(setCourse).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (user?.role !== "student") return;
    let cancelled = false;
    let tries = 0;

    async function checkOwned() {
      try {
        const list = await api("/enrollment/my-courses");
        if (cancelled) return;
        const isOwned = list.some((e) => e.courseId === id);
        setOwned(isOwned);
        return isOwned;
      } catch {
        return false;
      }
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("purchase") === "success") {
      setMessage("Payment received — activating your access...");
      const poll = async () => {
        const isOwned = await checkOwned();
        tries += 1;
        if (isOwned) {
          setMessage("✓ Payment confirmed! The course is now in your dashboard.");
        } else if (tries < 8 && !cancelled) {
          setTimeout(poll, 1500);
        } else if (!cancelled) {
          setMessage("Payment is still processing. Check your dashboard in a minute.");
        }
      };
      poll();
    } else {
      if (params.get("purchase") === "cancelled") setMessage("Payment cancelled.");
      checkOwned();
    }

    return () => {
      cancelled = true;
    };
  }, [id, user]);

  async function buy() {
    if (!user) return navigate("/login");
    setBuying(true);
    setMessage("");
    try {
      const res = await api(`/enrollment/checkout/${id}`, { method: "POST" });
      if (res.free) {
        setOwned(true);
        setMessage("✓ Course added to your dashboard.");
      } else if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBuying(false);
    }
  }

  if (!course) {
    return (
      <main className="site">
        <Header />
        <div className="table-empty"><p>Loading course...</p></div>
      </main>
    );
  }

  const b = course.breakdown;

  return (
    <main className="site">
      <Header />

      <section className="course-detail">
        <motion.div
          className="detail-main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="detail-cover" style={{ background: course.cover || "var(--accent)" }}>
            <span className="course-industry">{course.industry}</span>
          </div>
          <span className="eyebrow">{course.industry}</span>
          <h1>{course.title}</h1>
          <p className="lead">{course.description}</p>

          <div className="course-meta big">
            <span>⭐ {course.rating || "—"} ({course.reviewCount} reviews)</span>
            <span>👥 {course.students} students</span>
            <span>📚 {course.lessonCount} lessons</span>
            <span className="tag">{course.level}</span>
          </div>

          <div className="topic-tags">
            {course.topics.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>

          <h2>Course Program</h2>
          <div className="module-list">
            {course.modules.map((m) => (
              <div key={m.id} className="module-block">
                <p className="module-head">
                  <span>{m.title}</span>
                  <span className="muted small">{m.lessons.length} lessons</span>
                </p>
                {m.lessons.map((l) => (
                  <div key={l.id} className="lesson-row">
                    <span className="lesson-num">{l.order}</span>
                    <div>
                      <strong>{l.title}</strong>
                      <p className="muted small">{l.durationMin} min{l.homework?.length ? " · 📝 HW" : ""}</p>
                    </div>
                    {!owned && <span className="lock">🔒</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="teacher-box glass">
            <div className="teacher-avatar">{course.teacher?.name?.[0]}</div>
            <div>
              <strong>{course.teacher?.name}</strong>
              <p className="muted small">{course.teacher?.bio || "Platform teacher"}</p>
            </div>
          </div>

          {course.reviews?.length > 0 && (
            <>
              <h2>Reviews</h2>
              <div className="reviews-grid">
                {course.reviews.map((r) => (
                  <article key={r.id} className="review-card">
                    <p className="review-text">“{r.text}”</p>
                    <span className="review-name">{r.student?.name} · ⭐ {r.rating}</span>
                  </article>
                ))}
              </div>
            </>
          )}
        </motion.div>

        <motion.aside
          className="buy-card glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <span className="price-big">${course.price}</span>

          <div className="breakdown">
            <div><span>Teacher price</span><span>${b.basePrice}</span></div>
            <div><span>Service fee ({b.percent}%)</span><span>+${b.platformFee}</span></div>
            <div className="total"><span>Total</span><span>${b.total}</span></div>
          </div>

          {owned ? (
            <Link to="/dashboard" className="primary-btn full">Go to learning</Link>
          ) : (
            <button className="primary-btn full" onClick={buy} disabled={buying}>
              {buying ? "Processing..." : user?.role === "student" || !user ? "Buy course" : "Students only"}
            </button>
          )}

          {message && <p className="form-message">{message}</p>}

          <ul className="buy-perks">
            <li>✓ Lifetime access</li>
            <li>✓ Materials & homework</li>
            <li>✓ Access to live lessons</li>
          </ul>
        </motion.aside>
      </section>
    </main>
  );
}
