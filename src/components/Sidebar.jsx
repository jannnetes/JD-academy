import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const brand = { student: "EDUFLOW", teacher: "STUDIO", admin: "ADMIN" };
const roleLabel = { student: "STUDENT", teacher: "TEACHER", admin: "ADMIN" };

export default function Sidebar({ tabs, active, onTab }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "student";
  const initials = (user?.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <aside className="dash-side">
      <div className="side-top">
        <Link to="/" className="side-logo">JD</Link>
        <span className="side-brand">{brand[role]}</span>
      </div>

      <nav className="side-nav">
        {tabs.map((t) => (
          <button key={t.id} className={active === t.id ? "side-link active" : "side-link"} onClick={() => onTab(t.id)}>
            <span className="side-mark" />{t.label}
          </button>
        ))}
      </nav>

      <div className="side-foot">
        <div className="side-user">
          <span className="side-ava">{initials}</span>
          <div>
            <div className="side-name">{user?.name}</div>
            <div className="side-role">{roleLabel[role]}</div>
          </div>
        </div>
        <button className="side-exit" onClick={handleLogout}>SIGN OUT →</button>
      </div>
    </aside>
  );
}
