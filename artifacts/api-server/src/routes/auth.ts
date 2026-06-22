import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../middlewares/adminAuth";
import { sendWelcomeEmail } from "../lib/email";

const router = Router();
const JWT_EXPIRES = "30d";
const BCRYPT_ROUNDS = 12;

// ── In-memory rate limiter ─────────────────────────────────────────────────────
const rateLimitStore = new Map<string, { attempts: number; resetAt: number }>();

function rateLimit(maxAttempts: number, windowMs: number) {
  return (req: any, res: any, next: any): void => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "unknown";
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);
    if (!record || now > record.resetAt) {
      rateLimitStore.set(key, { attempts: 1, resetAt: now + windowMs });
      return next();
    }
    if (record.attempts >= maxAttempts) {
      const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSec));
      res.status(429).json({ error: "Too many attempts. Please try again later.", retryAfter: retryAfterSec });
      return;
    }
    record.attempts += 1;
    next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) rateLimitStore.delete(key);
  }
}, 10 * 60 * 1000);

// ── Password helpers ───────────────────────────────────────────────────────────

// Legacy SHA-256 scheme (existing users). Used only for migration detection.
function legacyHash(password: string): string {
  return createHash("sha256").update(password + JWT_SECRET).digest("hex");
}

// New bcrypt scheme for all new registrations.
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Verify a password against whichever scheme was used, and transparently
// upgrade legacy SHA-256 hashes to bcrypt on first successful login.
// Returns { valid: boolean; newHash: string | null } — newHash is set when
// an upgrade should be written back to the DB.
async function verifyPassword(
  password: string,
  stored: string
): Promise<{ valid: boolean; newHash: string | null }> {
  const isBcrypt = stored.startsWith("$2b$") || stored.startsWith("$2a$");
  if (isBcrypt) {
    const valid = await bcrypt.compare(password, stored);
    return { valid, newHash: null };
  }
  // Legacy SHA-256 path — verify, then re-hash with bcrypt so the user is
  // silently upgraded on next login without requiring a password reset.
  const valid = stored === legacyHash(password);
  if (!valid) return { valid: false, newHash: null };
  const newHash = await hashPassword(password);
  return { valid: true, newHash };
}

function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function requireAuth(req: any, res: any, next: any): void {
  const auth = req.headers.authorization as string | undefined;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: number; email: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// POST /api/auth/register — 5 attempts per 15 minutes
router.post("/auth/register", rateLimit(5, 15 * 60 * 1000), async (req, res): Promise<void> => {
  try {
    const rawBody = req.body as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
      phone?: unknown;
      address?: unknown;
    };

    const name = typeof rawBody.name === "string" ? sanitizeString(rawBody.name) : "";
    const email = typeof rawBody.email === "string" ? rawBody.email.trim().toLowerCase() : "";
    const password = typeof rawBody.password === "string" ? rawBody.password : "";
    const phone = typeof rawBody.phone === "string" ? sanitizeString(rawBody.phone) : undefined;
    const address = typeof rawBody.address === "string" ? sanitizeString(rawBody.address) : undefined;

    if (!name || !email || !password) {
      res.status(400).json({ error: "name, email, and password are required" });
      return;
    }
    if (name.length < 2 || name.length > 100) {
      res.status(400).json({ error: "Name must be 2–100 characters" });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Please provide a valid email address" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }
    if (password.length > 128) {
      res.status(400).json({ error: "Password too long" });
      return;
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const [user] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        passwordHash: await hashPassword(password),
        phone: phone ?? null,
        address: address ?? null,
      })
      .returning();

    const accountNumber = `ORB-${String(user.id).padStart(4, "0")}`;
    await db.update(usersTable).set({ accountNumber }).where(eq(usersTable.id, user.id));

    const token = signToken({ userId: user.id, email: user.email });

    sendWelcomeEmail({ customerName: user.name, customerEmail: user.email }).catch(() => {});

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        accountNumber,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Registration failed");
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login — 10 attempts per 15 minutes
router.post("/auth/login", rateLimit(10, 15 * 60 * 1000), async (req, res): Promise<void> => {
  try {
    const rawBody = req.body as { email?: unknown; password?: unknown };
    const email = typeof rawBody.email === "string" ? rawBody.email.trim().toLowerCase() : "";
    const password = typeof rawBody.password === "string" ? rawBody.password : "";

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const { valid, newHash } = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Transparent bcrypt upgrade for legacy SHA-256 accounts
    if (newHash) {
      await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, user.id));
    }

    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        accountNumber: user.accountNumber,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Login failed");
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me
router.get("/auth/me", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      accountNumber: user.accountNumber,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch user");
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PATCH /api/auth/me
router.patch("/auth/me", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const rawBody = req.body as {
      name?: unknown;
      phone?: unknown;
      address?: unknown;
      password?: unknown;
      newPassword?: unknown;
    };

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (rawBody.name !== undefined) {
      const name = typeof rawBody.name === "string" ? sanitizeString(rawBody.name) : "";
      if (!name || name.length < 2 || name.length > 100) {
        res.status(400).json({ error: "Name must be 2–100 characters" });
        return;
      }
      updateData.name = name;
    }
    if (rawBody.phone !== undefined) {
      updateData.phone = typeof rawBody.phone === "string" ? sanitizeString(rawBody.phone).slice(0, 30) : null;
    }
    if (rawBody.address !== undefined) {
      updateData.address = typeof rawBody.address === "string" ? sanitizeString(rawBody.address).slice(0, 500) : null;
    }

    if (rawBody.newPassword !== undefined) {
      const currentPassword = typeof rawBody.password === "string" ? rawBody.password : "";
      const newPassword = typeof rawBody.newPassword === "string" ? rawBody.newPassword : "";

      const { valid } = await verifyPassword(currentPassword, user.passwordHash);
      if (!currentPassword || !valid) {
        res.status(400).json({ error: "Current password is incorrect" });
        return;
      }
      if (newPassword.length < 8) {
        res.status(400).json({ error: "New password must be at least 8 characters" });
        return;
      }
      if (newPassword.length > 128) {
        res.status(400).json({ error: "New password too long" });
        return;
      }
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const [updated] = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, req.user.userId))
      .returning();

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
      accountNumber: updated.accountNumber,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update user");
    res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;
