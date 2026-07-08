import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();

// Must live inside the same persistent volume as the SQLite DB (see
// DATABASE_URL) — anything outside it gets wiped on the next deploy.
export const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED = {
  "application/pdf": ".pdf",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Re-check on every write, not just at boot — cheap, and guards
    // against the directory disappearing underneath a long-running process.
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = ALLOWED[file.mimetype] || path.extname(file.originalname) || "";
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED[file.mimetype]) return cb(new Error("Only PDF or image files (PNG/JPG/GIF/WEBP) are allowed"));
    cb(null, true);
  },
});

router.post("/", requireAuth, requireRole("teacher", "admin"), (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const base = process.env.API_URL || "";
    res.json({ url: `${base}/uploads/${req.file.filename}`, name: req.file.originalname });
  });
});

export default router;
