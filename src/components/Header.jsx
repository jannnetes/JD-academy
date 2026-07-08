import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext.jsx";
import { useI18n } from "../i18n.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { TelegramIcon, SOCIAL } from "./Social.jsx";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const links = [
    { to: "/catalog", label: t("nav.catalog") },
    { to: "/live", label: t("nav.live") },
    { to: "/teachers", label: t("nav.teachers") },
  ];

  const close = () => setOpen(false);
  function handleLogout() { logout(); close(); navigate("/"); }

  return (
    <>
      <div className="ef-nav-dock">
        <motion.nav
          className="ef-nav"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
        <LanguageSwitcher />
        <span className="ef-nav-sep" />
        <Link to="/" className="jd-logo" onClick={close}><span className="jd">JD</span><span className="learn">ACADEMY</span></Link>
        <span className="ef-nav-sep" />
        <div className="ef-nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? "ef-nav-link active" : "ef-nav-link")}>
              {l.label}
            </NavLink>
          ))}
        </div>
        <span className="ef-nav-tg-wrap">
          <a href={SOCIAL.channel} target="_blank" rel="noreferrer" className="ef-nav-tg" title="Our channel"><TelegramIcon size={18} /></a>
          <span className="ef-nav-sep" />
        </span>
        {user ? (
          <>
            <Link to="/dashboard" className="ef-nav-link">{t("nav.dashboard")}</Link>
            <button className="ef-pill-out" onClick={handleLogout}>{t("nav.signOut")}</button>
          </>
        ) : (
          <>
            <Link to="/login" className="ef-nav-link">{t("nav.signIn")}</Link>
            <Link to="/register" className="ef-pill-out">{t("nav.getStarted")}</Link>
          </>
        )}
        </motion.nav>
      </div>

      <button className="ef-burger" onClick={() => setOpen(true)} aria-label="Menu">☰</button>

      <div className={`ef-overlay ${open ? "show" : ""}`}>
        <button className="ef-overlay-close" onClick={close} aria-label="Close">✕</button>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className="ef-over-link" onClick={close}>{l.label}</NavLink>
        ))}
        {user ? (
          <>
            <NavLink to="/dashboard" className="ef-over-link" onClick={close}>{t("nav.dashboard")}</NavLink>
            <button className="ef-over-link asbtn" onClick={handleLogout}>{t("nav.signOut")}</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="ef-over-link" onClick={close}>{t("nav.signIn")}</NavLink>
            <NavLink to="/register" className="ef-over-link acid" onClick={close}>{t("nav.getStarted")}</NavLink>
          </>
        )}
        <div className="ef-over-lang"><LanguageSwitcher /></div>
      </div>
    </>
  );
}
