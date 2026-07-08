// Course covers are either a legacy raw CSS background value (gradients from
// seed data) or an uploaded image URL — tell them apart and render each right.
export function coverStyle(cover, fallback) {
  if (!cover) return { background: fallback || "var(--accent)" };
  if (/^https?:\/\//.test(cover)) {
    return { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  return { background: cover };
}
