import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Globe, Satellite, Shield, Zap, Users, Award, HeadphonesIcon, MapPin, Mail, Clock, CheckCircle2 } from "lucide-react";

export default function About() {
  return (
    <MainLayout>
      <section className="relative py-24 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,212,255,0.06)_0%,transparent_60%)]" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              <Satellite className="w-3.5 h-3.5" />
              About OrbitFuture
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-6 leading-none">
              Your Starlink<br /><span className="text-primary">Solutions Partner</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              OrbitFuture is an independent satellite internet solutions company. We help customers worldwide order, activate, deploy, and manage Starlink connectivity — with dedicated support at every step.
            </p>
          </div>

          {/* Positioning disclaimer */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-16 text-center">
            <p className="text-gray-300 text-sm leading-relaxed">
              OrbitFuture is an <strong className="text-white">independent deployment and support company</strong>. We are not affiliated with, endorsed by, or operated by SpaceX or Starlink. We provide ordering assistance, setup support, and ongoing customer service for customers accessing Starlink satellite internet services in 100+ countries worldwide.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              { icon: Globe, stat: "100+", label: "Countries Served" },
              { icon: Clock, stat: "24/7", label: "Customer Support" },
              { icon: Zap, stat: "20min", label: "Avg Setup Time" },
            ].map(({ icon: Icon, stat, label }) => (
              <div key={label} className="bg-card border border-border rounded-2xl p-8 text-center hover:border-primary/30 transition-colors">
                <Icon className="w-8 h-8 text-primary mx-auto mb-4" />
                <div className="text-4xl font-black text-white mb-2">{stat}</div>
                <div className="text-gray-400 text-sm uppercase tracking-widest font-bold">{label}</div>
              </div>
            ))}
          </div>

          {/* Mission + Why Choose Us */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-6">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                We believe high-speed internet is a basic utility — not a luxury. We exist to make Starlink satellite connectivity accessible and easy for everyone, regardless of their technical background or location.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Whether you're in a rural area, on a vessel crossing oceans, or running a remote business, we handle the complexity of getting you connected — from order to activation — with expert support throughout.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-6">What We Provide</h2>
              <div className="space-y-4">
                {[
                  { icon: Satellite, text: "Starlink hardware ordering and global delivery coordination" },
                  { icon: Zap, text: "Remote service activation and account setup assistance" },
                  { icon: Shield, text: "12-month hardware warranty and secure PCI-DSS payments" },
                  { icon: HeadphonesIcon, text: "24/7 WhatsApp and email support — before, during, and after setup" },
                  { icon: Award, text: "No long-term contracts — month-to-month, cancel anytime" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Business Identity / Contact Section */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-10 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-8">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm mb-0.5">Company</p>
                    <p className="text-gray-400 text-sm">OrbitFuture Ltd</p>
                    <p className="text-gray-500 text-xs mt-0.5">Independent Satellite Internet Solutions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm mb-0.5">Email</p>
                    <a href="mailto:support@orbitfuture.store" className="text-primary text-sm hover:underline">support@orbitfuture.store</a>
                    <br />
                    <a href="mailto:sales@orbitfuture.store" className="text-primary text-sm hover:underline">sales@orbitfuture.store</a>
                    <br />
                    <a href="mailto:billing@orbitfuture.store" className="text-primary text-sm hover:underline">billing@orbitfuture.store</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm mb-0.5">Support Hours</p>
                    <p className="text-gray-400 text-sm">24 hours a day, 7 days a week</p>
                    <p className="text-gray-500 text-xs mt-0.5">WhatsApp and email response typically within 30 minutes</p>
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm mb-0.5">Payments</p>
                    <p className="text-gray-400 text-sm">Secure via Paystack (PCI-DSS compliant)</p>
                    <p className="text-gray-500 text-xs mt-0.5">Visa, Mastercard, Verve, Bank Transfer, Mobile Money</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm mb-0.5">Refund Policy</p>
                    <p className="text-gray-400 text-sm">Hardware: 14-day return window for unopened equipment</p>
                    <p className="text-gray-400 text-sm mt-0.5">Service: Cancel anytime, no cancellation fees</p>
                    <Link href="/faq" className="text-primary text-xs hover:underline mt-1 inline-block">View full refund policy →</Link>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm mb-0.5">Coverage</p>
                    <p className="text-gray-400 text-sm">Starlink service available in 100+ countries worldwide</p>
                    <Link href="/coverage" className="text-primary text-xs hover:underline mt-1 inline-block">Check your country →</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Compliance */}
          <div className="bg-white/2 border border-white/8 rounded-2xl p-6 mb-12">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-3">Legal & Compliance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Terms of Service", href: "/faq#terms" },
                { label: "Privacy Policy", href: "/faq#privacy" },
                { label: "Refund Policy", href: "/faq#refund" },
              ].map((l) => (
                <Link key={l.label} href={l.href}>
                  <div className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    {l.label}
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-gray-600 text-[11px] mt-4 leading-relaxed">
              OrbitFuture is an independent company and is not affiliated with, endorsed by, or operated by Space Exploration Technologies Corp. (SpaceX) or the Starlink brand. "Starlink" is a registered trademark of Space Exploration Technologies Corp. References to Starlink describe the satellite internet service that OrbitFuture helps customers access.
            </p>
          </div>

          <div className="text-center bg-card border border-border rounded-2xl p-12">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">Ready to Get Connected?</h2>
            <p className="text-gray-400 mb-8">Check availability in your area and get set up with full support from our team.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/plans">
                <Button size="lg" className="h-12 px-8 text-sm font-bold uppercase tracking-widest">
                  Check Availability & Order
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-bold uppercase tracking-widest border-white/20">
                  Contact Our Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
