export const CURRENCIES = [
  "USD", "GBP", "EUR", "CAD", "AUD",
  "NGN", "KES", "GHS", "ZAR", "EGP", "UGX", "ZMW", "TZS",
  "INR", "XOF",
] as const;
export type Currency = typeof CURRENCIES[number];

export interface Bundle {
  id: string;
  name: string;
  tokens: number;
  badge?: string;
  prices: Record<Currency, number>;
}

export const BUNDLES: Bundle[] = [
  {
    id: "starter",
    name: "Starter",
    tokens: 100,
    prices: {
      USD: 5,   GBP: 4,   EUR: 5,   CAD: 7,   AUD: 8,
      NGN: 5000, KES: 650, GHS: 75,  ZAR: 95,  EGP: 155, UGX: 18500, ZMW: 135, TZS: 12500,
      INR: 420, XOF: 3000,
    },
  },
  {
    id: "basic",
    name: "Basic",
    tokens: 250,
    prices: {
      USD: 10,  GBP: 8,   EUR: 9,   CAD: 14,  AUD: 16,
      NGN: 10000, KES: 1300, GHS: 150, ZAR: 190, EGP: 310, UGX: 37000, ZMW: 270, TZS: 25000,
      INR: 840, XOF: 6000,
    },
  },
  {
    id: "standard",
    name: "Standard",
    tokens: 700,
    badge: "Best Value",
    prices: {
      USD: 25,  GBP: 20,  EUR: 23,  CAD: 34,  AUD: 39,
      NGN: 25000, KES: 3250, GHS: 375, ZAR: 475, EGP: 775, UGX: 92000, ZMW: 675, TZS: 62500,
      INR: 2100, XOF: 15000,
    },
  },
  {
    id: "premium",
    name: "Premium",
    tokens: 1500,
    badge: "Popular",
    prices: {
      USD: 50,  GBP: 40,  EUR: 46,  CAD: 68,  AUD: 78,
      NGN: 50000, KES: 6500, GHS: 750, ZAR: 950, EGP: 1550, UGX: 185000, ZMW: 1350, TZS: 125000,
      INR: 4200, XOF: 30000,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tokens: 3500,
    badge: "Most Tokens",
    prices: {
      USD: 100, GBP: 80,  EUR: 92,  CAD: 136, AUD: 156,
      NGN: 100000, KES: 13000, GHS: 1500, ZAR: 1900, EGP: 3100, UGX: 370000, ZMW: 2700, TZS: 250000,
      INR: 8400, XOF: 60000,
    },
  },
];

export function getBundleByAmount(amount: number, currency: Currency): { name: string; tokens: number } | null {
  const bundle = BUNDLES.find((b) => b.prices[currency] === amount);
  if (!bundle) return null;
  return { name: bundle.name, tokens: bundle.tokens };
}

export function getAllBundles(currency: Currency) {
  return BUNDLES.map((b) => ({
    id: b.id,
    name: b.name,
    tokens: b.tokens,
    badge: b.badge,
    price: b.prices[currency],
    currency,
  }));
}
