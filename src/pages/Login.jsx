import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

const demos = [
  { label: "Учень", email: "student@jdlearn.com", password: "student123" },
  { label: "Викладач", email: "teacher@jdlearn.com", password: "teacher123" },
  { label: "Адмін", email: "admin@jdlearn.com", password: "admin123" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="site">
      <Header />
      <section className="auth-wrap">
        <motion.div
          className="auth-card glass"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">Вхід</span>
          <h1>З поверненням 👋</h1>
          <p className="muted">Увійдіть, щоб продовжити навчання.</p>

          <form onSubmit={submit} className="auth-form">
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@email.com"
                required
              />
            </label>
            <label>
              Пароль
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••"
                required
              />
            </label>

            {error && <div className="form-status error"><span>!</span><p>{error}</p></div>}

            <button className="primary-btn full" disabled={loading}>
              {loading ? "Входимо..." : "Увійти"}
            </button>
          </form>

          <p className="muted small">
            Немає акаунту? <Link to="/register" className="link">Зареєструватися</Link>
          </p>

          <div className="demo-box">
            <p className="small muted">Демо-акаунти (один клік):</p>
            <div className="demo-chips">
              {demos.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  className="chip"
                  onClick={() => setForm({ email: d.email, password: d.password })}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="auth-aside">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
      </section>
    </main>
  );
}
