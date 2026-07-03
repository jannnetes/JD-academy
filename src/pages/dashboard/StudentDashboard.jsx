import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashShell from "../../components/DashShell.jsx";
import GamificationBar from "../../components/GamificationBar.jsx";
import SupportPanel from "../../components/SupportPanel.jsx";
import { api } from "../../api";

const tabs = [
  { id: "courses", label: "My Learning" },
  { id: "achievements", label: "Achievements" },
  { id: "live", label: "Live Lessons" },
  { id: "support", label: "Help & Support" },
  { id: "orders", label: "Payments" },
];

export default function StudentDashboard() {
  const [active, setActive] = useState("courses");
  const [enrollments, setEnrollments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [gami, setGami] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api("/enrollment/my-courses").then(setEnrollments).catch(() => {});
    api("/live/my-bookings").then(setBookings).catch(() => {});
    api("/enrollment/orders").then(setOrders).catch(() => {});
    api("/me/gamification").then(setGami).catch(() => {});
    api("/me/leaderboard").then(setLeaderboard).catch(() => {});
  }, []);

  return (
    <DashShell tabs={tabs} active={active} onTab={setActive}>
      <GamificationBar data={gami} />

      {active === "courses" && (
        <section className="dash-grid">
          {enrollments.length === 0 && (
            <div className="empty-card glass">
              <p>You don't have any courses yet.</p>
              <Link to="/catalog" className="primary-btn">Browse catalog</Link>
            </div>
          )}
          {enrollments.map((e) => (
            <article key={e.id} className="dash-card glass">
              <div className="dash-card-cover" style={{ background: e.course.cover }} />
              <h3>{e.course.title}</h3>
              <p className="muted small">Teacher: {e.course.teacher.name}</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${e.progressPct}%` }} />
              </div>
              <p className="small muted">{e.progressPct}% complete</p>
              <Link to={`/learn/${e.courseId}`} className="primary-btn full">
                {e.progressPct > 0 ? "Continue learning" : "Start course"}
              </Link>
            </article>
          ))}
        </section>
      )}

      {active === "achievements" && gami && (
        <>
          <section className="badge-grid">
            {gami.badges.map((b) => (
              <article key={b.code} className={`badge-card glass ${b.earned ? "earned" : "locked"}`}>
                <span className="badge-icon">{b.earned ? b.icon : "🔒"}</span>
                <strong>{b.title}</strong>
                <span className="muted small">{b.description}</span>
              </article>
            ))}
          </section>

          <section className="leaderboard glass">
            <h3>🏆 Student Leaderboard</h3>
            {leaderboard.map((u) => (
              <div key={u.id} className="lb-row">
                <span className="lb-rank">#{u.rank}</span>
                <span className="lb-name">{u.name}</span>
                <span className="lb-xp">{u.xp.toLocaleString("en-US")} XP · 🔥{u.streak}</span>
              </div>
            ))}
          </section>
        </>
      )}

      {active === "live" && (
        <section className="dash-grid">
          {bookings.length === 0 && (
            <div className="empty-card glass"><p>No live lesson bookings yet.</p></div>
          )}
          {bookings.map((bk) => (
            <article key={bk.id} className="dash-card glass">
              <span className="badge">{bk.liveSession.status}</span>
              <h3>{bk.liveSession.title}</h3>
              <p className="muted small">Teacher: {bk.liveSession.teacher.name}</p>
              <p className="small">🕐 {new Date(bk.liveSession.startsAt).toLocaleString("en-US")}</p>
              <a href={bk.liveSession.roomUrl} target="_blank" rel="noreferrer" className="primary-btn full">
                Join lesson
              </a>
              {bk.liveSession.homework?.length > 0 && (
                <div className="hw-box">
                  <strong>Homework:</strong>
                  {bk.liveSession.homework.map((h) => (
                    <p key={h.id} className="small">📝 {h.title} — {h.description}</p>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      {active === "support" && <SupportPanel />}

      {active === "orders" && (
        <section className="table-card glass">
          <div className="table-row table-head"><span>Course</span><span>Amount</span><span>Date</span></div>
          {orders.map((o) => (
            <div key={o.id} className="table-row">
              <strong>{o.course?.title || o.type}</strong>
              <span>${o.amount}</span>
              <span>{new Date(o.createdAt).toLocaleDateString("en-US")}</span>
            </div>
          ))}
          {orders.length === 0 && <div className="table-empty"><p>No payments yet.</p></div>}
        </section>
      )}
    </DashShell>
  );
}
