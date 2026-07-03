import { useEffect, useState } from "react";

const KEY = "jdlearn_theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(KEY) || document.documentElement.dataset.theme || "light"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <span className="theme-toggle-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}
