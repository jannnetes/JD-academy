import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadAnalytics } from "../analytics";

const KEY = "jdacademy_cookie_consent"; // "accepted" | "declined"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "accepted") {
      loadAnalytics();
    } else if (!saved) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(KEY, "accepted");
    loadAnalytics();
    setVisible(false);
  }
  function decline() {
    localStorage.setItem(KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <p className="cookie-text">
        We use cookies to run this site and, with your consent, to understand how it's used (analytics).{" "}
        <Link to="/privacy">Learn more</Link>.
      </p>
      <div className="cookie-actions">
        <button className="secondary-btn" onClick={decline}>Necessary only</button>
        <button className="primary-btn" onClick={accept}>Accept all</button>
      </div>
    </div>
  );
}
