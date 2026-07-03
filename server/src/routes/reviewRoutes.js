import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../auth.js";

const router = Router();

// Leave a review for a purchased course
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
  const { rating, text } = req.body || {};
  const review = await prisma.review.create({
    data: {
      courseId: req.params.courseId,
      studentId: req.user.id,
      rating: Number(rating) || 5,
      text: text || "",
      status: "published",
    },
  });
  res.json(review);
});

export default router;
