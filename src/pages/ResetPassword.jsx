import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header.jsx";
import { api } from "../api";
import { useI18n } from "../i18n.jsx";

export default function ResetPassword() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestLink(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await api("/auth/forgot-password", { method: "POST", body: { email, locale } });
      setInfo(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitNewPassword(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      await api("/auth/reset-password", { method: "POST", body: { token, password } });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const heading = token ? [t("auth.newPass1"), t("auth.newPass2")] : [t("auth.forgot1"), t("auth.forgot2")];

  return (
    <div className="au" style={{ gridTemplateColumns: "1fr" }}>
      <motion.div className="au-left" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="au-form-wrap">
          <span className="au-crumb">JD ACADEMY / {token ? "RESET" : "FORGOT PASSWORD"}</span>
          <h1 className="au-title">
            <span className="filled">{heading[0]}</span>
            <span className="outline">{heading[1]}</span>
          </h1>
          <p className="au-sub">{token ? t("auth.newPassSub") : t("auth.forgotSub")}</p>

          {token ? (
            <form onSubmit={submitNewPassword} className="au-form">
              <label className="au-field">
                <span className="au-label">{t("auth.password")}</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required minLength={6} />
              </label>
              {error && <p className="au-error">! {error}</p>}
              {info && <p className="au-info">{info}</p>}
              <button className="au-submit" disabled={loading}>
                {loading ? <span className="au-spin" /> : t("auth.setNewPass")}
              </button>
            </form>
          ) : (
            <form onSubmit={requestLink} className="au-form">
              <label className="au-field">
                <span className="au-label">{t("auth.email")}</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
              </label>
              {error && <p className="au-error">! {error}</p>}
              {info && <p className="au-info">{info}</p>}
              <button className="au-submit" disabled={loading}>
                {loading ? <span className="au-spin" /> : t("auth.sendReset")}
              </button>
            </form>
          )}

          <p className="au-switch">
            <Link to="/login">{t("auth.backToLogin")}</Link>
          </p>
        </div>
      </motion.div>
      <Header />
    </div>
  );
}
