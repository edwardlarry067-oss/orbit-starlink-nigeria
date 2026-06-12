import { Router } from "express";
import Stripe from "stripe";
import { db } from "@workspace/db";
import { subscriptionsTable, plansTable, walletsTable, walletTransactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { BUNDLES } from "../utils/bundleMapper";
import { requireAuth } from "./auth";
import { sendSubscriptionConfirmation, sendPaymentReceipt, sendAdminPaymentAlert } from "../lib/email";

const router = Router();

function getStripe(): Stripe {
  const key = process.env["STRIPE_SECRET_KEY"] ?? "";
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  if (key.startsWith("pk_")) {
    throw new Error("STRIPE_SECRET_KEY is a publishable key (pk_...). Please set it to your secret key (sk_...) from the Stripe dashboard.");
  }
  return new Stripe(key, { apiVersion: "2025-04-30.basil" });
}

const APP_URL = (() => {
  const url = process.env["APP_URL"] ?? process.env["REPLIT_DEV_DOMAIN"];
  if (url) return url.startsWith("http") ? url : `https://${url}`;
  return "https://www.orbitfuture.com";
})();

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

// ── Token wallet helpers ───────────────────────────────────────────────────────

async function getOrCreateWallet(email: string) {
  const [existing] = await db.select().from(walletsTable).where(eq(walletsTable.email, email)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(walletsTable).values({ email, balance: 0 }).returning();
  return created;
}

async function creditTokensViaStripe(email: string, tokens: number, bundleName: string, sessionId: string) {
  const wallet = await getOrCreateWallet(email);
  const [updated] = await db
    .update(walletsTable)
    .set({ balance: wallet.balance + tokens, updatedAt: new Date() })
    .where(eq(walletsTable.id, wallet.id))
    .returning();
  await db.insert(walletTransactionsTable).values({
    walletId: wallet.id,
    type: "credit",
    amount: tokens,
    description: `Stripe: ${bundleName} bundle — ${tokens} tokens`,
    reference: sessionId,
    status: "completed",
    metadata: { source: "stripe", bundleName, sessionId },
  });
  return updated.balance;
}

// POST /api/stripe-token-buy
router.post("/stripe-token-buy", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const { bundleId } = req.body as { bundleId: string };
    if (!bundleId) { res.status(400).json({ error: "bundleId is required" }); return; }

    const stripeKey = process.env["STRIPE_SECRET_KEY"];
    if (!stripeKey) { res.status(503).json({ error: "Payment gateway not configured." }); return; }
    if (stripeKey.startsWith("pk_")) { res.status(503).json({ error: "Stripe is misconfigured: a publishable key was provided. Please set STRIPE_SECRET_KEY to your secret key (sk_...) from the Stripe dashboard." }); return; }

    const bundle = BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) { res.status(400).json({ error: "Invalid bundleId" }); return; }

    const amountUsd = bundle.prices["USD"];
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Orbit Wallet — ${bundle.name} Bundle`,
              description: `${bundle.tokens.toLocaleString()} tokens added to your Orbit Wallet`,
            },
            unit_amount: Math.round(amountUsd * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "token_bundle",
        bundleId: bundle.id,
        bundleName: bundle.name,
        tokens: String(bundle.tokens),
        userId: String(req.user.userId),
        customerEmail: req.user.email,
      },
      success_url: `${APP_URL}/wallet?stripe_token_success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/wallet?stripe_token_cancel=1`,
    });

    res.json({ paymentLink: session.url, sessionId: session.id });
  } catch (err) {
    req.log?.error?.({ err }, "stripe-token-buy error");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// POST /api/stripe-token-verify
router.post("/stripe-token-verify", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const { session_id } = req.body as { session_id: string };
    if (!session_id) { res.status(400).json({ error: "session_id is required" }); return; }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      res.status(400).json({ error: "Payment not completed", status: session.payment_status });
      return;
    }

    const meta = session.metadata ?? {};
    if (meta.type !== "token_bundle") {
      res.status(400).json({ error: "Invalid session type" });
      return;
    }

    // Idempotency: check if this session was already processed
    const [existing] = await db
      .select()
      .from(walletTransactionsTable)
      .where(eq(walletTransactionsTable.reference, session_id))
      .limit(1);

    const tokens = parseInt(meta.tokens ?? "0") || 0;
    const bundleName = meta.bundleName ?? "Bundle";
    const email = meta.customerEmail ?? req.user.email;

    if (existing) {
      const wallet = await getOrCreateWallet(email);
      res.json({ success: true, tokensAdded: tokens, newBalance: wallet.balance, alreadyProcessed: true });
      return;
    }

    const newBalance = await creditTokensViaStripe(email, tokens, bundleName, session_id);

    sendAdminPaymentAlert({
      type: "token",
      customerName: email,
      customerEmail: email,
      item: `${bundleName} — ${tokens.toLocaleString()} tokens`,
      amountPaid: (session.amount_total ?? 0) / 100,
      currency: session.currency?.toUpperCase() ?? "USD",
      transactionId: session_id,
    }).catch(() => {});

    res.json({ success: true, tokensAdded: tokens, newBalance });
  } catch (err) {
    req.log?.error?.({ err }, "stripe-token-verify error");
    res.status(500).json({ error: "Verification failed" });
  }
});

// POST /api/stripe-plan-pay
router.post("/stripe-plan-pay", async (req, res): Promise<void> => {
  try {
    const { planId, email, name, address } = req.body as {
      planId: number;
      email: string;
      name: string;
      address?: string;
    };

    if (!planId || !email?.trim() || !name?.trim()) {
      res.status(400).json({ error: "planId, email, and name are required" });
      return;
    }

    const stripeKey = process.env["STRIPE_SECRET_KEY"];
    if (!stripeKey) {
      res.status(503).json({ error: "Payment gateway not configured. Please contact support." });
      return;
    }
    if (stripeKey.startsWith("pk_")) {
      res.status(503).json({ error: "Stripe is misconfigured: a publishable key was provided. Please set STRIPE_SECRET_KEY to your secret key (sk_...) from the Stripe dashboard." });
      return;
    }

    let planName: string;
    let priceMonthly: number;
    let planSpeed: string;
    let hardwarePrice: number = 0;

    try {
      const [dbPlan] = await db.select().from(plansTable).where(eq(plansTable.id, planId)).limit(1);
      if (dbPlan) {
        planName = dbPlan.name;
        priceMonthly = parseFloat(String(dbPlan.priceMonthly));
        planSpeed = dbPlan.speed;
        hardwarePrice = dbPlan.hardwarePrice ? parseFloat(String(dbPlan.hardwarePrice)) : 0;
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

    const stripe = getStripe();

    const safeEmail = encodeURIComponent(email.trim());
    const safeName = encodeURIComponent(name.trim());
    const safeAddr = encodeURIComponent(address?.trim() ?? "");

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: planName,
            description: `${planSpeed} · $${priceMonthly}/month`,
          },
          unit_amount: Math.round(priceMonthly * 100),
        },
        quantity: 1,
      },
    ];

    if (hardwarePrice > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${planName} — Hardware Kit`,
            description: "One-time hardware fee (dish, router, cables)",
          },
          unit_amount: Math.round(hardwarePrice * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email.trim(),
      line_items: lineItems,
      metadata: {
        planId: String(planId),
        planName,
        planSpeed,
        customerName: name.trim(),
        customerEmail: email.trim(),
        address: address?.trim() ?? "",
      },
      success_url: `${APP_URL}/plans?stripe_success=1&plan_id=${planId}&email=${safeEmail}&name=${safeName}&address=${safeAddr}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/plans?stripe_cancel=1`,
    });

    res.json({ paymentLink: session.url, sessionId: session.id });
  } catch (err) {
    req.log?.error?.({ err }, "stripe-plan-pay error");
    res.status(500).json({ error: "Failed to generate payment link" });
  }
});

// POST /api/stripe-plan-verify
router.post("/stripe-plan-verify", async (req, res): Promise<void> => {
  try {
    const { session_id, plan_id, email, name, address } = req.body as {
      session_id: string;
      plan_id?: string;
      email?: string;
      name?: string;
      address?: string;
    };

    if (!session_id) {
      res.status(400).json({ error: "session_id is required" });
      return;
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      res.status(400).json({ error: "Payment not completed", status: session.payment_status });
      return;
    }

    const meta = session.metadata ?? {};
    const planIdNum = parseInt(plan_id ?? meta.planId ?? "0") || 0;
    const customerEmail = email ?? meta.customerEmail ?? session.customer_email ?? "";
    const customerName = name ?? meta.customerName ?? "";
    const customerAddress = address ?? meta.address ?? "";
    const planName = meta.planName ?? PLAN_PRICES[planIdNum]?.name ?? "Starlink Plan";
    const planSpeed = meta.planSpeed ?? PLAN_PRICES[planIdNum]?.speed ?? "";
    const amountPaid = (session.amount_total ?? 0) / 100;

    // Idempotency: check if already processed
    const [existingSub] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.stripeSubscriptionId, session.payment_intent as string ?? session_id))
      .limit(1);

    let subscriptionId: number | null = existingSub?.id ?? null;

    if (!existingSub) {
      try {
        const [sub] = await db
          .insert(subscriptionsTable)
          .values({
            email: customerEmail,
            name: customerName,
            planId: planIdNum,
            status: "active",
            address: customerAddress,
            amountPaid: String(amountPaid),
            stripeSubscriptionId: session.payment_intent as string ?? session_id,
          })
          .returning();
        subscriptionId = sub?.id ?? null;

        // Send confirmation and receipt emails asynchronously
        if (sub) {
          const [dbPlan] = await db.select().from(plansTable).where(eq(plansTable.id, planIdNum)).limit(1);
          const planFeatures = (dbPlan?.features as string[]) ?? [];
          const planCategory = dbPlan?.category ?? "";

          sendSubscriptionConfirmation({
            customerName,
            customerEmail,
            planName,
            planCategory,
            planSpeed,
            priceMonthly: amountPaid,
            features: planFeatures,
            subscriptionId: sub.id,
          }).catch(() => {});

          sendPaymentReceipt({
            customerName,
            customerEmail,
            planName,
            amountPaid,
            currency: session.currency?.toUpperCase() ?? "USD",
            transactionId: session.payment_intent as string ?? session_id,
            date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          }).catch(() => {});

          sendAdminPaymentAlert({
            type: "plan",
            customerName,
            customerEmail,
            item: planName,
            amountPaid,
            currency: session.currency?.toUpperCase() ?? "USD",
            transactionId: session.payment_intent as string ?? session_id,
          }).catch(() => {});
        }
      } catch {
        // DB unavailable — still return success
      }
    }

    res.json({
      success: true,
      subscription: {
        id: subscriptionId,
        planName,
        planSpeed,
        email: customerEmail,
        amountPaid,
        currency: session.currency?.toUpperCase() ?? "USD",
        sessionId: session_id,
        address: customerAddress,
        alreadyProcessed: !!existingSub,
      },
    });
  } catch (err) {
    req.log?.error?.({ err }, "stripe-plan-verify error");
    res.status(500).json({ error: "Verification failed" });
  }
});

// POST /api/stripe-webhook
router.post("/stripe-webhook", async (req, res): Promise<void> => {
  res.sendStatus(200);

  try {
    const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
    let event: Stripe.Event;

    if (webhookSecret) {
      const sig = req.headers["stripe-signature"] as string;
      const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
      try {
        event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
      } catch {
        req.log?.warn("Stripe webhook signature verification failed");
        return;
      }
    } else {
      event = req.body as Stripe.Event;
    }

    if (event.type !== "checkout.session.completed") return;

    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") return;

    const meta = session.metadata ?? {};

    // Token bundle purchase
    if (meta.type === "token_bundle") {
      const email = meta.customerEmail ?? session.customer_email ?? "";
      const tokens = parseInt(meta.tokens ?? "0") || 0;
      const bundleName = meta.bundleName ?? "Bundle";
      if (email && tokens > 0) {
        try {
          // Idempotency: skip if already credited
          const [existing] = await db
            .select()
            .from(walletTransactionsTable)
            .where(eq(walletTransactionsTable.reference, session.id))
            .limit(1);
          if (!existing) {
            await creditTokensViaStripe(email, tokens, bundleName, session.id);
          }
        } catch (err) {
          req.log?.error?.({ err }, "Stripe webhook: token credit failed");
        }
      }
      return;
    }

    // Plan subscription purchase
    const planIdNum = parseInt(meta.planId ?? "0") || 0;
    const customerEmail = meta.customerEmail ?? session.customer_email ?? "";
    const customerName = meta.customerName ?? "";
    const amountPaid = (session.amount_total ?? 0) / 100;

    try {
      await db.insert(subscriptionsTable).values({
        email: customerEmail,
        name: customerName,
        planId: planIdNum,
        status: "active",
        address: meta.address ?? "",
        amountPaid: String(amountPaid),
        stripeSubscriptionId: session.payment_intent as string ?? session.id,
      });
    } catch {
      // Already inserted via verify endpoint or DB unavailable
    }
  } catch (err) {
    req.log?.error?.({ err }, "Stripe webhook processing error");
  }
});

export default router;
