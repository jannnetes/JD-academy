import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();

router.use(requireAuth, requireRole("teacher", "admin"));

// Teacher's own courses (with full module/lesson tree for the builder)
router.get("/courses", async (req, res) => {
  const courses = await prisma.course.findMany({
    where: { teacherId: req.user.id },
    include: {
      _count: { select: { enrollments: true } },
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" }, include: { homework: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(
    courses.map((c) => ({
      ...c,
      topics: c.topics.split(",").map((x) => x.trim()).filter(Boolean),
      students: c._count.enrollments,
      lessonCount: c.modules.reduce((s, m) => s + m.lessons.length, 0),
    }))
  );
});

// Analytics: students, revenue, reviews
router.get("/analytics", async (req, res) => {
  const courses = await prisma.course.findMany({
    where: { teacherId: req.user.id },
    select: { id: true },
  });
  const courseIds = courses.map((c) => c.id);

  const orders = await prisma.order.findMany({
    where: { courseId: { in: courseIds }, status: "paid" },
  });
  const revenue = orders.reduce((s, o) => s + o.teacherPayout, 0);
  const platformPaid = orders.reduce((s, o) => s + o.platformFee, 0);

  const students = await prisma.enrollment.count({
    where: { courseId: { in: courseIds } },
  });

  const reviewWhere = { courseId: { in: courseIds }, status: "published" };
  const [reviews, ratingAgg] = await Promise.all([
    prisma.review.findMany({
      where: reviewWhere,
      include: { course: { select: { title: true } }, student: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.review.aggregate({ where: reviewWhere, _avg: { rating: true } }),
  ]);

  const avgRating = ratingAgg._avg.rating ? Math.round(ratingAgg._avg.rating * 10) / 10 : 0;

  res.json({
    courseCount: courseIds.length,
    students,
    revenue,
    platformPaid,
    salesCount: orders.length,
    avgRating,
    recentReviews: reviews,
  });
});

export default router;
