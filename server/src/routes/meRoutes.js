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
