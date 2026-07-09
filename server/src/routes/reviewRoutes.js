import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../auth.js";
import { notify } from "../notifications.js";

const router = Router();

// This student's own review for a course (for pre-filling the edit form).
router.get("/mine/:courseId", requireAuth, async (req, res) => {
  const review = await prisma.review.findUnique({
    where: { courseId_studentId: { courseId: req.params.courseId, studentId: req.user.id } },
  });
  res.json(review || null);
});

// Leave (or edit) a review for a purchased course.
router.post("/:courseId", requireAuth, async (req, res) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: req.user.id,
        courseId: req.params.courseId,
      },
    },
  });
  if (!enrollment) {
    return res.status(403).json({ error: "Відгук можна залишити лише після покупки" });
  }
  const ratingNum = Math.round(Number(req.body?.rating));
  const rating = Number.isFinite(ratingNum) ? Math.min(5, Math.max(1, ratingNum)) : 5;
  const text = String(req.body?.text || "").slice(0, 2000);

  const existed = await prisma.review.findUnique({
    where: { courseId_studentId: { courseId: req.params.courseId, studentId: req.user.id } },
  });
  const review = await prisma.review.upsert({
    where: { courseId_studentId: { courseId: req.params.courseId, studentId: req.user.id } },
    create: { courseId: req.params.courseId, studentId: req.user.id, rating, text, status: "published" },
    update: { rating, text },
  });

  if (!existed) {
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (course) {
      await notify(course.teacherId, {
        type: "new_review",
        title: `New ${review.rating}★ review`,
        body: `Someone reviewed "${course.title}": "${review.text.slice(0, 80)}"`,
        link: `/course/${course.id}`,
      });
    }
  }

  res.json(review);
});

export default router;
