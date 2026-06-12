import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { getApiBase } from "@workspace/api-client-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, Zap, ArrowRight, Package, CreditCard, Wifi,
  Globe, Shield, HeadphonesIcon, CheckCheck, Minus, Phone, Home, Ship, Briefcase, MapPin
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { PlanFinder } from "@/components/PlanFinder";
import { findPlanByDbId, findPlanByName } from "@/data/plans";
import { getFirstPayment, formatNaira } from "@/utils/pricing";
import { trackViewContent, trackAddToCart, trackPurchase } from "@/lib/analytics";

type Plan = {
  id: number;
  name: string;
  category: string;
  speed: string;
  priceMonthly: number;
  hardwarePrice?: number;
  localPrices?: Record<string, { monthly: number; hardware?: number }>;
  features: string[];
  popular: boolean;
  active: boolean;
  description: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "All Plans",
  residential: "Residential",
  roam: "Roam & Mobile",
  maritime: "Maritime",
  business: "Business",
  aviation: "Aviation",
};

const RECOMMENDED_FOR: Record<string, { label: string; icon: React.ElementType }> = {
  residential: { label: "Homes & Families", icon: Home },
  roam: { label: "Travelers & Vehicles", icon: MapPin },
  maritime: { label: "Vessels & Boats", icon: Ship },
  business: { label: "Offices & Enterprises", icon: Briefcase },
  aviation: { label: "Aircraft Operators", icon: Phone },
};

const COMPARISON_FEATURES = [
  "Data Cap",
  "Contracts",
  "Cancel anytime",
  "24/7 Support",
  "Hardware included",
  "In-motion use",
  "Multiple devices",
  "SLA guarantee",
];

const COMPARISON_DATA: Record<string, Record<string, string | boolean>> = {
  "ORBITFUTURE": {
    "Data Cap": "None (Priority data)",
    "Contracts": false,
    "Cancel anytime": true,
    "24/7 Support": true,
    "Hardware included": true,
    "In-motion use": true,
    "Multiple devices": true,
    "SLA guarantee": "99.9%",
    highlight: "true",
  },
  "Traditional ISP": {
    "Data Cap": "Yes (100–200GB)",
    "Contracts": true,
    "Cancel anytime": false,
    "24/7 Support": false,
    "Hardware included": false,
    "In-motion use": false,
    "Multiple devices": "Limited",
    "SLA guarantee": "None",
  },
  "Other Satellite": {
    "Data Cap": "Yes",
    "Contracts": true,
    "Cancel anytime": false,
    "24/7 Support": false,
    "Hardware included": false,
    "In-motion use": false,
    "Multiple devices": "Limited",
    "SLA guarantee": "None",
  },
};

const PLANS_FAQS = [
  { q: "Is hardware charged separately?", a: "Yes. The Starlink hardware kit (dish + router) is a one-time purchase charged at the time of your first order. Monthly service fees are billed separately from month 2 onwards." },
  { q: "Can I change plans later?", a: "Yes. You can upgrade or change your plan from your dashboard. Contact our support team and we'll assist with the transition." },
  { q: "What's included in every order?", a: "Every order includes the Starlink hardware kit, free installation support from our team, a 12-month hardware warranty, and 24/7 WhatsApp and email support." },
  { q: "How does aviation pricing work?", a: "Aviation connectivity requires custom configuration based on aircraft type, routes, and data requirements. Contact our sales team at sales@orbitfuture.store for a tailored enterprise quote." },
];

function ComparisonCell({ value, highlight }: { value: string | boolean; highlight?: boolean }) {
  if (value === true) {
    return <CheckCheck className={`w-5 h-5 mx-auto ${highlight ? "text-primary" : "text-emerald-400"}`} />;
  }
  if (value === false) {
    return <Minus className="w-5 h-5 mx-auto text-gray-700" />;
  }
  return (
    <span className={`text-xs font-bold ${highlight ? "text-primary" : "text-gray-400"}`}>
      {value}
    </span>
  );
}

export default function Plans() {
  const { formatPrice, formatMonthly, currency } = useCurrency();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [payingPlanId, setPayingPlanId] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    fetch(`${getApiBase()}/api/plans`)
      .then((r) => r.json())
      .then((data) => {
        const loaded: Plan[] = Array.isArray(data) ? data : [];
        setPlans(loaded);
        setLoading(false);
        trackViewContent({ planName: "Starlink Plans Page", planId: 0, price: 0 });
      })
      .catch(() => setLoading(false));
  }, []);

  // Handle Paystack redirect back after plan payment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paystackSuccess = params.get("paystack_success");
    const reference = params.get("reference");
    const planId = params.get("plan_id");
    const email = params.get("email");
    const name = params.get("name");
    const address = params.get("address");

    if (!paystackSuccess || !reference) return;
    window.history.replaceState({}, "", "/plans");

    fetch(`${getApiBase()}/api/paystack-plan-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, plan_id: planId, email, name, address }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          trackPurchase({
            orderId: reference ?? `ref-${Date.now()}`,
            planName: data.subscription?.planName ?? "Starlink Plan",
            planId: parseInt(planId ?? "0", 10),
            value: parseFloat(String(data.subscription?.price ?? 0)),
          });
          setToastMsg({ type: "success", text: `Subscription activated! Welcome to ${data.subscription?.planName ?? "Starlink"}.` });
          setTimeout(() => navigate("/dashboard"), 3000);
        } else {
          setToastMsg({ type: "error", text: data.error || "Payment verification failed. Contact support." });
        }
      })
      .catch(() => setToastMsg({ type: "error", text: "Could not verify payment. Contact support." }));
  }, [navigate]);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 6000);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const allCategories = ["all", ...Array.from(new Set(plans.map((p) => p.category)))];
  // Show aviation separately — always last
  const filtered = (activeCategory === "all" ? plans : plans.filter((p) => p.category === activeCategory))
    .filter((p) => p.category !== "aviation");
  const aviationPlans = plans.filter((p) => p.category === "aviation");
  const showAviation = activeCategory === "all" || activeCategory === "aviation";

  const handleGetStarted = (plan: Plan) => {
    const sp = findPlanByDbId(plan.id) ?? findPlanByName(plan.name);
    trackAddToCart({
      planName: plan.name,
      planId: plan.id,
      price: sp ? (sp.usdMonthly + sp.usdHardware) : (plan.priceMonthly + (plan.hardwarePrice ?? 0)),
    });
    navigate(`/checkout?planId=${plan.id}`);
  };

  const totalCost = (plan: Plan) => {
    const hw = plan.hardwarePrice ?? 0;
    return { monthly: plan.priceMonthly, hardware: hw, firstMonth: plan.priceMonthly + hw };
  };

  return (
    <MainLayout>
      {toastMsg && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl text-sm font-bold border transition-all ${
          toastMsg.type === "success"
            ? "bg-emerald-950 border-emerald-500/40 text-emerald-300"
            : "bg-red-950 border-red-500/40 text-red-300"
        }`}>
          {toastMsg.text}
        </div>
      )}
      <div className="container mx-auto px-4 py-16 max-w-7xl">

        {/* Page header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
            <Wifi className="w-3.5 h-3.5" />
            Starlink Plans · Available in 100+ Countries
          </div>
          {currency !== "USD" && (
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5 mb-4 text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              <Globe className="w-3 h-3" />
              {currency === "NGN" ? "₦ Prices shown in Nigerian Naira · Pay via Paystack" :
               currency === "GHS" ? "GH₵ Prices shown in Ghanaian Cedis · Pay via Paystack" :
               currency === "ZAR" ? "R Prices shown in South African Rand · Pay via Paystack" :
               currency === "KES" ? "KSh Prices shown in Kenyan Shillings · Pay via Paystack" :
               `Prices shown in your local currency`}
            </div>
          )}
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4">
            Starlink Plans
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            All plans include hardware, installation support, and 24/7 expert help. No contracts, no hidden fees. OrbitFuture handles everything from order to activation.
          </p>

          {/* Pricing transparency notice */}
          <div className="mt-6 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Shield, label: "Secure Checkout", desc: "Paystack PCI-DSS Level 1" },
              { icon: Package, label: "Pricing Clarity", desc: "Hardware charged once. Monthly from month 2." },
              { icon: CheckCircle2, label: "No Hidden Fees", desc: "Price shown = price you pay" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-2.5 bg-white/2 border border-white/8 rounded-xl px-4 py-3">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">{label}</p>
                  <p className="text-[10px] text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category filter + Plan Finder */}
        <div className="flex flex-wrap gap-2 justify-center items-center mb-12">
          <PlanFinder
            onSelectPlan={(dbId) => {
              const sp = findPlanByDbId(dbId);
              if (sp) {
                trackAddToCart({ planName: sp.name, planId: dbId, price: sp.usdMonthly + sp.usdHardware });
              }
              navigate(`/checkout?planId=${dbId}`);
            }}
          />
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                activeCategory === cat
                  ? "bg-primary text-black border-primary"
                  : "bg-transparent text-gray-400 border-white/20 hover:border-white/40 hover:text-white"
              }`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>


        {/* Plan cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div id="plan-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 lg:pb-0">
              {filtered.map((plan) => {
                const sp = findPlanByDbId(plan.id) ?? findPlanByName(plan.name);
                const displayMonthly = sp ? formatNaira(sp.monthlyPrice) : formatMonthly(plan.priceMonthly, plan.localPrices);
                const displayHardware = sp ? formatNaira(sp.hardwareFee) : formatPrice(plan.hardwarePrice ?? 0, plan.localPrices, "hardware");
                const displayFirst = sp ? formatNaira(getFirstPayment(sp)) : formatPrice((plan.priceMonthly) + (plan.hardwarePrice ?? 0), plan.localPrices);
                const hasHardware = sp ? sp.hardwareFee > 0 : (plan.hardwarePrice ?? 0) > 0;
                const rec = RECOMMENDED_FOR[plan.category];
                return (
                  <div
                    key={plan.id}
                    data-plan-id={plan.id}
                    className={`relative bg-card border rounded-2xl flex flex-col transition-all hover:border-primary/40 hover:shadow-[0_0_40px_rgba(0,212,255,0.06)] ${
                      plan.popular ? "border-primary/40 shadow-[0_0_40px_rgba(0,212,255,0.08)]" : "border-border"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-6">
                        <Badge className="bg-primary text-black text-[10px] font-black uppercase tracking-widest px-3">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <div className="p-7 pb-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary capitalize">{plan.category}</p>
                        {rec && (
                          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                            <rec.icon className="w-3 h-3 text-gray-400" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{rec.label}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{plan.description}</p>
                    </div>

                    {/* Pricing block — sourced from /data/plans.ts via /utils/pricing.ts */}
                    <div className="px-7 py-5 border-t border-b border-white/5 bg-white/2 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wifi className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Monthly</span>
                        </div>
                        <span className="font-black text-white text-lg">
                          {displayMonthly}<span className="text-gray-500 text-xs font-normal">/mo</span>
                        </span>
                      </div>

                      {hasHardware && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Hardware</span>
                            <span className="text-[9px] text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-1.5 py-0.5 uppercase font-bold">Once</span>
                          </div>
                          <span className="font-bold text-amber-400">{displayHardware}</span>
                        </div>
                      )}

                      <div className="border-t border-white/8 pt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs text-emerald-400 uppercase tracking-wider font-bold">
                            {hasHardware ? "First Payment" : "Monthly"}
                          </span>
                        </div>
                        <span className="font-black text-emerald-400 text-xl">{displayFirst}</span>
                      </div>

                      <p className="text-[10px] text-gray-600 leading-relaxed">
                        {hasHardware
                          ? `Then ${displayMonthly}/mo. Hardware charged once on first payment.`
                          : `Billed monthly. Cancel anytime.`}
                      </p>
                    </div>

                    {/* Speed + features */}
                    <div className="px-7 py-5 flex-1">
                      <div className="inline-flex items-center gap-1.5 bg-primary/8 border border-primary/15 rounded-lg px-3 py-1.5 mb-4">
                        <Zap className="w-3 h-3 text-primary" />
                        <span className="text-xs font-bold text-primary">{plan.speed}</span>
                      </div>
                      <div className="space-y-2">
                        {plan.features.slice(0, 5).map((f) => (
                          <div key={f} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs text-gray-400">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="p-5 pt-0">
                      <Button
                        className="w-full font-bold uppercase tracking-widest text-xs h-12"
                        onClick={() => handleGetStarted(plan)}
                        disabled={payingPlanId === plan.id}
                      >
                        {payingPlanId === plan.id ? (
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Preparing Checkout…
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Order Securely — {displayFirst}
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </Button>
                      <p className="text-center text-[10px] text-gray-600 mt-2 uppercase tracking-widest">
                        Paystack · Secure Checkout · Cancel Anytime
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Aviation — Enterprise Contact Card */}
            {showAviation && aviationPlans.length > 0 && (
              <div className="mt-8">
                <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border border-primary/20 rounded-2xl p-8 md:p-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-primary">Aviation · For Aircraft Operators</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-3">
                        Aviation Connectivity
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        In-flight high-speed internet for commercial and private aircraft. Coverage is global. Pricing, hardware configuration, and data packages are custom-quoted based on aircraft type, routes, and requirements.
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {["In-flight connectivity", "Global coverage", "FAA/EASA compatible hardware", "Dedicated aviation support", "Custom data packages", "Enterprise SLA"].map((f) => (
                          <div key={f} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs text-gray-400">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
                      <a href="mailto:sales@orbitfuture.store?subject=Aviation%20Connectivity%20Enquiry">
                        <Button className="w-full md:w-auto h-12 px-8 font-bold uppercase tracking-widest text-xs">
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Contact Enterprise Sales
                        </Button>
                      </a>
                      <a href="https://wa.me/16206123994?text=Hi%2C%20I%27m%20interested%20in%20aviation%20connectivity%20pricing." target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="w-full md:w-auto h-12 px-8 font-bold uppercase tracking-widest text-xs border-white/20">
                          WhatsApp Sales Team
                        </Button>
                      </a>
                      <p className="text-[10px] text-gray-600 text-center">sales@orbitfuture.store</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Comparison table toggle */}
        <div className="mt-20 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-1">
              How We Compare
            </h2>
            <p className="text-gray-500 text-sm">OrbitFuture vs Traditional ISP vs Other Satellite providers</p>
          </div>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors"
          >
            {showComparison ? "Hide ▲" : "Show ▼"}
          </button>
        </div>

        {showComparison && (
          <div className="overflow-x-auto rounded-2xl border border-border mb-16">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs font-bold uppercase tracking-widest text-gray-500 w-[200px]">Feature</th>
                  {Object.keys(COMPARISON_DATA).map((provider) => (
                    <th
                      key={provider}
                      className={`p-4 text-center text-xs font-black uppercase tracking-widest ${
                        provider === "ORBITFUTURE" ? "text-primary bg-primary/5" : "text-gray-400"
                      }`}
                    >
                      {provider === "ORBITFUTURE" && (
                        <span className="block text-[8px] bg-primary text-black rounded-full px-2 py-0.5 mb-1 uppercase tracking-widest w-fit mx-auto">Our Service</span>
                      )}
                      {provider}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((feature, idx) => (
                  <tr
                    key={feature}
                    className={`border-b border-border/40 ${idx % 2 === 0 ? "bg-white/1" : ""}`}
                  >
                    <td className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{feature}</td>
                    {Object.entries(COMPARISON_DATA).map(([provider, data]) => (
                      <td
                        key={provider}
                        className={`p-4 text-center ${provider === "ORBITFUTURE" ? "bg-primary/3" : ""}`}
                      >
                        <ComparisonCell
                          value={data[feature]}
                          highlight={provider === "ORBITFUTURE"}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Included with every plan */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-12">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">
            ✦ Included with Every Order
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, label: "Hardware Kit Included" },
              { icon: Globe, label: "Free Shipping Worldwide" },
              { icon: Shield, label: "12-Month Warranty" },
              { icon: HeadphonesIcon, label: "24/7 Expert Support" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-bold text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust / stats bar */}
        <div className="border-t border-white/5 pt-12 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Countries Available", value: "100+" },
              { label: "Avg Download Speed", value: "200Mbps" },
              { label: "Avg Latency", value: "20ms" },
              { label: "Uptime (Starlink Network)", value: "99.9%" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-black text-primary mb-1">{s.value}</div>
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-6 text-center">
            Pricing Questions
          </h2>
          <div className="space-y-3 mb-8">
            {PLANS_FAQS.map((faq, i) => (
              <div key={i} className="border border-white/8 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/3 transition-colors"
                >
                  <span className="text-white text-sm font-bold pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <span className="text-primary text-sm shrink-0">▲</span>
                    : <span className="text-gray-500 text-sm shrink-0">▼</span>}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/faq">
              <Button variant="outline" className="h-11 px-8 text-xs font-bold uppercase tracking-widest border-white/20 hover:border-white/40">
                View All FAQs →
              </Button>
            </Link>
          </div>
        </div>

        {/* Legal disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-gray-700 text-[10px] leading-relaxed max-w-2xl mx-auto">
            OrbitFuture is an independent satellite internet solutions company. We are not affiliated with, endorsed by, or operated by SpaceX or Starlink. "Starlink" is a registered trademark of Space Exploration Technologies Corp. References to Starlink describe the satellite internet service that OrbitFuture helps customers access and manage.
          </p>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-black/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Starlink Plans</p>
            <p className="text-[11px] text-gray-500 truncate">No contracts · Free shipping · 24/7 support</p>
          </div>
          <a href="#plan-grid" onClick={(e) => { e.preventDefault(); document.getElementById('plan-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
            <Button className="h-11 px-6 text-xs font-black uppercase tracking-widest shrink-0">
              <ArrowRight className="w-4 h-4 mr-1.5" />
              View Plans
            </Button>
          </a>
        </div>
      </div>
    </MainLayout>
  );
}
