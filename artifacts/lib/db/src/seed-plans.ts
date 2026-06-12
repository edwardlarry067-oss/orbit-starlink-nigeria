import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { plansTable } from "./schema.js";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

const REAL_STARLINK_PLANS = [
  {
    id: 1,
    name: "Starlink Residential",
    category: "residential",
    speed: "25–100 Mbps",
    priceMonthly: "120",
    hardwarePrice: "599",
    localPrices: { NGN: { monthly: 38000, hardware: 299000 } },
    description: "High-speed satellite internet for homes. Unlimited data, no contracts, cancel anytime.",
    features: JSON.stringify([
      "Unlimited data",
      "25–100 Mbps download",
      "Priority residential data",
      "Free installation support",
      "Wi-Fi router included",
      "24/7 customer support",
      "No contracts",
    ]),
    popular: true,
    active: true,
  },
  {
    id: 2,
    name: "Starlink Roam",
    category: "roam",
    speed: "25–100 Mbps",
    priceMonthly: "150",
    hardwarePrice: "599",
    localPrices: { NGN: { monthly: 50000, hardware: 299000 } },
    description: "Take your Starlink anywhere on land. Use while parked, camping, or travelling.",
    features: JSON.stringify([
      "Use anywhere on land",
      "Pause & resume service anytime",
      "25–100 Mbps download",
      "Deprioritised on congested cells",
      "Wi-Fi router included",
      "24/7 support",
    ]),
    popular: false,
    active: true,
  },
  {
    id: 3,
    name: "Starlink Mobile Priority",
    category: "roam",
    speed: "5–50 Mbps",
    priceMonthly: "50",
    hardwarePrice: "0",
    localPrices: { NGN: { monthly: 25000, hardware: 120000 } },
    description: "50 GB of high-speed priority mobile data. Perfect add-on for Roam subscribers on the move.",
    features: JSON.stringify([
      "50 GB priority data/month",
      "In-motion use",
      "Land & sea coverage",
      "Add-on to Roam plan",
      "No extra hardware needed",
    ]),
    popular: false,
    active: true,
  },
  {
    id: 4,
    name: "Starlink Priority (40 GB)",
    category: "business",
    speed: "40–220 Mbps",
    priceMonthly: "250",
    hardwarePrice: "2500",
    localPrices: { NGN: { monthly: 400000, hardware: 4000000 } },
    description: "Enterprise-grade connectivity with 40 GB priority data. Ideal for remote offices and farms.",
    features: JSON.stringify([
      "40 GB priority data/month",
      "40–220 Mbps download",
      "Priority over residential users",
      "SLA-backed uptime",
      "Dedicated business support",
      "Business dashboard",
    ]),
    popular: false,
    active: true,
  },
  {
    id: 5,
    name: "Starlink Priority (1 TB)",
    category: "business",
    speed: "40–220 Mbps",
    priceMonthly: "500",
    hardwarePrice: "2500",
    localPrices: { NGN: { monthly: 800000, hardware: 4000000 } },
    description: "1 TB priority data for data-heavy business operations requiring consistent fast speeds.",
    features: JSON.stringify([
      "1 TB priority data/month",
      "40–220 Mbps download",
      "Priority network access",
      "SLA-backed uptime",
      "Dedicated business support",
      "Multi-user support",
    ]),
    popular: false,
    active: true,
  },
  {
    id: 6,
    name: "Starlink Priority (6 TB)",
    category: "business",
    speed: "100–350 Mbps",
    priceMonthly: "1500",
    hardwarePrice: "0",
    localPrices: { NGN: { monthly: 2400000, hardware: 0 } },
    description: "6 TB priority data for enterprise businesses with heavy bandwidth requirements.",
    features: JSON.stringify([
      "6 TB priority data/month",
      "100–350 Mbps download",
      "Highest priority access",
      "Enterprise SLA",
      "24/7 dedicated support",
      "Custom network configuration",
    ]),
    popular: false,
    active: true,
  },
  {
    id: 7,
    name: "Starlink Maritime (50 GB)",
    category: "maritime",
    speed: "40–220 Mbps",
    priceMonthly: "250",
    hardwarePrice: "2500",
    localPrices: { NGN: { monthly: 400000, hardware: 4000000 } },
    description: "Reliable high-speed internet at sea. 50 GB priority data for vessels and boats.",
    features: JSON.stringify([
      "50 GB priority maritime data",
      "40–220 Mbps at sea",
      "Global ocean coverage",
      "In-motion marine use",
      "Weather-resistant hardware",
      "24/7 maritime support",
    ]),
    popular: false,
    active: true,
  },
  {
    id: 8,
    name: "Starlink Maritime (1 TB)",
    category: "maritime",
    speed: "100–350 Mbps",
    priceMonthly: "1000",
    hardwarePrice: "2500",
    localPrices: { NGN: { monthly: 1600000, hardware: 4000000 } },
    description: "High-capacity maritime internet. 1 TB priority data for commercial and charter vessels.",
    features: JSON.stringify([
      "1 TB maritime priority data",
      "100–350 Mbps at sea",
      "Global ocean coverage",
      "In-motion use",
      "Fleet management dashboard",
      "Dual dish support available",
    ]),
    popular: false,
    active: true,
  },
  {
    id: 9,
    name: "Starlink Aviation",
    category: "aviation",
    speed: "40–350 Mbps",
    priceMonthly: "12500",
    hardwarePrice: "150000",
    localPrices: { NGN: { monthly: 20000000, hardware: 240000000 } },
    description: "In-flight high-speed internet for commercial and private aircraft. Contact us for custom enterprise pricing.",
    features: JSON.stringify([
      "In-flight connectivity",
      "40–350 Mbps in air",
      "Global coverage",
      "Passenger Wi-Fi ready",
      "FAA/EASA certified hardware",
      "Dedicated aviation support",
    ]),
    popular: false,
    active: true,
  },
];

async function seedPlans() {
  console.log("Seeding real Starlink plans into database...");

  for (const plan of REAL_STARLINK_PLANS) {
    const [existing] = await db.select({ id: plansTable.id }).from(plansTable).where(eq(plansTable.id, plan.id));

    if (existing) {
      await db.update(plansTable).set({
        name: plan.name,
        category: plan.category,
        speed: plan.speed,
        priceMonthly: plan.priceMonthly,
        hardwarePrice: plan.hardwarePrice,
        description: plan.description,
        features: JSON.parse(plan.features),
        localPrices: plan.localPrices,
        popular: plan.popular,
        active: plan.active,
        stripePriceId: null,
        stripePaymentLink: null,
        updatedAt: new Date(),
      }).where(eq(plansTable.id, plan.id));
      console.log(`  Updated plan ${plan.id}: ${plan.name} — $${plan.priceMonthly}/mo`);
    } else {
      await db.insert(plansTable).values({
        name: plan.name,
        category: plan.category,
        speed: plan.speed,
        priceMonthly: plan.priceMonthly,
        hardwarePrice: plan.hardwarePrice,
        description: plan.description,
        features: JSON.parse(plan.features),
        localPrices: plan.localPrices,
        popular: plan.popular,
        active: plan.active,
      });
      console.log(`  Created plan ${plan.id}: ${plan.name} — $${plan.priceMonthly}/mo`);
    }
  }

  console.log("Done! All plans updated with real Starlink pricing.");
  await client.end();
}

seedPlans().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
