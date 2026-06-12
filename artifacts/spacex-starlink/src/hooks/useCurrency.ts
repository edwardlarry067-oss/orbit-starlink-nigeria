import { useState, useEffect, useCallback } from "react";

const GEO_CACHE_KEY = "orbit_geo_country";
const RATES_CACHE_KEY = "orbit_fx_rates";
const MANUAL_COUNTRY_KEY = "orbit_manual_country";
const CACHE_TTL = 24 * 60 * 60 * 1000;

export type SupportedCurrency =
  | "USD" | "NGN" | "GBP" | "EUR" | "CAD" | "AUD" | "BRL" | "MXN"
  | "INR" | "KES" | "GHS" | "ZAR" | "NZD" | "JPY" | "PHP" | "IDR"
  | "CLP" | "COP" | "PEN" | "TZS" | "UGX" | "RWF" | "XOF" | "XAF"
  | "EGP" | "MAD" | "ETB" | "ZMW" | "MZN" | "AOA" | "BWP" | "NAD";

export const COUNTRY_CURRENCY: Record<string, SupportedCurrency> = {
  // Africa
  NG: "NGN",
  GH: "GHS",
  ZA: "ZAR",
  KE: "KES",
  TZ: "TZS",
  UG: "UGX",
  RW: "RWF",
  SN: "XOF", CI: "XOF", BF: "XOF", ML: "XOF", GN: "XOF", NE: "XOF", TG: "XOF", BJ: "XOF",
  CM: "XAF", CG: "XAF", CD: "XAF", CF: "XAF", TD: "XAF", GQ: "XAF", GA: "XAF",
  EG: "EGP",
  MA: "MAD",
  ET: "ETB",
  ZM: "ZMW",
  MZ: "MZN",
  AO: "AOA",
  BW: "BWP",
  NA: "NAD",
  // Europe
  GB: "GBP",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR",
  AT: "EUR", PT: "EUR", IE: "EUR", FI: "EUR", GR: "EUR", LU: "EUR",
  SK: "EUR", SI: "EUR", EE: "EUR", LV: "EUR", LT: "EUR", CY: "EUR", MT: "EUR",
  // Americas
  CA: "CAD",
  BR: "BRL",
  MX: "MXN",
  CL: "CLP",
  CO: "COP",
  PE: "PEN",
  // Asia-Pacific
  AU: "AUD",
  IN: "INR",
  NZ: "NZD",
  JP: "JPY",
  PH: "PHP",
  ID: "IDR",
};

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: "$",  NGN: "₦",  GBP: "£",  EUR: "€",  CAD: "CA$", AUD: "A$",
  BRL: "R$", MXN: "MX$", INR: "₹", KES: "KSh", GHS: "GH₵", ZAR: "R",
  NZD: "NZ$", JPY: "¥", PHP: "₱", IDR: "Rp", CLP: "$",  COP: "$",
  PEN: "S/", TZS: "TSh", UGX: "USh", RWF: "Fr", XOF: "CFA", XAF: "CFA",
  EGP: "£",  MAD: "DH",  ETB: "Br",  ZMW: "K",   MZN: "MT",  AOA: "Kz",
  BWP: "P",  NAD: "N$",
};

export type CountryInfo = {
  code: string;
  name: string;
  flag: string;
  currency: SupportedCurrency;
  region: "africa" | "europe" | "americas" | "asia-pacific" | "other";
};

export const COUNTRIES: CountryInfo[] = [
  // Africa
  { code: "NG", name: "Nigeria",           flag: "🇳🇬", currency: "NGN", region: "africa" },
  { code: "GH", name: "Ghana",             flag: "🇬🇭", currency: "GHS", region: "africa" },
  { code: "ZA", name: "South Africa",      flag: "🇿🇦", currency: "ZAR", region: "africa" },
  { code: "KE", name: "Kenya",             flag: "🇰🇪", currency: "KES", region: "africa" },
  { code: "EG", name: "Egypt",             flag: "🇪🇬", currency: "EGP", region: "africa" },
  { code: "ET", name: "Ethiopia",          flag: "🇪🇹", currency: "ETB", region: "africa" },
  { code: "TZ", name: "Tanzania",          flag: "🇹🇿", currency: "TZS", region: "africa" },
  { code: "UG", name: "Uganda",            flag: "🇺🇬", currency: "UGX", region: "africa" },
  { code: "RW", name: "Rwanda",            flag: "🇷🇼", currency: "RWF", region: "africa" },
  { code: "CM", name: "Cameroon",          flag: "🇨🇲", currency: "XAF", region: "africa" },
  { code: "SN", name: "Senegal",           flag: "🇸🇳", currency: "XOF", region: "africa" },
  { code: "CI", name: "Côte d'Ivoire",     flag: "🇨🇮", currency: "XOF", region: "africa" },
  { code: "MA", name: "Morocco",           flag: "🇲🇦", currency: "MAD", region: "africa" },
  { code: "ZM", name: "Zambia",            flag: "🇿🇲", currency: "ZMW", region: "africa" },
  { code: "MZ", name: "Mozambique",        flag: "🇲🇿", currency: "MZN", region: "africa" },
  { code: "AO", name: "Angola",            flag: "🇦🇴", currency: "AOA", region: "africa" },
  { code: "BW", name: "Botswana",          flag: "🇧🇼", currency: "BWP", region: "africa" },
  { code: "NA", name: "Namibia",           flag: "🇳🇦", currency: "NAD", region: "africa" },
  // Americas
  { code: "US", name: "United States",     flag: "🇺🇸", currency: "USD", region: "americas" },
  { code: "CA", name: "Canada",            flag: "🇨🇦", currency: "CAD", region: "americas" },
  { code: "BR", name: "Brazil",            flag: "🇧🇷", currency: "BRL", region: "americas" },
  { code: "MX", name: "Mexico",            flag: "🇲🇽", currency: "MXN", region: "americas" },
  { code: "CL", name: "Chile",             flag: "🇨🇱", currency: "CLP", region: "americas" },
  { code: "CO", name: "Colombia",          flag: "🇨🇴", currency: "COP", region: "americas" },
  { code: "PE", name: "Peru",              flag: "🇵🇪", currency: "PEN", region: "americas" },
  // Europe
  { code: "GB", name: "United Kingdom",    flag: "🇬🇧", currency: "GBP", region: "europe" },
  { code: "DE", name: "Germany",           flag: "🇩🇪", currency: "EUR", region: "europe" },
  { code: "FR", name: "France",            flag: "🇫🇷", currency: "EUR", region: "europe" },
  { code: "IT", name: "Italy",             flag: "🇮🇹", currency: "EUR", region: "europe" },
  { code: "ES", name: "Spain",             flag: "🇪🇸", currency: "EUR", region: "europe" },
  { code: "NL", name: "Netherlands",       flag: "🇳🇱", currency: "EUR", region: "europe" },
  // Asia-Pacific
  { code: "AU", name: "Australia",         flag: "🇦🇺", currency: "AUD", region: "asia-pacific" },
  { code: "IN", name: "India",             flag: "🇮🇳", currency: "INR", region: "asia-pacific" },
  { code: "JP", name: "Japan",             flag: "🇯🇵", currency: "JPY", region: "asia-pacific" },
  { code: "PH", name: "Philippines",       flag: "🇵🇭", currency: "PHP", region: "asia-pacific" },
  { code: "ID", name: "Indonesia",         flag: "🇮🇩", currency: "IDR", region: "asia-pacific" },
  { code: "NZ", name: "New Zealand",       flag: "🇳🇿", currency: "NZD", region: "asia-pacific" },
];

const NO_DECIMALS = new Set<SupportedCurrency>([
  "JPY", "IDR", "CLP", "COP", "UGX", "RWF", "XOF", "XAF",
  "NGN", "KES", "GHS", "TZS", "ETB", "ZMW", "MZN", "AOA",
]);

function getCachedJson(key: string): unknown | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { value, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) { localStorage.removeItem(key); return null; }
    return value;
  } catch { return null; }
}

function setCache(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify({ value, expiry: Date.now() + CACHE_TTL }));
  } catch {}
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<SupportedCurrency>("USD");
  const [country, setCountryState] = useState<string>("US");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detect() {
      try {
        // Check for manual override first
        const manual = localStorage.getItem(MANUAL_COUNTRY_KEY);
        if (manual && COUNTRY_CURRENCY[manual]) {
          const manualCurrency = COUNTRY_CURRENCY[manual];
          setCountryState(manual);
          if (manualCurrency !== "USD") {
            let cachedRates = getCachedJson(RATES_CACHE_KEY) as Record<string, number> | null;
            if (!cachedRates) {
              try {
                const rateRes = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(5000) });
                const data = await rateRes.json();
                if (data?.rates) { cachedRates = data.rates; setCache(RATES_CACHE_KEY, cachedRates); }
              } catch {}
            }
            if (cachedRates) setRates(cachedRates);
          }
          setCurrencyState(manualCurrency);
          setLoading(false);
          return;
        }

        // Geo-detect
        let detectedCountry = getCachedJson(GEO_CACHE_KEY) as string | null;
        if (!detectedCountry) {
          const res = await fetch("https://ipapi.co/country/", { signal: AbortSignal.timeout(5000) });
          detectedCountry = (await res.text()).trim();
          if (detectedCountry && detectedCountry.length === 2) setCache(GEO_CACHE_KEY, detectedCountry);
        }

        const detectedCurrency: SupportedCurrency = COUNTRY_CURRENCY[detectedCountry ?? ""] ?? "USD";
        setCountryState(detectedCountry ?? "US");
        if (detectedCurrency === "USD") { setLoading(false); return; }

        let cachedRates = getCachedJson(RATES_CACHE_KEY) as Record<string, number> | null;
        if (!cachedRates) {
          try {
            const rateRes = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(5000) });
            const data = await rateRes.json();
            if (data?.rates) { cachedRates = data.rates; setCache(RATES_CACHE_KEY, cachedRates); }
          } catch {}
        }

        if (cachedRates) {
          setRates(cachedRates);
          setCurrencyState(detectedCurrency);
        }
      } catch {
        // default to USD on any error
      } finally {
        setLoading(false);
      }
    }
    detect();
  }, []);

  const setCountry = useCallback(async (countryCode: string) => {
    const newCurrency: SupportedCurrency = COUNTRY_CURRENCY[countryCode] ?? "USD";
    localStorage.setItem(MANUAL_COUNTRY_KEY, countryCode);
    setCountryState(countryCode);
    setCurrencyState(newCurrency);

    if (newCurrency !== "USD" && Object.keys(rates).length === 0) {
      try {
        let cachedRates = getCachedJson(RATES_CACHE_KEY) as Record<string, number> | null;
        if (!cachedRates) {
          const rateRes = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(5000) });
          const data = await rateRes.json();
          if (data?.rates) { cachedRates = data.rates; setCache(RATES_CACHE_KEY, cachedRates); }
        }
        if (cachedRates) setRates(cachedRates);
      } catch {}
    }
  }, [rates]);

  function convert(usdAmount: number): number {
    if (currency === "USD") return usdAmount;
    return usdAmount * (rates[currency] ?? 1);
  }

  function formatPrice(usdAmount: number, localPrices?: Record<string, { monthly?: number; hardware?: number }>, field?: "monthly" | "hardware"): string {
    if (currency !== "USD" && localPrices?.[currency] != null) {
      const localVal = field === "hardware" ? localPrices[currency].hardware : localPrices[currency].monthly;
      if (localVal != null) {
        const sym = CURRENCY_SYMBOLS[currency] ?? currency;
        return `${sym}${Math.round(localVal).toLocaleString()}`;
      }
    }
    if (currency === "USD") return `$${usdAmount.toLocaleString("en-US")}`;
    const converted = convert(usdAmount);
    const sym = CURRENCY_SYMBOLS[currency] ?? currency;
    const rounded = NO_DECIMALS.has(currency) ? Math.round(converted) : Math.round(converted * 100) / 100;
    return `${sym}${rounded.toLocaleString()}`;
  }

  function formatMonthly(usdAmount: number, localPrices?: Record<string, { monthly?: number; hardware?: number }>): string {
    return `${formatPrice(usdAmount, localPrices, "monthly")}/mo`;
  }

  const symbol = CURRENCY_SYMBOLS[currency] ?? "$";
  const currentCountryInfo = COUNTRIES.find((c) => c.code === country);

  return { currency, symbol, country, currentCountryInfo, rates, loading, formatPrice, formatMonthly, convert, setCountry };
}
