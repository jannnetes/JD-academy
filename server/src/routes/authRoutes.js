import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { signToken, requireAuth } from "../auth.js";
import { transporter, buildConfirmationEmail } from "../email.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "teacher"]).default("student"),
  locale: z.string().optional(),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid registration data" });
  }
  const { name, email, password, role, locale } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "A user with this email already exists" });
  }

  const hash = await bcrypt.hash(password, 12);
  const token = crypto.randomBytes(32).toString("hex");
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hash,
      role,
      isVerified: false,
      verifyToken: token,
      verifyTokenExp: new Date(Date.now() + 24 * 60 * 60 * 1000),
      preferredLocale: locale || "en",
    },
  });

  try {
    const mail = buildConfirmationEmail(name, token, locale || "en");
    await transporter.sendMail({ ...mail, to: email });
  } catch (err) {
    console.error("Email send failed:", err.message);
    // Roll back so the user can retry registration cleanly.
    await prisma.user.delete({ where: { id: user.id } });
    return res.status(502).json({ error: "Could not send confirmation email. Try again later." });
  }

  res.json({ message: "Registration successful. Check your email to confirm." });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password || "", user.password))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  if (!user.isVerified) {
    return res.status(403).json({ error: "Please confirm your email first. Check your inbox." });
  }
  const { password: _p, ...safe } = user;
  res.json({ token: signToken(user), user: safe });
});

// Email confirmation link target → flips isVerified, redirects to client.
router.get("/verify", async (req, res) => {
  const token = req.query.token;
  const client = process.env.CLIENT_URL || "http://localhost:5173";
  const user = token
    ? await prisma.user.findFirst({ where: { verifyToken: token, verifyTokenExp: { gt: new Date() } } })
    : null;
  if (!user) {
    return res.redirect(`${client}/login?verified=0`);
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verifyToken: null, verifyTokenExp: null },
  });
  res.redirect(`${client}/login?verified=1`);
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
