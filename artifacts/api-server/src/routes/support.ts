import { Router } from "express";
import { db } from "@workspace/db";
import { supportTicketsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { adminAuth } from "../middlewares/adminAuth";
import { sendSupportReply } from "../lib/email";

const router = Router();

function generateTicketRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "ORB-";
  for (let i = 0; i < 8; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

function sanitize(s: string): string {
  return s.trim().replace(/[<>]/g, "").slice(0, 5000);
}

// POST /api/support/tickets — customer submits a ticket (no auth required)
router.post("/support/tickets", async (req, res): Promise<void> => {
  try {
    const { customerName, customerEmail, subject, message, priority } = req.body as {
      customerName?: string;
      customerEmail?: string;
      subject?: string;
      message?: string;
      priority?: string;
    };

    const name = typeof customerName === "string" ? sanitize(customerName) : "";
    const email = typeof customerEmail === "string" ? customerEmail.trim().toLowerCase() : "";
    const subj = typeof subject === "string" ? sanitize(subject) : "";
    const msg = typeof message === "string" ? sanitize(message) : "";
    const prio = ["low", "normal", "high", "urgent"].includes(priority ?? "")
      ? (priority as string)
      : "normal";

    if (!name || !email || !subj || !msg) {
      res.status(400).json({ error: "customerName, customerEmail, subject, and message are required" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    let ticketRef = generateTicketRef();
    // ensure uniqueness
    for (let i = 0; i < 5; i++) {
      const [existing] = await db
        .select({ id: supportTicketsTable.id })
        .from(supportTicketsTable)
        .where(eq(supportTicketsTable.ticketRef, ticketRef))
        .limit(1);
      if (!existing) break;
      ticketRef = generateTicketRef();
    }

    const [ticket] = await db
      .insert(supportTicketsTable)
      .values({ ticketRef, customerName: name, customerEmail: email, subject: subj, message: msg, priority: prio, status: "open" })
      .returning();

    res.status(201).json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketRef: ticket.ticketRef,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create support ticket");
    res.status(500).json({ error: "Failed to submit ticket" });
  }
});

// GET /api/support/tickets?email=... — customer retrieves their tickets
router.get("/support/tickets", async (req, res): Promise<void> => {
  try {
    const email = req.query.email as string | undefined;
    const ref = req.query.ref as string | undefined;

    if (!email && !ref) {
      res.status(400).json({ error: "email or ref query param is required" });
      return;
    }

    let whereClause: any;
    if (ref) {
      whereClause = eq(supportTicketsTable.ticketRef, ref.toUpperCase());
    } else {
      whereClause = eq(supportTicketsTable.customerEmail, (email as string).toLowerCase());
    }

    const tickets = await db
      .select()
      .from(supportTicketsTable)
      .where(whereClause)
      .orderBy(desc(supportTicketsTable.createdAt));

    res.json({ tickets });
  } catch (err) {
    req.log.error({ err }, "Failed to list tickets");
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// ── Admin endpoints ────────────────────────────────────────────────────────────

// GET /api/admin/support/tickets
router.get("/admin/support/tickets", adminAuth, async (req, res): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;

    let whereClause: any;
    if (status && status !== "all") {
      whereClause = eq(supportTicketsTable.status, status);
    }

    const [tickets, [{ total }]] = await Promise.all([
      db
        .select()
        .from(supportTicketsTable)
        .where(whereClause)
        .orderBy(desc(supportTicketsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(supportTicketsTable).where(whereClause),
    ]);

    res.json({ tickets, total, page, limit });
  } catch (err) {
    req.log.error({ err }, "Failed to list admin support tickets");
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// PATCH /api/admin/support/tickets/:id — update status and/or reply
router.patch("/admin/support/tickets/:id", adminAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const { status, adminReply } = req.body as { status?: string; adminReply?: string };

    const [ticket] = await db
      .select()
      .from(supportTicketsTable)
      .where(eq(supportTicketsTable.id, id))
      .limit(1);

    if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (adminReply !== undefined) {
      const replyText = sanitize(adminReply);
      updateData.adminReply = replyText;
      updateData.adminRepliedAt = new Date();
      if (!status) updateData.status = "replied";

      // Send email notification to customer
      sendSupportReply({
        customerName: ticket.customerName,
        customerEmail: ticket.customerEmail,
        ticketId: ticket.ticketRef,
        subject: ticket.subject,
        message: replyText,
        agentName: "ORBITFUTURE Support",
      }).catch(() => {});
    }

    const [updated] = await db
      .update(supportTicketsTable)
      .set(updateData)
      .where(eq(supportTicketsTable.id, id))
      .returning();

    res.json({ success: true, ticket: updated });
  } catch (err) {
    req.log.error({ err }, "Failed to update support ticket");
    res.status(500).json({ error: "Failed to update ticket" });
  }
});

// DELETE /api/admin/support/tickets/:id
router.delete("/admin/support/tickets/:id", adminAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const [deleted] = await db
      .delete(supportTicketsTable)
      .where(eq(supportTicketsTable.id, id))
      .returning({ id: supportTicketsTable.id });

    if (!deleted) { res.status(404).json({ error: "Ticket not found" }); return; }
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete ticket");
    res.status(500).json({ error: "Failed to delete ticket" });
  }
});

export default router;
