import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../auth.js";
import { computeBreakdown, applyPromoCode } from "../fees.js";
import { awardXp, checkBadges } from "../gamification.js";
import { stripe } from "../stripe.js";
import { grantCourseEnrollment } from "../fulfillment.js";
import { notify } from "../notifications.js";

const router = Router();

// Start a real payment: creates a Stripe Checkout Session and returns its
// URL. Enrollment is only granted once Stripe confirms payment via webhook
// (see routes/stripeWebhook.js) — never on this request directly.
router.post("/checkout/:courseId", requireAuth, async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
  if (!course) return res.status(404).json({ error: "Курс не знайдено" });

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: req.user.id, courseId: course.id } },
  });
  if (existing) return res.status(409).json({ error: "Курс вже придбано" });

  const { promoCode } = req.body || {};
  let b, promo;
  if (promoCode) {
    try {
      ({ breakdown: b, promo } = await applyPromoCode(promoCode, course.basePrice, "course"));
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  } else {
    b = await computeBreakdown(course.basePrice, "course");
  }

  if (b.total <= 0) {
    const enrollment = await grantCourseEnrollment(course.id, req.user.id, { breakdown: b, promoCode: promo?.code });
    return res.json({ free: true, enrollment });
  }

  if (!stripe) {
    return res.status(503).json({ error: "Оплата тимчасово недоступна. Спробуйте пізніше." });
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: req.user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: course.title },
          unit_amount: Math.round(b.total * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: "course", courseId: course.id, studentId: req.user.id, promoCode: promo?.code || "",
      basePrice: String(b.basePrice), platformFee: String(b.platformFee), total: String(b.total),
    },
    success_url: `${clientUrl}/course/${course.id}?purchase=success`,
    cancel_url: `${clientUrl}/course/${course.id}?purchase=cancelled`,
  });

  res.json({ url: session.url });
});

// Student: my enrolled courses with full module/lesson tree + progress
router.get("/my-courses", requireAuth, async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: req.user.id },
    include: {
      course: {
        include: {
          teacher: { select: { name: true } },
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: { orderBy: { order: "asc" }, include: { homework: true } },
            },
          },
        },
      },
      lessonProgress: true,
    },
    orderBy: { purchasedAt: "desc" },
  });
  res.json(enrollments);
});

// One enrolled course (the learning player)
router.get("/learn/:courseId", requireAuth, async (req, res) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: req.user.id, courseId: req.params.courseId } },
    include: {
      course: {
        include: {
          teacher: { select: { name: true } },
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
                include: { homework: true, blocks: { orderBy: { order: "asc" } } },
              },
            },
          },
        },
      },
      lessonProgress: true,
    },
  });
  if (!enrollment) return res.status(403).json({ error: "Курс не придбано" });

  const certificate = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId: req.user.id, courseId: req.params.courseId } },
  });
  res.json({ ...enrollment, certificate });
});

// Helper: recompute progress, award XP, issue certificate at 100%
async function recomputeProgress(enrollment, userId) {
  const total = await prisma.lesson.count({
    where: { module: { courseId: enrollment.courseId } },
  });
  const done = await prisma.lessonProgress.count({
    where: { enrollmentId: enrollment.id, completed: true },
  });
  const progressPct = total ? Math.round((done / total) * 100) : 0;

  const data = { progressPct };
  let certificate = null;
  if (progressPct === 100 && !enrollment.completedAt) {
    data.completedAt = new Date();
    certificate = await prisma.certificate.upsert({
      where: { userId_courseId: { userId, courseId: enrollment.courseId } },
      create: {
        userId,
        courseId: enrollment.courseId,
        serial: `JDL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      },
      update: {},
    });
    const course = await prisma.course.findUnique({ where: { id: enrollment.courseId } });
    await notify(userId, {
      type: "certificate_earned",
      title: "Certificate earned 🎓",
      body: `You completed "${course?.title}" — your certificate is ready.`,
      link: `/learn/${enrollment.courseId}`,
    });
  }
  await prisma.enrollment.update({ where: { id: enrollment.id }, data });
  return { progressPct, certificate };
}

// Student: complete a lesson -> XP + streak + badges (+ certificate at 100%)
router.post("/lessons/:lessonId/complete", requireAuth, async (req, res) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: req.params.lessonId },
    include: { module: true },
  });
  if (!lesson) return res.status(404).json({ error: "Урок не знайдено" });

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: req.user.id, courseId: lesson.module.courseId } },
  });
  if (!enrollment) return res.status(403).json({ error: "Курс не придбано" });

  const already = await prisma.lessonProgress.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: lesson.id } },
  });

  await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: lesson.id } },
    create: { enrollmentId: enrollment.id, lessonId: lesson.id, completed: true },
    update: { completed: true },
  });

  // Award XP only the first time a lesson is completed
  let gamification = null;
  if (!already?.completed) {
    gamification = await awardXp(req.user.id, lesson.xpReward);
  }

  const { progressPct, certificate } = await recomputeProgress(enrollment, req.user.id);
  if (certificate) {
    const extra = await checkBadges(req.user.id, gamification?.user
      ?? (await prisma.user.findUnique({ where: { id: req.user.id } })));
    if (gamification) gamification.newBadges.push(...extra);
  }

  res.json({ progressPct, certificate, gamification, xpEarned: already?.completed ? 0 : lesson.xpReward });
});

// Student: submit homework -> XP
router.post("/homework/:homeworkId/submit", requireAuth, async (req, res) => {
  const hw = await prisma.homework.findUnique({ where: { id: req.params.homeworkId } });
  if (!hw) return res.status(404).json({ error: "Завдання не знайдено" });

  const existing = await prisma.homeworkSubmission.findUnique({
    where: { homeworkId_studentId: { homeworkId: hw.id, studentId: req.user.id } },
  });
  if (existing) return res.status(409).json({ error: "Ви вже здали це завдання" });

  await prisma.homeworkSubmission.create({
    data: { homeworkId: hw.id, studentId: req.user.id, content: req.body?.content || "" },
  });
  const gamification = await awardXp(req.user.id, hw.xpReward);
  res.json({ gamification, xpEarned: hw.xpReward });
});

router.get("/orders", requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { buyerId: req.user.id },
    include: { course: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

// ---- Wishlist ----
router.get("/wishlist", requireAuth, async (req, res) => {
  const items = await prisma.wishlist.findMany({
    where: { studentId: req.user.id },
    include: {
      course: {
        include: { teacher: { select: { name: true } }, _count: { select: { enrollments: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(items.map((w) => ({ ...w, course: { ...w.course, students: w.course._count.enrollments } })));
});

router.post("/wishlist/:courseId", requireAuth, async (req, res) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
  if (!course) return res.status(404).json({ error: "Курс не знайдено" });
  const item = await prisma.wishlist.upsert({
    where: { studentId_courseId: { studentId: req.user.id, courseId: course.id } },
    create: { studentId: req.user.id, courseId: course.id },
    update: {},
  });
  res.json(item);
});

router.delete("/wishlist/:courseId", requireAuth, async (req, res) => {
  await prisma.wishlist.deleteMany({ where: { studentId: req.user.id, courseId: req.params.courseId } });
  res.json({ ok: true });
});

export default router;
