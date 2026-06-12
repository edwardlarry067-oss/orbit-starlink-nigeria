import { pgTable, serial, text, boolean, timestamp, integer, numeric, jsonb } from "drizzle-orm/pg-core";

export const plansTable = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  speed: text("speed").notNull(),
  priceMonthly: numeric("price_monthly").notNull(),
  hardwarePrice: numeric("hardware_price"),
  description: text("description").notNull().default(""),
  features: jsonb("features").notNull().$type<string[]>().default([]),
  localPrices: jsonb("local_prices").$type<Record<string, { monthly: number; hardware?: number }>>().default({}),
  stripePriceId: text("stripe_price_id"),
  stripePaymentLink: text("stripe_payment_link"),
  popular: boolean("popular").notNull().default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type TrackingEvent = {
  status: string;
  timestamp: string;
  note?: string;
  updatedBy?: string;
};

export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  planId: integer("plan_id").notNull(),
  status: text("status").notNull().default("active"),
  address: text("address"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSessionId: text("stripe_session_id"),
  amountPaid: text("amount_paid"),
  // Billing cycle fields
  renewalDate: timestamp("renewal_date"),
  nextBillingDate: timestamp("next_billing_date"),
  autoRenew: boolean("auto_renew").notNull().default(true),
  billingCycleMonths: integer("billing_cycle_months").notNull().default(1),
  // Order tracking fields
  trackingStatus: text("tracking_status").notNull().default("pending"),
  trackingHistory: jsonb("tracking_history").$type<TrackingEvent[]>().default([]),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  address: text("address"),
  accountNumber: text("account_number").unique(),
  kycStatus: text("kyc_status").notNull().default("unverified"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const walletsTable = pgTable("wallets", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  balance: integer("balance").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const walletTransactionsTable = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull(),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  reference: text("reference"),
  status: text("status").notNull().default("completed"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const flutterwaveTransactionsTable = pgTable("flutterwave_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  email: text("email").notNull(),
  bundleName: text("bundle_name").notNull(),
  tokens: integer("tokens").notNull(),
  amount: text("amount").notNull(),
  currency: text("currency").notNull(),
  txRef: text("tx_ref").notNull().unique(),
  flwRef: text("flw_ref"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const whatsappOrdersTable = pgTable("whatsapp_orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  planName: text("plan_name").notNull(),
  planPrice: text("plan_price").notNull(),
  hardwarePrice: text("hardware_price"),
  paymentMethod: text("payment_method").notNull().default("stripe"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const supportTicketsTable = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketRef: text("ticket_ref").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("normal"),
  adminReply: text("admin_reply"),
  adminRepliedAt: timestamp("admin_replied_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Invoices ──────────────────────────────────────────────────────────────────
export type InvoiceLineItem = { description: string; amount: number; quantity?: number };

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  userEmail: text("user_email").notNull(),
  subscriptionId: integer("subscription_id"),
  amountUsd: numeric("amount_usd").notNull(),
  currency: text("currency").notNull().default("USD"),
  lineItems: jsonb("line_items").$type<InvoiceLineItem[]>().default([]),
  status: text("status").notNull().default("paid"),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  paymentRef: text("payment_ref"),
  planName: text("plan_name").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── OTP Codes ─────────────────────────────────────────────────────────────────
export const otpCodesTable = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull(),
  otpCode: text("otp_code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
