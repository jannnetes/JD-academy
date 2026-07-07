import "dotenv/config";
import "./instrument.js";
import * as Sentry from "@sentry/node";
import dns from "node:dns";
import net from "node:net";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

// Some hosts (e.g. Railway) have no outbound IPv6 route. Node's Happy
// Eyeballs algorithm (net.connect autoSelectFamily, default since Node 20)
// still races an IPv6 attempt regardless of DNS result order, so it isn't
// enough to just reorder lookups — the dual-stack race itself has to be
// disabled to reliably connect over IPv4 only (fixes SMTP ENETUNREACH).
dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);

import { attachUser } from "./auth.js";
import { corsOptions, helmetMw, hppMw, globalLimiter, authLimiter } from "./security.js";
import { stripeWebhookHandler } from "./routes/stripeWebhook.js";
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import liveRoutes from "./routes/liveRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import meRoutes from "./routes/meRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmetMw);
app.use(cors(corsOptions));
app.use(hppMw);

// Stripe needs the raw, unparsed body to verify the webhook signature —
// must be registered before the global express.json() below.
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhookHandler);

app.use(express.json({ limit: "2mb" }));
app.use("/api", globalLimiter);
app.use(attachUser);

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "jdacademy" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollment", enrollmentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/live", liveRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/me", meRoutes);
app.use("/api/stream", streamRoutes);

// Production: serve the built frontend (dist) as static + SPA fallback
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "../../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

Sentry.setupExpressErrorHandler(app);

// Central error handler — never leak stack traces in production
app.use((err, _req, res, _next) => {
  console.error(err);
  const isProd = process.env.NODE_ENV === "production";
  res.status(err.status || 500).json({
    error: isProd ? "Internal server error" : err.message,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 JD Academy API running on http://localhost:${PORT}`);
});
