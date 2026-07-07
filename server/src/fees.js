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

// Validates a promo code and returns it, or throws a user-facing message.
// Discount is applied to the base price before the platform fee, so the
// teacher's payout and platform fee both scale down proportionally.
export async function applyPromoCode(code, basePrice, type = "course") {
  const promo = await prisma.promoCode.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!promo || !promo.active) throw new Error("Invalid promo code");
  if (promo.expiresAt && promo.expiresAt < new Date()) throw new Error("This promo code has expired");
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) throw new Error("This promo code has been fully redeemed");

  const discountedBase = Math.round(basePrice * (1 - promo.percentOff / 100));
  const breakdown = await computeBreakdown(discountedBase, type);
  return { breakdown, promo };
}
