import { Router } from "express";
import { Readable } from "node:stream";
import { prisma } from "../prisma.js";
import { verifyVideoToken } from "../auth.js";

const router = Router();

// Public (token-gated, not session-gated) — proxies the actual video bytes
// so the real origin URL is never exposed to the browser. Supports Range
// requests so <video> scrubbing/seeking still works.
router.get("/lesson/:lessonId", async (req, res) => {
  let payload;
  try {
    payload = verifyVideoToken(req.query.token || "");
  } catch {
    return res.status(403).send("Link expired or invalid — reopen the lesson to get a fresh one.");
  }
  if (payload.lessonId !== req.params.lessonId) {
    return res.status(403).send("Invalid link");
  }

  const lesson = await prisma.lesson.findUnique({ where: { id: req.params.lessonId } });
  if (!lesson?.videoUrl) return res.status(404).send("Not found");

  const upstream = await fetch(lesson.videoUrl, {
    headers: req.headers.range ? { Range: req.headers.range } : {},
  });
  if (!upstream.ok && upstream.status !== 206) {
    return res.status(502).send("Could not load video");
  }

  res.status(upstream.status);
  res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
  for (const header of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const value = upstream.headers.get(header);
    if (value) res.setHeader(header, value);
  }
  Readable.fromWeb(upstream.body).pipe(res);
});

export default router;
