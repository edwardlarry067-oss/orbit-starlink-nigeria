import { logger } from "./logger";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";

const REQUIRED_SECRETS: { key: string; feature: string }[] = [
  { key: "SESSION_SECRET",        feature: "JWT auth signing" },
  { key: "ADMIN_PASSWORD",        feature: "Admin panel login" },
  { key: "PAYSTACK_SECRET_KEY",   feature: "Paystack payments" },
  { key: "STRIPE_SECRET_KEY",     feature: "Stripe payments" },
  { key: "STRIPE_WEBHOOK_SECRET", feature: "Stripe webhooks" },
  { key: "FLW_SECRET_KEY",        feature: "Flutterwave payments" },
  { key: "FLW_WEBHOOK_SECRET",    feature: "Flutterwave webhooks" },
  { key: "RESEND_API_KEY",        feature: "Transactional email" },
  { key: "APP_URL",               feature: "Redirect URLs / email links" },
  { key: "PAYSTACK_CURRENCY",     feature: "Paystack currency setting" },
];

export interface EnvStatus {
  key: string;
  feature: string;
  set: boolean;
  source: "env" | "db" | "missing";
}

let _cachedStatus: EnvStatus[] | null = null;

export function getEnvStatus(): EnvStatus[] {
  return _cachedStatus ?? REQUIRED_SECRETS.map((s) => ({
    ...s,
    set: !!process.env[s.key],
    source: process.env[s.key] ? "env" : "missing",
  }));
}

export async function loadEnvFromDb(): Promise<void> {
  try {
    const rows = await db.select().from(siteSettingsTable);
    for (const row of rows) {
      if (!process.env[row.key] && row.value) {
        process.env[row.key] = row.value;
        logger.info({ key: row.key }, "Loaded env var from DB settings");
      }
    }
  } catch (err) {
    logger.warn({ err }, "Could not load env vars from DB — table may not exist yet");
  }
}

export async function validateEnv(): Promise<void> {
  await loadEnvFromDb();

  _cachedStatus = REQUIRED_SECRETS.map((s) => {
    const val = process.env[s.key];
    return {
      ...s,
      set: !!val,
      source: val ? "env" : "missing",
    } as EnvStatus;
  });

  const missing = _cachedStatus.filter((s) => !s.set);
  const present = _cachedStatus.filter((s) => s.set);

  if (present.length > 0) {
    logger.info(
      { keys: present.map((s) => s.key) },
      `[ENV] ${present.length}/${REQUIRED_SECRETS.length} required secrets are configured`
    );
  }

  if (missing.length > 0) {
    logger.warn(
      { missing: missing.map((s) => `${s.key} (${s.feature})`) },
      `[ENV] ${missing.length} secret(s) missing — affected features degraded gracefully`
    );
  }
}
