import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, requireRole } from "../auth.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { courses: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

router.patch("/users/:id/role", async (req, res) => {
  const { role } = req.body || {};
  if (!["student", "teacher", "admin"].includes(role)) {
    return res.status(400).json({ error: "Невірна роль" });
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, name: true, role: true },
  });
  res.json(user);
});

router.get("/orders", async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      buyer: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

router.get("/stats", async (_req, res) => {
  const [users, courses, orders] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.order.findMany({ where: { status: "paid" } }),
  ]);
  const platformRevenue = orders.reduce((s, o) => s + o.platformFee, 0);
  const gmv = orders.reduce((s, o) => s + o.amount, 0);
  res.json({
    users,
    courses,
    salesCount: orders.length,
    platformRevenue,
    gmv,
  });
});

router.get("/fees", async (_req, res) => {
  const fees = await prisma.platformFeeConfig.findMany();
  res.json(fees);
});

router.put("/fees/:type", async (req, res) => {
  const { percent } = req.body || {};
  const fee = await prisma.platformFeeConfig.upsert({
    where: { type: req.params.type },
    create: { type: req.params.type, percent: Number(percent) },
    update: { percent: Number(percent) },
  });
  res.json(fee);
});

export default router;
