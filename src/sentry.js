import * as Sentry from "@sentry/react";

const DSN = import.meta.env.VITE_SENTRY_DSN;

// No-op when unset (e.g. local dev) — error monitoring, not a tracking
// cookie, so it doesn't need to wait behind the cookie consent banner.
if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE,
  });
}
