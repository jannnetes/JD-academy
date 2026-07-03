import { prisma } from "./prisma.js";

// Returns platform fee percent for a given type ("course" | "live" | "publish").
export async function getFeePercent(type) {
  const cfg = await prisma.platformFeeConfig.findUnique({ where: { type } });
  return cfg?.percent ?? 15; // default 15%
}

// Markup model: buyer pays base + fee on top. Teacher receives the base price.
export async function computeBreakdown(basePrice, type = "course") {
  const percent = await getFeePercent(type);
  const platformFee = Math.round((basePrice * percent) / 100);
  return {
    basePrice,
    percent,
    platformFee,
    teacherPayout: basePrice,
    total: basePrice + platformFee,
  };
}
