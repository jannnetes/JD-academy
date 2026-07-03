import { useEffect, useRef, useState } from "react";

// Desktop-only circular cursor; label changes via [data-cursor] on hovered els.
export default function CustomCursor() {
  const dot = useRef(null);
  const [label, setLabel] = useState("LEARN");
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.body.classList.add("has-custom-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf;

    const move = (e) => {
      x = e.clientX; y = e.clientY;
      const t = e.target.closest && e.target.closest("[data-cursor], a, button, .magnetic");
      if (t) {
        setActive(true);
        setLabel(t.dataset?.cursor || "OPEN");
      } else {
        setActive(false);
        setLabel("LEARN");
      }
    };
    const leave = () => setHidden(true);
    const enter = () => setHidden(false);
    const loop = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      if (dot.current) dot.current.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div ref={dot} className={`cursor-ring ${active ? "active" : ""} ${hidden ? "hidden" : ""}`} aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}
