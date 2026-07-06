const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

let loaded = false;

// Only called after the user accepts the cookie banner — GDPR requires
// consent before tracking scripts run, not just before we "use" the data.
export function loadAnalytics() {
  if (loaded) return;
  loaded = true;

  if (GA_ID) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID);
  }

  if (PIXEL_ID) {
    /* eslint-disable */
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }
}

// Fire a conversion event on both GA4 and Meta Pixel, if loaded/configured.
export function trackEvent(name, params = {}) {
  if (window.gtag) window.gtag("event", name, params);
  if (window.fbq) window.fbq("trackCustom", name, params);
}
