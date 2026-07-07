import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header.jsx";
import XpToast from "../components/XpToast.jsx";
import BlockRenderer from "../components/BlockRenderer.jsx";
import { api } from "../api";

export default function Learn() {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [toast, setToast] = useState(null);
  const [hwContent, setHwContent] = useState("");
  const [submittedHw, setSubmittedHw] = useState(new Set());

  async function load() {
    const d = await api(`/enrollment/learn/${courseId}`);
    setData(d);
    if (!activeLesson) {
      const first = d.course.modules[0]?.lessons[0];
      setActiveLesson(first || null);
    }
  }
  useEffect(() => {
    load();
  }, [courseId]);

  // The real video URL is never sent in bulk — fetch a fresh, short-lived
  // signed link each time the active lesson changes.
  useEffect(() => {
    if (!activeLesson) { setVideoUrl(null); return; }
    let cancelled = false;
    setVideoUrl(null);
    api(`/enrollment/lessons/${activeLesson.id}/video-token`)
      .then((res) => { if (!cancelled) setVideoUrl(res.url); })
      .catch(() => { if (!cancelled) setVideoUrl(null); });
    return () => { cancelled = true; };
  }, [activeLesson?.id]);

  function showToast(payload) {
    setToast(payload);
    setTimeout(() => setToast(null), 3500);
  }

  const doneIds = new Set(
    (data?.lessonProgress || []).filter((p) => p.completed).map((p) => p.lessonId)
  );

  async function completeLesson(lesson) {
    const res = await api(`/enrollment/lessons/${lesson.id}/complete`, { method: "POST" });
    if (res.xpEarned > 0 || res.certificate) {
      showToast({
        xp: res.xpEarned,
        leveledUp: res.gamification?.leveledUp,
        badges: res.gamification?.newBadges || [],
        certificate: res.certificate,
      });
    }
    await load();
  }

  async function submitHw(hw) {
    try {
      const res = await api(`/enrollment/homework/${hw.id}/submit`, {
        method: "POST",
        body: { content: hwContent },
      });
      setSubmittedHw(new Set([...submittedHw, hw.id]));
      setHwContent("");
      showToast({ xp: res.xpEarned, leveledUp: res.gamification?.leveledUp, badges: res.gamification?.newBadges || [] });
    } catch (err) {
      showToast({ xp: 0, line: err.message });
    }
  }

  if (!data) {
    return (
      <main className="site">
        <Header />
        <div className="table-empty"><p>Loading course...</p></div>
      </main>
    );
  }

  const { course } = data;
  const lessonsHw = activeLesson?.homework?.[0];

  return (
    <main className="site">
      <Header />
      <XpToast toast={toast} />

      <div className="learn-top">
        <div>
          <Link to="/dashboard" className="link small">← Back to dashboard</Link>
          <h1>{course.title}</h1>
          <p className="muted">Teacher: {course.teacher.name}</p>
        </div>
        <div className="learn-progress glass">
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${data.progressPct}%` }} /></div>
          <span className="small">{data.progressPct}% complete</span>
          {data.certificate && <span className="cert-chip">🎓 Certificate earned</span>}
        </div>
      </div>

      <div className="learn-layout">
        {/* Curriculum sidebar */}
        <aside className="curriculum glass">
          {course.modules.map((m) => (
            <div key={m.id} className="curr-module">
              <p className="curr-module-title">{m.title}</p>
              {m.lessons.map((l) => (
                <button
                  key={l.id}
                  className={`curr-lesson ${activeLesson?.id === l.id ? "active" : ""}`}
                  onClick={() => setActiveLesson(l)}
                >
                  <span className={`curr-check ${doneIds.has(l.id) ? "done" : ""}`}>
                    {doneIds.has(l.id) ? "✓" : ""}
                  </span>
                  <span className="curr-lesson-title">{l.title}</span>
                  <span className="muted small">{l.durationMin}m</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Lesson player */}
        <section className="lesson-stage">
          {activeLesson ? (
            <motion.div key={activeLesson.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="video-frame">
                {videoUrl ? (
                  <video key={videoUrl} src={videoUrl} controls className="video-el" />
                ) : (
                  <div className="video-placeholder">Loading video…</div>
                )}
              </div>
              <h2>{activeLesson.title}</h2>
              {activeLesson.blocks?.length > 0 ? (
                <BlockRenderer blocks={activeLesson.blocks} />
              ) : (
                <p className="muted">{activeLesson.content}</p>
              )}

              <button
                className="primary-btn"
                onClick={() => completeLesson(activeLesson)}
                disabled={doneIds.has(activeLesson.id)}
              >
                {doneIds.has(activeLesson.id) ? "✓ Lesson complete" : `Complete lesson (+${activeLesson.xpReward} XP)`}
              </button>

              {lessonsHw && (
                <div className="hw-panel glass">
                  <span className="eyebrow">Homework · +{lessonsHw.xpReward} XP</span>
                  <h3>{lessonsHw.title}</h3>
                  <p className="muted">{lessonsHw.description}</p>
                  {submittedHw.has(lessonsHw.id) ? (
                    <p className="form-message">✓ Submitted!</p>
                  ) : (
                    <>
                      <textarea
                        placeholder="Your answer / link to your work..."
                        value={hwContent}
                        onChange={(e) => setHwContent(e.target.value)}
                      />
                      <button className="secondary-btn" onClick={() => submitHw(lessonsHw)}>
                        Submit homework
                      </button>
                    </>
                  )}
                </div>
              )}

              {data.certificate && (
                <div className="certificate glass">
                  <span className="cert-seal">🎓</span>
                  <h3>Certificate of Completion</h3>
                  <p>Issued for <strong>{course.title}</strong></p>
                  <Link to={`/certificate/${data.certificate.id}`} className="primary-btn">
                    View & download certificate
                  </Link>
                </div>
              )}
            </motion.div>
          ) : (
            <p className="muted">Select a lesson on the left.</p>
          )}
        </section>
      </div>
    </main>
  );
}
