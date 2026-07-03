import { useEffect, useRef } from "react";

// A minimalist dachshund that runs along the bottom edge on scroll and barks on click.
// Pure SVG + vanilla JS, public pages only. Respects reduced-motion.
export default function ScrollDog() {
  const wrap = useRef(null);
  const svg = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = wrap.current;
    if (!el) return;

    let pos = 80;
    let lastY = window.scrollY;
    let idleTimer;
    const maxX = () => window.innerWidth - 150;

    el.style.left = pos + "px";

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (Math.abs(delta) < 2) return;
      const dir = delta > 0 ? 1 : -1;
      pos += dir * Math.min(Math.abs(delta) * 0.7, 22);
      pos = Math.max(16, Math.min(pos, maxX()));
      el.style.left = pos + "px";
      el.classList.add("running");
      if (svg.current) svg.current.style.transform = dir === -1 ? "scaleX(-1)" : "scaleX(1)";
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => el.classList.remove("running"), 400);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(idleTimer); };
  }, []);

  function bark() {
    const el = wrap.current;
    if (!el) return;
    const woof = document.createElement("div");
    woof.className = "dog-woof";
    woof.textContent = "Woof! 🐾";
    el.appendChild(woof);
    el.classList.add("jump");
    setTimeout(() => el.classList.remove("jump"), 500);
    setTimeout(() => woof.remove(), 1300);
  }

  return (
    <div className="jd-dog-wrap" ref={wrap} onClick={bark} role="button" aria-label="Pet the dog">
      <svg ref={svg} className="jd-dog" viewBox="0 0 120 52" width="96" height="42" aria-hidden="true">
        <ellipse cx="60" cy="32" rx="38" ry="12" fill="#0D0D0D" />
        <circle cx="96" cy="24" r="13" fill="#0D0D0D" />
        <ellipse cx="106" cy="22" rx="4" ry="3" fill="#F7F4EE" />
        <circle cx="100" cy="19" r="2.5" fill="#F7F4EE" />
        <circle cx="101" cy="18.5" r="1" fill="#0D0D0D" />
        <ellipse cx="93" cy="13" rx="6" ry="9" fill="#0D0D0D" transform="rotate(-20 93 13)" />
        <rect className="leg lg-a" x="82" y="40" width="6" height="11" rx="3" fill="#0D0D0D" />
        <rect className="leg lg-b" x="72" y="40" width="6" height="11" rx="3" fill="#0D0D0D" />
        <rect className="leg lg-a" x="36" y="40" width="6" height="11" rx="3" fill="#0D0D0D" />
        <rect className="leg lg-b" x="26" y="40" width="6" height="11" rx="3" fill="#0D0D0D" />
        <path className="dog-tail" d="M22 30 Q10 20 8 12" stroke="#0D0D0D" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
