import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashShell from "../../components/DashShell.jsx";
import GamificationBar from "../../components/GamificationBar.jsx";
import SupportPanel from "../../components/SupportPanel.jsx";
import { api } from "../../api";

const tabs = [
  { id: "courses", label: "My Learning" },
  { id: "wishlist", label: "Wishlist" },
  { id: "achievements", label: "Achievements" },
  { id: "certificates", label: "Certificates" },
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
  const [wishlist, setWishlist] = useState([]);
  const [certificates, setCertificates] = useState([]);

  function reloadWishlist() {
    api("/enrollment/wishlist").then(setWishlist).catch(() => {});
  }
  useEffect(() => {
    api("/enrollment/my-courses").then(setEnrollments).catch(() => {});
    api("/live/my-bookings").then(setBookings).catch(() => {});
    api("/enrollment/orders").then(setOrders).catch(() => {});
    api("/me/gamification").then(setGami).catch(() => {});
    api("/me/leaderboard").then(setLeaderboard).catch(() => {});
    api("/enrollment/certificates").then(setCertificates).catch(() => {});
    reloadWishlist();
  }, []);

  async function removeFromWishlist(courseId) {
    await api(`/enrollment/wishlist/${courseId}`, { method: "DELETE" });
    reloadWishlist();
  }

  return (
    <DashShell tabs={tabs} active={active} onTab={setActive}>
      <GamificationBar data={gami} onCertificatesClick={() => setActive("certificates")} />

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

      {active === "wishlist" && (
        <section className="dash-grid">
          {wishlist.length === 0 && (
            <div className="empty-card glass">
              <p>Nothing saved yet.</p>
              <Link to="/catalog" className="primary-btn">Browse catalog</Link>
            </div>
          )}
          {wishlist.map((w) => (
            <article key={w.id} className="dash-card glass">
              <div className="dash-card-cover" style={{ background: w.course.cover }} />
              <h3>{w.course.title}</h3>
              <p className="muted small">Teacher: {w.course.teacher.name} · {w.course.students} students</p>
              <Link to={`/course/${w.courseId}`} className="primary-btn full">View course</Link>
              <button className="secondary-btn full" onClick={() => removeFromWishlist(w.courseId)}>Remove</button>
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

      {active === "certificates" && (
        <section className="dash-grid">
          {certificates.length === 0 && (
            <div className="empty-card glass">
              <p>No certificates yet — finish a course 100% to earn one.</p>
              <Link to="/dashboard" className="primary-btn">Continue learning</Link>
            </div>
          )}
          {certificates.map((c) => (
            <article key={c.id} className="dash-card glass cert-list-card">
              <span className="cert-seal">🎓</span>
              <h3>{c.course.title}</h3>
              <p className="muted small">Teacher: {c.course.teacher.name}</p>
              <p className="muted small">Issued {new Date(c.issuedAt).toLocaleDateString("en-US")}</p>
              <Link to={`/certificate/${c.id}`} className="primary-btn full">View & Download</Link>
            </article>
          ))}
        </section>
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
