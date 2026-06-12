import { MainLayout } from "@/components/layout/MainLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Globe, CheckCircle2, Wifi } from "lucide-react";

const REGIONS = [
  {
    name: "North America",
    countries: ["United States", "Canada", "Mexico", "Caribbean Islands"],
    status: "Full Coverage",
    color: "emerald",
  },
  {
    name: "Europe",
    countries: ["United Kingdom", "Germany", "France", "Spain", "Italy", "Netherlands", "Poland", "Sweden", "Norway", "40+ more"],
    status: "Full Coverage",
    color: "emerald",
  },
  {
    name: "Asia-Pacific",
    countries: ["Australia", "New Zealand", "Japan", "Philippines", "India", "Singapore", "Indonesia", "Malaysia", "30+ more"],
    status: "Full Coverage",
    color: "emerald",
  },
  {
    name: "Latin America",
    countries: ["Brazil", "Chile", "Colombia", "Argentina", "Peru", "Ecuador", "Bolivia", "15+ more"],
    status: "Full Coverage",
    color: "emerald",
  },
  {
    name: "Africa",
    countries: ["Nigeria", "Kenya", "Ghana", "South Africa", "Ethiopia", "Tanzania", "Rwanda", "20+ more"],
    status: "Available",
    color: "primary",
  },
  {
    name: "Middle East",
    countries: ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Jordan", "Israel", "Turkey", "10+ more"],
    status: "Available",
    color: "primary",
  },
];

const COLOR_MAP: Record<string, string> = {
  emerald: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  primary: "text-primary bg-primary/10 border-primary/20",
};

export default function Coverage() {
  return (
    <MainLayout>
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 text-xs font-bold uppercase tracking-widest text-primary">
              <Globe className="w-3.5 h-3.5" />
              Global Coverage
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-6 leading-none">
              Available in <span className="text-primary">100+</span><br />Countries
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Our LEO satellite constellation provides coverage across every continent. If you can see the sky, you can get connected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {REGIONS.map((region) => (
              <div key={region.name} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">{region.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${COLOR_MAP[region.color]}`}>
                    {region.status}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {region.countries.map((c) => (
                    <div key={c} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-gray-400 text-xs">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { icon: Globe, stat: "100+", label: "Countries" },
                { icon: Wifi, stat: "1 Gbps", label: "Max Speed" },
                { icon: CheckCircle2, stat: "99.9%", label: "Uptime" },
              ].map(({ icon: Icon, stat, label }) => (
                <div key={label}>
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-black text-white mb-1">{stat}</div>
                  <div className="text-gray-400 text-xs uppercase tracking-widest font-bold">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 mb-6 text-sm">Not sure if we cover your area? Contact us and we'll check instantly.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/plans">
                <Button size="lg" className="h-12 px-8 text-sm font-bold uppercase tracking-widest">
                  View Plans
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-bold uppercase tracking-widest border-white/20">
                  Check My Area
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
