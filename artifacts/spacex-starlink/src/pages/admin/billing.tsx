import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminToken } from "@/lib/auth";
import { Receipt, CheckCircle2, AlertCircle, Clock, TrendingUp, DollarSign, FileText, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

type InvoiceStatus = "paid" | "unpaid" | "overdue";

interface Invoice {
  id: number;
  invoiceNumber: string;
  userEmail: string;
  subscriptionId: number | null;
  amountUsd: string;
  currency: string;
  lineItems: { description: string; amount: number }[];
  status: InvoiceStatus;
  dueDate: string;
  paidAt: string | null;
  paymentRef: string | null;
  planName: string;
  createdAt: string;
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  if (status === "paid") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">
      <CheckCircle2 className="w-2.5 h-2.5" /> Paid
    </span>
  );
  if (status === "overdue") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/20 rounded-full px-2 py-0.5">
      <AlertCircle className="w-2.5 h-2.5" /> Overdue
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5">
      <Clock className="w-2.5 h-2.5" /> Unpaid
    </span>
  );
}

function InvoiceRow({ invoice, onMarkPaid, onDelete }: {
  invoice: Invoice;
  onMarkPaid: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="border border-white/8 rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <button className="flex-1 flex items-center gap-3 text-left" onClick={() => setExpanded(!expanded)}>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white font-mono">{invoice.invoiceNumber}</p>
            <p className="text-xs text-muted-foreground truncate">{invoice.userEmail}</p>
          </div>
          <div className="ml-auto flex items-center gap-3 shrink-0">
            <p className="text-xs text-muted-foreground hidden sm:block">{format(new Date(invoice.createdAt), "MMM d, yyyy")}</p>
            <StatusBadge status={invoice.status} />
            <p className="text-sm font-bold text-white">${parseFloat(invoice.amountUsd).toFixed(2)}</p>
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 bg-white/2">
          <div className="space-y-1.5 mb-3">
            <p className="text-xs text-muted-foreground">Plan: <span className="text-white">{invoice.planName}</span></p>
            {invoice.paymentRef && <p className="text-xs text-muted-foreground font-mono">Ref: {invoice.paymentRef}</p>}
            {(invoice.lineItems ?? []).map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-gray-400">{item.description}</span>
                <span className="text-white">${item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            {invoice.status !== "paid" && (
              <Button
                size="sm"
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  await onMarkPaid(invoice.id);
                  setLoading(false);
                }}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Paid
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30"
              disabled={loading}
              onClick={async () => {
                if (!confirm("Delete this invoice?")) return;
                setLoading(true);
                await onDelete(invoice.id);
                setLoading(false);
              }}
            >
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBilling() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [total, setTotal] = useState(0);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const params = new URLSearchParams({ limit: "100" });
      if (filter !== "all") params.set("status", filter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const res = await fetch(`${base}/api/admin/billing/invoices?${params}`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      const data = await res.json();
      setInvoices(data.invoices ?? []);
      setTotalRevenue(data.totalRevenue ?? 0);
      setTotalOutstanding(data.totalOutstanding ?? 0);
      setTotal(data.total ?? 0);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, [filter, dateFrom, dateTo]);

  const handleMarkPaid = async (id: number) => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    await fetch(`${base}/api/admin/billing/invoices/${id}/mark-paid`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: "paid" as InvoiceStatus, paidAt: new Date().toISOString() } : i));
  };

  const handleDelete = async (id: number) => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    await fetch(`${base}/api/admin/billing/invoices/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    });
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-white flex items-center gap-3">
          <Receipt className="w-7 h-7 text-primary" />
          Billing
        </h1>
        <p className="text-muted-foreground mt-2">Manage all customer invoices and payments.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Revenue</p>
            </div>
            <p className="text-2xl font-black text-emerald-400">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Outstanding</p>
            </div>
            <p className="text-2xl font-black text-amber-400">${totalOutstanding.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Invoices</p>
            </div>
            <p className="text-2xl font-black text-white">{total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {["all", "paid", "unpaid", "overdue"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${filter === f ? "bg-primary text-black border-primary" : "text-muted-foreground border-white/10 hover:border-white/20"}`}
          >
            {f}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="text-xs bg-card border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-primary/40 [color-scheme:dark]"
          />
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="text-xs bg-card border border-white/10 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-primary/40 [color-scheme:dark]"
          />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-[10px] text-muted-foreground hover:text-white border border-white/10 rounded-lg px-2 py-1.5">
              Clear
            </button>
          )}
          <button onClick={fetchInvoices} className="text-xs text-muted-foreground hover:text-white border border-white/10 rounded-lg px-3 py-1.5">
            Refresh
          </button>
        </div>
      </div>

      {/* Invoice list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-white/5 rounded-lg animate-pulse" />)}
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
          <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No invoices found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map(inv => (
            <InvoiceRow key={inv.id} invoice={inv} onMarkPaid={handleMarkPaid} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
