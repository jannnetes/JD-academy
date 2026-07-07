import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth } from "../auth.js";
import { levelInfo } from "../gamification.js";

const router = Router();

// Gamification profile: level, xp, streak, badges (earned + locked), certificates
router.get("/gamification", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const info = levelInfo(user.xp);

  const allBadges = await prisma.badge.findMany();
  const earned = await prisma.userBadge.findMany({
    where: { userId: req.user.id },
    include: { badge: true },
  });
  const earnedIds = new Set(earned.map((e) => e.badgeId));

  const badges = allBadges.map((b) => ({
    ...b,
    earned: earnedIds.has(b.id),
    earnedAt: earned.find((e) => e.badgeId === b.id)?.earnedAt || null,
  }));

  const lessonsDone = await prisma.lessonProgress.count({
    where: { enrollment: { studentId: req.user.id }, completed: true },
  });

  const certificates = await prisma.certificate.findMany({
    where: { userId: req.user.id },
    include: { course: { select: { title: true } } },
    orderBy: { issuedAt: "desc" },
  });

  res.json({
    ...info,
    streak: user.streak,
    badges,
    earnedCount: earned.length,
    badgeTotal: allBadges.length,
    lessonsDone,
    certificates,
  });
});

router.get("/notifications", requireAuth, async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const unreadCount = await prisma.notification.count({ where: { userId: req.user.id, read: false } });
  res.json({ notifications, unreadCount });
});

router.patch("/notifications/:id/read", requireAuth, async (req, res) => {
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { read: true },
  });
  res.json({ ok: true });
});

router.patch("/notifications/read-all", requireAuth, async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, read: false },
    data: { read: true },
  });
  res.json({ ok: true });
});

// Public leaderboard (top by XP)
router.get("/leaderboard", async (_req, res) => {
  const top = await prisma.user.findMany({
    where: { role: "student" },
    orderBy: { xp: "desc" },
    take: 10,
    select: { id: true, name: true, xp: true, streak: true },
  });
  res.json(top.map((u, i) => ({ ...u, rank: i + 1 })));
});

export default router;
