import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EMAIL = "jd.school.admin@gmail.com";
const PASSWORD = "Admin123!";

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { password: hash, role: "admin", isVerified: true },
    create: { name: "JD Admin", email: EMAIL, password: hash, role: "admin", isVerified: true },
  });
  console.log("Admin ready:", user.email, user.role, user.isVerified);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
