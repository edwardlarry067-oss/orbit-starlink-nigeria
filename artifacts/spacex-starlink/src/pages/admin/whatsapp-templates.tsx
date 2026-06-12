import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Copy, Check, MessageCircle, ChevronDown, ChevronUp, Zap } from "lucide-react";

const WHATSAPP_NUMBER = "+1 (620) 612-3994";
const BUSINESS_NAME = "OrbitFuture";

type Template = {
  id: string;
  label: string;
  category: string;
  price: string;
  hardware: string;
  speed: string;
  body: string;
};

function buildTemplate(plan: {
  name: string;
  category: string;
  price: string;
  hardware: string;
  speed: string;
  features: string[];
}): string {
  return `Hello! 👋 Thank you for your interest in *${BUSINESS_NAME}*.

✅ Great news — we've received your order request for the *${plan.name} Plan* and are ready to process it!

━━━━━━━━━━━━━━━━━━━━━
📦 *Your Order Summary*

🌐 Plan: ${plan.name}
💰 Monthly Service: *${plan.price}/month*
🔧 Hardware Kit: *${plan.hardware}* (one-time, shipped to you)
⚡ Speed: ${plan.speed}

✅ What's included:
${plan.features.map(f => `  • ${f}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━━
💳 *Choose Your Payment Method*

We accept the following — just let us know which you prefer and we'll send you a direct payment link:

1️⃣ *Stripe* (Global — Visa, Mastercard, Apple Pay, Google Pay)
   👉 [Stripe Payment Link — paste here]

2️⃣ *Paystack* (Africa & Global — Card, Bank Transfer, USSD, Mobile Money)
   👉 [Paystack Payment Link — paste here]

3️⃣ *Orbit Wallet* (Instant token activation — no card needed)
   👉 Reply "WALLET" and we'll activate your plan immediately.

━━━━━━━━━━━━━━━━━━━━━
📦 *Next Steps*

1. Reply with your preferred payment method above
2. We'll send you the payment link within minutes
3. Once payment is confirmed, your kit ships within 1–3 business days
4. Setup takes just 15 minutes — no technician needed!

Questions? We're here 24/7. Just reply to this message. 🙌

*${BUSINESS_NAME}*
📞 ${WHATSAPP_NUMBER}`;
}

const TEMPLATES: Template[] = [
  {
    id: "residential",
    label: "Residential",
    category: "Residential",
    price: "$120",
    hardware: "$599",
    speed: "50–200 Mbps",
    body: buildTemplate({
      name: "Residential",
      category: "residential",
      price: "$120",
      hardware: "$599",
      speed: "50–200 Mbps",
      features: ["Unlimited data", "50–200 Mbps download speed", "99.9% uptime SLA", "24/7 customer support", "Fixed location use", "WiFi 6 router included"],
    }),
  },
  {
    id: "priority",
    label: "Priority",
    category: "Residential",
    price: "$250",
    hardware: "$599",
    speed: "40–220 Mbps",
    body: buildTemplate({
      name: "Priority",
      category: "residential",
      price: "$250",
      hardware: "$599",
      speed: "40–220 Mbps",
      features: ["1 TB priority data/month", "40–220 Mbps download", "Priority network access", "Portable use included", "No throttling on priority data", "24/7 support"],
    }),
  },
  {
    id: "business-residential",
    label: "Business (Residential)",
    category: "Residential",
    price: "$500",
    hardware: "$2,500",
    speed: "100–350 Mbps",
    body: buildTemplate({
      name: "Business",
      category: "residential",
      price: "$500",
      hardware: "$2,500",
      speed: "100–350 Mbps",
      features: ["Priority commercial network", "Multi-device support", "SLA uptime guarantee", "Dedicated account manager", "Commercial-grade hardware", "Advanced network monitoring"],
    }),
  },
  {
    id: "roam",
    label: "Roam",
    category: "Roam & Maritime",
    price: "$150",
    hardware: "$599",
    speed: "5–50 Mbps",
    body: buildTemplate({
      name: "Roam",
      category: "roam",
      price: "$150",
      hardware: "$599",
      speed: "5–50 Mbps",
      features: ["Full mobility on land", "Works while moving", "Pause/resume anytime", "Global land coverage", "No fixed address needed", "App-based management"],
    }),
  },
  {
    id: "maritime-standard",
    label: "Maritime Standard",
    category: "Roam & Maritime",
    price: "$250",
    hardware: "$2,500",
    speed: "40–220 Mbps",
    body: buildTemplate({
      name: "Maritime Standard",
      category: "roam",
      price: "$250",
      hardware: "$2,500",
      speed: "40–220 Mbps",
      features: ["Full ocean coverage", "Works at sea in motion", "40–220 Mbps offshore", "Priority maritime data", "Weather-resistant hardware", "24/7 maritime support"],
    }),
  },
  {
    id: "maritime-priority",
    label: "Maritime Priority",
    category: "Roam & Maritime",
    price: "$1,000",
    hardware: "$2,500",
    speed: "100–350 Mbps",
    body: buildTemplate({
      name: "Maritime Priority",
      category: "roam",
      price: "$1,000",
      hardware: "$2,500",
      speed: "100–350 Mbps",
      features: ["1 TB priority maritime data/mo", "Fleet management tools", "Dedicated bandwidth lanes", "SLA guaranteed uptime", "Multi-antenna support", "Commercial vessel rating"],
    }),
  },
  {
    id: "business-standard",
    label: "Business Standard",
    category: "Business",
    price: "$500",
    hardware: "$2,500",
    speed: "100–350 Mbps",
    body: buildTemplate({
      name: "Business Standard",
      category: "business",
      price: "$500",
      hardware: "$2,500",
      speed: "100–350 Mbps",
      features: ["Priority commercial data", "Up to 350 Mbps download", "Business SLA guarantee", "Commercial hardware kit", "Multi-site management", "Dedicated support line"],
    }),
  },
  {
    id: "business-priority",
    label: "Business Priority",
    category: "Business",
    price: "$1,500",
    hardware: "$2,500",
    speed: "100–500 Mbps",
    body: buildTemplate({
      name: "Business Priority",
      category: "business",
      price: "$1,500",
      hardware: "$2,500",
      speed: "100–500 Mbps",
      features: ["5 TB priority data/month", "Up to 500 Mbps download", "99.9% SLA uptime", "Dedicated account team", "Custom deployment support", "Advanced analytics dashboard"],
    }),
  },
  {
    id: "enterprise",
    label: "Enterprise",
    category: "Business",
    price: "$5,000",
    hardware: "$10,000",
    speed: "Custom (up to 1 Gbps)",
    body: buildTemplate({
      name: "Enterprise",
      category: "business",
      price: "$5,000",
      hardware: "$10,000",
      speed: "Custom (up to 1 Gbps)",
      features: ["Custom data allocation", "Up to 1 Gbps speeds", "Guaranteed SLA & uptime", "Multi-location deployment", "White-glove installation", "Executive support tier"],
    }),
  },
];

const QUICK_REPLIES: { id: string; label: string; body: string }[] = [
  {
    id: "payment-received",
    label: "Payment Received ✅",
    body: `Hello! 👋\n\nGreat news — we've confirmed your payment! 🎉\n\n✅ *Payment Status: Confirmed*\n📦 Your OrbitFuture kit is being prepared for shipment.\n🚚 Expected delivery: *7–14 business days*\n\nOnce your kit arrives, setup takes just 15 minutes using the OrbitFuture app. We'll also send you a tracking number as soon as it ships.\n\nThank you for choosing *${BUSINESS_NAME}*! We're excited to get you connected. 🌐\n\nAny questions? We're here 24/7 — just reply to this message.`,
  },
  {
    id: "kit-shipped",
    label: "Kit Shipped 🚚",
    body: `Hello! 👋\n\nExciting update — your OrbitFuture kit has been *shipped!* 📦🚀\n\n🚚 *Tracking Number:* [Paste tracking number here]\n📅 *Estimated Delivery:* [Insert date]\n\n*What to expect in your kit:*\n  • Satellite dish & mounting base\n  • WiFi 6 router\n  • Power supply & cables\n\n*Next Steps:*\n1. Download the *OrbitFuture app* (iOS / Android)\n2. When your kit arrives, open the app and follow the guided setup\n3. Setup takes about 15 minutes — no technician needed!\n\nWe're here if you need any help. Welcome to fast satellite internet! 🌐\n\n*${BUSINESS_NAME}*`,
  },
  {
    id: "follow-up",
    label: "Follow-Up 👋",
    body: `Hello! 👋 This is a follow-up from *${BUSINESS_NAME}*.\n\nWe noticed you reached out about OrbitFuture satellite internet and wanted to check in — are you still interested? We'd love to help you get connected!\n\n🌐 *Our plans start at just $120/month* with no contracts.\n⚡ Speeds from 50 Mbps up to 1 Gbps\n📦 Hardware kit ships directly to your door\n🔧 15-minute self-setup — no technician needed\n\nJust reply to this message and we'll walk you through everything, including a payment link to get started today.\n\nLooking forward to hearing from you! 🙌`,
  },
  {
    id: "payment-reminder",
    label: "Payment Reminder 🔔",
    body: `Hello! 👋 A quick reminder from *${BUSINESS_NAME}*.\n\nYour OrbitFuture order is still pending payment. We're holding your spot — but availability is limited in your area!\n\n💳 To complete your order, simply:\n1. Choose your payment method (Flutterwave or Orbit Wallet)\n2. Reply here and we'll send your payment link immediately\n3. Payment is confirmed instantly — your kit ships within 7–14 business days\n\nNeed help or have questions? Just reply to this message — we respond within minutes.\n\nDon't miss out on fast satellite internet! 🌐`,
  },
  {
    id: "support",
    label: "Support Response 🛠️",
    body: `Hello! 👋 Thank you for reaching out to *${BUSINESS_NAME}* support.\n\nWe've received your message and our team is looking into this for you right now. We aim to resolve all support requests within *30 minutes* during business hours.\n\nIn the meantime, here are some quick tips that resolve most issues:\n\n🔧 *Connection Issues:*\n  • Ensure the dish has a clear view of the sky (no obstructions)\n  • Restart the router by unplugging for 30 seconds\n  • Check the OrbitFuture app for outage alerts in your area\n\n📱 *App Issues:*\n  • Update the OrbitFuture app to the latest version\n  • Ensure Bluetooth is enabled during setup\n\nIf the issue persists, please describe it in more detail and we'll resolve it promptly.\n\nThank you for your patience! 🙏`,
  },
];

function TemplateCopyCard({ template, isQuick = false }: { template: { id: string; label: string; body: string; price?: string; hardware?: string; speed?: string; category?: string }; isQuick?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden transition-all">
      <div className="flex items-center justify-between px-5 py-4 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isQuick ? "bg-primary/10" : "bg-[#25D366]/10"}`}>
            {isQuick ? <Zap className="w-4 h-4 text-primary" /> : <MessageCircle className="w-4 h-4 text-[#25D366]" />}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm">{template.label}</p>
            {!isQuick && (template as Template).price && (
              <p className="text-muted-foreground text-xs mt-0.5">
                {(template as Template).price}/mo · Hardware {(template as Template).hardware} · {(template as Template).speed}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded(e => !e)}
            className="h-8 px-3 rounded-md text-xs font-bold text-muted-foreground hover:text-white border border-border hover:border-white/20 transition-colors flex items-center gap-1.5"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? "Hide" : "Preview"}
          </button>
          <button
            onClick={handleCopy}
            className={`h-8 px-4 rounded-md text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
              copied
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-[#25D366] text-black hover:bg-[#20b858]"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-5 py-4 bg-black/30">
          <pre className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-mono">{template.body}</pre>
        </div>
      )}
    </div>
  );
}

const CATEGORIES = ["Residential", "Roam & Maritime", "Business"];

export default function WhatsAppTemplates() {
  const [activeCategory, setActiveCategory] = useState("Residential");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = TEMPLATES.filter(t =>
    t.category === activeCategory &&
    (searchQuery === "" || t.label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">WhatsApp Templates</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Copy a template, paste it into WhatsApp, and replace the <span className="text-white font-bold">[payment link]</span> placeholder before sending.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse" />
          <span className="text-[#25D366] text-xs font-bold uppercase tracking-widest">{TEMPLATES.length + QUICK_REPLIES.length} Templates Ready</span>
        </div>
      </div>

      {/* How to use */}
      <div className="border border-primary/20 bg-primary/5 rounded-xl p-5 mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">How to Use</p>
        <ol className="space-y-1.5">
          {[
            "A customer sends you an order via WhatsApp (from your website).",
            "Find the matching plan template below and click Copy.",
            "Paste it into WhatsApp and fill in the [payment link] placeholder.",
            "Send! The customer receives a professional reply with all details.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
              <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* ── ORDER REPLY TEMPLATES ─────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Order Reply Templates</h2>
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{TEMPLATES.length} templates</span>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 mb-5 border-b border-border pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all -mb-px ${
                activeCategory === cat
                  ? "text-white border-[#25D366]"
                  : "text-muted-foreground border-transparent hover:text-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredTemplates.map(t => (
            <TemplateCopyCard key={t.id} template={t} />
          ))}
        </div>
      </section>

      {/* ── QUICK REPLY TEMPLATES ─────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <Zap className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Quick Reply Templates</h2>
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{QUICK_REPLIES.length} templates</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {QUICK_REPLIES.map(t => (
            <TemplateCopyCard key={t.id} template={t} isQuick />
          ))}
        </div>
      </section>

      {/* Bottom tip */}
      <div className="mt-10 border border-border rounded-xl p-5 bg-card text-center">
        <p className="text-xs text-muted-foreground">
          💡 <strong className="text-white">Pro tip:</strong> Pin this page in your browser for instant access when orders come in.
          Each template is fully formatted and ready to paste — just add the payment link.
        </p>
      </div>
    </AdminLayout>
  );
}
