import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, otpCodesTable } from "@workspace/db";
import { eq, and, gt, desc } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../middlewares/adminAuth";

const router = Router();
const JWT_EXPIRES = "30d";

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// In-memory rate limiter for OTP requests
const otpRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkOtpRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = otpRateLimit.get(key);
  if (!entry || now > entry.resetAt) {
    otpRateLimit.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of otpRateLimit.entries()) {
    if (now > v.resetAt) otpRateLimit.delete(k);
  }
}, 5 * 60 * 1000);

async function sendOtpEmail(email: string, otp: string, name: string): Promise<boolean> {
  const key = process.env["RESEND_API_KEY"];
  if (!key) return false;
  try {
    const { Resend } = require("resend");
    const resend = new Resend(key);
    const fromEmail = process.env["EMAIL_FROM"] ?? "ORBITFUTURE <noreply@orbitfuture.store>";
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Your OrbitFuture Login Code: ${otp}`,
      html: `
        <!DOCTYPE html>
        <html><head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#050D1A;font-family:'Helvetica Neue',Arial,sans-serif;">
          <div style="max-width:480px;margin:40px auto;background:#0A1628;border:1px solid rgba(0,212,255,0.15);border-radius:16px;padding:40px 32px;text-align:center;">
            <div style="width:56px;height:56px;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;">
              <span style="font-size:24px;">🛰️</span>
            </div>
            <h1 style="color:#fff;font-size:22px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">ORBITFUTURE</h1>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 32px;text-transform:uppercase;letter-spacing:1px;">Login Verification Code</p>
            <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0 0 24px;">Hi ${name || "there"},<br>Use the code below to sign in to your account.</p>
            <div style="background:rgba(0,212,255,0.08);border:2px solid rgba(0,212,255,0.3);border-radius:12px;padding:24px;margin:0 0 24px;">
              <p style="color:#00D4FF;font-size:42px;font-weight:900;letter-spacing:8px;margin:0;font-family:monospace;">${otp}</p>
            </div>
            <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0 0 8px;">This code expires in <strong style="color:rgba(255,255,255,0.6);">10 minutes</strong>.</p>
            <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">If you didn't request this, ignore this email. Your account is secure.</p>
          </div>
        </body></html>
      `,
    });
    return true;
  } catch {
    return false;
  }
}

// POST /api/auth/otp/send
router.post("/auth/otp/send", async (req, res): Promise<void> => {
  const { email } = req.body as { email?: string };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    res.status(400).json({ error: "Valid email address is required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Rate limit: 3 OTP requests per email per 10 minutes
  if (!checkOtpRateLimit(`send:${normalizedEmail}`, 3, 10 * 60 * 1000)) {
    res.status(429).json({ error: "Too many OTP requests. Please wait 10 minutes." });
    return;
  }

  try {
    // Invalidate any existing unused OTPs for this email
    await db
      .update(otpCodesTable)
      .set({ used: true })
      .where(and(eq(otpCodesTable.identifier, normalizedEmail), eq(otpCodesTable.used, false)));

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(otpCodesTable).values({
      identifier: normalizedEmail,
      otpCode: otp,
      expiresAt,
      used: false,
      attempts: 0,
    });

    // Check if user exists for personalization
    const [user] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.email, normalizedEmail)).limit(1);

    const sent = await sendOtpEmail(normalizedEmail, otp, user?.name ?? "");

    if (sent) {
      res.json({ success: true, message: "OTP sent to your email address", emailSent: true });
    } else {
      // Dev mode: return OTP in response when email service isn't configured
      res.json({
        success: true,
        message: "OTP generated (email service not configured — dev mode)",
        emailSent: false,
        devOtp: otp,
      });
    }
  } catch (err: any) {
    console.error("[otp/send]", err);
    res.status(500).json({ error: "Failed to generate OTP" });
  }
});

// POST /api/auth/otp/verify
router.post("/auth/otp/verify", async (req, res): Promise<void> => {
  const { email, code } = req.body as { email?: string; code?: string };

  if (!email || !code) {
    res.status(400).json({ error: "email and code are required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = String(code).trim();

  // Rate limit: 5 verify attempts per email per 5 minutes
  if (!checkOtpRateLimit(`verify:${normalizedEmail}`, 5, 5 * 60 * 1000)) {
    res.status(429).json({ error: "Too many verification attempts. Please try again in 5 minutes." });
    return;
  }

  try {
    const now = new Date();
    const [otpRecord] = await db
      .select()
      .from(otpCodesTable)
      .where(
        and(
          eq(otpCodesTable.identifier, normalizedEmail),
          eq(otpCodesTable.used, false),
          gt(otpCodesTable.expiresAt, now),
        ),
      )
      .orderBy(desc(otpCodesTable.createdAt))
      .limit(1);

    if (!otpRecord) {
      res.status(400).json({ error: "No valid OTP found. Please request a new code." });
      return;
    }

    // Increment attempts
    await db
      .update(otpCodesTable)
      .set({ attempts: otpRecord.attempts + 1 })
      .where(eq(otpCodesTable.id, otpRecord.id));

    if (otpRecord.attempts >= 5) {
      await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, otpRecord.id));
      res.status(400).json({ error: "Too many failed attempts. Please request a new code." });
      return;
    }

    if (otpRecord.otpCode !== normalizedCode) {
      res.status(400).json({ error: "Invalid code. Please try again." });
      return;
    }

    // Mark OTP as used
    await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, otpRecord.id));

    // Find or create user
    let user = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail)).limit(1).then(r => r[0]);

    if (!user) {
      // Auto-register: create user with email-derived name, no password
      const autoName = normalizedEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      const [created] = await db
        .insert(usersTable)
        .values({
          email: normalizedEmail,
          name: autoName,
          passwordHash: "",
          phone: null,
          address: null,
        })
        .returning();
      user = created;

      // Set account number
      const accountNumber = `ORB-${String(user.id).padStart(4, "0")}`;
      await db.update(usersTable).set({ accountNumber }).where(eq(usersTable.id, user.id));
      user.accountNumber = accountNumber;
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      success: true,
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
  } catch (err: any) {
    console.error("[otp/verify]", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
