import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getApiBase } from "@workspace/api-client-react";
import { FileText, CheckCircle2, AlertCircle, Clock, Printer, ChevronDown, ChevronUp, TrendingUp, DollarSign, Receipt } from "lucide-react";
import { format } from "date-fns";

type InvoiceStatus = "paid" | "unpaid" | "overdue";

interface Invoice {
  id: number;
  invoiceNumber: string;
  userEmail: string;
  subscriptionId: number | null;
  amountUsd: string;
  currency: string;
  lineItems: { description: string; amount: number; quantity?: number }[];
  status: InvoiceStatus;
  dueDate: string;
  paidAt: string | null;
  paymentRef: string | null;
  planName: string;
  createdAt: string;
}

interface BillingSummary {
  invoiceCount: number;
  totalPaid: number;
  totalOutstanding: number;
  unpaidCount: number;
  nextBills: { subscriptionId: number; planName: string; amount: number; renewalDate: string; autoRenew: boolean }[];
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
  if (status === "paid") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-1">
      <CheckCircle2 className="w-3 h-3" /> Paid
    </span>
  );
  if (status === "overdue") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/20 rounded-full px-2.5 py-1">
      <AlertCircle className="w-3 h-3" /> Overdue
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-full px-2.5 py-1">
      <Clock className="w-3 h-3" /> Due
    </span>
  );
}

function InvoiceRow({ invoice, accountNumber }: { invoice: Invoice; accountNumber?: string }) {
  const [expanded, setExpanded] = useState(false);

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${invoice.invoiceNumber}</title>
    <style>
      body{font-family:Arial,sans-serif;max-width:600px;margin:40px auto;color:#111;padding:20px;}
      h1{font-size:24px;font-weight:900;letter-spacing:2px;}
      .header{display:flex;justify-content:space-between;border-bottom:2px solid #eee;padding-bottom:16px;margin-bottom:24px;}
      table{width:100%;border-collapse:collapse;}
      th{background:#f5f5f5;padding:10px;text-align:left;font-size:12px;text-transform:uppercase;}
      td{padding:10px;border-bottom:1px solid #eee;font-size:14px;}
      .total{font-weight:900;font-size:18px;}
      .badge{display:inline-block;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${invoice.status === "paid" ? "#d1fae5" : "#fef3c7"};color:${invoice.status === "paid" ? "#065f46" : "#92400e"};}
      .meta{color:#444;font-size:13px;margin:4px 0;}
    </style></head><body>
    <div class="header">
      <div><h1>ORBITFUTURE</h1><p style="margin:0;color:#666;font-size:13px;">orbitfuture.store</p></div>
      <div style="text-align:right"><p style="margin:0;font-size:13px;color:#666;">Invoice</p><p style="margin:4px 0 0;font-size:18px;font-weight:900;">${invoice.invoiceNumber}</p></div>
    </div>
    <p class="meta"><strong>To:</strong> ${invoice.userEmail}</p>
    ${accountNumber ? `<p class="meta"><strong>Account Number:</strong> <span style="font-family:monospace;font-weight:700;">${accountNumber}</span></p>` : ""}
    <p class="meta"><strong>Date:</strong> ${format(new Date(invoice.createdAt), "MMMM d, yyyy")}</p>
    <p class="meta"><strong>Status:</strong> <span class="badge">${invoice.status.toUpperCase()}</span></p>
    <table><thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead><tbody>
    ${(invoice.lineItems ?? []).map(l => `<tr><td>${l.description}</td><td style="text-align:right">$${l.amount.toFixed(2)}</td></tr>`).join("")}
    </tbody><tfoot><tr><td class="total">Total</td><td class="total" style="text-align:right">$${parseFloat(invoice.amountUsd).toFixed(2)} ${invoice.currency}</td></tr></tfoot></table>
    ${invoice.paymentRef ? `<p style="margin-top:24px;font-size:12px;color:#666;">Payment Ref: ${invoice.paymentRef}</p>` : ""}
    </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-4 px-4 py-4 hover:bg-white/3 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Receipt className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-white">{invoice.invoiceNumber}</p>
          <p className="text-xs text-muted-foreground">{invoice.planName || "Starlink Plan"} · {format(new Date(invoice.createdAt), "MMM d, yyyy")}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={invoice.status} />
          <p className="text-sm font-bold text-white">${parseFloat(invoice.amountUsd).toFixed(2)}</p>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-4 bg-white/2">
          <div className="space-y-2 mb-4">
            {(invoice.lineItems ?? []).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{item.description}</span>
                <span className="text-white font-medium">${item.amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm font-bold border-t border-white/8 pt-2">
              <span className="text-white">Total</span>
              <span className="text-primary">${parseFloat(invoice.amountUsd).toFixed(2)} {invoice.currency}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            {invoice.paidAt && <span>Paid {format(new Date(invoice.paidAt), "MMM d, yyyy 'at' h:mm a")}</span>}
            {invoice.paymentRef && <span className="font-mono">Ref: {invoice.paymentRef.slice(0, 16)}…</span>}
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white border border-white/10 rounded-lg px-3 py-2 hover:border-white/20 transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Print Invoice
          </button>
        </div>
      )}
    </div>
  );
}

export default function Billing() {
  const { user, token } = useAuth();
  const [, navigate] = useLocation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | InvoiceStatus>("all");

  useEffect(() => {
    if (!token) { navigate("/login?redirect=/billing"); return; }
    const base = getApiBase();
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${base}/api/billing/invoices`, { headers }).then(r => r.json()),
      fetch(`${base}/api/billing/summary`, { headers }).then(r => r.json()),
    ]).then(([invData, sumData]) => {
      setInvoices(invData.invoices ?? []);
      setSummary(sumData);
    }).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const filtered = filter === "all" ? invoices : invoices.filter(i => i.status === filter);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black uppercase tracking-widest text-white flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" /> Billing & Invoices
          </h1>
          <p className="text-muted-foreground text-sm mt-1">View your payment history and download invoices.</p>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Paid</p>
                </div>
                <p className="text-xl font-black text-emerald-400">${summary.totalPaid.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Outstanding</p>
                </div>
                <p className="text-xl font-black text-amber-400">${summary.totalOutstanding.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Invoices</p>
                </div>
                <p className="text-xl font-black text-white">{summary.invoiceCount}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Next bills */}
        {(summary?.nextBills ?? []).length > 0 && (
          <Card className="bg-card border-border mb-6">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Upcoming Renewals</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 divide-y divide-white/5">
              {summary!.nextBills.map(b => (
                <div key={b.subscriptionId} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-bold text-white">{b.planName}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.renewalDate ? `Renews ${format(new Date(b.renewalDate), "MMM d, yyyy")}` : "Renewal date TBD"}
                      {b.autoRenew ? " · Auto-renew on" : " · Auto-renew off"}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-primary">${b.amount.toFixed(2)}/mo</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          {(["all", "paid", "unpaid", "overdue"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${filter === f ? "bg-primary text-black border-primary" : "text-muted-foreground border-white/10 hover:border-white/20"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Invoices list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
            <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {invoices.length === 0 ? "No invoices yet. Complete a purchase to see your billing history." : `No ${filter} invoices.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(inv => <InvoiceRow key={inv.id} invoice={inv} accountNumber={user?.accountNumber ?? undefined} />)}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
