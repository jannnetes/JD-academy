// Inline SVG social icons (no external libs). Strict brand URLs.
export const SOCIAL = {
  channel: "https://t.me/jd_learn_school",
  support: "https://t.me/jd_learn_admin",
  instagram: "https://www.instagram.com/jd.learn?igsh=dmQzbWl5Y2wxZzMy",
};

export function TelegramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21.9 4.3 18.6 20c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.3-.1-.5-.6-.2L6.1 13.5l-4.8-1.5C.2 11.6.2 10.9 1.6 10.4l18.7-7.2c.9-.3 1.7.2 1.6 1.1Z" fill="currentColor" />
    </svg>
  );
}

export function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}
