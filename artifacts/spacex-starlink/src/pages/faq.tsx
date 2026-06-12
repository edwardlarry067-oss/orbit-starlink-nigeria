import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";

const FAQS = [
  {
    category: "About OrbitFuture",
    items: [
      {
        q: "What is OrbitFuture?",
        a: "OrbitFuture is an independent satellite internet solutions company. We help customers worldwide order, activate, deploy, and manage Starlink connectivity. We are not affiliated with, owned by, or operated by SpaceX or the Starlink brand. We provide ordering assistance, setup support, hardware delivery, and ongoing technical help for Starlink users.",
      },
      {
        q: "Is OrbitFuture the same as Starlink?",
        a: "No. OrbitFuture is an independent company that helps customers access and manage Starlink satellite internet services. Starlink is a trademark of Space Exploration Technologies Corp. (SpaceX). We are not affiliated with SpaceX or Starlink in any official capacity.",
      },
      {
        q: "Where is OrbitFuture based?",
        a: "OrbitFuture operates globally to serve customers in 100+ countries where Starlink service is available. Our support team is available 24/7 via WhatsApp and email at support@orbitfuture.store.",
      },
    ],
  },
  {
    category: "Getting Started",
    items: [
      {
        q: "How does Starlink satellite internet work?",
        a: "Starlink uses a constellation of low-Earth orbit (LEO) satellites orbiting at approximately 550km altitude. Your dish connects directly to these satellites, delivering high-speed internet with low latency. The dish self-aligns automatically once powered on and placed with a clear view of the sky.",
      },
      {
        q: "How long does installation take?",
        a: "Most customers are up and running in 15–30 minutes. The dish is plug-and-play — position it in an area with a clear view of the sky, plug it in, and connect to the Wi-Fi network it creates. Our team is available via WhatsApp to guide you through every step.",
      },
      {
        q: "Do I need a professional installer?",
        a: "No. The kit is designed for self-installation and includes the dish, mount, power supply, and router. Detailed instructions are provided. Our support team can walk you through setup via WhatsApp or email call at no extra charge.",
      },
    ],
  },
  {
    category: "Plans & Pricing",
    items: [
      {
        q: "Are there contracts or long-term commitments?",
        a: "No long-term contracts. All plans are month-to-month. You can cancel anytime with no cancellation fees — just contact our support team before your next billing cycle.",
      },
      {
        q: "What is the hardware fee?",
        a: "The Starlink hardware kit (dish + router) is a one-time purchase charged at the time of your first order. It is separate from your monthly service fee. The exact cost varies by plan tier — you'll see the full breakdown clearly before confirming your order.",
      },
      {
        q: "Can I pause my subscription?",
        a: "Yes. You can pause your service for up to 3 months per year from your account dashboard without losing your hardware warranty or account history.",
      },
      {
        q: "Is there a data cap?",
        a: "Residential and Business plans have no hard data caps during normal usage. Priority data is provided as outlined in each plan. During network congestion, speeds may be temporarily deprioritized after the priority data threshold is reached.",
      },
      {
        q: "How is aviation pricing handled?",
        a: "Aviation connectivity solutions require custom configuration based on aircraft type, route coverage, and data requirements. Please contact our sales team at sales@orbitfuture.store or via WhatsApp for a tailored enterprise quote.",
      },
    ],
  },
  {
    category: "Coverage & Performance",
    items: [
      {
        q: "Which countries are supported?",
        a: "Starlink service is available in 100+ countries across North America, Europe, Asia-Pacific, Latin America, Africa, and the Middle East. Check our Coverage Areas page for your specific location. Availability can change as Starlink expands — contact us if your country is not listed.",
      },
      {
        q: "What speeds can I expect?",
        a: "Residential plans typically deliver 50–300 Mbps download. Business and priority plans deliver higher speeds with priority network access. Latency is typically 20–40ms, suitable for video calls, gaming, and VoIP. Exact speeds vary by location and local network conditions.",
      },
      {
        q: "Does weather affect the service?",
        a: "Heavy snow, ice, or extreme storms can temporarily affect signal quality. The Starlink dish has a built-in snow melt function. Most weather conditions do not cause service interruptions, and the system reconnects automatically once conditions improve.",
      },
    ],
  },
  {
    category: "Payments & Billing",
    items: [
      {
        q: "What payment methods are accepted?",
        a: "We accept all major credit and debit cards (Visa, Mastercard, Verve) via Paystack. Bank transfer, USSD, and mobile money options are also available depending on your country. You can also use your Orbit Wallet token balance to pay for subscriptions.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. All payments are processed by Paystack, a PCI-DSS Level 1 compliant payment processor. Your card details are never stored on our servers. All connections are encrypted with SSL/TLS.",
      },
      {
        q: "What is the Orbit Wallet?",
        a: "The Orbit Wallet lets you pre-load tokens that can be used to activate or renew plans instantly without needing a card at checkout. Tokens can be purchased securely via Paystack and never expire.",
      },
      {
        q: "When will I be charged?",
        a: "Hardware is charged once at order time. Monthly service fees are billed on the same date each month from your subscription start date. You'll receive an email confirmation for every charge.",
      },
    ],
  },
  {
    id: "refund",
    category: "Refund & Cancellation Policy",
    items: [
      {
        q: "What is your refund policy for hardware?",
        a: "Unopened hardware may be returned within 14 days of delivery for a full refund. Hardware that has been opened and tested is not eligible for a refund unless it is confirmed defective under our 12-month warranty. To initiate a return, contact billing@orbitfuture.store with your order reference.",
      },
      {
        q: "What is your refund policy for monthly service fees?",
        a: "Monthly service fees are non-refundable once a billing period has started. However, you can cancel anytime before your next billing date to avoid future charges. There are no cancellation fees.",
      },
      {
        q: "What if my hardware arrives defective?",
        a: "All hardware is covered by a 12-month replacement warranty. If your equipment is defective on arrival or fails within the warranty period, contact support@orbitfuture.store and we will arrange a replacement at no cost to you.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "You can cancel anytime from your account dashboard or by contacting support@orbitfuture.store. Cancellation takes effect at the end of your current billing cycle. No cancellation fees apply.",
      },
    ],
  },
  {
    id: "privacy",
    category: "Privacy & Terms",
    items: [
      {
        q: "What data does OrbitFuture collect?",
        a: "We collect only the information necessary to process your order and provide support: your name, email address, shipping/installation address, and payment reference numbers. We do not store card numbers. We do not sell your data to third parties.",
      },
      {
        q: "How is my data used?",
        a: "Your information is used to: process and fulfill your order, activate your service, send you order confirmations and receipts, provide customer support, and improve our platform. We use Paystack for payment processing, which has its own PCI-DSS compliant privacy practices.",
      },
      {
        q: "Terms of Service summary",
        a: "By placing an order with OrbitFuture, you agree that: (1) OrbitFuture is an independent solutions company, not SpaceX or Starlink; (2) Monthly plans are billed on a recurring basis until cancelled; (3) Hardware fees are one-time and non-refundable once the item is opened and functional; (4) OrbitFuture is not responsible for Starlink network outages beyond our control; (5) Support is provided 24/7 via WhatsApp and email.",
      },
    ],
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <MainLayout>
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-gray-400">Everything you need to know about OrbitFuture and how we work.</p>
          </div>

          <div className="space-y-10">
            {FAQS.map((section) => (
              <div key={section.category} id={(section as any).id}>
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">{section.category}</h2>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const id = `${section.category}-${item.q}`;
                    const isOpen = open === id;
                    return (
                      <div key={id} className="border border-white/8 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpen(isOpen ? null : id)}
                          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/3 transition-colors"
                        >
                          <span className="text-white text-sm font-bold pr-4">{item.q}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-card border border-border rounded-2xl p-10">
            <MessageCircle className="w-10 h-10 text-[#25D366] mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Still have questions?</h3>
            <p className="text-gray-400 text-sm mb-6">Our support team typically replies within minutes.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <Button className="h-11 px-8 text-xs font-bold uppercase tracking-widest">Contact Support</Button>
              </Link>
              <a href="https://wa.me/16206123994" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="h-11 px-8 text-xs font-bold uppercase tracking-widest border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10">
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-xs leading-relaxed">
              OrbitFuture is an independent company. "Starlink" is a trademark of Space Exploration Technologies Corp. (SpaceX). OrbitFuture is not affiliated with or endorsed by SpaceX.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
