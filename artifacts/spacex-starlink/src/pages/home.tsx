import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Satellite, Zap, Globe, Shield, Lock, HeadphonesIcon, CheckCircle2, Star, ChevronDown, ChevronUp, ArrowRight, Package, Award, Clock, Home as HomeIcon, Briefcase, Navigation, Ship, Plane, Users, Mail, Phone } from "lucide-react";

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


const TESTIMONIALS = [
  {
    name: "Chukwuemeka O.",
    location: "Lagos, Nigeria",
    plan: "Starlink Business",
    rating: 5,
    text: "Running a logistics company across Lagos, we needed reliable internet across all our offices. OrbitFuture handled the setup and support — our operations team can now coordinate in real time, even in areas with poor GSM coverage.",
    avatar: "CO",
  },
  {
    name: "Sarah K.",
    location: "Rural Montana, USA",
    plan: "Starlink Residential",
    rating: 5,
    text: "I work remotely from a ranch that had zero reliable internet. OrbitFuture's team helped me get set up in 20 minutes. Now I stream 4K and have video meetings all day without issues. Truly life-changing.",
    avatar: "SK",
  },
  {
    name: "Adaeze N.",
    location: "Abuja, Nigeria",
    plan: "Starlink Residential",
    rating: 5,
    text: "As a remote worker serving international clients, I needed internet that matched big-city speeds. OrbitFuture got me connected fast — client calls are crystal clear. I'm never dropping a deadline again.",
    avatar: "AN",
  },
  {
    name: "Captain James T.",
    location: "North Atlantic",
    plan: "Starlink Maritime",
    rating: 5,
    text: "We operate a vessel on long transatlantic routes. OrbitFuture keeps our crew connected for welfare and our operations team connected for safety communications. Exceptional service and support.",
    avatar: "JT",
  },
  {
    name: "Babatunde F.",
    location: "Port Harcourt, Nigeria",
    plan: "Starlink Residential",
    rating: 5,
    text: "I run a media production studio and upload huge video files daily. Before OrbitFuture, we'd lose hours waiting on uploads. Now 4K footage goes up in minutes. The service paid for itself in the first week.",
    avatar: "BF",
  },
  {
    name: "Dr. Claire M.",
    location: "Ontario, Canada",
    plan: "Starlink Residential",
    rating: 5,
    text: "Our clinic is 80km from the nearest city. OrbitFuture lets us do telemedicine, send lab results digitally, and keep patient records in the cloud. It has genuinely improved patient outcomes.",
    avatar: "CM",
  },
  {
    name: "Ngozi A.",
    location: "Enugu, Nigeria",
    plan: "Starlink Business",
    rating: 5,
    text: "We run an EdTech platform for students across southeastern Nigeria. OrbitFuture made it possible to stream live classes with zero buffering. Our student retention rate shot up 40% since we switched.",
    avatar: "NA",
  },
  {
    name: "Hans & Greta B.",
    location: "Bavaria, Germany",
    plan: "Starlink Residential",
    rating: 5,
    text: "Living in the Alps meant poor connectivity for years. OrbitFuture changed everything — fast, reliable internet even in deep winter. We can now work from home full-time.",
    avatar: "HB",
  },
  {
    name: "Emeka K.",
    location: "Kano, Nigeria",
    plan: "Starlink Residential",
    rating: 5,
    text: "I've tried every internet provider in Kano — none came close. OrbitFuture is in a different league. Consistent speeds, no power outage disruptions, and setup was genuinely 20 minutes. Best investment I've made.",
    avatar: "EK",
  },
  {
    name: "Felix W.",
    location: "Vancouver, Canada",
    plan: "Starlink Roam",
    rating: 5,
    text: "I'm a travel content creator driving across North America. Starlink Roam via OrbitFuture goes everywhere I do. I've uploaded 4K footage from the middle of the Rockies. Nothing else comes close.",
    avatar: "FW",
  },
  {
    name: "Chioma I.",
    location: "Lagos, Nigeria",
    plan: "Starlink Residential",
    rating: 5,
    text: "Finally — internet that actually matches the price I pay. I host virtual fitness classes for over 300 subscribers globally. OrbitFuture means my streams never freeze. My clients are happier than ever.",
    avatar: "CI",
  },
  {
    name: "Sophie D.",
    location: "Brittany, France",
    plan: "Starlink Roam",
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
    q: "How quickly can I get connected?",
    a: "Most customers are online within 20–30 minutes of receiving their equipment. The Starlink dish self-aligns automatically — just position it with a clear sky view, plug it in, and you're connected. Our support team is available to walk you through every step.",
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
    q: "Do I need a technician to install it?",
    a: "No. The kit is fully plug-and-play with step-by-step instructions. 95% of customers self-install in under 30 minutes. Our team is available via WhatsApp and email if you need any help.",
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
  {
    step: "01",
    icon: Globe,
    title: "Choose Your Plan",
    desc: "Browse residential, business, roam, maritime, or aviation plans. Select what matches your location and usage needs.",
  },
  {
    step: "02",
    icon: Shield,
    title: "Secure Checkout",
    desc: "Complete your order in minutes. Pay securely via card, bank transfer, or your Orbit Wallet. No contracts required.",
  },
  {
    step: "03",
    icon: Package,
    title: "Receive Your Kit",
    desc: "Your Starlink hardware ships directly to you — dish, Wi-Fi router, power supply, mount, and all cables included.",
  },
  {
    step: "04",
    icon: Zap,
    title: "Go Live in 20 Min",
    desc: "Position the dish with a clear sky view, plug it in, and connect. Our team activates your account remotely.",
  },
];

const WHO_ITS_FOR = [
  {
    icon: HomeIcon,
    label: "Home Users",
    title: "Reliable Home Internet",
    desc: "No more buffering, dropouts, or data caps. Stream 4K, work from home, and video call — from any location.",
    tags: ["Unlimited data", "Self-install in 20 min", "No contracts"],
    href: "/plans",
  },
  {
    icon: Briefcase,
    label: "Businesses",
    title: "Enterprise Connectivity",
    desc: "Keep operations running with priority-class speeds. SLA-backed uptime for offices, farms, and remote sites.",
    tags: ["Priority data", "SLA uptime", "Business dashboard"],
    href: "/plans",
  },
  {
    icon: Navigation,
    label: "Travelers",
    title: "Internet on the Move",
    desc: "Roam plan lets you use Starlink wherever you go on land. Perfect for digital nomads, overlanders, and campers.",
    tags: ["Use anywhere on land", "Pause anytime", "In-vehicle use"],
    href: "/plans",
  },
  {
    icon: Ship,
    label: "Maritime",
    title: "At-Sea Connectivity",
    desc: "High-speed internet on open water. Crew welfare, vessel operations, and cargo coordination — anywhere at sea.",
    tags: ["Global ocean coverage", "In-motion use", "Priority data"],
    href: "/plans",
  },
  {
    icon: Plane,
    label: "Aviation",
    title: "In-Flight Internet",
    desc: "Custom enterprise packages for commercial and private aircraft. FAA/EASA-compatible hardware. Global flight coverage.",
    tags: ["Global air coverage", "Custom packages", "Enterprise SLA"],
    href: "/support",
  },
];

function SatelliteGlobe() {
  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80 mx-auto flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,212,255,0.12)_0%,transparent_70%)] rounded-full" />
      <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]">
        <defs>
          <filter id="sat-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
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
        <ellipse cx="150" cy="78"  rx="76"  ry="18" fill="none" stroke="rgba(0,212,255,0.05)" strokeWidth="0.6" />
        <ellipse cx="150" cy="222" rx="76"  ry="18" fill="none" stroke="rgba(0,212,255,0.05)" strokeWidth="0.6" />
        <ellipse cx="150" cy="150" rx="36" ry="132" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="0.8" />
        <ellipse cx="150" cy="150" rx="36" ry="132" fill="none" stroke="rgba(0,212,255,0.07)" strokeWidth="0.7" transform="rotate(60 150 150)" />
        <ellipse cx="150" cy="150" rx="36" ry="132" fill="none" stroke="rgba(0,212,255,0.07)" strokeWidth="0.7" transform="rotate(120 150 150)" />
        <ellipse cx="150" cy="150" rx="143" ry="38" fill="none" stroke="rgba(0,212,255,0.55)" strokeWidth="1.3" strokeDasharray="7,4" />
        <ellipse cx="150" cy="150" rx="143" ry="38" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="1.1" strokeDasharray="7,4" transform="rotate(55 150 150)" />
        <ellipse cx="150" cy="150" rx="143" ry="38" fill="none" stroke="rgba(0,212,255,0.35)" strokeWidth="1" strokeDasharray="7,4" transform="rotate(-55 150 150)" />
        <circle r="5.5" fill="#00d4ff" filter="url(#sat-glow)">
          <animateMotion dur="8s" repeatCount="indefinite" calcMode="linear">
            <mpath href="#orbit-equator" />
          </animateMotion>
        </circle>
        <circle r="4" fill="#00d4ff" filter="url(#sat-glow)">
          <animateMotion dur="11s" repeatCount="indefinite" begin="-5s" calcMode="linear">
            <mpath href="#orbit-polar" />
          </animateMotion>
        </circle>
        <circle r="4" fill="#4dffc8" filter="url(#sat-glow)">
          <animateMotion dur="9.5s" repeatCount="indefinite" begin="-2s" calcMode="linear">
            <mpath href="#orbit-diagonal" />
          </animateMotion>
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

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <MainLayout>
      {/* ── TRUST STATUS BAR ── */}
      <TrustStatusBar />

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(0,212,255,0.04)_0%,transparent_50%)]" />
        <div className="container mx-auto px-4 text-center relative z-10 max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8 text-xs font-bold uppercase tracking-widest text-primary">
            <Satellite className="w-3.5 h-3.5" />
            Independent Starlink Solutions · 100+ Countries
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter text-white mb-6 leading-none">
            Internet<br />
            <span className="text-primary">Anywhere.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            OrbitFuture helps you order, activate, and deploy Starlink satellite internet anywhere in the world. Expert support, secure checkout, and full setup assistance — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/plans">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-sm font-bold uppercase tracking-widest shadow-[0_0_40px_rgba(0,212,255,0.2)]">
                <Zap className="w-5 h-5 mr-2" />
                Check Availability & Order
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 text-sm font-bold uppercase tracking-widest border-white/20 hover:border-white/40">
                Talk to Our Team
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {[
              { icon: Shield, label: "Secure Payments" },
              { icon: Lock, label: "SSL Protected" },
              { icon: HeadphonesIcon, label: "24/7 Support" },
              { icon: Globe, label: "100+ Countries" },
              { icon: CheckCircle2, label: "Verified Checkout" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOUNTAIN IMAGE ── */}
      <section className="relative w-full overflow-hidden">
        <img
          src="/mountain-starlink.png"
          alt="Starlink satellite dish installed in a dramatic mountain landscape at dusk"
          className="w-full object-cover h-64 md:h-96 lg:h-[480px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        <div className="absolute bottom-0 left-0 right-0 pb-8 text-center">
          <p className="text-white/90 text-sm md:text-base font-bold uppercase tracking-[0.25em]">
            Connected from the world's most remote locations
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Starlink Signal Active</span>
          </div>
        </div>
      </section>

      {/* ── POSITIONING BANNER ── */}
      <section className="py-10 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-gray-300 text-sm leading-relaxed">
            <span className="text-white font-bold">OrbitFuture</span> is an independent satellite internet solutions company. We help customers worldwide order, activate, and manage{" "}
            <span className="text-primary font-bold">Starlink</span> connectivity — with dedicated setup support, expert guidance, and flexible payment options. We are not affiliated with or operated by SpaceX.
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 bg-black border-y border-white/5">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { stat: "100+", label: "Countries Served" },
              { stat: "20ms", label: "Avg Latency" },
              { stat: "300+", label: "Mbps Typical Speed" },
              { stat: "24/7", label: "Expert Support" },
            ].map(({ stat, label }) => (
              <div key={label}>
                <div className="text-3xl md:text-4xl font-black text-white mb-1">{stat}</div>
                <div className="text-gray-500 text-[11px] uppercase tracking-widest font-bold">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              <Zap className="w-3.5 h-3.5" />
              Simple 4-Step Process
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              From order to online in four straightforward steps. No technical knowledge needed.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line — desktop only */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent z-0" />
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }, i) => (
              <div key={step} className="relative z-10 flex flex-col items-center text-center group">
                <div className="relative mb-5">
                  <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center group-hover:bg-primary/15 transition-colors shadow-[0_0_20px_rgba(0,212,255,0.08)]">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-black text-[10px] font-black rounded-full flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-2">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/plans">
              <Button className="h-12 px-10 text-xs font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(0,212,255,0.15)]">
                <Zap className="w-4 h-4 mr-2" />
                Get Started Now
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
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
              Built for Real Customers.
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              We don't just process orders. We ensure you get connected, stay connected, and have expert support at every step from order to activation.
            </p>
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
              <div key={title} className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.05)]">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-6">
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
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
              Who It's For
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Whether you're at home, running a business, traveling, at sea, or in the air — we have the right connectivity solution for you.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {WHO_ITS_FOR.map(({ icon: Icon, label, title, desc, tags, href }) => (
              <Link key={label} href={href}>
                <div className="group bg-card border border-border rounded-2xl p-6 flex flex-col h-full hover:border-primary/40 hover:shadow-[0_0_30px_rgba(0,212,255,0.06)] transition-all cursor-pointer">
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
            <p className="text-gray-400 max-w-xl mx-auto">
              Every OrbitFuture order comes with hardware, support, and setup assistance. No hidden extras, no surprises.
            </p>
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
              <Button className="h-12 px-10 text-xs font-bold uppercase tracking-widest">
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
            <p className="text-gray-400 max-w-xl mx-auto">
              From remote homesteads to cargo vessels — representative customer experiences from OrbitFuture users worldwide.
            </p>
            <p className="text-gray-600 text-[11px] mt-3 max-w-lg mx-auto leading-relaxed">
              Reviews represent illustrative use cases. Names and identifying details are representative of typical customer profiles.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-1 mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-9 h-9 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-xs font-black text-primary shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{t.name}</p>
                    <p className="text-gray-600 text-[10px]">{t.location}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-1">{t.plan.replace("Starlink ", "")}</span>
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
                {[
                  "North America & Canada",
                  "Europe (all 44 countries)",
                  "Africa (40+ countries)",
                  "Asia-Pacific",
                  "Latin America",
                  "Middle East",
                ].map((region) => (
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

      {/* ── FAQ PREVIEW ── */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-4">
              Common Questions
            </h2>
            <p className="text-gray-400">Quick answers to what most customers want to know.</p>
          </div>
          <div className="space-y-3 mb-10">
            {HOME_FAQS.map((faq, i) => (
              <div key={i} className="border border-white/8 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/3 transition-colors"
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

      {/* ── ENTERPRISE / BUSINESS INQUIRY ── */}
      <section className="py-16 bg-black border-y border-white/5">
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
                  {[
                    "Custom data packages and pricing",
                    "Multi-site deployment support",
                    "Dedicated account manager",
                    "SLA-backed uptime guarantees",
                    "Priority enterprise onboarding",
                  ].map((item) => (
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
                  <a href="https://wa.me/16206123994?text=Hi%2C%20I%27d%20like%20to%20discuss%20an%20enterprise%20connectivity%20solution." target="_blank" rel="noopener noreferrer">
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
                  <Button size="lg" className="w-full sm:w-auto h-14 px-12 text-sm font-bold uppercase tracking-widest shadow-[0_0_40px_rgba(0,212,255,0.2)]">
                    <Zap className="w-5 h-5 mr-2" />
                    Check Availability & Order
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
