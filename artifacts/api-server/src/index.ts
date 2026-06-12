import app from "./app";
import { logger } from "./lib/logger";
import { db } from "@workspace/db";
import { plansTable, usersTable } from "@workspace/db";
import { sql, isNull } from "drizzle-orm";
import { validateEnv } from "./lib/envValidator";

// ── Auto-seed plans if table is empty ────────────────────────────────────────
async function seedIfEmpty() {
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(plansTable);
    if (Number(count) > 0) return;

    const PLANS = [
      {
        name: "Starlink Residential",
        category: "residential",
        speed: "25–100 Mbps",
        priceMonthly: "120.00",
        hardwarePrice: "599.00",
        description: "High-speed satellite internet for homes. Unlimited data, no contracts, cancel anytime.",
        features: ["Unlimited data", "25–100 Mbps download", "Priority residential data", "Free installation support", "Wi-Fi router included", "24/7 customer support", "No contracts"],
        popular: true,
        active: true,
        localPrices: { NGN: { monthly: 38000, hardware: 299000 } },
      },
      {
        name: "Starlink Roam",
        category: "roam",
        speed: "25–100 Mbps",
        priceMonthly: "150.00",
        hardwarePrice: "599.00",
        description: "Take your Starlink anywhere on land. Use while parked, camping, or travelling.",
        features: ["Use anywhere on land", "Pause & resume service anytime", "25–100 Mbps download", "Deprioritised on congested cells", "Wi-Fi router included", "24/7 support"],
        popular: false,
        active: true,
        localPrices: { NGN: { monthly: 50000, hardware: 299000 } },
      },
      {
        name: "Starlink Mobile Priority",
        category: "roam",
        speed: "5–50 Mbps",
        priceMonthly: "50.00",
        hardwarePrice: "0.00",
        description: "50 GB of high-speed priority mobile data. Perfect add-on for Roam subscribers on the move.",
        features: ["50 GB priority data/month", "In-motion use", "Land & sea coverage", "Add-on to Roam plan", "No extra hardware needed"],
        popular: false,
        active: true,
        localPrices: { NGN: { monthly: 25000, hardware: 120000 } },
      },
      {
        name: "Starlink Priority (40 GB)",
        category: "business",
        speed: "40–220 Mbps",
        priceMonthly: "250.00",
        hardwarePrice: "2500.00",
        description: "Enterprise-grade connectivity with 40 GB priority data. Ideal for remote offices and farms.",
        features: ["40 GB priority data/month", "40–220 Mbps download", "Priority over residential users", "SLA-backed uptime", "Dedicated business support", "Business dashboard"],
        popular: false,
        active: true,
        localPrices: { NGN: { monthly: 400000, hardware: 4000000 } },
      },
      {
        name: "Starlink Priority (1 TB)",
        category: "business",
        speed: "40–220 Mbps",
        priceMonthly: "500.00",
        hardwarePrice: "2500.00",
        description: "1 TB priority data for data-heavy business operations requiring consistent fast speeds.",
        features: ["1 TB priority data/month", "40–220 Mbps download", "Priority network access", "SLA-backed uptime", "Dedicated business support", "Multi-user support"],
        popular: false,
        active: true,
        localPrices: { NGN: { monthly: 800000, hardware: 4000000 } },
      },
      {
        name: "Starlink Priority (6 TB)",
        category: "business",
        speed: "100–350 Mbps",
        priceMonthly: "1500.00",
        hardwarePrice: "0.00",
        description: "6 TB priority data for enterprise businesses with heavy bandwidth requirements.",
        features: ["6 TB priority data/month", "100–350 Mbps download", "Highest priority access", "Enterprise SLA", "24/7 dedicated support", "Custom network configuration"],
        popular: false,
        active: true,
        localPrices: { NGN: { monthly: 2400000, hardware: 0 } },
      },
      {
        name: "Starlink Maritime (50 GB)",
        category: "maritime",
        speed: "40–220 Mbps",
        priceMonthly: "250.00",
        hardwarePrice: "2500.00",
        description: "Reliable high-speed internet at sea. 50 GB priority data for vessels and boats.",
        features: ["50 GB priority maritime data", "40–220 Mbps at sea", "Global ocean coverage", "In-motion marine use", "Weather-resistant hardware", "24/7 maritime support"],
        popular: false,
        active: true,
        localPrices: { NGN: { monthly: 400000, hardware: 4000000 } },
      },
      {
        name: "Starlink Maritime (1 TB)",
        category: "maritime",
        speed: "100–350 Mbps",
        priceMonthly: "1000.00",
        hardwarePrice: "2500.00",
        description: "High-capacity maritime internet. 1 TB priority data for commercial and charter vessels.",
        features: ["1 TB maritime priority data", "100–350 Mbps at sea", "Global ocean coverage", "In-motion use", "Fleet management dashboard", "Dual dish support available"],
        popular: false,
        active: true,
        localPrices: { NGN: { monthly: 1600000, hardware: 4000000 } },
      },
      {
        name: "Starlink Aviation",
        category: "aviation",
        speed: "40–350 Mbps",
        priceMonthly: "12500.00",
        hardwarePrice: "150000.00",
        description: "In-flight high-speed internet for commercial and private aircraft. Contact us for custom enterprise pricing.",
        features: ["In-flight connectivity", "40–350 Mbps in air", "Global coverage", "Passenger Wi-Fi ready", "FAA/EASA certified hardware", "Dedicated aviation support"],
        popular: false,
        active: true,
        localPrices: { NGN: { monthly: 20000000, hardware: 240000000 } },
      },
    ];

    await db.insert(plansTable).values(PLANS);
    logger.info({ count: PLANS.length }, "Auto-seeded plans table");
  } catch (err) {
    logger.warn({ err }, "Auto-seed skipped (table may not exist yet)");
  }
}

// ── Backfill account numbers for users who don't have one ─────────────────────
async function backfillAccountNumbers() {
  try {
    const users = await db.select({ id: usersTable.id }).from(usersTable).where(isNull(usersTable.accountNumber));
    if (users.length === 0) return;
    await Promise.all(
      users.map(u =>
        db.update(usersTable)
          .set({ accountNumber: `ORB-${String(u.id).padStart(4, "0")}` })
          .where(sql`${usersTable.id} = ${u.id} AND ${usersTable.accountNumber} IS NULL`)
      )
    );
    logger.info({ count: users.length }, "Backfilled account numbers");
  } catch (err) {
    logger.warn({ err }, "Account number backfill skipped");
  }
}

// ── Startup DB table check ────────────────────────────────────────────────────
async function ensureTablesExist(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1 FROM plans LIMIT 1`);
    return true;
  } catch {
    logger.warn("DB tables missing — schema may need migration. Run db:push or restart.");
    return false;
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // P1: Validate env vars + load from DB on startup
  validateEnv().catch((e) => logger.warn({ err: e }, "Env validation failed"));

  // P1: Verify DB tables exist, then seed + backfill if needed
  ensureTablesExist().then((ok) => {
    if (ok) {
      seedIfEmpty();
      backfillAccountNumbers();
    } else {
      logger.warn("Skipping seed — tables not ready. Run db:push to fix.");
    }
  });
});
