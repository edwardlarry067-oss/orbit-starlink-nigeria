import { Router } from "express";
import { db } from "@workspace/db";
import { plansTable, subscriptionsTable, walletsTable, walletTransactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendSubscriptionConfirmation } from "../lib/email";
import { createInvoice } from "../lib/invoiceService";
import { requireAuth } from "./auth";

const router = Router();

// ── Wallet Pay: debit wallet tokens and create subscription directly ──────────
// requireAuth ensures only the authenticated user can spend their own wallet.
// Email is taken from the verified JWT — never from the request body — so no
// user can drain another user's wallet by supplying a different email address.
router.post("/checkout/wallet-pay", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const { planId, name, address } = req.body as {
      planId: number;
      name: string;
      address?: string;
    };

    const email: string = req.user.email;

    if (!planId || !name) {
      res.status(400).json({ error: "planId and name are required" });
      return;
    }

    const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, planId));
    if (!plan) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    const priceTokens = Math.ceil(parseFloat(plan.priceMonthly));

    const existing = await db.select().from(walletsTable).where(eq(walletsTable.email, email.toLowerCase())).limit(1);
    let wallet = existing[0];
    if (!wallet) {
      const [created] = await db.insert(walletsTable).values({ email: email.toLowerCase(), balance: 0 }).returning();
      wallet = created;
    }

    if (wallet.balance < priceTokens) {
      res.status(402).json({
        error: "Insufficient wallet balance",
        required: priceTokens,
        available: wallet.balance,
      });
      return;
    }

    const [updatedWallet] = await db
      .update(walletsTable)
      .set({ balance: wallet.balance - priceTokens, updatedAt: new Date() })
      .where(eq(walletsTable.id, wallet.id))
      .returning();

    await db.insert(walletTransactionsTable).values({
      walletId: wallet.id,
      type: "debit",
      amount: priceTokens,
      description: `Subscription: ${plan.name} — 1 month`,
      reference: `SUB-${Date.now()}`,
      status: "completed",
      metadata: { planId, planName: plan.name },
    });

    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    const [sub] = await db
      .insert(subscriptionsTable)
      .values({
        email: email.toLowerCase(),
        name,
        planId,
        address: address ?? null,
        status: "active",
        stripeSessionId: `wallet_${Date.now()}`,
        renewalDate,
        nextBillingDate: renewalDate,
        autoRenew: true,
        trackingStatus: "pending",
      })
      .returning();

    createInvoice({
      userEmail: email,
      subscriptionId: sub.id,
      planId,
      amountPaid: priceTokens,
      currency: "USD",
      paymentRef: sub.stripeSessionId ?? undefined,
      isFirstMonth: false,
    }).catch(() => {});

    sendSubscriptionConfirmation({
      customerName: sub.name,
      customerEmail: sub.email,
      planName: plan.name,
      planCategory: plan.category,
      planSpeed: plan.speed,
      priceMonthly: parseFloat(plan.priceMonthly),
      features: plan.features as string[],
      subscriptionId: sub.id,
    }).catch(() => {});

    res.json({
      success: true,
      subscription: {
        id: sub.id,
        email: sub.email,
        name: sub.name,
        planId: sub.planId,
        planName: plan.name,
        planCategory: plan.category,
        priceMonthly: parseFloat(plan.priceMonthly),
        status: sub.status,
        createdAt: sub.createdAt,
      },
      wallet: {
        balance: updatedWallet.balance,
        tokensUsed: priceTokens,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to process wallet payment");
    res.status(500).json({ error: "Failed to process wallet payment" });
  }
});

// ── Legacy Stripe endpoints — removed, Flutterwave is the only payment method ─
router.post("/checkout/session", (_req, res) => {
  res.status(410).json({ error: "Stripe checkout removed. Use Flutterwave on the Plans page." });
});

router.get("/checkout/success", (_req, res) => {
  res.json({ success: true });
});

router.post("/checkout/webhook", (_req, res) => {
  res.json({ received: true });
});

export default router;
