import { prisma } from "./prisma.js";

export async function notify(userId, { type, title, body, link }) {
  return prisma.notification.create({
    data: { userId, type, title, body, link: link || null },
  });
}
