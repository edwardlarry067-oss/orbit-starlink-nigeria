declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    _fbq?: unknown;
  }
}

const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ?? "";
const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined) ?? "";

let _initialized = false;

function loadScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}

function initGA4() {
  if (!GA_ID) return;
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, "gtag-script");
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function (...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });
}

function initMetaPixel() {
  if (!PIXEL_ID || typeof window === "undefined") return;
  if (window.fbq) return;

  const f = window;
  const n: (...args: unknown[]) => void = function (...args: unknown[]) {
    // @ts-ignore
    n.callMethod ? n.callMethod(...args) : n.queue.push(args);
  };
  // @ts-ignore
  if (!f._fbq) f._fbq = n;
  window.fbq = n;
  // @ts-ignore
  n.push = n;
  // @ts-ignore
  n.loaded = true;
  // @ts-ignore
  n.version = "2.0";
  // @ts-ignore
  n.queue = [];

  loadScript("https://connect.facebook.net/en_US/fbevents.js", "meta-pixel-script");
  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
}

export function initAnalytics() {
  if (_initialized) return;
  _initialized = true;
  initGA4();
  initMetaPixel();
}

function ga(event: string, params?: Record<string, unknown>) {
  if (GA_ID && typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}

function pixel(event: string, params?: Record<string, unknown>) {
  if (PIXEL_ID && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

export function trackPageView(path: string, title: string) {
  if (GA_ID && typeof window.gtag === "function") {
    window.gtag("config", GA_ID, { page_path: path, page_title: title });
  }
  pixel("PageView");
}

export function trackViewContent(params: {
  planName: string;
  planId: number;
  price: number;
  currency?: string;
}) {
  const { planName, planId, price, currency = "USD" } = params;
  ga("view_item", {
    currency,
    value: price,
    items: [{ item_id: String(planId), item_name: planName, price, quantity: 1 }],
  });
  pixel("ViewContent", {
    content_ids: [String(planId)],
    content_name: planName,
    content_type: "product",
    value: price,
    currency,
  });
}

export function trackAddToCart(params: {
  planName: string;
  planId: number;
  price: number;
  currency?: string;
}) {
  const { planName, planId, price, currency = "USD" } = params;
  ga("add_to_cart", {
    currency,
    value: price,
    items: [{ item_id: String(planId), item_name: planName, price, quantity: 1 }],
  });
  pixel("AddToCart", {
    content_ids: [String(planId)],
    content_name: planName,
    content_type: "product",
    value: price,
    currency,
  });
}

export function trackInitiateCheckout(params: {
  planName: string;
  planId: number;
  price: number;
  currency?: string;
}) {
  const { planName, planId, price, currency = "USD" } = params;
  ga("begin_checkout", {
    currency,
    value: price,
    items: [{ item_id: String(planId), item_name: planName, price, quantity: 1 }],
  });
  pixel("InitiateCheckout", {
    content_ids: [String(planId)],
    content_name: planName,
    value: price,
    currency,
    num_items: 1,
  });
}

export function trackPurchase(params: {
  orderId: string;
  planName: string;
  planId: number;
  value: number;
  currency?: string;
}) {
  const { orderId, planName, planId, value, currency = "USD" } = params;
  ga("purchase", {
    transaction_id: orderId,
    currency,
    value,
    items: [{ item_id: String(planId), item_name: planName, price: value, quantity: 1 }],
  });
  pixel("Purchase", {
    content_ids: [String(planId)],
    content_name: planName,
    value,
    currency,
  });
}

export function trackLead(params: { planName?: string; source?: string }) {
  ga("generate_lead", { value: 0, currency: "USD", ...params });
  pixel("Lead", { content_name: params.planName });
}

export function trackContactClick(method: "whatsapp" | "email" | "form") {
  ga("contact_click", { method });
}
