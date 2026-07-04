import { useEffect, useRef, useState, useCallback } from "react";

// Photo-based dachshund companion. Expects transparent PNGs in /public/dog/.
// Moods: peek (default), run, headphones (catalog/courses), lick (click).
const IMAGES = {
  peek: "/dog/dog-peek.png",
  run: "/dog/dog-run.png",
  headphones: "/dog/dog-headphones.png",
  lick: "/dog/dog-lick.png",
};

export default function DachshundCompanion({ onBroken }) {
  const ref = useRef(null);
  const [mood, setMood] = useState("peek");
  const [x, setX] = useState(50);          // % of viewport width
  const [flip, setFlip] = useState(false);
  const [msg, setMsg] = useState(null);
  const lastY = useRef(0);
  const runTo = useRef(null);
  const msgTimer = useRef(null);
  const moodTimer = useRef(null);

  const say = useCallback((text) => {
    setMsg(text);
    clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMsg(null), 2800);
  }, []);

  // scroll → wander horizontally with a wobble, run mood while moving
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    lastY.current = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;
        lastY.current = y;
        const total = Math.max(1, document.body.scrollHeight - window.innerHeight);
        const p = Math.min(1, Math.max(0, y / total));
        const target = Math.max(8, Math.min(92, 10 + p * 80 + Math.sin(p * Math.PI * 4) * 14));
        if (Math.abs(delta) > 6) {
          setFlip(target < x);
          setMood((m) => (m === "headphones" ? m : "run"));
          setX(target);
          clearTimeout(runTo.current);
          runTo.current = setTimeout(() => setMood((m) => (m === "run" ? "peek" : m)), 700);
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [x]);

  // headphones mood + message while the courses section is in view
  useEffect(() => {
    const el = document.querySelector(".ef-courses, .cat-grid");
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setMood("headphones"); say("So many courses 🎧"); }
        else setMood((m) => (m === "headphones" ? "peek" : m));
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [say]);

  function handleClick() {
    setMood("lick");
    say("Woof! 🐾");
    const el = ref.current;
    if (el) {
      el.classList.remove("dog-jump");
      void el.offsetWidth; // restart animation
      el.classList.add("dog-jump");
    }
    clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setMood("peek"), 1400);
  }

  return (
    <>
      <div
        ref={ref}
        className={`dogc mood-${mood}`}
        style={{ left: `${x}%` }}
        onClick={handleClick}
        role="button"
        aria-label="JD Academy mascot"
      >
        <img
          src={IMAGES[mood] || IMAGES.peek}
          alt="JD Academy dachshund mascot"
          className="dogc-img"
          style={{ transform: flip ? "scaleX(-1)" : "scaleX(1)" }}
          onError={() => onBroken && onBroken()}
          draggable="false"
        />
        <span className="dogc-shadow" />
      </div>
      {msg && <div className="dogc-msg" style={{ left: `${x}%` }}>{msg}</div>}
    </>
  );
}
