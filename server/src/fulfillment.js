import { prisma } from "./prisma.js";
import { computeBreakdown } from "./fees.js";

// Called only after a Stripe payment is confirmed (webhook) — or directly
// for zero-cost courses. Idempotent: safe to call twice for the same pair.
// `breakdown` lets the caller pass a promo-discounted price (falls back to
// the course's full base price if omitted, e.g. for older/plain callers).
export async function grantCourseEnrollment(courseId, studentId, { breakdown, promoCode } = {}) {
  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (existing) return existing;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error(`Course ${courseId} not found`);
  const b = breakdown || (await computeBreakdown(course.basePrice, "course"));

  const ops = [
    prisma.order.create({
      data: {
        buyerId: studentId,
        courseId,
        type: "course",
        amount: b.total,
        platformFee: b.platformFee,
        teacherPayout: b.teacherPayout,
        status: "paid",
        promoCode: promoCode || null,
      },
    }),
    prisma.enrollment.create({ data: { studentId, courseId } }),
  ];
  if (promoCode) {
    ops.push(prisma.promoCode.update({ where: { code: promoCode }, data: { usedCount: { increment: 1 } } }));
  }

  const [, enrollment] = await prisma.$transaction(ops);
  return enrollment;
}

export async function grantLiveBooking(liveSessionId, studentId) {
  const existing = await prisma.liveBooking.findUnique({
    where: { liveSessionId_studentId: { liveSessionId, studentId } },
  });
  if (existing) return existing;

  const session = await prisma.liveSession.findUnique({ where: { id: liveSessionId } });
  if (!session) throw new Error(`LiveSession ${liveSessionId} not found`);

  if (session.price > 0) {
    const b = await computeBreakdown(session.price, "live");
    await prisma.order.create({
      data: {
        buyerId: studentId,
        type: "live",
        amount: b.total,
        platformFee: b.platformFee,
        teacherPayout: b.teacherPayout,
        status: "paid",
      },
    });
  }
  return prisma.liveBooking.create({ data: { liveSessionId, studentId } });
}
