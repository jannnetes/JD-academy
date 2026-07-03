import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Global reveal-on-scroll: any matching element fades/rises in when it enters
// the viewport. Catches async-loaded cards via a MutationObserver. Renders nothing.
const SELECTORS = [
  ".bs-card", ".bs-teach", ".dash-card", ".stat-card", ".badge-card",
  ".ef-course", ".lz-card", ".mag-course", ".lz-flip", ".price-card",
  ".review-card", ".bs-step", "[data-reveal]",
].join(",");

export default function Reveal() {
  const location = useLocation();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("rv-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    const attach = (root) => {
      const els = root.querySelectorAll ? root.querySelectorAll(SELECTORS) : [];
      els.forEach((el, i) => {
        if (el.classList.contains("rv")) return;
        el.classList.add("rv");
        el.style.transitionDelay = `${Math.min(i % 8, 8) * 40}ms`;
        io.observe(el);
      });
    };

    // initial + slightly delayed (data loads from API after mount)
    attach(document);
    const t1 = setTimeout(() => attach(document), 250);
    const t2 = setTimeout(() => attach(document), 900);

    // catch dynamically added nodes
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) attach(n.parentNode || n); }));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); clearTimeout(t1); clearTimeout(t2); };
  }, [location.pathname]);

  return null;
}
