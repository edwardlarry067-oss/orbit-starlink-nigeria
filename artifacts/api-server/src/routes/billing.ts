import { Router } from "express";
import { db } from "@workspace/db";
import { invoicesTable, subscriptionsTable, plansTable } from "@workspace/db";
import { eq, desc, sql, and, count, gte, lte } from "drizzle-orm";
import { requireAuth } from "./auth";
import { adminAuth } from "../middlewares/adminAuth";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../middlewares/adminAuth";

const router = Router();

// ── GET /api/billing/invoices — user's own invoices ───────────────────────────
router.get("/billing/invoices", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const invoices = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.userEmail, req.user.email.toLowerCase()))
      .orderBy(desc(invoicesTable.createdAt));

    res.json({ invoices });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to fetch invoices");
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// ── GET /api/billing/invoices/:id — invoice detail ───────────────────────────
router.get("/billing/invoices/:id", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const [inv] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id)).limit(1);
    if (!inv) { res.status(404).json({ error: "Invoice not found" }); return; }

    // Security: user can only see their own invoices
    if (inv.userEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Attach subscription info if linked
    let subscription = null;
    if (inv.subscriptionId) {
      const [sub] = await db
        .select({ sub: subscriptionsTable, plan: plansTable })
        .from(subscriptionsTable)
        .leftJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
        .where(eq(subscriptionsTable.id, inv.subscriptionId))
        .limit(1);
      subscription = sub ?? null;
    }

    res.json({ invoice: inv, subscription });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to fetch invoice");
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

// ── GET /api/billing/summary — upcoming bills + outstanding balance ───────────
router.get("/billing/summary", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const email = req.user.email.toLowerCase();

    const invoices = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.userEmail, email))
      .orderBy(desc(invoicesTable.createdAt));

    const paid = invoices.filter(i => i.status === "paid");
    const unpaid = invoices.filter(i => i.status !== "paid");
    const overdue = invoices.filter(i => i.status === "overdue");

    const totalPaid = paid.reduce((sum, i) => sum + parseFloat(String(i.amountUsd)), 0);
    const totalOutstanding = unpaid.reduce((sum, i) => sum + parseFloat(String(i.amountUsd)), 0);

    // Next billing: find active subscriptions → renewal dates
    const activeSubs = await db
      .select({ sub: subscriptionsTable, plan: plansTable })
      .from(subscriptionsTable)
      .leftJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
      .where(eq(subscriptionsTable.email, email));

    const nextBills = activeSubs
      .filter(r => r.sub.status === "active" && r.sub.renewalDate)
      .map(r => ({
        subscriptionId: r.sub.id,
        planName: r.plan?.name ?? "Starlink Plan",
        amount: parseFloat(String(r.plan?.priceMonthly ?? 0)),
        renewalDate: r.sub.renewalDate,
        autoRenew: r.sub.autoRenew,
      }))
      .sort((a, b) => new Date(a.renewalDate!).getTime() - new Date(b.renewalDate!).getTime());

    res.json({
      invoiceCount: invoices.length,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      unpaidCount: unpaid.length,
      overdueCount: overdue.length,
      nextBills,
      recentInvoices: invoices.slice(0, 5),
    });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to fetch billing summary");
    res.status(500).json({ error: "Failed to fetch billing summary" });
  }
});

// ── PATCH /api/subscriptions/:id/auto-renew — toggle auto-renew ──────────────
router.patch("/subscriptions/:id/auto-renew", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const [existing] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: "Subscription not found" }); return; }
    if (existing.email.toLowerCase() !== req.user.email.toLowerCase()) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { autoRenew } = req.body as { autoRenew?: boolean };
    if (typeof autoRenew !== "boolean") {
      res.status(400).json({ error: "autoRenew must be a boolean" });
      return;
    }

    const [updated] = await db
      .update(subscriptionsTable)
      .set({ autoRenew, updatedAt: new Date() })
      .where(eq(subscriptionsTable.id, id))
      .returning();

    res.json({ success: true, autoRenew: updated.autoRenew });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to update auto-renew");
    res.status(500).json({ error: "Failed to update auto-renew" });
  }
});

// ── GET /api/admin/billing/invoices — all invoices (admin) ───────────────────
router.get("/admin/billing/invoices", adminAuth, async (req, res): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const fromDate = req.query.from as string | undefined;
    const toDate = req.query.to as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (status && status !== "all") conditions.push(eq(invoicesTable.status, status));
    if (fromDate) {
      const from = new Date(fromDate);
      if (!isNaN(from.getTime())) conditions.push(gte(invoicesTable.createdAt, from));
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (!isNaN(to.getTime())) conditions.push(lte(invoicesTable.createdAt, to));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const invoices = await db
      .select()
      .from(invoicesTable)
      .where(whereClause)
      .orderBy(desc(invoicesTable.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() }).from(invoicesTable).where(whereClause);

    const totalRevenue = await db
      .select({ sum: sql<string>`COALESCE(SUM(amount_usd::numeric),0)` })
      .from(invoicesTable)
      .where(eq(invoicesTable.status, "paid"))
      .then(r => parseFloat(r[0]?.sum ?? "0"));

    const totalOutstanding = await db
      .select({ sum: sql<string>`COALESCE(SUM(amount_usd::numeric),0)` })
      .from(invoicesTable)
      .where(eq(invoicesTable.status, "unpaid"))
      .then(r => parseFloat(r[0]?.sum ?? "0"));

    res.json({ invoices, total, page, limit, totalRevenue, totalOutstanding });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to fetch admin invoices");
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// ── PATCH /api/admin/billing/invoices/:id/mark-paid ───────────────────────────
router.patch("/admin/billing/invoices/:id/mark-paid", adminAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const [updated] = await db
      .update(invoicesTable)
      .set({ status: "paid", paidAt: new Date(), updatedAt: new Date() })
      .where(eq(invoicesTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Invoice not found" }); return; }

    res.json({ success: true, invoice: updated });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to mark invoice paid");
    res.status(500).json({ error: "Failed to mark invoice paid" });
  }
});

// ── DELETE /api/admin/billing/invoices/:id ────────────────────────────────────
router.delete("/admin/billing/invoices/:id", adminAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    await db.delete(invoicesTable).where(eq(invoicesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log?.error?.({ err }, "Failed to delete invoice");
    res.status(500).json({ error: "Failed to delete invoice" });
  }
});

export default router;
