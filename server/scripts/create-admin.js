// Creates (or promotes/updates) a single admin account without touching any
// other data — safe to re-run, unlike prisma/seed.js which wipes the DB.
//
// Usage:
//   node scripts/create-admin.js <email> <password>
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/create-admin.js
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.argv[2] || process.env.ADMIN_EMAIL;
const password = process.argv[3] || process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.js <email> <password>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

async function main() {
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: "admin", isVerified: true },
    create: { name: "Admin", email, password: hash, role: "admin", isVerified: true },
  });
  console.log(`✅ Admin ready: ${user.email} (role: ${user.role}, verified: ${user.isVerified})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
