import { Router } from "express";
import { db } from "@workspace/db";
import { flutterwaveTransactionsTable, walletsTable, walletTransactionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "./auth";
import { BUNDLES, getAllBundles, getBundleByAmount, type Currency } from "../utils/bundleMapper";

const router = Router();

const FLW_SECRET = () => process.env["FLW_SECRET_KEY"] ?? "";
const FLW_API = "https://api.flutterwave.com/v3";
const APP_URL = process.env["APP_URL"] ?? "https://www.spacexstarlink.com";

// ── helpers ────────────────────────────────────────────────────────────────────

async function flwGet(path: string) {
  const r = await fetch(`${FLW_API}${path}`, {
    headers: { Authorization: `Bearer ${FLW_SECRET()}`, "Content-Type": "application/json" },
  });
  return r.json() as Promise<Record<string, unknown>>;
}

async function flwPost(path: string, body: unknown) {
  const r = await fetch(`${FLW_API}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${FLW_SECRET()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json() as Promise<Record<string, unknown>>;
}

async function getOrCreateWallet(email: string) {
  const [existing] = await db.select().from(walletsTable).where(eq(walletsTable.email, email)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(walletsTable).values({ email, balance: 0 }).returning();
  return created;
}

async function creditTokens(userId: number, email: string, tokens: number, txRef: string, bundleName: string, amount: string, currency: string, flwRef: string) {
  const wallet = await getOrCreateWallet(email);
  const [updatedWallet] = await db
    .update(walletsTable)
    .set({ balance: wallet.balance + tokens, updatedAt: new Date() })
    .where(eq(walletsTable.id, wallet.id))
    .returning();
  await db.insert(walletTransactionsTable).values({
    walletId: wallet.id,
    type: "credit",
    amount: tokens,
    description: `Flutterwave: ${bundleName} bundle — ${tokens} tokens`,
    reference: txRef,
    status: "completed",
    metadata: { source: "flutterwave", amount, currency, flwRef, bundleName },
  });
  await db.update(flutterwaveTransactionsTable)
    .set({ status: "successful", flwRef })
    .where(eq(flutterwaveTransactionsTable.txRef, txRef));
  return updatedWallet.balance;
}

// ── A) POST /api/flutterwave-init ─────────────────────────────────────────────

router.post("/flutterwave-init", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const { currency, bundleId } = req.body as { currency: string; bundleId: string };
    if (!currency || !bundleId) {
      res.status(400).json({ error: "currency and bundleId are required" });
      return;
    }

    const cur = currency.toUpperCase() as Currency;
    const bundle = BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) { res.status(400).json({ error: "Invalid bundleId" }); return; }
    const amount = bundle.prices[cur];
    if (!amount) { res.status(400).json({ error: `Currency ${cur} not supported` }); return; }

    const txRef = `FLW-${req.user.userId}-${Date.now()}`;

    // Pre-insert pending transaction for idempotency
    await db.insert(flutterwaveTransactionsTable).values({
      userId: req.user.userId,
      email: req.user.email,
      bundleName: bundle.name,
      tokens: bundle.tokens,
      amount: String(amount),
      currency: cur,
      txRef,
      status: "pending",
    }).onConflictDoNothing();

    const payload = {
      tx_ref: txRef,
      amount,
      currency: cur,
      redirect_url: `${APP_URL}/wallet?verify=true`,
      customer: { email: req.user.email },
      meta: { userId: req.user.userId, bundleId, tokens: bundle.tokens },
      customizations: {
        title: "Starlink HQ — Token Purchase",
        description: `${bundle.tokens} ${bundle.name} Tokens`,
        logo: `${APP_URL}/favicon.ico`,
      },
    };

    const data = await flwPost("/payments", payload) as any;
    if (data.status !== "success") {
      req.log.error({ data }, "Flutterwave init failed");
      res.status(502).json({ error: data.message || "Payment initiation failed" });
      return;
    }

    res.json({ paymentLink: data.data.link, txRef });
  } catch (err) {
    req.log.error({ err }, "flutterwave-init error");
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

// ── B) GET /api/flutterwave-verify ────────────────────────────────────────────

router.get("/flutterwave-verify", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const transactionId = req.query.transaction_id as string;
    if (!transactionId) { res.status(400).json({ error: "transaction_id is required" }); return; }

    const data = await flwGet(`/transactions/${transactionId}/verify`) as any;
    if (data.status !== "success" || data.data?.status !== "successful") {
      res.status(400).json({ error: "Payment not successful", detail: data.message });
      return;
    }

    const txData = data.data;
    const txRef: string = txData.tx_ref;
    const amount: number = txData.amount;
    const currency: Currency = txData.currency as Currency;
    const flwRef: string = txData.flw_ref;

    // Idempotency check — if already successful, just return current balance
    const [existing] = await db.select().from(flutterwaveTransactionsTable)
      .where(eq(flutterwaveTransactionsTable.txRef, txRef)).limit(1);
    if (existing?.status === "successful") {
      const wallet = await getOrCreateWallet(req.user.email);
      res.json({ success: true, tokensAdded: existing.tokens, newBalance: wallet.balance, alreadyProcessed: true });
      return;
    }

    // Match bundle by amount + currency
    const bundleMatch = getBundleByAmount(amount, currency);
    if (!bundleMatch) {
      req.log.warn({ amount, currency, txRef }, "No bundle matched for Flutterwave verify");
      res.status(400).json({ error: "Could not match payment to a bundle" });
      return;
    }

    const newBalance = await creditTokens(
      req.user.userId, req.user.email, bundleMatch.tokens,
      txRef, bundleMatch.name, String(amount), currency, flwRef
    );

    res.json({ success: true, tokensAdded: bundleMatch.tokens, newBalance });
  } catch (err) {
    req.log.error({ err }, "flutterwave-verify error");
    res.status(500).json({ error: "Verification failed" });
  }
});

// ── C) POST /api/flutterwave-webhook ─────────────────────────────────────────

router.post("/flutterwave-webhook", async (req, res): Promise<void> => {
  // Always respond 200 immediately to prevent Flutterwave retries
  res.sendStatus(200);

  try {
    const secret = process.env["FLW_WEBHOOK_SECRET"];
    const hash = req.headers["verif-hash"] as string;
    if (secret && hash !== secret) {
      req.log.warn("Flutterwave webhook: invalid verif-hash");
      return;
    }

    const raw = Buffer.isBuffer(req.body) ? req.body.toString("utf-8") : JSON.stringify(req.body);
    const event = JSON.parse(raw) as any;

    req.log.info({ event: event.event, txRef: event.data?.tx_ref }, "Flutterwave webhook received");

    if (event.event !== "charge.completed") return;
    if (event.data?.status !== "successful") return;

    const txData = event.data;
    const txRef: string = txData.tx_ref;
    const flwRef: string = txData.flw_ref;
    const email: string = txData.customer?.email;
    const currency: Currency = txData.currency as Currency;

    if (!txRef || !email) { req.log.warn({ txRef, email }, "Webhook missing txRef or email"); return; }

    // Re-verify with Flutterwave API
    const verify = await flwGet(`/transactions/${txData.id}/verify`) as any;
    if (verify.status !== "success" || verify.data?.status !== "successful") {
      req.log.warn({ txRef }, "Webhook re-verify failed");
      return;
    }

    const amount: number = verify.data.amount;

    // Idempotency check
    const [existing] = await db.select().from(flutterwaveTransactionsTable)
      .where(eq(flutterwaveTransactionsTable.txRef, txRef)).limit(1);
    if (existing?.status === "successful") {
      req.log.info({ txRef }, "Webhook: already processed, skipping");
      return;
    }

    // Match bundle
    const bundleMatch = getBundleByAmount(amount, currency);
    if (!bundleMatch) { req.log.warn({ amount, currency, txRef }, "Webhook: no bundle match"); return; }

    // Find user id from pending tx or wallet
    let userId = existing?.userId;
    if (!userId) {
      // Extract from tx_ref: FLW-{userId}-{timestamp}
      const parts = txRef.split("-");
      userId = parseInt(parts[1] ?? "0") || 0;
    }
    if (!userId) { req.log.warn({ txRef }, "Webhook: could not determine userId"); return; }

    await creditTokens(userId, email, bundleMatch.tokens, txRef, bundleMatch.name, String(amount), currency, flwRef);
    req.log.info({ txRef, tokens: bundleMatch.tokens, email }, "Webhook: tokens credited successfully");
  } catch (err) {
    req.log.error({ err }, "Flutterwave webhook processing error");
  }
});

// ── E) POST /api/flutterwave-plan-pay ─────────────────────────────────────────
// Generates a Flutterwave payment link for a Starlink plan purchase

const PLAN_PRICES: Record<number, { name: string; priceMonthly: number; speed: string }> = {
  1: { name: "Starlink Best Effort", priceMonthly: 90, speed: "5–100 Mbps" },
  2: { name: "Starlink Standard", priceMonthly: 120, speed: "50–250 Mbps" },
  3: { name: "Starlink Standard Plus", priceMonthly: 150, speed: "100–300 Mbps" },
  4: { name: "Starlink Roam", priceMonthly: 150, speed: "50–200 Mbps" },
  5: { name: "Starlink Maritime", priceMonthly: 250, speed: "100–350 Mbps" },
  6: { name: "Starlink Aviation", priceMonthly: 500, speed: "100–350 Mbps" },
  7: { name: "Starlink Business", priceMonthly: 500, speed: "200–500 Mbps" },
  8: { name: "Starlink Enterprise", priceMonthly: 1500, speed: "500 Mbps–1 Gbps" },
  9: { name: "Starlink Global Elite", priceMonthly: 3000, speed: "1 Gbps+" },
};

router.post("/flutterwave-plan-pay", async (req, res): Promise<void> => {
  try {
    const { planId, email, name, address, currency } = req.body as {
      planId: number;
      email: string;
      name: string;
      address?: string;
      currency?: string;
    };

    if (!planId || !email?.trim() || !name?.trim()) {
      res.status(400).json({ error: "planId, email, and name are required" });
      return;
    }

    if (!FLW_SECRET()) {
      res.status(503).json({ error: "Payment gateway not configured. Please contact support." });
      return;
    }

    // Look up plan from DB, fall back to static map
    let planName: string;
    let priceMonthly: number;
    let planSpeed: string;

    try {
      const { plansTable } = await import("@workspace/db");
      const { eq } = await import("drizzle-orm");
      const [dbPlan] = await db.select().from(plansTable).where(eq(plansTable.id, planId)).limit(1);
      if (dbPlan) {
        planName = dbPlan.name;
        priceMonthly = parseFloat(String(dbPlan.priceMonthly));
        planSpeed = dbPlan.speed;
      } else {
        throw new Error("not in db");
      }
    } catch {
      const fallback = PLAN_PRICES[planId];
      if (!fallback) { res.status(404).json({ error: "Plan not found" }); return; }
      planName = fallback.name;
      priceMonthly = fallback.priceMonthly;
      planSpeed = fallback.speed;
    }

    const cur = (currency ?? "USD").toUpperCase();
    const txRef = `PLAN-${planId}-${Date.now()}`;

    const safeEmail = encodeURIComponent(email.trim());
    const safeName = encodeURIComponent(name.trim());
    const safeAddr = encodeURIComponent(address?.trim() ?? "");

    const redirectUrl =
      `${APP_URL}/plans?flw_verify=1&plan_id=${planId}&email=${safeEmail}&name=${safeName}&address=${safeAddr}`;

    const payload = {
      tx_ref: txRef,
      amount: priceMonthly,
      currency: cur,
      redirect_url: redirectUrl,
      customer: { email: email.trim(), name: name.trim() },
      meta: { planId, planName, planSpeed, address: address?.trim() ?? "" },
      customizations: {
        title: `Starlink — ${planName}`,
        description: `${planSpeed} · $${priceMonthly}/month`,
        logo: `${APP_URL}/favicon.ico`,
      },
    };

    const data = await flwPost("/payments", payload) as any;
    if (data.status !== "success") {
      res.status(502).json({ error: data.message ?? "Payment initiation failed" });
      return;
    }

    res.json({ paymentLink: data.data.link, txRef });
  } catch (err) {
    req.log?.error?.({ err }, "flutterwave-plan-pay error");
    res.status(500).json({ error: "Failed to generate payment link" });
  }
});

// ── F) POST /api/flutterwave-plan-verify ──────────────────────────────────────
// Called after Flutterwave redirects back to the site

router.post("/flutterwave-plan-verify", async (req, res): Promise<void> => {
  try {
    const { transaction_id, plan_id, email, name, address } = req.body as {
      transaction_id: string;
      plan_id: string;
      email?: string;
      name?: string;
      address?: string;
    };

    if (!transaction_id) {
      res.status(400).json({ error: "transaction_id is required" });
      return;
    }

    if (!FLW_SECRET()) {
      res.status(503).json({ error: "Payment gateway not configured" });
      return;
    }

    // Verify with Flutterwave
    const data = await flwGet(`/transactions/${transaction_id}/verify`) as any;
    if (data.status !== "success" || data.data?.status !== "successful") {
      res.status(400).json({ error: "Payment not verified", detail: data.message });
      return;
    }

    const txData = data.data;
    const amountPaid: number = txData.amount;
    const currency: string = txData.currency;
    const flwRef: string = txData.flw_ref;
    const planIdNum = parseInt(plan_id ?? "0") || 0;

    // Look up plan
    let planName: string;
    let planSpeed: string;

    try {
      const { plansTable } = await import("@workspace/db");
      const { eq } = await import("drizzle-orm");
      const [dbPlan] = await db.select().from(plansTable).where(eq(plansTable.id, planIdNum)).limit(1);
      planName = dbPlan?.name ?? PLAN_PRICES[planIdNum]?.name ?? "Starlink Plan";
      planSpeed = dbPlan?.speed ?? PLAN_PRICES[planIdNum]?.speed ?? "";
    } catch {
      planName = PLAN_PRICES[planIdNum]?.name ?? "Starlink Plan";
      planSpeed = PLAN_PRICES[planIdNum]?.speed ?? "";
    }

    const customerEmail = email ?? txData.customer?.email ?? "";
    const customerName = name ?? txData.customer?.name ?? "";

    // Save subscription (best-effort — may fail without DB on Vercel)
    let subscriptionId: number | null = null;
    try {
      const { subscriptionsTable } = await import("@workspace/db");
      const [sub] = await db
        .insert(subscriptionsTable)
        .values({
          email: customerEmail,
          name: customerName,
          planId: planIdNum,
          status: "active",
          address: address ?? "",
          amountPaid: String(amountPaid),
          stripeSubscriptionId: flwRef,
        })
        .returning();
      subscriptionId = sub?.id ?? null;
    } catch {
      // DB unavailable — still return success with payment details
    }

    res.json({
      success: true,
      subscription: {
        id: subscriptionId,
        planName,
        planSpeed,
        email: customerEmail,
        amountPaid,
        currency,
        flwRef,
        address: address ?? "",
      },
    });
  } catch (err) {
    req.log?.error?.({ err }, "flutterwave-plan-verify error");
    res.status(500).json({ error: "Verification failed" });
  }
});

// ── D) GET /api/user/token-balance ────────────────────────────────────────────

router.get("/user/token-balance", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const wallet = await getOrCreateWallet(req.user.email);
    const transactions = await db
      .select()
      .from(flutterwaveTransactionsTable)
      .where(eq(flutterwaveTransactionsTable.userId, req.user.userId))
      .orderBy(desc(flutterwaveTransactionsTable.createdAt))
      .limit(10);

    res.json({
      balance: wallet.balance,
      transactions: transactions.map((t) => ({
        id: t.id,
        bundleName: t.bundleName,
        tokens: t.tokens,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        createdAt: t.createdAt,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "token-balance error");
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

export default router;
