import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.homeworkSubmission.deleteMany();
  await prisma.homework.deleteMany();
  await prisma.liveBooking.deleteMany();
  await prisma.liveSession.deleteMany();
  await prisma.review.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformFeeConfig.deleteMany();

  const hash = (p) => bcrypt.hashSync(p, 10);

  await prisma.platformFeeConfig.createMany({
    data: [
      { type: "course", percent: 15 },
      { type: "live", percent: 10 },
      { type: "publish", percent: 5 },
    ],
  });

  await prisma.badge.createMany({
    data: [
      { code: "first_lesson", title: "First Step", description: "Complete your first lesson", icon: "🌱" },
      { code: "lessons_10", title: "Persistent", description: "Complete 10 lessons", icon: "📚" },
      { code: "streak_3", title: "In Rhythm", description: "3-day streak", icon: "🔥" },
      { code: "streak_7", title: "Week On Fire", description: "7-day streak", icon: "⚡" },
      { code: "xp_500", title: "Skilled", description: "Earn 500 XP", icon: "⭐" },
      { code: "xp_2000", title: "Master", description: "Earn 2000 XP", icon: "👑" },
      { code: "first_course", title: "Graduate", description: "Complete your first course", icon: "🎓" },
    ],
  });

  const admin = await prisma.user.create({
    data: { name: "Admin", email: "admin@jdlearn.com", password: hash("admin123"), role: "admin", isVerified: true },
  });
  const teacher = await prisma.user.create({
    data: {
      name: "Elena Carter", email: "teacher@jdlearn.com", password: hash("teacher123"), role: "teacher", isVerified: true,
      bio: "Language teacher and exam-prep coach with 8+ years of experience.", expertise: "Languages,Test Prep",
    },
  });
  const teacher2 = await prisma.user.create({
    data: {
      name: "Andrew Coder", email: "dev@jdlearn.com", password: hash("teacher123"), role: "teacher", isVerified: true,
      bio: "Senior developer. I teach programming from zero to your first job.", expertise: "Programming",
    },
  });
  const student = await prisma.user.create({
    data: { name: "Maria Stone", email: "student@jdlearn.com", password: hash("student123"), role: "student", isVerified: true, xp: 340, streak: 2 },
  });
  await prisma.user.create({
    data: { name: "Ivan Top", email: "ivan@jdlearn.com", password: hash("student123"), role: "student", isVerified: true, xp: 1280, streak: 9 },
  });

  async function makeCourse(data, modulePlan) {
    const course = await prisma.course.create({ data });
    for (let m = 0; m < modulePlan.length; m++) {
      const mod = await prisma.module.create({
        data: { courseId: course.id, order: m + 1, title: modulePlan[m].title },
      });
      for (let l = 0; l < modulePlan[m].lessons.length; l++) {
        const lt = modulePlan[m].lessons[l];
        const lesson = await prisma.lesson.create({
          data: {
            moduleId: mod.id, order: l + 1, title: lt,
            durationMin: 20 + l * 5,
            content: "Lesson notes and materials.",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          },
        });
        if (l === modulePlan[m].lessons.length - 1) {
          await prisma.homework.create({
            data: { lessonId: lesson.id, title: `HW: ${modulePlan[m].title}`, description: "Complete the practical task based on this module." },
          });
        }
      }
    }
    return course;
  }

  const eng = await makeCourse(
    { teacherId: teacher.id, title: "English for Exams", description: "A complete prep course for English standardized exams.", industry: "Languages", topics: "English,Exam,Grammar", basePrice: 2400, status: "published", cover: "#F73B20", level: "Intermediate" },
    [
      { title: "Grammar", lessons: ["Present Tenses", "Past Tenses", "Conditionals"] },
      { title: "Vocabulary & Reading", lessons: ["Top 1000 Words", "Reading Strategies"] },
      { title: "Exam Format", lessons: ["Test Breakdown", "Mock Exam"] },
    ]
  );
  const de = await makeCourse(
    { teacherId: teacher.id, title: "Spoken German A1-B1", description: "Living, conversational German for everyday life.", industry: "Languages", topics: "German,Conversation", basePrice: 2800, status: "published", cover: "#4A7856", level: "Beginner" },
    [
      { title: "First Phrases", lessons: ["Greetings", "About Yourself"] },
      { title: "Daily Life", lessons: ["At the Store", "At the Doctor", "Transport"] },
    ]
  );
  await makeCourse(
    { teacherId: teacher.id, title: "Math From Scratch", description: "Systematic math prep for standardized tests.", industry: "Test Prep", topics: "Math,Exam", basePrice: 2200, status: "published", cover: "#1A3FD4", level: "Intermediate" },
    [{ title: "Algebra", lessons: ["Equations", "Functions"] }, { title: "Geometry", lessons: ["Planimetry", "Solid Geometry"] }]
  );
  await makeCourse(
    { teacherId: teacher2.id, title: "Web Dev: React From Zero", description: "Modern front-end development with React.", industry: "Programming", topics: "React,JavaScript,Frontend", basePrice: 4500, status: "published", cover: "#0D0D0D", level: "Advanced" },
    [
      { title: "JS Basics", lessons: ["Variables", "Functions", "Arrays"] },
      { title: "React", lessons: ["Components", "Hooks", "State"] },
      { title: "Project", lessons: ["Build an App", "Deploy"] },
    ]
  );
  await makeCourse(
    { teacherId: teacher2.id, title: "Python for Beginners", description: "Your first programming language.", industry: "Programming", topics: "Python,Basics", basePrice: 3800, status: "published", cover: "#6B21A8", level: "Beginner" },
    [{ title: "Start", lessons: ["Installation", "First Program"] }, { title: "Logic", lessons: ["Conditions", "Loops", "Functions"] }]
  );

  for (const course of [eng, de]) {
    const fee = Math.round((course.basePrice * 15) / 100);
    await prisma.order.create({
      data: { buyerId: student.id, courseId: course.id, type: "course", amount: course.basePrice + fee, platformFee: fee, teacherPayout: course.basePrice, status: "paid" },
    });
    const enr = await prisma.enrollment.create({ data: { studentId: student.id, courseId: course.id, progressPct: 30 } });
    if (course.id === eng.id) {
      const lessons = await prisma.lesson.findMany({ where: { module: { courseId: course.id } }, orderBy: { order: "asc" }, take: 2 });
      for (const l of lessons) {
        await prisma.lessonProgress.create({ data: { enrollmentId: enr.id, lessonId: l.id, completed: true } });
      }
    }
  }

  const b1 = await prisma.badge.findUnique({ where: { code: "first_lesson" } });
  await prisma.userBadge.create({ data: { userId: student.id, badgeId: b1.id } });

  await prisma.review.create({
    data: { courseId: eng.id, studentId: student.id, rating: 5, text: "Crystal-clear explanations — my English improved fast!", status: "published" },
  });

  const session = await prisma.liveSession.create({
    data: {
      teacherId: teacher.id, courseId: eng.id, title: "Tricky Exam Questions Breakdown",
      startsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), durationMin: 60, price: 0, capacity: 25,
      provider: "daily", roomUrl: "https://jdlearn.daily.co/demo-exam",
    },
  });
  await prisma.liveBooking.create({ data: { liveSessionId: session.id, studentId: student.id } });

  console.log("✅ Seed complete!");
  console.log("\nDemo accounts:");
  console.log("  Admin:    admin@jdlearn.com / admin123");
  console.log("  Teacher:  teacher@jdlearn.com / teacher123");
  console.log("  Student:  student@jdlearn.com / student123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
