import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiBase } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Satellite, CreditCard, Activity, Package, Truck, Wrench, CheckCircle2,
  Zap, Calendar, ArrowRight, Clock, AlertCircle, HeadphonesIcon, User,
  Lock, Save, Loader2, Shield, Receipt, LayoutDashboard, MapPin, Signal,
  Copy, CheckCheck, TrendingUp, RefreshCw
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

// ── Types ─────────────────────────────────────────────────────────────────────
type TrackingEvent = { status: string; timestamp: string; note?: string };

type Subscription = {
  id: number;
  email: string;
  planId: number;
  planName?: string;
  planCategory?: string;
  planSpeed?: string;
  priceMonthly?: number;
  status: string;
  address?: string;
  amountPaid?: string;
  renewalDate?: string;
  nextBillingDate?: string;
  autoRenew?: boolean;
  trackingStatus?: string;
  trackingHistory?: TrackingEvent[];
  createdAt: string;
  cancelledAt?: string;
};

type Invoice = {
  id: number;
  invoiceNumber: string;
  amountUsd: string;
  currency: string;
  status: string;
  planName: string;
  paidAt?: string;
  createdAt: string;
};

type BillingSummary = {
  invoiceCount: number;
  totalPaid: number;
  totalOutstanding: number;
  unpaidCount: number;
  overdueCount: number;
  nextBills: { subscriptionId: number; planName: string; amount: number; renewalDate: string; autoRenew: boolean }[];
};

// ── Tracking stages ────────────────────────────────────────────────────────────
const TRACKING_STAGES = ["pending", "processing", "shipped", "delivered", "activated", "completed"] as const;
type TrackingStage = (typeof TRACKING_STAGES)[number];

const STAGE_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  pending:    { label: "Order Received",  icon: Clock,          color: "text-amber-400" },
  processing: { label: "Processing",      icon: Wrench,         color: "text-blue-400" },
  shipped:    { label: "Shipped",          icon: Truck,          color: "text-violet-400" },
  delivered:  { label: "Delivered",       icon: Package,        color: "text-orange-400" },
  activated:  { label: "Activated",       icon: Zap,            color: "text-emerald-400" },
  completed:  { label: "Online",          icon: CheckCircle2,   color: "text-primary" },
};

function getStageIndex(status: string): number {
  return TRACKING_STAGES.indexOf(status as TrackingStage);
}

// ── Simulated data gauge ───────────────────────────────────────────────────────
function getSimulatedUsage(createdAt: string, priceMonthly: number): { used: number; total: number } {
  const daysOld = Math.max(0, differenceInDays(new Date(), new Date(createdAt)));
  const dayOfMonth = daysOld % 30;
  const baseTotal = priceMonthly >= 500 ? 1000 : priceMonthly >= 200 ? 500 : priceMonthly >= 100 ? 200 : 100;
  const usedRatio = Math.min(0.95, (dayOfMonth / 30) * 0.85 + Math.random() * 0.08);
  return { used: Math.round(baseTotal * usedRatio), total: baseTotal };
}

function DataGauge({ used, total }: { used: number; total: number }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  const color = pct > 85 ? "bg-red-500" : pct > 65 ? "bg-amber-500" : "bg-primary";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">Data Used</span>
        <span className="text-white font-bold">{used} GB / {total} GB</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">{100 - pct}% remaining · Resets in {30 - (differenceInDays(new Date(), new Date()) % 30)} days</p>
    </div>
  );
}

// ── Tracking timeline card ─────────────────────────────────────────────────────
function TrackingTimeline({ subscription, liveStatus }: { subscription: Subscription; liveStatus?: string }) {
  const currentStatus = liveStatus ?? subscription.trackingStatus ?? "pending";
  const currentIdx = getStageIndex(currentStatus);
  const history: TrackingEvent[] = subscription.trackingHistory ?? [];

  return (
    <div className="space-y-1 mt-2">
      {TRACKING_STAGES.map((stage, i) => {
        const meta = STAGE_META[stage];
        const Icon = meta.icon;
        const done = i < currentIdx;
        const active = i === currentIdx;
        const future = i > currentIdx;
        const event = history.find(h => h.status === stage);

        return (
          <div key={stage} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                active ? "border-primary bg-primary/20 shadow-[0_0_10px_rgba(0,212,255,0.3)]" :
                done ? "border-emerald-500 bg-emerald-500/15" :
                "border-white/15 bg-white/3"
              }`}>
                <Icon className={`w-3.5 h-3.5 ${active ? "text-primary" : done ? "text-emerald-400" : "text-gray-600"}`} />
              </div>
              {i < TRACKING_STAGES.length - 1 && (
                <div className={`w-px h-5 mt-0.5 ${done ? "bg-emerald-500/40" : "bg-white/8"}`} />
              )}
            </div>
            <div className="pb-1 min-w-0">
              <p className={`text-xs font-bold ${active ? "text-white" : done ? "text-emerald-400" : "text-gray-600"}`}>
                {meta.label}
                {active && (
                  <span className="ml-2 inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse align-middle" />
                )}
              </p>
              {event && (
                <p className="text-[10px] text-muted-foreground truncate">{event.note}</p>
              )}
              {event?.timestamp && (
                <p className="text-[10px] text-gray-600">{format(new Date(event.timestamp), "MMM d 'at' h:mm a")}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Subscription service card ──────────────────────────────────────────────────
function ServiceCard({ sub, token }: { sub: Subscription; token: string }) {
  const [liveStatus, setLiveStatus] = useState<string | undefined>(undefined);
  const [connected, setConnected] = useState(false);
  const [showTracking, setShowTracking] = useState(true);
  const [autoRenew, setAutoRenew] = useState<boolean>(sub.autoRenew ?? true);
  const [togglingRenew, setTogglingRenew] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const apiBase = getApiBase();

  const handleToggleAutoRenew = async () => {
    setTogglingRenew(true);
    const next = !autoRenew;
    try {
      const r = await fetch(`${apiBase}/api/subscriptions/${sub.id}/auto-renew`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ autoRenew: next }),
      });
      if (r.ok) setAutoRenew(next);
    } catch { /* silent */ }
    setTogglingRenew(false);
  };

  useEffect(() => {
    const base = getApiBase();
    const url = `${base}/api/subscriptions/${sub.id}/tracking-stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "tracking_update" && msg.trackingStatus) {
          setLiveStatus(msg.trackingStatus);
        }
      } catch { }
    };
    es.onerror = () => { setConnected(false); es.close(); };

    return () => { es.close(); };
  }, [sub.id, token]);

  const currentStatus = liveStatus ?? sub.trackingStatus ?? "pending";
  const stageIdx = getStageIndex(currentStatus);
  const stageMeta = STAGE_META[currentStatus] ?? STAGE_META["pending"];
  const Icon = stageMeta.icon;
  const isActive = sub.status === "active";
  const isCompleted = currentStatus === "completed" || currentStatus === "activated";
  const usage = getSimulatedUsage(sub.createdAt, sub.priceMonthly ?? 120);

  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Card top bar */}
      <div className={`h-1 w-full ${isActive ? "bg-gradient-to-r from-primary/50 to-emerald-500/50" : "bg-red-500/30"}`} />
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0">
            <p className="text-sm font-black text-white uppercase tracking-widest truncate">{sub.planName || "Starlink Plan"}</p>
            <p className="text-xs text-muted-foreground">{sub.planSpeed || "High-speed satellite"}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              isActive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"
            }`}>
              {isActive ? "● Active" : sub.status}
            </span>
            {connected && (
              <span className="text-[9px] text-primary/60 uppercase tracking-widest">Live</span>
            )}
          </div>
        </div>

        {/* Status + price row */}
        <div className="flex items-center gap-3 mb-4 bg-white/3 rounded-xl px-3 py-2.5 border border-white/5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? "bg-primary/10 border border-primary/20" : "bg-amber-500/10 border border-amber-500/20"}`}>
            <Icon className={`w-4 h-4 ${isCompleted ? stageMeta.color : "text-amber-400"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white">{stageMeta.label}</p>
            {sub.renewalDate && (
              <p className="text-[10px] text-muted-foreground">Renews {format(new Date(sub.renewalDate), "MMM d, yyyy")}</p>
            )}
          </div>
          <p className="text-sm font-black text-primary shrink-0">${sub.priceMonthly ?? "—"}/mo</p>
        </div>

        {/* Data usage */}
        {isCompleted && (
          <div className="mb-4">
            <DataGauge used={usage.used} total={usage.total} />
          </div>
        )}

        {/* Address */}
        {sub.address && (
          <div className="flex items-start gap-2 mb-4">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground truncate">{sub.address}</p>
          </div>
        )}

        {/* Auto-renew toggle */}
        {sub.status === "active" && (
          <div className="flex items-center justify-between border-t border-white/5 pt-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3" /> Auto-Renew
            </span>
            <button
              onClick={handleToggleAutoRenew}
              disabled={togglingRenew}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                autoRenew ? "bg-primary" : "bg-white/15"
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${autoRenew ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
        )}

        {/* Tracking toggle */}
        <button
          className="w-full flex items-center justify-between text-xs font-bold text-muted-foreground hover:text-white border-t border-white/5 pt-3 transition-colors"
          onClick={() => setShowTracking(!showTracking)}
        >
          <span className="flex items-center gap-1.5 uppercase tracking-widest">
            <Activity className="w-3 h-3" /> Order Tracking
          </span>
          <span className="text-[10px]">{showTracking ? "hide" : "show"}</span>
        </button>

        {showTracking && <TrackingTimeline subscription={sub} liveStatus={liveStatus} />}
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, token, updateProfile, refreshUser, logout } = useAuth();
  const [, navigate] = useLocation();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", address: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const apiBase = getApiBase();

  useEffect(() => {
    if (!token) { navigate("/login?redirect=/dashboard"); return; }
    if (!user) return;

    setProfileForm({ name: user.name, phone: user.phone ?? "", address: user.address ?? "" });

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch subscriptions, billing summary, and wallet balance in parallel
    Promise.all([
      fetch(`${apiBase}/api/subscriptions?email=${encodeURIComponent(user.email)}`, { headers })
        .then(r => r.ok ? r.json() : { subscriptions: [] }),
      fetch(`${apiBase}/api/billing/summary`, { headers })
        .then(r => r.ok ? r.json() : null),
      fetch(`${apiBase}/api/wallet/${encodeURIComponent(user.email)}`, { headers })
        .then(r => r.ok ? r.json() : null),
    ]).then(([subData, billData, walletData]) => {
      if (walletData?.balance !== undefined) setWalletBalance(walletData.balance);
      const subs: Subscription[] = (subData.subscriptions ?? []).map((s: any) => ({
        id: s.id,
        email: s.email,
        planId: s.planId,
        planName: s.planName ?? s.plan?.name ?? "Starlink Plan",
        planCategory: s.planCategory ?? s.plan?.category ?? "",
        planSpeed: s.planSpeed ?? s.plan?.speed ?? "",
        priceMonthly: s.priceMonthly ?? parseFloat(String(s.plan?.priceMonthly ?? 120)),
        status: s.status,
        address: s.address,
        amountPaid: s.amountPaid,
        renewalDate: s.renewalDate,
        nextBillingDate: s.nextBillingDate,
        autoRenew: s.autoRenew ?? true,
        trackingStatus: s.trackingStatus ?? "pending",
        trackingHistory: s.trackingHistory ?? [],
        createdAt: s.createdAt,
        cancelledAt: s.cancelledAt,
      }));
      setSubscriptions(subs);
      if (billData) setBillingSummary(billData);
    }).catch(console.error).finally(() => setLoading(false));
  }, [token, user?.email]);

  const copyAccountNumber = () => {
    if (!user?.accountNumber) return;
    navigator.clipboard.writeText(user.accountNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass && passwordForm.newPass !== passwordForm.confirm) {
      setProfileError("New passwords don't match"); return;
    }
    setProfileError(""); setSavingProfile(true);
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone || undefined,
        address: profileForm.address || undefined,
        ...(passwordForm.current && passwordForm.newPass ? { password: passwordForm.current, newPassword: passwordForm.newPass } : {}),
      });
      await refreshUser();
      setEditMode(false);
      setProfileSuccess("Profile updated successfully");
      setPasswordForm({ current: "", newPass: "", confirm: "" });
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err: any) {
      setProfileError(err.message || "Update failed");
    }
    setSavingProfile(false);
  };

  if (!user) return null;

  const activeCount = subscriptions.filter(s => s.status === "active").length;
  const hasOverdue = billingSummary && (billingSummary.overdueCount ?? 0) > 0;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* ── Account header ────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
                <Satellite className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-black text-white uppercase tracking-wider leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            {user.accountNumber && (
              <button
                onClick={copyAccountNumber}
                className="flex items-center gap-2 mt-1 group"
              >
                <span className="text-xs font-mono font-bold text-primary/80 group-hover:text-primary transition-colors">{user.accountNumber}</span>
                {copied
                  ? <CheckCheck className="w-3 h-3 text-emerald-400" />
                  : <Copy className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                }
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{copied ? "Copied!" : "Account No."}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/billing">
              <Button variant="outline" size="sm" className="h-9 text-xs uppercase tracking-widest font-bold border-white/10 hover:border-primary/40">
                <Receipt className="w-3.5 h-3.5 mr-1.5" /> Billing
              </Button>
            </Link>
            <Link href="/support">
              <Button variant="outline" size="sm" className="h-9 text-xs uppercase tracking-widest font-bold border-white/10">
                <HeadphonesIcon className="w-3.5 h-3.5 mr-1.5" /> Support
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs uppercase tracking-widest font-bold text-red-400 hover:text-red-300 hover:bg-red-950/20"
              onClick={() => { logout(); navigate("/"); }}
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* ── Overdue invoice warning ──────────────────────────────────────── */}
        {hasOverdue && (
          <div className="flex items-center gap-3 bg-amber-950/30 border border-amber-700/40 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">
              You have {billingSummary!.unpaidCount} unpaid invoice{billingSummary!.unpaidCount > 1 ? "s" : ""}.
              <Link href="/billing" className="ml-2 underline font-bold">View billing →</Link>
            </p>
          </div>
        )}

        {/* ── Summary stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Signal className="w-3.5 h-3.5 text-emerald-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Plans</p>
              </div>
              <p className="text-2xl font-black text-white">{activeCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Paid</p>
              </div>
              <p className="text-2xl font-black text-primary">${billingSummary?.totalPaid?.toFixed(0) ?? "0"}</p>
            </CardContent>
          </Card>
          {/* Next bill — shows due date AND amount */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Next Bill</p>
              </div>
              {billingSummary?.nextBills?.[0] ? (
                <>
                  <p className="text-sm font-black text-white leading-tight">
                    {format(new Date(billingSummary.nextBills[0].renewalDate), "MMM d, yyyy")}
                  </p>
                  <p className="text-[11px] text-violet-400 font-bold mt-0.5">
                    ${billingSummary.nextBills[0].amount.toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-sm font-black text-gray-600">—</p>
              )}
            </CardContent>
          </Card>
          {/* Wallet balance */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Wallet</p>
              </div>
              {walletBalance !== null ? (
                <>
                  <p className="text-2xl font-black text-amber-400">{walletBalance}</p>
                  <p className="text-[10px] text-muted-foreground">tokens</p>
                </>
              ) : (
                <p className="text-sm font-black text-gray-600">—</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Service cards ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Satellite className="w-3.5 h-3.5 text-primary" /> My Services
            </h2>
            <Link href="/plans">
              <button className="text-xs text-primary hover:underline flex items-center gap-1 font-bold uppercase tracking-widest">
                Add Plan <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2].map(i => <div key={i} className="h-48 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
              <Satellite className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No active plans yet.</p>
              <Link href="/plans">
                <Button size="sm" className="text-xs uppercase tracking-widest font-bold">
                  Browse Plans <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {subscriptions.map(sub => (
                <ServiceCard key={sub.id} sub={sub} token={token!} />
              ))}
            </div>
          )}
        </div>

        {/* ── Quick actions ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Top Up", href: "/wallet", icon: CreditCard, color: "text-amber-400" },
            { label: "Browse Plans", href: "/plans", icon: Satellite, color: "text-primary" },
            { label: "Track Order", href: "/track", icon: Package, color: "text-violet-400" },
            { label: "Get Support", href: "/support", icon: HeadphonesIcon, color: "text-emerald-400" },
          ].map(a => {
            const Icon = a.icon;
            return (
              <Link key={a.href} href={a.href}>
                <div className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary/30 cursor-pointer transition-all group">
                  <Icon className={`w-5 h-5 ${a.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors text-center">{a.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Profile section ───────────────────────────────────────────────── */}
        <div className="border-t border-white/5 pt-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-primary" /> Account Settings
            </h2>
            {!editMode && (
              <Button variant="outline" size="sm" className="text-xs uppercase tracking-widest font-bold h-8 border-white/10 hover:border-primary/30" onClick={() => { setEditMode(true); setProfileError(""); setProfileSuccess(""); }}>
                Edit Profile
              </Button>
            )}
          </div>

          {profileSuccess && (
            <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-700/30 rounded-lg px-3 py-2.5 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-400">{profileSuccess}</p>
            </div>
          )}

          {!editMode ? (
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { label: "Full Name", value: user.name, icon: User },
                { label: "Email", value: user.email, icon: null },
                { label: "Account Number", value: user.accountNumber ?? "—", icon: null, mono: true },
                { label: "Phone", value: user.phone || "—", icon: null },
                { label: "Address", value: user.address || "—", icon: null },
                { label: "Member Since", value: format(new Date(user.createdAt), "MMMM d, yyyy"), icon: null },
              ].map(field => (
                <div key={field.label} className="flex items-center gap-3 bg-card border border-border rounded-lg p-3">
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{field.label}</p>
                    <p className={`text-sm text-white truncate ${field.mono ? "font-mono" : ""}`}>{field.value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Full Name</label>
                  <Input value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} className="h-11 bg-card" required />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Phone</label>
                  <Input value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} className="h-11 bg-card" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block mb-1.5">Installation Address</label>
                <Input value={profileForm.address} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} className="h-11 bg-card" placeholder="Street, City, Country" />
              </div>

              <div className="border-t border-white/5 pt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Change Password (optional)
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <Input type="password" placeholder="Current password" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} className="h-11 bg-card" />
                  <Input type="password" placeholder="New password" value={passwordForm.newPass} onChange={e => setPasswordForm(p => ({ ...p, newPass: e.target.value }))} className="h-11 bg-card" minLength={6} />
                  <Input type="password" placeholder="Confirm new password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} className="h-11 bg-card" />
                </div>
              </div>

              {profileError && <p className="text-destructive text-sm">{profileError}</p>}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={savingProfile} className="text-xs uppercase tracking-widest font-bold">
                  {savingProfile ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving…</> : <><Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes</>}
                </Button>
                <Button type="button" variant="ghost" className="text-xs uppercase tracking-widest font-bold text-muted-foreground" onClick={() => { setEditMode(false); setProfileError(""); }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
