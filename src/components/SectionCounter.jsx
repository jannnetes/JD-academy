import { useEffect, useState } from "react";

// Fixed left-edge counter "0X / 0N" that tracks the section in view.
export default function SectionCounter({ total }) {
  const [current, setCurrent] = useState(1);

  useEffect(() => {
    const sections = [...document.querySelectorAll("[data-sec]")];
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const n = Number(e.target.dataset.sec);
            if (n) setCurrent(n);
          }
        });
      },
      { threshold: 0.5 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [total]);

  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="sec-counter" aria-hidden="true">
      <span className="sec-now">{pad(current)}</span>
      <span className="sec-sep">/</span>
      <span className="sec-total">{pad(total)}</span>
    </div>
  );
}
