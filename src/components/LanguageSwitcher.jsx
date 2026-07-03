import { useEffect, useRef, useState } from "react";
import { LOCALES, useI18n } from "../i18n.jsx";

// Globe-style locale picker; dropdown opens upward (navbar sits at the bottom).
export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="lang" ref={ref}>
      <button className="lang-btn" onClick={() => setOpen(!open)} aria-label="Language">
        <span>{current.flag}</span><span className="lang-caret">▾</span>
      </button>
      {open && (
        <div className="lang-menu">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              className={`lang-opt ${l.code === locale ? "on" : ""}`}
              onClick={() => { setLocale(l.code); setOpen(false); }}
            >
              <span>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
