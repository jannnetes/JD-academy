import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, requireRole } from "../auth.js";
import { computeBreakdown } from "../fees.js";
import { stripe } from "../stripe.js";
import { grantLiveBooking } from "../fulfillment.js";

const router = Router();

// Upcoming sessions (public-ish; auth optional)
router.get("/", async (_req, res) => {
  const sessions = await prisma.liveSession.findMany({
    include: {
      teacher: { select: { name: true } },
      course: { select: { title: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { startsAt: "asc" },
  });
  res.json(
    sessions.map((s) => ({
      ...s,
      booked: s._count.bookings,
    }))
  );
});

// Teacher: schedule a session
router.post("/", requireAuth, requireRole("teacher", "admin"), async (req, res) => {
  const { title, startsAt, durationMin, price, capacity, courseId } = req.body || {};
  if (!title || !startsAt) {
    return res.status(400).json({ error: "Вкажіть назву і час" });
  }
  const session = await prisma.liveSession.create({
    data: {
      teacherId: req.user.id,
      title,
      startsAt: new Date(startsAt),
      durationMin: Number(durationMin) || 60,
      price: Number(price) || 0,
      capacity: Number(capacity) || 20,
      courseId: courseId || null,
      roomUrl: `https://meet.jit.si/jdacademy-${Math.random().toString(36).slice(2, 10)}`,
    },
  });
  res.json(session);
});

// Student: book a session — free sessions grant instantly, priced ones
// go through a Stripe Checkout Session (booking is granted by the webhook).
router.post("/:id/checkout", requireAuth, async (req, res) => {
  const session = await prisma.liveSession.findUnique({
    where: { id: req.params.id },
  });
  if (!session) return res.status(404).json({ error: "Заняття не знайдено" });

  const existing = await prisma.liveBooking.findUnique({
    where: {
      liveSessionId_studentId: {
        liveSessionId: session.id,
        studentId: req.user.id,
      },
    },
  });
  if (existing) return res.status(409).json({ error: "Ви вже записані" });

  if (session.price <= 0) {
    const booking = await grantLiveBooking(session.id, req.user.id);
    return res.json({ free: true, booking });
  }

  if (!stripe) {
    return res.status(503).json({ error: "Оплата тимчасово недоступна. Спробуйте пізніше." });
  }

  const b = await computeBreakdown(session.price, "live");
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: req.user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: session.title },
          unit_amount: Math.round(b.total * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { type: "live", liveSessionId: session.id, studentId: req.user.id },
    success_url: `${clientUrl}/live?booking=success`,
    cancel_url: `${clientUrl}/live?booking=cancelled`,
  });

  res.json({ url: checkout.url });
});

// Teacher: start / end session
router.patch("/:id/status", requireAuth, requireRole("teacher", "admin"), async (req, res) => {
  const session = await prisma.liveSession.findUnique({ where: { id: req.params.id } });
  if (!session) return res.status(404).json({ error: "Заняття не знайдено" });
  if (session.teacherId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Це не ваше заняття" });
  }
  const { status } = req.body || {};
  const updated = await prisma.liveSession.update({
    where: { id: session.id },
    data: { status },
  });
  res.json(updated);
});

// After a session: publish homework + materials
router.post("/:id/homework", requireAuth, requireRole("teacher", "admin"), async (req, res) => {
  const session = await prisma.liveSession.findUnique({ where: { id: req.params.id } });
  if (!session) return res.status(404).json({ error: "Заняття не знайдено" });
  if (session.teacherId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Це не ваше заняття" });
  }
  const { title, description, materials, dueDate } = req.body || {};
  const hw = await prisma.homework.create({
    data: {
      liveSessionId: session.id,
      title: title || "Домашнє завдання",
      description: description || "",
      materials: Array.isArray(materials) ? materials.join(",") : materials || "",
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  res.json(hw);
});

// My bookings (student)
router.get("/my-bookings", requireAuth, async (req, res) => {
  const bookings = await prisma.liveBooking.findMany({
    where: { studentId: req.user.id },
    include: {
      liveSession: {
        include: {
          teacher: { select: { name: true } },
          homework: true,
        },
      },
    },
    orderBy: { id: "desc" },
  });
  res.json(bookings);
});

export default router;
