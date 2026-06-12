export type PlanCategory = "residential" | "roam" | "business" | "maritime" | "aviation";

export type Plan = {
  id: string;
  dbId: number;
  name: string;
  description: string;
  category: PlanCategory;
  monthlyPrice: number;
  hardwareFee: number;
  usdMonthly: number;
  usdHardware: number;
  speed: string;
  features: string[];
  popular: boolean;
};

export const PLANS: readonly Plan[] = [
  {
    id: "residential",
    dbId: 1,
    name: "Starlink Residential",
    description: "High-speed satellite internet for homes. Unlimited data, no contracts, cancel anytime.",
    category: "residential",
    monthlyPrice: 38_000,
    hardwareFee: 299_000,
    usdMonthly: 120,
    usdHardware: 599,
    speed: "25–100 Mbps",
    popular: true,
    features: [
      "Unlimited data",
      "25–100 Mbps download",
      "Priority residential traffic",
      "Free installation support",
      "Wi-Fi router included",
      "24/7 customer support",
      "No contracts",
    ],
  },
  {
    id: "roam",
    dbId: 2,
    name: "Starlink Roam",
    description: "Take your Starlink anywhere on land. Use while parked, camping, or travelling.",
    category: "roam",
    monthlyPrice: 50_000,
    hardwareFee: 299_000,
    usdMonthly: 150,
    usdHardware: 599,
    speed: "25–100 Mbps",
    popular: false,
    features: [
      "Use anywhere on land",
      "Pause & resume service anytime",
      "25–100 Mbps download",
      "Deprioritised on congested cells",
      "Wi-Fi router included",
      "24/7 support",
    ],
  },
  {
    id: "mobile-priority",
    dbId: 3,
    name: "Starlink Mobile Priority",
    description: "50 GB of high-speed priority mobile data. Perfect add-on for Roam subscribers on the move.",
    category: "roam",
    monthlyPrice: 25_000,
    hardwareFee: 120_000,
    usdMonthly: 50,
    usdHardware: 0,
    speed: "5–50 Mbps",
    popular: false,
    features: [
      "50 GB priority data/month",
      "In-motion use",
      "Land & sea coverage",
      "Add-on to Roam plan",
      "No extra hardware needed",
    ],
  },
  {
    id: "priority-40gb",
    dbId: 4,
    name: "Starlink Priority (40 GB)",
    description: "Enterprise-grade connectivity with 40 GB priority data. Ideal for remote offices and farms.",
    category: "business",
    monthlyPrice: 400_000,
    hardwareFee: 4_000_000,
    usdMonthly: 250,
    usdHardware: 2_500,
    speed: "40–220 Mbps",
    popular: true,
    features: [
      "40 GB priority data/month",
      "40–220 Mbps download",
      "Priority over residential users",
      "SLA-backed uptime",
      "Dedicated business support",
      "Business dashboard",
    ],
  },
  {
    id: "priority-1tb",
    dbId: 5,
    name: "Starlink Priority (1 TB)",
    description: "1 TB priority data for data-heavy business operations requiring consistent fast speeds.",
    category: "business",
    monthlyPrice: 800_000,
    hardwareFee: 4_000_000,
    usdMonthly: 500,
    usdHardware: 2_500,
    speed: "40–220 Mbps",
    popular: false,
    features: [
      "1 TB priority data/month",
      "40–220 Mbps download",
      "Priority network access",
      "SLA-backed uptime",
      "Dedicated business support",
      "Multi-user support",
    ],
  },
  {
    id: "priority-6tb",
    dbId: 6,
    name: "Starlink Priority (6 TB)",
    description: "6 TB priority data for enterprise businesses with heavy bandwidth requirements.",
    category: "business",
    monthlyPrice: 2_400_000,
    hardwareFee: 0,
    usdMonthly: 1_500,
    usdHardware: 0,
    speed: "100–350 Mbps",
    popular: false,
    features: [
      "6 TB priority data/month",
      "100–350 Mbps download",
      "Highest priority access",
      "Enterprise SLA",
      "24/7 dedicated support",
      "Custom network configuration",
    ],
  },
  {
    id: "maritime-50gb",
    dbId: 7,
    name: "Starlink Maritime (50 GB)",
    description: "Reliable high-speed internet at sea. 50 GB priority data for vessels and boats.",
    category: "maritime",
    monthlyPrice: 400_000,
    hardwareFee: 4_000_000,
    usdMonthly: 250,
    usdHardware: 2_500,
    speed: "40–220 Mbps",
    popular: true,
    features: [
      "50 GB priority maritime data",
      "40–220 Mbps at sea",
      "Global ocean coverage",
      "In-motion marine use",
      "Weather-resistant hardware",
      "24/7 maritime support",
    ],
  },
  {
    id: "maritime-1tb",
    dbId: 8,
    name: "Starlink Maritime (1 TB)",
    description: "High-capacity maritime internet. 1 TB priority data for commercial and charter vessels.",
    category: "maritime",
    monthlyPrice: 1_600_000,
    hardwareFee: 4_000_000,
    usdMonthly: 1_000,
    usdHardware: 2_500,
    speed: "100–350 Mbps",
    popular: false,
    features: [
      "1 TB maritime priority data",
      "100–350 Mbps at sea",
      "Global ocean coverage",
      "In-motion use",
      "Fleet management dashboard",
      "Dual dish support available",
    ],
  },
  {
    id: "aviation",
    dbId: 9,
    name: "Starlink Aviation",
    description: "In-flight high-speed internet for commercial and private aircraft.",
    category: "aviation",
    monthlyPrice: 20_000_000,
    hardwareFee: 240_000_000,
    usdMonthly: 12_500,
    usdHardware: 150_000,
    speed: "40–350 Mbps",
    popular: false,
    features: [
      "In-flight connectivity",
      "40–350 Mbps in air",
      "Global coverage",
      "Passenger Wi-Fi ready",
      "FAA/EASA certified hardware",
      "Dedicated aviation support",
    ],
  },
] as const;

export function findPlanByDbId(dbId: number): Plan | undefined {
  return PLANS.find((p) => p.dbId === dbId);
}

export function findPlanByName(name: string): Plan | undefined {
  return PLANS.find((p) => p.name === name);
}

export function findPlanForCategory(category: PlanCategory): Plan | undefined {
  return (
    PLANS.find((p) => p.category === category && p.popular) ??
    PLANS.find((p) => p.category === category)
  );
}
