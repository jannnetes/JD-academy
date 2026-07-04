import { Router } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, requireRole } from "../auth.js";
import { computeBreakdown } from "../fees.js";

const router = Router();

function countLessons(course) {
  return (course.modules || []).reduce((s, m) => s + (m._count?.lessons ?? m.lessons?.length ?? 0), 0);
}

// Public catalog with filters: ?industry=&topic=&q=&level=
router.get("/", async (req, res) => {
  const { industry, topic, q, level } = req.query;
  const where = { status: "published" };
  if (industry) where.industry = industry;
  if (level) where.level = level;

  let courses = await prisma.course.findMany({
    where,
    include: {
      teacher: { select: { id: true, name: true, avatar: true } },
      modules: { include: { _count: { select: { lessons: true } } } },
      _count: { select: { enrollments: true } },
      reviews: { where: { status: "published" }, select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (topic) {
    const t = String(topic).toLowerCase();
    courses = courses.filter((c) => c.topics.toLowerCase().includes(t));
  }
  if (q) {
    const s = String(q).toLowerCase();
    courses = courses.filter(
      (c) => c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s)
    );
  }

  const withMeta = await Promise.all(
    courses.map(async (c) => {
      const breakdown = await computeBreakdown(c.basePrice, "course");
      const ratings = c.reviews.map((r) => r.rating);
      const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      const { reviews, modules, ...rest } = c;
      return {
        ...rest,
        topics: c.topics.split(",").map((x) => x.trim()).filter(Boolean),
        students: c._count.enrollments,
        lessonCount: countLessons(c),
        reviewCount: ratings.length,
        rating: Math.round(avg * 10) / 10,
        price: breakdown.total,
        breakdown,
      };
    })
  );

  res.json(withMeta);
});

router.get("/meta/industries", async (_req, res) => {
  const rows = await prisma.course.findMany({
    where: { status: "published" },
    select: { industry: true },
    distinct: ["industry"],
  });
  res.json(rows.map((r) => r.industry));
});

// Course detail with full module/lesson tree
router.get("/:id", async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: {
      teacher: { select: { id: true, name: true, bio: true, avatar: true } },
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { homework: true },
          },
        },
      },
      reviews: {
        where: { status: "published" },
        include: { student: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) return res.status(404).json({ error: "Курс не знайдено" });

  const breakdown = await computeBreakdown(course.basePrice, "course");
  const ratings = course.reviews.map((r) => r.rating);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  res.json({
    ...course,
    topics: course.topics.split(",").map((x) => x.trim()).filter(Boolean),
    students: course._count.enrollments,
    lessonCount: course.modules.reduce((s, m) => s + m.lessons.length, 0),
    rating: Math.round(avg * 10) / 10,
    reviewCount: ratings.length,
    price: breakdown.total,
    breakdown,
  });
});

// Teacher: create course
router.post("/", requireAuth, requireRole("teacher", "admin"), async (req, res) => {
  const { title, description, industry, topics, basePrice, cover, level } = req.body || {};
  if (!title || !industry || basePrice === undefined || basePrice === null || basePrice === "" || Number(basePrice) < 0) {
    return res.status(400).json({ error: "Заповніть назву, галузь і ціну" });
  }
  const course = await prisma.course.create({
    data: {
      teacherId: req.user.id,
      title,
      description: description || "",
      industry,
      topics: Array.isArray(topics) ? topics.join(",") : topics || "",
      basePrice: Number(basePrice),
      cover: cover || null,
      level: level || "Початковий",
      status: "draft",
    },
  });
  res.json(course);
});

async function assertOwner(req, res) {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });
  if (!course) {
    res.status(404).json({ error: "Курс не знайдено" });
    return null;
  }
  if (course.teacherId !== req.user.id && req.user.role !== "admin") {
    res.status(403).json({ error: "Це не ваш курс" });
    return null;
  }
  return course;
}

router.patch("/:id", requireAuth, requireRole("teacher", "admin"), async (req, res) => {
  const course = await assertOwner(req, res);
  if (!course) return;
  const { title, description, industry, topics, basePrice, cover, status, level } = req.body || {};
  const updated = await prisma.course.update({
    where: { id: req.params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(industry !== undefined && { industry }),
      ...(topics !== undefined && { topics: Array.isArray(topics) ? topics.join(",") : topics }),
      ...(basePrice !== undefined && { basePrice: Number(basePrice) }),
      ...(cover !== undefined && { cover }),
      ...(status !== undefined && { status }),
      ...(level !== undefined && { level }),
    },
  });
  res.json(updated);
});

// Teacher: add module
router.post("/:id/modules", requireAuth, requireRole("teacher", "admin"), async (req, res) => {
  const course = await assertOwner(req, res);
  if (!course) return;
  const count = await prisma.module.count({ where: { courseId: course.id } });
  const module = await prisma.module.create({
    data: { courseId: course.id, order: count + 1, title: req.body?.title || `Модуль ${count + 1}` },
  });
  res.json(module);
});

// Teacher: add lesson to a module
router.post("/:id/modules/:moduleId/lessons", requireAuth, requireRole("teacher", "admin"), async (req, res) => {
  const course = await assertOwner(req, res);
  if (!course) return;
  const module = await prisma.module.findUnique({ where: { id: req.params.moduleId } });
  if (!module || module.courseId !== course.id) {
    return res.status(404).json({ error: "Модуль не знайдено" });
  }
  const count = await prisma.lesson.count({ where: { moduleId: module.id } });
  const { title, videoUrl, durationMin, content } = req.body || {};
  const lesson = await prisma.lesson.create({
    data: {
      moduleId: module.id,
      order: count + 1,
      title: title || `Урок ${count + 1}`,
      videoUrl: videoUrl || null,
      durationMin: Number(durationMin) || 0,
      content: content || null,
    },
  });
  res.json(lesson);
});

// Teacher: attach homework to a lesson
router.post("/lessons/:lessonId/homework", requireAuth, requireRole("teacher", "admin"), async (req, res) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: req.params.lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) return res.status(404).json({ error: "Урок не знайдено" });
  if (lesson.module.course.teacherId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Це не ваш курс" });
  }
  const { title, description, materials } = req.body || {};
  const hw = await prisma.homework.create({
    data: {
      lessonId: lesson.id,
      title: title || "Домашнє завдання",
      description: description || "",
      materials: Array.isArray(materials) ? materials.join(",") : materials || "",
    },
  });
  res.json(hw);
});

// ---- Course builder: lesson content blocks ----
async function lessonOwner(req, res) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: req.params.lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) {
    res.status(404).json({ error: "Урок не знайдено" });
    return null;
  }
  if (lesson.module.course.teacherId !== req.user.id && req.user.role !== "admin") {
    res.status(403).json({ error: "Це не ваш курс" });
    return null;
  }
  return lesson;
}

router.get("/lessons/:lessonId/blocks", requireAuth, requireRole("teacher", "admin"), async (req, res) => {
  const lesson = await lessonOwner(req, res);
  if (!lesson) return;
  const blocks = await prisma.courseBlock.findMany({
    where: { lessonId: lesson.id },
    orderBy: { order: "asc" },
  });
  res.json(blocks.map((b) => ({ id: b.id, type: b.type, content: JSON.parse(b.content || "{}") })));
});

router.put("/lessons/:lessonId/blocks", requireAuth, requireRole("teacher", "admin"), async (req, res) => {
  const lesson = await lessonOwner(req, res);
  if (!lesson) return;
  const blocks = Array.isArray(req.body?.blocks) ? req.body.blocks : [];
  await prisma.$transaction([
    prisma.courseBlock.deleteMany({ where: { lessonId: lesson.id } }),
    ...blocks.map((b, i) =>
      prisma.courseBlock.create({
        data: { lessonId: lesson.id, order: i, type: b.type, content: JSON.stringify(b.content || {}) },
      })
    ),
  ]);
  res.json({ ok: true, count: blocks.length });
});

export default router;
