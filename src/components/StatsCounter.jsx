import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function Counter({ to, suffix, label, decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(eased * to);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  const display = decimals
    ? n.toFixed(decimals)
    : Math.floor(n).toLocaleString("uk-UA");

  return (
    <div ref={ref} className="stat-counter">
      <span className="stat-counter-num">
        {display}
        {suffix}
      </span>
      <span className="stat-counter-label">{label}</span>
    </div>
  );
}

export default function StatsCounter() {
  return (
    <section className="stats-strip">
      <Counter to={10000} suffix="+" label="Active students" />
      <Counter to={500} suffix="+" label="Courses in catalog" />
      <Counter to={200} suffix="+" label="Expert teachers" />
      <Counter to={4.9} decimals={1} suffix="★" label="Average rating" />
    </section>
  );
}
