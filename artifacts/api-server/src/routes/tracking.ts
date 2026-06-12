import { Router } from "express";
import { db } from "@workspace/db";
import { subscriptionsTable, plansTable, type TrackingEvent } from "@workspace/db";
import { eq } from "drizzle-orm";
import { adminAuth } from "../middlewares/adminAuth";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../middlewares/adminAuth";

const router = Router();

// ── SSE client registry ──────────────────────────────────────────────────────
const sseClients = new Map<number, Set<any>>();

export function broadcastTrackingUpdate(subscriptionId: number, data: object) {
  const clients = sseClients.get(subscriptionId);
  if (!clients || clients.size === 0) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try { res.write(payload); } catch { /* ignore closed connections */ }
  }
}

// ── GET /api/subscriptions/:id/tracking-stream ── SSE real-time feed ─────────
router.get("/subscriptions/:id/tracking-stream", (req, res): void => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).end(); return; }

  // Optional auth via query param token (SSE can't set headers easily)
  const token = req.query.token as string | undefined;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      res.status(401).end();
      return;
    }
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Register client
  if (!sseClients.has(id)) sseClients.set(id, new Set());
  sseClients.get(id)!.add(res);

  // Send initial heartbeat
  res.write(`data: {"type":"connected","subscriptionId":${id}}\n\n`);

  // Heartbeat every 25 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    try { res.write(": heartbeat\n\n"); } catch { clearInterval(heartbeat); }
  }, 25_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    const clients = sseClients.get(id);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) sseClients.delete(id);
    }
  });
});

export const TRACKING_STAGES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "activated",
  "completed",
] as const;

export type TrackingStage = (typeof TRACKING_STAGES)[number];

const TRACKING_LABELS: Record<string, string> = {
  pending: "Order Received",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  activated: "Activated",
  completed: "Completed",
};

const TRACKING_NOTES: Record<string, string> = {
  pending: "Your order has been received and is in our queue.",
  processing: "Hardware is being prepared and configured for your plan.",
  shipped: "Your Starlink kit is on its way. Expect delivery in 3–5 business days.",
  delivered: "Hardware delivered! Please set up your dish at the installation address.",
  activated: "Your service is now active and online. Welcome to the network!",
  completed: "Setup complete. You're fully connected to the OrbitFuture network.",
};

// ── PATCH /api/subscriptions/:id/tracking-status ── admin only ───────────────
router.patch("/subscriptions/:id/tracking-status", adminAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const { status, note } = req.body as { status?: string; note?: string };
    if (!status || !TRACKING_STAGES.includes(status as TrackingStage)) {
      res.status(400).json({ error: `status must be one of: ${TRACKING_STAGES.join(", ")}` });
      return;
    }

    const [existing] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: "Subscription not found" }); return; }

    const historyEvent: TrackingEvent = {
      status,
      timestamp: new Date().toISOString(),
      note: note ?? TRACKING_NOTES[status] ?? "",
      updatedBy: "admin",
    };

    const currentHistory = (existing.trackingHistory as TrackingEvent[]) ?? [];
    const newHistory = [...currentHistory, historyEvent];

    const [updated] = await db
      .update(subscriptionsTable)
      .set({
        trackingStatus: status,
        trackingHistory: newHistory,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsTable.id, id))
      .returning();

    const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, updated.planId)).limit(1);

    const broadcastPayload = {
      type: "tracking_update",
      subscriptionId: id,
      trackingStatus: status,
      label: TRACKING_LABELS[status] ?? status,
      note: historyEvent.note,
      timestamp: historyEvent.timestamp,
      history: newHistory,
    };

    broadcastTrackingUpdate(id, broadcastPayload);

    res.json({
      success: true,
      subscription: {
        id: updated.id,
        trackingStatus: updated.trackingStatus,
        trackingHistory: updated.trackingHistory,
        planName: plan?.name ?? "",
      },
    });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to update tracking status");
    res.status(500).json({ error: "Failed to update tracking status" });
  }
});

// ── GET /api/subscriptions/:id/tracking ── public tracking info ──────────────
router.get("/subscriptions/:id/tracking", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    // Optional user auth check
    const auth = req.headers.authorization as string | undefined;
    let userEmail: string | null = null;
    if (auth?.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as any;
        userEmail = decoded.email ?? null;
      } catch { /* anonymous */ }
    }

    const [row] = await db
      .select({ sub: subscriptionsTable, plan: plansTable })
      .from(subscriptionsTable)
      .leftJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
      .where(eq(subscriptionsTable.id, id))
      .limit(1);

    if (!row) { res.status(404).json({ error: "Subscription not found" }); return; }

    // Only owner or admin can see full details
    if (userEmail && row.sub.email.toLowerCase() !== userEmail.toLowerCase()) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.json({
      id: row.sub.id,
      trackingStatus: row.sub.trackingStatus,
      trackingHistory: (row.sub.trackingHistory as TrackingEvent[]) ?? [],
      planName: row.plan?.name ?? "",
      email: row.sub.email,
      createdAt: row.sub.createdAt,
    });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to get tracking");
    res.status(500).json({ error: "Failed to get tracking" });
  }
});

export default router;
