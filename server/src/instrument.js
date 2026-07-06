import * as Sentry from "@sentry/node";

// Must be imported before anything else so Sentry can instrument early.
// No-op if SENTRY_DSN isn't set (e.g. local dev).
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
  });
}
