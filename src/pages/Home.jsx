import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Header from "../components/Header.jsx";
import CustomCursor from "../components/CustomCursor.jsx";
import PageLoader from "../components/PageLoader.jsx";
import { api } from "../api";
import { CATEGORIES, categoryForIndustry } from "../categories";
import { useI18n } from "../i18n.jsx";
import { TelegramIcon, InstagramIcon, SOCIAL } from "../components/Social.jsx";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { n: "01", t: "Choose a course", d: "18 directions from practitioners." },
  { n: "02", t: "Learn", d: "Modules, homework, XP & streaks." },
  { n: "03", t: "Grow", d: "Certificate and new opportunities." },
];

export default function Home() {
  const root = useRef(null);
  const { t } = useI18n();
  const [courses, setCourses] = useState([]);
  const [totalCourses, setTotalCourses] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api("/courses").then((c) => {
      setCourses(c.slice(0, 6));
      setTotalCourses(c.length);
    }).catch(() => {});
    api("/live").then(setSessions).catch(() => {});
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const lenis = new Lenis({ duration: 1.4, lerp: 0.08, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    const id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".ef-reveal").forEach((el) => {
        gsap.fromTo(el, { clipPath: "inset(100% 0 0 0)", y: 30 },
          { clipPath: "inset(0% 0 0 0)", y: 0, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%" } });
      });
    }, root);
    return () => ctx.revert();
  }, [courses.length]);

  return (
    <div className="ef" ref={root}>
      <PageLoader />
      <CustomCursor />
      <Header />

      {/* HERO — paper */}
      <section className="ef-sec ef-paper ef-hero">
        <span className="ef-ghost">E</span>
        <span className="ef-vlabel">EST. 2024</span>
        <div className="ef-wrap">
          <p className="ef-kicker">{t("hero.kicker")}</p>
          <h1 className="ef-hero-title">
            <span className="l1"><b>{t("hero.l1")}</b><i className="thin">{t("hero.l1b")}</i></span>
            <span className="l2 stroke">{t("hero.l2")}</span>
            <span className="l3">{t("hero.l3")}</span>
          </h1>
          <div className="ef-hero-foot">
            <Link to="/register" className="ef-pill-cta" data-cursor="GO">{t("hero.cta")}</Link>
            {totalCourses !== null && (
              <span className="ef-mono">{t("hero.note").replace("{n}", totalCourses)}</span>
            )}
          </div>
        </div>
        <div className="ef-rule" />
      </section>

      {/* MARQUEE — coral */}
      <div className="ef-marquee">
        <div className="marquee-track">
          {Array(2).fill(0).map((_, i) => (
            <span key={i} className="ef-marquee-row">LEARN · GROW · EARN · {totalCourses ?? "NEW"} COURSES · LIVE LESSONS · GET CERTIFIED · </span>
          ))}
        </div>
      </div>

      {/* CATEGORIES — paper */}
      <section className="ef-sec ef-paper ef-cats">
        <span className="ef-vlabel">{t("cats.label")}</span>
        <div className="ef-wrap">
          <h2 className="ef-bignum ef-reveal">18 <i>{t("cats.count")}</i></h2>
          <div className="ef-cat-grid">
            {CATEGORIES.map((c, i) => (
              <motion.div key={c.slug} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                <Link to="/catalog" className="ef-cat" style={{ "--c": c.color, "--ct": c.text }} data-cursor="OPEN">
                  {c.icon} {c.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES — dark */}
      <section className="ef-sec ef-ink ef-courses">
        <span className="ef-vlabel light">{t("courses.label")}</span>
        <div className="ef-wrap">
          <h2 className="ef-h2 light ef-reveal"><span>{t("courses.h1")}</span><span className="stroke-w">{t("courses.h2")}</span></h2>
          <div className="ef-course-grid">
            {courses.map((c) => {
              const cat = categoryForIndustry(c.industry) || { color: "#F73B20", text: "#fff", name: c.industry.toUpperCase() };
              return (
                <Link to={`/course/${c.id}`} className="ef-course" key={c.id} style={{ background: cat.color, color: cat.text }} data-cursor="BUY">
                  <h3 className="ef-course-title">{c.title}</h3>
                  <div className="ef-course-rule" />
                  <div className="ef-course-meta ef-mono">[{cat.name}] · ★ {c.rating || "—"} · {c.lessonCount} {t("courses.lessons")}</div>
                  <div className="ef-course-foot ef-mono">
                    <span>{c.teacher?.name}</span><span>${c.price}</span>
                  </div>
                  <span className="ef-course-buy">{t("courses.enroll")}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIVE — coral */}
      <section className="ef-sec ef-coral ef-live">
        <span className="ef-vlabel light">{t("live.label")}</span>
        <div className="ef-wrap">
          <h2 className="ef-live-title stroke-w ef-reveal">LIVE</h2>
          <div className="ef-live-badge"><span className="ef-dot" />{t("live.weekly")}</div>
          <div className="ef-live-list">
            {sessions.slice(0, 4).map((s) => (
              <div className="ef-live-row" key={s.id}>
                <span className="ef-mono">{new Date(s.startsAt).toLocaleDateString("en-US", { day: "2-digit", month: "short" })}</span>
                <span className="ef-live-name">{s.title}</span>
                <span className="ef-mono">{s.teacher?.name}</span>
              </div>
            ))}
            {sessions.length === 0 && <p className="ef-mono">{t("live.updating")}</p>}
          </div>
        </div>
      </section>

      {/* MANIFESTO — paper, swiss 3-col */}
      <section className="ef-sec ef-paper ef-manifesto">
        <span className="ef-vlabel">{t("manifesto.label")}</span>
        <div className="ef-wrap ef-mani-grid">
          <p className="ef-mani-text">{t("manifesto.text1")}<i>{t("manifesto.em")}</i>{t("manifesto.text2")}</p>
          <div className="ef-mani-stats">
            {steps.map((s) => (
              <div key={s.n} className="ef-mani-stat">
                <span className="ef-mani-n">{s.n}</span>
                <strong>{s.t}</strong>
                <span className="ef-mono">{s.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — dark */}
      <section className="ef-sec ef-ink ef-cta">
        <div className="ef-wrap">
          <h2 className="ef-cta-title">
            <span>{t("cta.l1")}</span>
            <span className="stroke-coral">{t("cta.l2")}</span>
          </h2>
          <div className="ef-cta-actions">
            <Link to="/register" className="ef-pill-out coral" data-cursor="GO">{t("cta.student")}</Link>
            <Link to="/register" className="ef-pill-out paper" data-cursor="GO">{t("cta.teacher")}</Link>
          </div>
          <p className="ef-mono ef-copy">{t("cta.copy")}</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ef-footer ef-ink">
        <div className="ef-wrap ef-footer-grid">
          <div className="ef-footer-brand"><span className="jd">JD</span><span className="learn-w">ACADEMY</span></div>
          <div className="ef-footer-social">
            <span className="ef-mono" style={{ opacity: 0.5 }}>{t("footer.follow")}</span>
            <div className="ef-social-row">
              <a href={SOCIAL.channel} target="_blank" rel="noreferrer" className="ef-social"><TelegramIcon /></a>
              <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="ef-social"><InstagramIcon /></a>
              <a href={SOCIAL.support} target="_blank" rel="noreferrer" className="ef-social"><TelegramIcon /></a>
            </div>
            <a href={SOCIAL.support} target="_blank" rel="noreferrer" className="ef-footer-q">{t("footer.questions")}</a>
          </div>
        </div>
        <div className="ef-wrap ef-footer-copy ef-mono">
          {t("footer.rights")}
          <span style={{ marginLeft: 18 }}>
            <Link to="/privacy" style={{ color: "inherit", opacity: 0.6, marginRight: 14 }}>Privacy</Link>
            <Link to="/terms" style={{ color: "inherit", opacity: 0.6, marginRight: 14 }}>Terms</Link>
            <Link to="/impressum" style={{ color: "inherit", opacity: 0.6 }}>Impressum</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
