import { Router } from "express";
import { db } from "@workspace/db";
import { plansTable, subscriptionsTable, walletsTable, walletTransactionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

// POST /api/activate-with-tokens
router.post("/activate-with-tokens", requireAuth, async (req: any, res): Promise<void> => {
  try {
    const { planId, address } = req.body as { planId: number; address?: string };

    if (!planId || isNaN(Number(planId))) {
      res.status(400).json({ error: "planId is required and must be a number" });
      return;
    }

    const [plan] = await db
      .select()
      .from(plansTable)
      .where(eq(plansTable.id, Number(planId)))
      .limit(1);

    if (!plan) {
      res.status(404).json({ error: "Plan not found" });
      return;
    }

    const tokenCost = Math.ceil(parseFloat(plan.priceMonthly as unknown as string));

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const [wallet] = await db
      .select()
      .from(walletsTable)
      .where(eq(walletsTable.email, user.email))
      .limit(1);

    const currentBalance = wallet?.balance ?? 0;

    if (currentBalance < tokenCost) {
      res.status(400).json({
        error: "Insufficient token balance",
        balance: currentBalance,
        required: tokenCost,
        shortfall: tokenCost - currentBalance,
      });
      return;
    }

    const [updatedWallet] = await db
      .update(walletsTable)
      .set({ balance: currentBalance - tokenCost, updatedAt: new Date() })
      .where(eq(walletsTable.id, wallet!.id))
      .returning();

    const txRef = `ACTIVATE-${planId}-${Date.now()}`;
    await db.insert(walletTransactionsTable).values({
      walletId: wallet!.id,
      type: "debit",
      amount: tokenCost,
      description: `Plan activation: ${plan.name} (${tokenCost} tokens)`,
      reference: txRef,
      status: "completed",
      metadata: { planId: plan.id, planName: plan.name, activatedAt: new Date().toISOString() },
    });

    const [sub] = await db
      .insert(subscriptionsTable)
      .values({
        email: user.email,
        name: user.name,
        planId: plan.id,
        status: "active",
        address: address?.trim() || null,
        amountPaid: plan.priceMonthly as unknown as string,
      })
      .returning();

    req.log.info(
      { userId: user.id, planId: plan.id, tokenCost, newBalance: updatedWallet.balance },
      "Plan activated with tokens"
    );

    res.status(201).json({
      subscription: {
        id: sub.id,
        planName: plan.name,
        planSpeed: plan.speed,
        status: sub.status,
        email: sub.email,
        createdAt: sub.createdAt,
      },
      tokensDeducted: tokenCost,
      newBalance: updatedWallet.balance,
    });
  } catch (err) {
    req.log.error({ err }, "activate-with-tokens failed");
    res.status(500).json({ error: "Activation failed. Please try again." });
  }
});

export default router;
