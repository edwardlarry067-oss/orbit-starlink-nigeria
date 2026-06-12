import { db } from "@workspace/db";
import { invoicesTable, subscriptionsTable, plansTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

export interface CreateInvoiceParams {
  userEmail: string;
  subscriptionId?: number;
  planId: number;
  amountPaid: number;
  currency?: string;
  paymentRef?: string;
  isFirstMonth?: boolean;
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${ym}-${rand}`;
}

export async function createInvoice(params: CreateInvoiceParams): Promise<typeof invoicesTable.$inferSelect | null> {
  try {
    const { userEmail, subscriptionId, planId, amountPaid, currency = "USD", paymentRef, isFirstMonth = true } = params;

    let planName = "Starlink Plan";
    let priceMonthly = amountPaid;
    let hardwarePrice = 0;

    try {
      const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, planId)).limit(1);
      if (plan) {
        planName = plan.name;
        priceMonthly = parseFloat(String(plan.priceMonthly));
        hardwarePrice = plan.hardwarePrice ? parseFloat(String(plan.hardwarePrice)) : 0;
      }
    } catch { /* use defaults */ }

    const lineItems = [];
    if (isFirstMonth && hardwarePrice > 0) {
      lineItems.push({ description: "Starlink Hardware Kit (one-time)", amount: hardwarePrice });
      lineItems.push({ description: `${planName} — Monthly Service`, amount: priceMonthly });
    } else {
      lineItems.push({ description: `${planName} — Monthly Service`, amount: amountPaid });
    }

    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    // Ensure unique invoice number with retry
    let invoiceNumber = generateInvoiceNumber();
    let retries = 0;
    while (retries < 5) {
      try {
        const [inv] = await db
          .insert(invoicesTable)
          .values({
            invoiceNumber,
            userEmail: userEmail.toLowerCase(),
            subscriptionId: subscriptionId ?? null,
            amountUsd: String(amountPaid),
            currency,
            lineItems,
            status: "paid",
            dueDate,
            paidAt: now,
            paymentRef: paymentRef ?? null,
            planName,
          })
          .returning();
        return inv;
      } catch (e: any) {
        if (e?.code === "23505" || e?.message?.includes("unique")) {
          invoiceNumber = generateInvoiceNumber();
          retries++;
        } else {
          throw e;
        }
      }
    }
    return null;
  } catch (err) {
    console.error("[invoiceService] Failed to create invoice:", err);
    return null;
  }
}

export async function getUserInvoices(email: string) {
  return db
    .select()
    .from(invoicesTable)
    .where(eq(invoicesTable.userEmail, email.toLowerCase()))
    .orderBy(sql`${invoicesTable.createdAt} DESC`);
}

export async function getInvoiceById(id: number) {
  const [inv] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, id)).limit(1);
  return inv ?? null;
}
