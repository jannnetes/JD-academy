import { useEffect, useState } from "react";
import DashShell from "../../components/DashShell.jsx";
import { api } from "../../api";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "review", label: "Course Review" },
  { id: "users", label: "Users" },
  { id: "orders", label: "Finances" },
  { id: "fees", label: "Fees" },
];

export default function AdminDashboard() {
  const [active, setActive] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [fees, setFees] = useState([]);
  const [pending, setPending] = useState([]);

  function reload() {
    api("/admin/stats").then(setStats).catch(() => {});
    api("/admin/users").then(setUsers).catch(() => {});
    api("/admin/orders").then(setOrders).catch(() => {});
    api("/admin/fees").then(setFees).catch(() => {});
    api("/admin/courses/pending").then(setPending).catch(() => {});
  }
  useEffect(reload, []);

  async function changeRole(id, role) {
    await api(`/admin/users/${id}/role`, { method: "PATCH", body: { role } });
    reload();
  }
  async function changeFee(type, percent) {
    await api(`/admin/fees/${type}`, { method: "PUT", body: { percent: Number(percent) } });
    reload();
  }
  async function approveCourse(c) {
    await api(`/admin/courses/${c.id}/review`, { method: "PATCH", body: { approve: true } });
    reload();
  }
  async function rejectCourse(c) {
    const reason = prompt("Why is this course being rejected? (visible to the teacher)");
    if (reason === null) return;
    await api(`/admin/courses/${c.id}/review`, { method: "PATCH", body: { approve: false, reason } });
    reload();
  }

  return (
    <DashShell tabs={tabs} active={active} onTab={setActive}>
      {active === "overview" && stats && (
        <section className="stat-grid">
          <div className="stat-card glass"><span className="stat-num">{stats.users}</span><span className="muted">Users</span></div>
          <div className="stat-card glass"><span className="stat-num">{stats.courses}</span><span className="muted">Courses</span></div>
          <div className="stat-card glass accent"><span className="stat-num">${stats.platformRevenue}</span><span className="muted">Platform Revenue</span></div>
          <div className="stat-card glass"><span className="stat-num">${stats.gmv}</span><span className="muted">GMV</span></div>
        </section>
      )}

      {active === "review" && (
        <section className="table-card glass">
          {pending.length === 0 && <div className="table-empty"><p>No courses waiting for review.</p></div>}
          {pending.map((c) => (
            <div key={c.id} className="table-row wide" style={{ alignItems: "center" }}>
              <div>
                <strong>{c.title}</strong>
                <p className="muted small">{c.industry} · {c._count.modules} modules · ${c.basePrice}</p>
              </div>
              <span className="muted small">{c.teacher.name} · {c.teacher.email}</span>
              <div style={{ display: "flex", gap: 10 }}>
                <a href={`/course/${c.id}`} target="_blank" rel="noreferrer" className="secondary-btn">Preview</a>
                <button className="primary-btn" onClick={() => approveCourse(c)}>Approve</button>
                <button className="secondary-btn" onClick={() => rejectCourse(c)}>Reject</button>
              </div>
            </div>
          ))}
        </section>
      )}

      {active === "users" && (
        <section className="table-card glass">
          <div className="table-row table-head wide"><span>Name</span><span>Email</span><span>Role</span></div>
          {users.map((u) => (
            <div key={u.id} className="table-row wide">
              <strong>{u.name}</strong>
              <span className="muted small">{u.email}</span>
              <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}>
                <option value="student">student</option>
                <option value="teacher">teacher</option>
                <option value="admin">admin</option>
              </select>
            </div>
          ))}
        </section>
      )}

      {active === "orders" && (
        <section className="table-card glass">
          <div className="table-row table-head wide"><span>Buyer</span><span>Course</span><span>Amount / Fee</span></div>
          {orders.map((o) => (
            <div key={o.id} className="table-row wide">
              <strong>{o.buyer.name}</strong>
              <span className="muted small">{o.course?.title || o.type}</span>
              <span>${o.amount} <span className="accent-text">(+{o.platformFee})</span></span>
            </div>
          ))}
          {orders.length === 0 && <div className="table-empty"><p>No orders yet.</p></div>}
        </section>
      )}

      {active === "fees" && (
        <section className="form-card glass">
          <h2>Platform Fees</h2>
          <p className="muted small">Changes apply to new purchases. Historical orders are not recalculated.</p>
          {fees.map((f) => (
            <div key={f.id} className="fee-row">
              <span>{f.type === "course" ? "Course purchase" : f.type === "live" ? "Live session" : "Publishing"}</span>
              <input
                type="number"
                defaultValue={f.percent}
                onBlur={(e) => changeFee(f.type, e.target.value)}
              />
              <span>%</span>
            </div>
          ))}
        </section>
      )}
    </DashShell>
  );
}
