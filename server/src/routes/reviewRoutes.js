import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../auth.js";
import { notify } from "../notifications.js";

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

  const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
  if (course) {
    await notify(course.teacherId, {
      type: "new_review",
      title: `New ${review.rating}★ review`,
      body: `Someone reviewed "${course.title}": "${review.text.slice(0, 80)}"`,
      link: `/course/${course.id}`,
    });
  }

  res.json(review);
});

export default router;
