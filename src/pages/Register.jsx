import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
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
          <span className="eyebrow">Реєстрація</span>
          <h1>Створіть акаунт</h1>
          <p className="muted">Оберіть, хто ви на платформі.</p>

          <div className="role-switch">
            <button
              type="button"
              className={form.role === "student" ? "active" : ""}
              onClick={() => setForm({ ...form, role: "student" })}
            >
              🎓 Я учень
            </button>
            <button
              type="button"
              className={form.role === "teacher" ? "active" : ""}
              onClick={() => setForm({ ...form, role: "teacher" })}
            >
              👩‍🏫 Я викладач
            </button>
          </div>

          <form onSubmit={submit} className="auth-form">
            <label>
              Ім’я
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ваше ім’я"
                required
              />
            </label>
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
                placeholder="Мінімум 6 символів"
                required
              />
            </label>

            {error && <div className="form-status error"><span>!</span><p>{error}</p></div>}

            <button className="primary-btn full" disabled={loading}>
              {loading ? "Створюємо..." : "Зареєструватися"}
            </button>
          </form>

          <p className="muted small">
            Вже є акаунт? <Link to="/login" className="link">Увійти</Link>
          </p>
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
