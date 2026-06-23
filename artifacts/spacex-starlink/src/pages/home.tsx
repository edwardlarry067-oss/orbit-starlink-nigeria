import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Satellite, Zap, Globe, Shield, Lock, HeadphonesIcon, CheckCircle2,
  Star, ChevronDown, ChevronUp, ArrowRight, Package, Award, Clock,
  Home as HomeIcon, Briefcase, Navigation, Ship, Plane, Users,
  Mail, Phone, TruckIcon, MapPin, BadgeCheck, MessageCircle,
  CreditCard, WifiIcon, Wrench, AlertCircle,
} from "lucide-react";

const WHATSAPP_NUMBER = "16206123994";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! 👋 I need help choosing a Starlink plan.\n\nCould you help me pick the right plan for my needs and location?\n\nThank you!")}`;

function trackClick(label: string) {
  try {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead", { content_name: label });
    }
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "click", { event_category: "CTA", event_label: label });
    }
  } catch {}
}

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    let start: number;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setCount(Math.floor(eased * target));
      if (pct < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);

  return { count, ref };
}

function StatCounter({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) {
  const { count, ref } = useCountUp(target);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black text-white mb-2 tabular-nums">
        {count}{suffix}
      </div>
      <div className="text-gray-500 text-[11px] uppercase tracking-widest font-bold">{label}</div>
    </div>
  );
}

function TrustStatusBar() {
  return (
    <div className="bg-[#040404] border-b border-white/5 py-2.5 overflow-hidden">
      <div className="container mx-auto px-4 flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
        {[
          { dot: "bg-emerald-400", text: "Secure Paystack Checkout" },
          { dot: "bg-primary", text: "SSL Encrypted" },
          { dot: "bg-primary", text: "No Hidden Fees" },
          { dot: "bg-primary", text: "Service Available in 100+ Countries" },
          { dot: "bg-emerald-400", text: "14-Day Hardware Return Policy" },
        ].map(({ dot, text }) => (
          <div key={text} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SatelliteGlobe() {
  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,212,255,0.12)_0%,transparent_70%)] rounded-full" />
      <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]">
        <defs>
          <filter id="sat-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="globe-surface" cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor="rgba(0,212,255,0.12)" />
            <stop offset="60%" stopColor="rgba(0,30,50,0.6)" />
            <stop offset="100%" stopColor="rgba(0,10,20,0.95)" />
          </radialGradient>
          <path id="orbit-equator" d="M 285,150 a 135,36 0 1,1 -270,0 a 135,36 0 1,1 270,0" />
          <path id="orbit-polar" d="M 150,15 a 36,135 0 1,1 0,270 a 36,135 0 1,1 0,-270" />
          <path id="orbit-diagonal" d="M 245,55 a 135,36 0 1,1 -190,190" />
        </defs>
        <circle cx="150" cy="150" r="132" fill="url(#globe-surface)" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5" />
        <ellipse cx="150" cy="150" rx="132" ry="36" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="0.8" />
        <ellipse cx="150" cy="112" rx="114" ry="28" fill="none" stroke="rgba(0,212,255,0.07)" strokeWidth="0.7" />
        <ellipse cx="150" cy="188" rx="114" ry="28" fill="none" stroke="rgba(0,212,255,0.07)" strokeWidth="0.7" />
        <ellipse cx="150" cy="78" rx="76" ry="18" fill="none" stroke="rgba(0,212,255,0.05)" strokeWidth="0.6" />
        <ellipse cx="150" cy="222" rx="76" ry="18" fill="none" stroke="rgba(0,212,255,0.05)" strokeWidth="0.6" />
        <ellipse cx="150" cy="150" rx="36" ry="132" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="0.8" />
        <ellipse cx="150" cy="150" rx="36" ry="132" fill="none" stroke="rgba(0,212,255,0.07)" strokeWidth="0.7" transform="rotate(60 150 150)" />
        <ellipse cx="150" cy="150" rx="36" ry="132" fill="none" stroke="rgba(0,212,255,0.07)" strokeWidth="0.7" transform="rotate(120 150 150)" />
        <ellipse cx="150" cy="150" rx="143" ry="38" fill="none" stroke="rgba(0,212,255,0.55)" strokeWidth="1.3" strokeDasharray="7,4" />
        <ellipse cx="150" cy="150" rx="143" ry="38" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="1.1" strokeDasharray="7,4" transform="rotate(55 150 150)" />
        <ellipse cx="150" cy="150" rx="143" ry="38" fill="none" stroke="rgba(0,212,255,0.35)" strokeWidth="1" strokeDasharray="7,4" transform="rotate(-55 150 150)" />
        <circle r="5.5" fill="#00d4ff" filter="url(#sat-glow)">
          <animateMotion dur="8s" repeatCount="indefinite" calcMode="linear"><mpath href="#orbit-equator" /></animateMotion>
        </circle>
        <circle r="4" fill="#00d4ff" filter="url(#sat-glow)">
          <animateMotion dur="11s" repeatCount="indefinite" begin="-5s" calcMode="linear"><mpath href="#orbit-polar" /></animateMotion>
        </circle>
        <circle r="4" fill="#4dffc8" filter="url(#sat-glow)">
          <animateMotion dur="9.5s" repeatCount="indefinite" begin="-2s" calcMode="linear"><mpath href="#orbit-diagonal" /></animateMotion>
        </circle>
        <circle cx="150" cy="18" r="3" fill="rgba(0,212,255,0.5)" />
        <circle cx="150" cy="282" r="3" fill="rgba(0,212,255,0.5)" />
        <circle cx="150" cy="150" r="132" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="8" opacity="0.4" />
      </svg>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 border border-primary/30 rounded-full px-3 py-1">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Starlink Coverage Active</span>
      </div>
    </div>
  );
}

const TESTIMONIALS = [
  {
    name: "Chukwuemeka O.",
    location: "Lagos, Nigeria",
    flag: "🇳🇬",
    plan: "Starlink Business",
    type: "Business Owner",
    rating: 5,
    text: "Running a logistics company across Lagos, we needed reliable internet across all our offices. OrbitFuture handled the setup and support — our operations team can now coordinate in real time, even in areas with poor GSM coverage.",
    avatar: "CO",
  },
  {
    name: "Sarah K.",
    location: "Rural Montana, USA",
    flag: "🇺🇸",
    plan: "Starlink Residential",
    type: "Remote Worker",
    rating: 5,
    text: "I work remotely from a ranch that had zero reliable internet. OrbitFuture's team helped me get set up in 20 minutes. Now I stream 4K and have video meetings all day without issues. Truly life-changing.",
    avatar: "SK",
  },
  {
    name: "Adaeze N.",
    location: "Abuja, Nigeria",
    flag: "🇳🇬",
    plan: "Starlink Residential",
    type: "Freelancer",
    rating: 5,
    text: "As a remote worker serving international clients, I needed internet that matched big-city speeds. OrbitFuture got me connected fast — client calls are crystal clear. I'm never dropping a deadline again.",
    avatar: "AN",
  },
  {
    name: "Captain James T.",
    location: "North Atlantic",
    flag: "🌊",
    plan: "Starlink Maritime",
    type: "Vessel Captain",
    rating: 5,
    text: "We operate a vessel on long transatlantic routes. OrbitFuture keeps our crew connected for welfare and our operations team connected for safety communications. Exceptional service and support.",
    avatar: "JT",
  },
  {
    name: "Babatunde F.",
    location: "Port Harcourt, Nigeria",
    flag: "🇳🇬",
    plan: "Starlink Residential",
    type: "Media Producer",
    rating: 5,
    text: "I run a media production studio and upload huge video files daily. Before OrbitFuture, we'd lose hours waiting on uploads. Now 4K footage goes up in minutes. The service paid for itself in the first week.",
    avatar: "BF",
  },
  {
    name: "Dr. Claire M.",
    location: "Ontario, Canada",
    flag: "🇨🇦",
    plan: "Starlink Residential",
    type: "Healthcare",
    rating: 5,
    text: "Our clinic is 80km from the nearest city. OrbitFuture lets us do telemedicine, send lab results digitally, and keep patient records in the cloud. It has genuinely improved patient outcomes.",
    avatar: "CM",
  },
  {
    name: "Ngozi A.",
    location: "Enugu, Nigeria",
    flag: "🇳🇬",
    plan: "Starlink Business",
    type: "EdTech Founder",
    rating: 5,
    text: "We run an EdTech platform for students across southeastern Nigeria. OrbitFuture made it possible to stream live classes with zero buffering. Our student retention rate shot up 40% since we switched.",
    avatar: "NA",
  },
  {
    name: "Hans B.",
    location: "Bavaria, Germany",
    flag: "🇩🇪",
    plan: "Starlink Residential",
    type: "Home User",
    rating: 5,
    text: "Living in the Alps meant poor connectivity for years. OrbitFuture changed everything — fast, reliable internet even in deep winter. We can now work from home full-time.",
    avatar: "HB",
  },
  {
    name: "Emeka K.",
    location: "Kano, Nigeria",
    flag: "🇳🇬",
    plan: "Starlink Residential",
    type: "Home User",
    rating: 5,
    text: "I've tried every internet provider in Kano — none came close. OrbitFuture is in a different league. Consistent speeds, no power outage disruptions, and setup was genuinely 20 minutes. Best investment I've made.",
    avatar: "EK",
  },
  {
    name: "Felix W.",
    location: "Vancouver, Canada",
    flag: "🇨🇦",
    plan: "Starlink Roam",
    type: "Content Creator",
    rating: 5,
    text: "I'm a travel content creator driving across North America. Starlink Roam via OrbitFuture goes everywhere I do. I've uploaded 4K footage from the middle of the Rockies. Nothing else comes close.",
    avatar: "FW",
  },
  {
    name: "Chioma I.",
    location: "Lagos, Nigeria",
    flag: "🇳🇬",
    plan: "Starlink Residential",
    type: "Fitness Coach",
    rating: 5,
    text: "Finally — internet that actually matches the price I pay. I host virtual fitness classes for over 300 subscribers globally. OrbitFuture means my streams never freeze. My clients are happier than ever.",
    avatar: "CI",
  },
  {
    name: "Sophie D.",
    location: "Brittany, France",
    flag: "🇫🇷",
    plan: "Starlink Roam",
    type: "Remote Worker",
    rating: 5,
    text: "As a remote worker who travels the French coast, I needed internet that kept up with me. OrbitFuture's Roam setup is flawless — cafés and campsites, I'm always connected.",
    avatar: "SD",
  },
];

const HOME_FAQS = [
  {
    q: "What exactly does OrbitFuture do?",
    a: "OrbitFuture is an independent satellite internet solutions company. We help customers worldwide order, activate, deploy, and manage Starlink connectivity. We handle the ordering process, provide installation guidance, and offer ongoing technical support — so you get connected faster with less friction.",
  },
  {
    q: "Do you deliver to Nigeria?",
    a: "Yes — Nigeria is one of our most active markets. We support customers across Lagos, Abuja, Port Harcourt, Kano, Enugu, and all other states. Delivery typically takes 7–14 business days from order confirmation.",
  },
  {
    q: "How long does delivery take?",
    a: "Standard international delivery is 7–14 business days. Express delivery options (3–7 days) are available in select regions at checkout. You'll receive a tracking number by email as soon as your order ships.",
  },
  {
    q: "Can I pay by bank transfer?",
    a: "Yes. Paystack supports bank transfer, USSD, and direct bank payments in addition to card payments. You can also use your Orbit Wallet balance if you have tokens loaded. All payment options are shown at checkout.",
  },
  {
    q: "Do I need a technician to install it?",
    a: "No. The kit is fully plug-and-play with step-by-step instructions. 95% of customers self-install in under 30 minutes. Our team is available via WhatsApp and email if you need any help at no extra charge.",
  },
  {
    q: "Can I use Starlink while traveling?",
    a: "Yes — with the Starlink Roam plan. It works on land anywhere Starlink has coverage. For sea travel, Starlink Maritime is designed for vessels. Both plans are available through OrbitFuture.",
  },
  {
    q: "What hardware is included in the kit?",
    a: "Your kit includes: Starlink dish (Gen 3), Wi-Fi router, power cable, all mounting hardware, and a carrying case. Everything you need to get online is in the box — no additional purchases needed.",
  },
  {
    q: "What happens after payment?",
    a: "After payment is confirmed, our team sends an order confirmation within 1 hour. We verify your delivery address and begin processing your order. You'll receive tracking details once the hardware ships, and our team is available for setup support when it arrives.",
  },
  {
    q: "Is there a long-term contract?",
    a: "No contracts, ever. All plans are month-to-month. Cancel anytime with zero cancellation fees.",
  },
  {
    q: "What speeds can I realistically expect?",
    a: "Residential plans typically deliver 50–300 Mbps download with 20–40ms latency. Business plans reach higher priority speeds. Exact speeds depend on your location and local network conditions.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Visa, Mastercard, and Verve cards via Paystack. You can also use your Orbit Wallet token balance. All payments are PCI-DSS compliant — your card details are never stored on our servers.",
  },
];

const INCLUDED = [
  { icon: Package, title: "Hardware Kit", desc: "Dish, router, cables, and mounting hardware — everything you need." },
  { icon: Zap, title: "Express Setup Guide", desc: "Step-by-step installation guide with video support." },
  { icon: HeadphonesIcon, title: "Installation Support", desc: "Free call with our team to walk you through setup." },
  { icon: Shield, title: "12-Month Warranty", desc: "Full hardware replacement warranty on all equipment." },
  { icon: Clock, title: "Account Activation", desc: "We activate your service remotely — no waiting." },
  { icon: Award, title: "Priority Support", desc: "24/7 WhatsApp and email support for all customers." },
];

const HOW_IT_WORKS = [
  { step: "01", icon: Globe, title: "Choose Your Plan", desc: "Browse residential, business, roam, maritime, or aviation plans. Select what matches your location and usage needs." },
  { step: "02", icon: Shield, title: "Secure Checkout", desc: "Complete your order in minutes. Pay securely via card, bank transfer, or your Orbit Wallet. No contracts required." },
  { step: "03", icon: Package, title: "Receive Your Kit", desc: "Your Starlink hardware ships directly to you — dish, Wi-Fi router, power supply, mount, and all cables included." },
  { step: "04", icon: Zap, title: "Go Live in 20 Min", desc: "Position the dish with a clear sky view, plug it in, and connect. Our team activates your account remotely." },
];

const WHO_ITS_FOR = [
  {
    icon: HomeIcon, label: "Home Users", title: "Reliable Home Internet",
    desc: "No more buffering, dropouts, or data caps. Stream 4K, work from home, and video call — from any location.",
    tags: ["Unlimited data", "Self-install in 20 min", "No contracts"], href: "/plans",
  },
  {
    icon: Briefcase, label: "Businesses", title: "Enterprise Connectivity",
    desc: "Keep operations running with priority-class speeds. SLA-backed uptime for offices, farms, and remote sites.",
    tags: ["Priority data", "SLA uptime", "Business dashboard"], href: "/plans",
  },
  {
    icon: Navigation, label: "Travelers", title: "Internet on the Move",
    desc: "Roam plan lets you use Starlink wherever you go on land. Perfect for digital nomads, overlanders, and campers.",
    tags: ["Use anywhere on land", "Pause anytime", "In-vehicle use"], href: "/plans",
  },
  {
    icon: Ship, label: "Maritime", title: "At-Sea Connectivity",
    desc: "High-speed internet on open water. Crew welfare, vessel operations, and cargo coordination — anywhere at sea.",
    tags: ["Global ocean coverage", "In-motion use", "Priority data"], href: "/plans",
  },
  {
    icon: Plane, label: "Aviation", title: "In-Flight Internet",
    desc: "Custom enterprise packages for commercial and private aircraft. FAA/EASA-compatible hardware. Global flight coverage.",
    tags: ["Global air coverage", "Custom packages", "Enterprise SLA"], href: "/support",
  },
];

const DELIVERY_STEPS = [
  {
    step: "01", icon: Package,
    title: "Place Your Order",
    desc: "Select your plan, enter your delivery address, and complete secure checkout. Paystack processes all payments.",
    time: "Takes 5 minutes",
  },
  {
    step: "02", icon: BadgeCheck,
    title: "Order Verification",
    desc: "Our team confirms your order within 1 hour and sends a confirmation email with your order reference number.",
    time: "Within 1 hour",
  },
  {
    step: "03", icon: TruckIcon,
    title: "Hardware Shipment",
    desc: "Your Starlink kit is dispatched from our warehouse. Standard delivery 7–14 days. Express options available.",
    time: "7–14 business days",
  },
  {
    step: "04", icon: HeadphonesIcon,
    title: "Activation Support",
    desc: "Our team contacts you on WhatsApp to guide you through setup and remotely activates your Starlink account.",
    time: "Same day as delivery",
  },
  {
    step: "05", icon: WifiIcon,
    title: "Go Online",
    desc: "You're fully connected. Enjoy speeds up to 300 Mbps. Our team remains available for any ongoing support.",
    time: "Within 20 minutes",
  },
];

const TRUST_ITEMS = [
  { icon: CreditCard, title: "Secure Paystack Payments", desc: "All payments processed by Paystack — PCI-DSS Level 1 compliant. Your card details are never stored on our servers." },
  { icon: Lock, title: "SSL Encrypted Checkout", desc: "End-to-end encryption protects every transaction. Look for the padlock in your browser — your data is always secure." },
  { icon: Globe, title: "Worldwide Support", desc: "Our support team is available 24/7 via WhatsApp and email. Customers across 100+ countries receive the same level of service." },
  { icon: Shield, title: "Hardware Warranty", desc: "All hardware comes with a 12-month manufacturer warranty. Defective items are replaced at no cost to you." },
  { icon: Wrench, title: "Dedicated Activation Assistance", desc: "We don't just ship hardware and disappear. Our team guides you through setup, activation, and first connection." },
  { icon: BadgeCheck, title: "Transparent Pricing", desc: "No hidden fees, no surprise charges. The price you see is the price you pay — hardware, setup support, and activation all included." },
];

const PHOTO_GALLERY = [
  { src: "/mountain-starlink.png", alt: "Starlink installation in a remote mountain location", label: "Remote / Rural", desc: "Ideal for farms, ranches, and off-grid properties" },
  { src: "/dish.jpg", alt: "Starlink dish home installation", label: "Home Installation", desc: "Rooftop mounting — clear sky, full signal" },
  { src: "/dish.png", alt: "Starlink dish setup", label: "Business Setup", desc: "Office and commercial rooftop deployments" },
  { src: null, alt: "Vehicle satellite internet setup", label: "Vehicle / Mobile", desc: "Trucks, RVs, and overland vehicles" },
  { src: null, alt: "Remote work setup with satellite internet", label: "Remote Work", desc: "Work from anywhere with a clear view of the sky" },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <MainLayout>
      <TrustStatusBar />

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(0,212,255,0.10)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(0,100,180,0.06)_0%,transparent_50%)]" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(0,212,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
                <Satellite className="w-3.5 h-3.5" />
                Independent Starlink Solutions · 100+ Countries
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-white mb-5 leading-none">
                Starlink Internet<br />
                <span className="text-primary">Delivered &amp; Supported</span><br />
                Worldwide
              </h1>
              <p className="text-base md:text-lg text-gray-400 mb-8 leading-relaxed max-w-lg">
                Order, activate, and deploy Starlink satellite internet with expert support, secure checkout, and fast setup assistance.
              </p>
              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-2 mb-8">
                {[
                  { icon: Globe, text: "Available in 100+ Countries" },
                  { icon: Shield, text: "Secure Checkout" },
                  { icon: HeadphonesIcon, text: "24/7 Support" },
                  { icon: TruckIcon, text: "Fast Delivery" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs text-gray-300 font-bold">{text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/plans">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-14 px-10 text-sm font-black uppercase tracking-widest shadow-[0_0_40px_rgba(0,212,255,0.25)] hover:shadow-[0_0_60px_rgba(0,212,255,0.4)] transition-shadow"
                    onClick={() => trackClick("Hero — Check Availability")}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Check Availability
                  </Button>
                </Link>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackClick("Hero — WhatsApp")}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-14 px-10 text-sm font-bold uppercase tracking-widest border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]/70 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Chat on WhatsApp
                  </Button>
                </a>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <SatelliteGlobe />
            </div>
          </div>
        </div>
      </section>

      {/* ── MOUNTAIN IMAGE ── */}
      <section className="relative w-full overflow-hidden">
        <img
          src="/mountain-starlink.png"
          alt="Starlink satellite dish installed in a dramatic mountain landscape at dusk"
          className="w-full object-cover h-64 md:h-96 lg:h-[480px]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        <div className="absolute bottom-0 left-0 right-0 pb-8 text-center">
          <p className="text-white/90 text-sm md:text-base font-bold uppercase tracking-[0.25em]">Connected from the world's most remote locations</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Starlink Signal Active</span>
          </div>
        </div>
      </section>

      {/* ── TRUSTED AROUND THE WORLD — ANIMATED COUNTERS ── */}
      <section className="py-16 md:py-20 bg-black border-y border-white/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4 text-xs font-bold uppercase tracking-widest text-primary">
              <Globe className="w-3.5 h-3.5" />
              Trusted Around The World
            </div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
              Numbers That Speak for Themselves
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter target={100} suffix="+" label="Countries Served" />
            <StatCounter target={20} suffix="ms" label="Avg Latency" />
            <StatCounter target={300} suffix="+" label="Mbps Speeds" />
            <StatCounter target={24} suffix="/7" label="Expert Support" />
          </div>
        </div>
      </section>

      {/* ── POSITIONING BANNER ── */}
      <section className="py-8 bg-primary/5 border-b border-primary/10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-gray-300 text-sm leading-relaxed">
            <span className="text-white font-bold">OrbitFuture</span> is an independent satellite internet solutions company. We help customers worldwide order, activate, and manage{" "}
            <span className="text-primary font-bold">Starlink</span> connectivity — with dedicated setup support, expert guidance, and flexible payment options.{" "}
            <span className="text-gray-500">We are not affiliated with or operated by SpaceX.</span>
          </p>
        </div>
      </section>

      {/* ── WHY CUSTOMERS TRUST ORBITFUTURE ── */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verified Trust Signals
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
              Why Customers Trust <span className="text-primary">OrbitFuture</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Every element of our service is designed to protect your money, your data, and your time.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group relative bg-card/50 backdrop-blur-sm border border-border hover:border-primary/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,212,255,0.06)] hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/4 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white mb-3">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 md:py-24 bg-black border-y border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              <Zap className="w-3.5 h-3.5" />
              Simple 4-Step Process
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">From order to online in four straightforward steps. No technical knowledge needed.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent z-0" />
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }, i) => (
              <div key={step} className="relative z-10 flex flex-col items-center text-center group">
                <div className="relative mb-5">
                  <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center group-hover:bg-primary/15 transition-colors shadow-[0_0_20px_rgba(0,212,255,0.08)]">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center">{i + 1}</div>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/plans">
              <Button className="h-12 px-10 text-xs font-bold uppercase tracking-widest" onClick={() => trackClick("How It Works — Get Started")}>
                <Zap className="w-4 h-4 mr-2" />
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW DELIVERY WORKS ── */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              <TruckIcon className="w-3.5 h-3.5" />
              Order to Online
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">How Delivery Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              From order placement to going live online — here's exactly what to expect, step by step.
            </p>
          </div>
          <div className="relative">
            {/* Vertical connector */}
            <div className="absolute left-6 md:left-1/2 top-6 bottom-6 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden sm:block" />
            <div className="space-y-6">
              {DELIVERY_STEPS.map(({ step, icon: Icon, title, desc, time }, i) => (
                <div key={step} className={`relative flex gap-6 items-start ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} group`}>
                  <div className="flex-1 hidden md:block" />
                  <div className="relative z-10 w-12 h-12 shrink-0 bg-primary text-black rounded-full flex items-center justify-center font-black text-sm shadow-[0_0_20px_rgba(0,212,255,0.3)] group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <div className="flex-1 bg-card/50 backdrop-blur-sm border border-border hover:border-primary/30 rounded-2xl p-5 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(0,212,255,0.05)]">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-black uppercase tracking-widest text-white">{title}</h3>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">{time}</span>
                        </div>
                        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link href="/plans">
              <Button className="h-12 px-10 text-xs font-bold uppercase tracking-widest" onClick={() => trackClick("Delivery — Order Now")}>
                <Package className="w-4 h-4 mr-2" />
                Place Your Order
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── REAL STARLINK INSTALLATIONS — PHOTO GALLERY ── */}
      <section className="py-20 md:py-24 bg-black border-y border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              <MapPin className="w-3.5 h-3.5" />
              Real Deployments
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
              Real Starlink <span className="text-primary">Installations</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              From mountain farms to urban rooftops — Starlink goes where other internet can't.
            </p>
            <p className="text-gray-600 text-[11px] mt-2">Photos from actual deployment environments.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PHOTO_GALLERY.map(({ src, alt, label, desc }, i) => (
              <div
                key={label}
                className={`group relative overflow-hidden rounded-2xl border border-white/8 hover:border-primary/30 transition-all duration-300 ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
              >
                {src ? (
                  <img
                    src={src}
                    alt={alt}
                    className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${i === 0 ? "h-64 md:h-full min-h-[300px]" : "h-40 md:h-48"}`}
                    loading="lazy"
                  />
                ) : (
                  <div className={`w-full bg-gradient-to-br from-primary/8 via-primary/4 to-black flex items-center justify-center ${i === 0 ? "h-64 md:h-full min-h-[300px]" : "h-40 md:h-48"}`}>
                    <div className="text-center">
                      <Satellite className="w-10 h-10 text-primary/40 mx-auto mb-2" />
                      <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">{label}</span>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="inline-block bg-primary/20 border border-primary/30 rounded-full px-2 py-0.5 mb-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">{label}</span>
                  </div>
                  <p className="text-white/70 text-[10px] leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/plans">
              <Button variant="outline" className="h-11 px-8 text-xs font-bold uppercase tracking-widest border-white/20 hover:border-primary/40" onClick={() => trackClick("Gallery — Check Plans")}>
                View All Plans →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY ORBITFUTURE ── */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              <Award className="w-3.5 h-3.5" />
              Why Choose OrbitFuture
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">Built for Real Customers.</h2>
            <p className="text-gray-400 max-w-xl mx-auto">We don't just process orders. We ensure you get connected, stay connected, and have expert support at every step.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Zap, title: "Ultra-Fast Starlink Speeds", desc: "Starlink delivers up to 300 Mbps download with 20–40ms latency — perfect for 4K streaming, VoIP, and remote work." },
              { icon: Globe, title: "Truly Global Reach", desc: "Starlink service available in 100+ countries across 6 continents. Rural, maritime, aviation — wherever you need connectivity." },
              { icon: Shield, title: "Dedicated Setup Support", desc: "Our team guides you from order to being live online. WhatsApp and email support available 24/7, 365 days a year." },
              { icon: Package, title: "Complete Hardware", desc: "Premium Starlink dish, Wi-Fi router, mount, and all cables included. No surprise hardware costs or third-party sourcing." },
              { icon: HeadphonesIcon, title: "Expert Activation Help", desc: "We handle remote service activation and troubleshoot any issues — so you're never left figuring it out alone." },
              { icon: Clock, title: "20-Minute Setup", desc: "The Starlink dish self-aligns automatically. No drilling. No professional installer needed. Most customers are online in under 30 minutes." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.05)] hover:-translate-y-0.5">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-widest text-white mb-3">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="py-20 md:py-24 bg-black border-y border-white/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              <Users className="w-3.5 h-3.5" />
              Built for Every Use Case
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">Who It's For</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Whether you're at home, running a business, traveling, at sea, or in the air — we have the right connectivity solution.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {WHO_ITS_FOR.map(({ icon: Icon, label, title, desc, tags, href }) => (
              <Link key={label} href={href}>
                <div className="group bg-card border border-border rounded-2xl p-6 flex flex-col h-full hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,212,255,0.06)] transition-all duration-300 cursor-pointer hover:-translate-y-0.5">
                  <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{label}</p>
                  <h3 className="text-sm font-bold text-white mb-2 leading-snug">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed flex-1 mb-4">{desc}</p>
                  <div className="space-y-1.5">
                    {tags.map((tag) => (
                      <div key={tag} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                        <span className="text-[10px] text-gray-500 font-bold">{tag}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-4 text-primary text-[10px] font-black uppercase tracking-widest group-hover:gap-2 transition-all">
                    View Plans <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ── */}
      <section className="py-20 md:py-24 bg-black">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
              Everything <span className="text-primary">Included.</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">Every OrbitFuture order comes with hardware, support, and setup assistance. No hidden extras, no surprises.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INCLUDED.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-1">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/plans">
              <Button className="h-12 px-10 text-xs font-bold uppercase tracking-widest" onClick={() => trackClick("Included — View Plans")}>
                <ArrowRight className="w-4 h-4 mr-2" />
                View All Plans & Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              <Star className="w-3.5 h-3.5" />
              Customer Stories
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
              Trusted by Customers Worldwide
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">From remote homesteads to cargo vessels — experiences from OrbitFuture customers around the globe.</p>
            <p className="text-gray-600 text-[11px] mt-3 max-w-lg mx-auto leading-relaxed">
              Testimonials represent customer experiences and deployment scenarios.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="group bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-primary/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.04)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-1 mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-xs font-black text-primary shrink-0">
                    {t.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold">{t.name}</p>
                    <p className="text-gray-600 text-[10px]">{t.flag} {t.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">{t.plan.replace("Starlink ", "")}</span>
                    <span className="text-[9px] text-gray-600 uppercase tracking-wider">{t.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COVERAGE SECTION ── */}
      <section className="py-16 bg-black border-y border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
                <Globe className="w-3.5 h-3.5" />
                Global Coverage
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-6">
                If you can see the sky,<br />
                <span className="text-primary">you can connect.</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Starlink's low-Earth orbit satellite network covers 100+ countries. Rural, remote, maritime, or airborne — we help you access connectivity where fibre and cable cannot reach.
              </p>
              <div className="space-y-3 mb-8">
                {["North America & Canada", "Europe (all 44 countries)", "Africa (40+ countries)", "Asia-Pacific", "Latin America", "Middle East"].map((region) => (
                  <div key={region} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-gray-300 text-sm">{region}</span>
                  </div>
                ))}
              </div>
              <Link href="/coverage">
                <Button variant="outline" className="h-11 px-8 text-xs font-bold uppercase tracking-widest border-white/20 hover:border-white/40">
                  Check Coverage Map →
                </Button>
              </Link>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <SatelliteGlobe />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-4">Common Questions</h2>
            <p className="text-gray-400">Quick answers to what most customers want to know.</p>
          </div>
          <div className="space-y-3 mb-10">
            {HOME_FAQS.map((faq, i) => (
              <div key={i} className="border border-white/8 rounded-xl overflow-hidden hover:border-white/12 transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/3 transition-colors"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-white text-sm font-bold pr-4">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
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
      </section>

      {/* ── URGENCY / READY TO GET CONNECTED ── */}
      <section className="py-16 md:py-20 bg-black border-y border-white/5">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-8 md:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,212,255,0.08)_0%,transparent_60%)]" />
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
                  <Zap className="w-3.5 h-3.5 animate-pulse" />
                  Available Now
                </div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-4">
                  Ready To Get Connected?
                </h2>
                <p className="text-gray-400 max-w-md mx-auto mb-8">
                  Starlink is available in your region. Place your order today and our team will have you connected in days — not weeks.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: AlertCircle, text: "No contracts" },
                  { icon: HeadphonesIcon, text: "Expert support" },
                  { icon: Shield, text: "Secure checkout" },
                  { icon: Zap, text: "Fast setup" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-xl px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-gray-300 font-bold">{text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/plans">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-14 px-12 text-sm font-black uppercase tracking-widest shadow-[0_0_40px_rgba(0,212,255,0.25)]"
                    onClick={() => trackClick("Urgency — Check Availability")}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Check Availability &amp; Order
                  </Button>
                </Link>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackClick("Urgency — WhatsApp")}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-14 px-10 text-sm font-bold uppercase tracking-widest border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Ask a Question on WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE / BUSINESS INQUIRY ── */}
      <section className="py-16 bg-background border-b border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-gradient-to-br from-primary/8 via-primary/4 to-transparent border border-primary/20 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
                  <Briefcase className="w-3.5 h-3.5" />
                  Enterprise & Business
                </div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-4">
                  Need a Custom<br />
                  <span className="text-primary">Enterprise Solution?</span>
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  For large-scale deployments, aviation connectivity, maritime fleets, or multi-site business networks — our enterprise team provides custom quotes, SLA agreements, and dedicated account management.
                </p>
                <div className="space-y-3 mb-8">
                  {["Custom data packages and pricing", "Multi-site deployment support", "Dedicated account manager", "SLA-backed uptime guarantees", "Priority enterprise onboarding"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="mailto:sales@orbitfuture.store?subject=Enterprise%20Inquiry">
                    <Button className="h-12 px-8 text-xs font-bold uppercase tracking-widest w-full sm:w-auto">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Sales Team
                    </Button>
                  </a>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackClick("Enterprise — WhatsApp")}>
                    <Button variant="outline" className="h-12 px-8 text-xs font-bold uppercase tracking-widest border-white/20 hover:border-white/40 w-full sm:w-auto">
                      <Phone className="w-4 h-4 mr-2" />
                      WhatsApp Us
                    </Button>
                  </a>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-black/40 border border-white/8 rounded-2xl p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Response Time</p>
                  <p className="text-white font-bold">Enterprise inquiries answered within 2 hours</p>
                  <p className="text-gray-500 text-xs mt-1">Mon–Sun, 24 hours</p>
                </div>
                <div className="bg-black/40 border border-white/8 rounded-2xl p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">General Support</p>
                  <p className="text-white font-bold">All tickets answered within 4 hours</p>
                  <p className="text-gray-500 text-xs mt-1">support@orbitfuture.store · WhatsApp 24/7</p>
                </div>
                <div className="bg-black/40 border border-white/8 rounded-2xl p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Refund Policy</p>
                  <p className="text-white font-bold">14-day hardware return guarantee</p>
                  <p className="text-gray-500 text-xs mt-1">Unopened hardware, full refund. No questions asked.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 md:py-24 bg-black">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="bg-card border border-primary/20 rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.06)_0%,transparent_70%)]" />
            <div className="relative z-10">
              <Satellite className="w-10 h-10 text-primary mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-6">
                Ready to Get Connected?
              </h2>
              <p className="text-gray-400 mb-10 max-w-md mx-auto">
                Check availability in your country and get your Starlink service set up — with expert guidance from our team every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/plans">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-14 px-12 text-sm font-bold uppercase tracking-widest shadow-[0_0_40px_rgba(0,212,255,0.2)]"
                    onClick={() => trackClick("Final CTA — Check Availability")}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Check Availability &amp; Order
                  </Button>
                </Link>
                <Link href="/support">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-12 text-sm font-bold uppercase tracking-widest border-white/20">
                    <HeadphonesIcon className="w-5 h-5 mr-2" />
                    Talk to Support
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                {["No Contracts", "Cancel Anytime", "24/7 Support", "Secure Checkout"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-gray-500 font-bold">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
