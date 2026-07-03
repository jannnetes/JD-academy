import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";

if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET is not set. Refusing to start in production without it.");
}
const SECRET = process.env.JWT_SECRET || "dev_secret";

export function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, {
    expiresIn: "7d",
  });
}

// Attaches req.user if a valid token is present (does not block).
export async function attachUser(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (token) {
      const payload = jwt.verify(token, SECRET);
      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (user) {
        const { password, ...safe } = user;
        req.user = safe;
      }
    }
  } catch {
    // ignore invalid token
  }
  next();
}

// Blocks if not authenticated.
export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Потрібна авторизація" });
  next();
}

// Blocks if user role is not in allowed list.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Потрібна авторизація" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Недостатньо прав" });
    }
    next();
  };
}
