import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminToken } from "@/lib/auth";
import { CheckCircle2, AlertCircle, XCircle, Database, Key, Activity, RefreshCw } from "lucide-react";

interface HealthData {
  overall: "healthy" | "degraded" | "critical";
  db: { status: string; message?: string };
  tables: Record<string, boolean>;
  missingTables: string[];
  env: {
    configured: string[];
    missing: { key: string; feature: string }[];
    allConfigured: boolean;
  };
  payments: {
    activeSubs?: number;
    pendingSubs?: number;
    recentOrders?: { id: number; email: string; planId: number; status: string; createdAt: string; amountPaid: string | null }[];
    error?: string;
  };
}

const STATUS_COLORS = {
  healthy: "text-emerald-400 border-emerald-700/40 bg-emerald-950/30",
  degraded: "text-amber-400 border-amber-700/40 bg-amber-950/30",
  critical: "text-red-400 border-red-700/40 bg-red-950/30",
};

const STATUS_ICONS = {
  healthy: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  degraded: <AlertCircle className="w-5 h-5 text-amber-400" />,
  critical: <XCircle className="w-5 h-5 text-red-400" />,
};

export default function SystemHealth() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError("");
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/admin/system-health`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastChecked(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load health data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, []);

  const overall = data?.overall ?? "critical";

  return (
    <AdminLayout>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-widest text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-primary" />
            System Health
          </h1>
          <p className="text-muted-foreground mt-2">
            Live status of database, environment config, and payment activity.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground border border-white/10 rounded-lg px-3 py-2 hover:border-primary/30 hover:text-primary transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 border border-red-700/40 bg-red-950/30 rounded-lg p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Overall status */}
      {data && (
        <div className={`mb-6 border rounded-xl p-5 flex items-center gap-4 ${STATUS_COLORS[overall]}`}>
          {STATUS_ICONS[overall]}
          <div>
            <p className="font-black text-lg uppercase tracking-widest">
              System {overall.charAt(0).toUpperCase() + overall.slice(1)}
            </p>
            {overall === "healthy" && <p className="text-sm opacity-70">All systems operational. Ready for live traffic.</p>}
            {overall === "degraded" && <p className="text-sm opacity-70">Some features are unavailable. Check missing config below.</p>}
            {overall === "critical" && <p className="text-sm opacity-70">Critical issues detected. App may not function correctly.</p>}
          </div>
          {lastChecked && (
            <p className="ml-auto text-xs opacity-50">Last checked: {lastChecked.toLocaleTimeString()}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4" /> Database
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {loading ? (
              <div className="h-8 bg-white/5 rounded animate-pulse" />
            ) : data ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Connection</span>
                  <span className={`text-sm font-bold ${data.db.status === "connected" ? "text-emerald-400" : "text-red-400"}`}>
                    {data.db.status === "connected" ? "✓ Connected" : "✗ Error"}
                  </span>
                </div>
                {data.db.message && (
                  <p className="text-xs text-red-400 bg-red-950/30 rounded p-2">{data.db.message}</p>
                )}
                <div className="pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Tables</p>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(data.tables).map(([table, ok]) => (
                      <div key={table} className="flex items-center gap-1.5">
                        {ok
                          ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          : <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                        }
                        <span className={`text-xs font-mono ${ok ? "text-gray-400" : "text-red-400 font-bold"}`}>{table}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card className="bg-card border-border">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Key className="w-4 h-4" /> Environment Variables
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {loading ? (
              <div className="h-8 bg-white/5 rounded animate-pulse" />
            ) : data ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">
                    {data.env.configured.length} / {data.env.configured.length + data.env.missing.length} configured
                  </span>
                  {data.env.allConfigured
                    ? <span className="text-xs text-emerald-400 font-bold">All set ✓</span>
                    : <span className="text-xs text-amber-400 font-bold">{data.env.missing.length} missing</span>
                  }
                </div>
                {data.env.missing.length > 0 && (
                  <div className="space-y-1.5">
                    {data.env.missing.map((m) => (
                      <div key={m.key} className="flex items-center justify-between bg-amber-950/20 border border-amber-700/20 rounded px-2.5 py-2">
                        <span className="text-xs font-mono font-bold text-amber-300">{m.key}</span>
                        <span className="text-[10px] text-amber-600 text-right max-w-[140px]">{m.feature}</span>
                      </div>
                    ))}
                    <a
                      href="/admin/env-config"
                      className="block mt-2 text-xs text-primary font-bold hover:underline"
                    >
                      → Configure missing keys
                    </a>
                  </div>
                )}
                {data.env.configured.length > 0 && (
                  <div className="pt-2 space-y-1">
                    {data.env.configured.map((k) => (
                      <div key={k} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-xs font-mono text-gray-400">{k}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Payment Activity */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" /> Payment Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="h-16 bg-white/5 rounded animate-pulse" />
            ) : data?.payments.error ? (
              <p className="text-sm text-red-400">{data.payments.error}</p>
            ) : data?.payments ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-emerald-950/20 border border-emerald-700/20 rounded-lg p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Active Subscriptions</p>
                    <p className="text-3xl font-black text-emerald-400">{data.payments.activeSubs ?? 0}</p>
                  </div>
                  <div className="bg-amber-950/20 border border-amber-700/20 rounded-lg p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Pending Orders</p>
                    <p className="text-3xl font-black text-amber-400">{data.payments.pendingSubs ?? 0}</p>
                  </div>
                </div>
                {(data.payments.recentOrders ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Recent Orders</p>
                    <div className="space-y-2">
                      {(data.payments.recentOrders ?? []).map((order) => (
                        <div key={order.id} className="flex items-center justify-between bg-white/2 border border-white/5 rounded-lg px-3 py-2.5">
                          <div>
                            <p className="text-xs font-bold text-white">{order.email}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Plan #{order.planId} · {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            {order.amountPaid && <p className="text-xs font-bold text-white">${order.amountPaid}</p>}
                            <span className={`text-[9px] font-black uppercase tracking-wider rounded-full px-2 py-0.5 ${
                              order.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                            }`}>{order.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
