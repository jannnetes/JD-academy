import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Header from "../components/Header.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useI18n } from "../i18n.jsx";
import { TelegramIcon, InstagramIcon, SOCIAL } from "../components/Social.jsx";

const words = [
  { t: "LEARN", k: "fill" },
  { t: "GROW", k: "stroke" },
  { t: "EARN", k: "acid" },
  { t: "CREATE", k: "fill" },
  { t: "RISE", k: "stroke" },
];

function Count({ to, suffix, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const s = performance.now(); let raf;
    const tick = (now) => { const p = Math.min((now - s) / 1500, 1); setN(Math.floor((1 - Math.pow(1 - p, 3)) * to)); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <div ref={ref} className="au-count">
      <span className="au-count-n">{n}{suffix}</span>
      <span className="au-count-l">{label}</span>
    </div>
  );
}

export default function Auth({ initialMode = "login" }) {
  const { login, register } = useAuth();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(
    new URLSearchParams(window.location.search).get("verified") === "1"
      ? "✓ Email confirmed. Please sign in."
      : new URLSearchParams(window.location.search).get("verified") === "0"
      ? "Invalid or expired confirmation link."
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [wi, setWi] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setWi((i) => (i + 1) % words.length), 2500);
    return () => clearInterval(id);
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        navigate("/dashboard");
      } else {
        const res = await register({ name: form.name, email: form.email, password: form.password, role: form.role, locale });
        setInfo(res.message || "Check your email to confirm registration.");
        setForm({ name: "", email: "", password: "", role: "student" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const heading = mode === "login" ? [t("auth.in1"), t("auth.in2")] : [t("auth.up1"), t("auth.up2")];

  return (
    <div className="au">
      {/* LEFT — form */}
      <motion.div className="au-left" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
        <div className="au-form-wrap">
          <span className="au-crumb">JD ACADEMY / {mode === "login" ? t("nav.signIn") : "SIGN UP"}</span>

          <div className="au-toggle">
            <button className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>{t("auth.signin").toUpperCase()}</button>
            <button className={mode === "register" ? "on" : ""} onClick={() => setMode("register")}>{t("auth.signup").toUpperCase()}</button>
          </div>

          <h1 className="au-title">
            <span className="filled">{heading[0]}</span>
            <span className="outline">{heading[1]}</span>
          </h1>
          <p className="au-sub">{mode === "login" ? t("auth.subIn") : t("auth.subUp")}</p>

          <form onSubmit={submit} className="au-form">
            {mode === "register" && (
              <>
                <div className="au-role">
                  <span className="au-label">{t("auth.youAre")}</span>
                  <div className="au-role-pills">
                    {[["student", t("auth.student"), "cobalt"], ["teacher", t("auth.teacher"), "coral"]].map(([r, l, c]) => (
                      <button type="button" key={r} className={`au-rp ${c} ${form.role === r ? "on" : ""}`} onClick={() => setForm({ ...form, role: r })}>{l}</button>
                    ))}
                  </div>
                </div>
                <label className="au-field">
                  <span className="au-label">{t("auth.name")}</span>
                  <input value={form.name} onChange={set("name")} placeholder="Your name" required />
                </label>
              </>
            )}
            <label className="au-field">
              <span className="au-label">{t("auth.email")}</span>
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" required />
            </label>
            <label className="au-field">
              <span className="au-label">{t("auth.password")}</span>
              <div className="au-pw">
                <input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="••••••" required />
                <button type="button" className="au-pw-toggle" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </label>

            {mode === "login" && (
              <Link to="/reset-password" className="au-forgot">{t("auth.forgotLink")}</Link>
            )}

            {error && <p className="au-error">! {error}</p>}
            {info && <p className="au-info">{info}</p>}

            <button className="au-submit" disabled={loading}>
              {loading ? <span className="au-spin" /> : (mode === "login" ? t("auth.submitIn") : t("auth.submitUp"))}
            </button>

            {mode === "register" && (
              <p className="au-legal">
                By creating an account you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
              </p>
            )}
          </form>

          <p className="au-switch">
            {mode === "login" ? t("auth.noAcc") : t("auth.hasAcc")}
            <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? t("auth.signup") : t("auth.signin")}
            </button>
          </p>
        </div>
      </motion.div>

      {/* RIGHT — typographic decor */}
      <div className="au-right">
        <span className="au-bigE">E</span>
        <span className="au-vtext">KNOWLEDGE WITHOUT BORDERS — EDUFLOW 2024</span>

        <div className="au-words">
          <AnimatePresence mode="wait">
            <motion.span
              key={wi}
              className={`au-word ${words[wi].k}`}
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: "inset(0 0 0 0)" }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            >
              {words[wi].t}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="au-counts">
          <Count to={10} suffix="K+" label="STUDENTS" />
          <Count to={500} suffix="+" label="COURSES" />
          <Count to={200} suffix="+" label="TEACHERS" />
        </div>

        <div className="au-community">
          <span className="au-comm-label">{t("auth.community")}</span>
          <div className="au-comm-icons">
            <a href={SOCIAL.channel} target="_blank" rel="noreferrer"><TelegramIcon /></a>
            <a href={SOCIAL.instagram} target="_blank" rel="noreferrer"><InstagramIcon /></a>
            <a href={SOCIAL.support} target="_blank" rel="noreferrer"><TelegramIcon /></a>
          </div>
        </div>
      </div>

      <Header />
    </div>
  );
}
