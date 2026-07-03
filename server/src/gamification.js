import { prisma } from "./prisma.js";

// Level curve: level N requires 100 * N^1.5 cumulative XP (simple, satisfying).
export function levelFromXp(xp) {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}
export function xpForLevel(level) {
  return Math.round(100 * Math.pow(level - 1, 1.5));
}
export function levelInfo(xp) {
  const level = levelFromXp(xp);
  const curr = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    xp,
    levelFloor: curr,
    levelCeil: next,
    intoLevel: xp - curr,
    levelSpan: next - curr,
    pct: Math.min(100, Math.round(((xp - curr) / (next - curr)) * 100)),
  };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Badge definitions and the predicate that unlocks them.
const BADGE_RULES = [
  { code: "first_lesson", check: (s) => s.lessonsDone >= 1 },
  { code: "lessons_10", check: (s) => s.lessonsDone >= 10 },
  { code: "streak_3", check: (s) => s.streak >= 3 },
  { code: "streak_7", check: (s) => s.streak >= 7 },
  { code: "xp_500", check: (s) => s.xp >= 500 },
  { code: "xp_2000", check: (s) => s.xp >= 2000 },
  { code: "first_course", check: (s) => s.coursesDone >= 1 },
];

// Awards XP, updates daily streak, and unlocks any newly-earned badges.
// Returns { user, newBadges, leveledUp }.
export async function awardXp(userId, amount) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const beforeLevel = levelFromXp(user.xp);

  const today = todayStr();
  let streak = user.streak;
  if (user.lastActiveDay !== today) {
    streak = user.lastActiveDay === yesterdayStr() ? streak + 1 : 1;
  }
  if (streak < 1) streak = 1;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount }, streak, lastActiveDay: today },
  });

  const newBadges = await checkBadges(userId, updated);
  const leveledUp = levelFromXp(updated.xp) > beforeLevel;

  return { user: updated, newBadges, leveledUp };
}

export async function checkBadges(userId, user) {
  const [lessonsDone, coursesDone] = await Promise.all([
    prisma.lessonProgress.count({
      where: { enrollment: { studentId: userId }, completed: true },
    }),
    prisma.certificate.count({ where: { userId } }),
  ]);
  const stats = { xp: user.xp, streak: user.streak, lessonsDone, coursesDone };

  const owned = await prisma.userBadge.findMany({
    where: { userId },
    select: { badge: { select: { code: true } } },
  });
  const ownedCodes = new Set(owned.map((b) => b.badge.code));

  const toAward = BADGE_RULES.filter(
    (r) => r.check(stats) && !ownedCodes.has(r.code)
  );

  const newBadges = [];
  for (const rule of toAward) {
    const badge = await prisma.badge.findUnique({ where: { code: rule.code } });
    if (!badge) continue;
    await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
    newBadges.push(badge);
  }
  return newBadges;
}
