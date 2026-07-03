import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

// CORS allowlist — only our own origins.
const ALLOWED = [
  process.env.CLIENT_URL,
  process.env.SITE_URL,
  "http://localhost:5173",
  "http://localhost:4000",
  "https://jd-learn.netlify.app",
].filter(Boolean);

// If no production frontend URL is configured, allow all origins (so a fresh
// deploy works out of the box). Once CLIENT_URL/SITE_URL is set, lock to the list.
const HAS_PROD_ORIGIN = !!(process.env.CLIENT_URL || process.env.SITE_URL);

export const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (ALLOWED.includes(origin)) return cb(null, true);
    if (!HAS_PROD_ORIGIN) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// CSP disabled on purpose: the app loads Google Fonts, an external Apps Script
// endpoint, data: images and three.js blob workers — a strict CSP would break
// them. All other hardening headers (noSniff, frameguard, HSTS, etc.) stay on.
export const helmetMw = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

export const hppMw = hpp();

// Brute-force / abuse protection.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, try again later." },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Too many auth attempts. Try again in 15 minutes." },
});
